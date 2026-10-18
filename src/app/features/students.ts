import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StudentStore } from '../core/student-store';
import { filterStudents, PROGRAMS, Student, StudentInput, toCsv } from '../core/student';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './students.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Students implements AfterViewInit {
  readonly store = inject(StudentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  @ViewChild('editor') editor!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteDialog') deleteDialog!: ElementRef<HTMLDialogElement>;
  readonly programs = PROGRAMS;
  readonly search = signal(this.route.snapshot.queryParamMap.get('search') ?? '');
  readonly program = signal('');
  readonly status = signal('');
  readonly attention = signal(this.route.snapshot.queryParamMap.get('attention') === 'true');
  readonly sort = signal('name');
  readonly page = signal(1);
  readonly pageSize = 8;
  readonly editing = signal<Student | null>(null);
  readonly deleting = signal<Student | null>(null);
  readonly message = signal('');
  readonly error = signal('');
  readonly filtered = computed(() => {
    let rows = filterStudents(this.store.students(), this.search(), this.program(), this.status());
    if (this.attention()) rows = rows.filter((s) => s.status === 'Active' && s.attendance < 75);
    return rows.sort((a, b) =>
      this.sort() === 'attendance'
        ? a.attendance - b.attendance
        : this.sort() === 'newest'
          ? b.enrolled.localeCompare(a.enrolled)
          : a.name.localeCompare(b.name),
    );
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount()));
  readonly visible = computed(() =>
    this.filtered().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  readonly firstRecord = computed(() =>
    this.filtered().length ? (this.currentPage() - 1) * this.pageSize + 1 : 0,
  );
  readonly lastRecord = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filtered().length),
  );
  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.pattern(/\S/),
      ],
    ],
    email: [
      '',
      [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
    ],
    program: [PROGRAMS[0] as string, Validators.required],
    year: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    status: ['Active', Validators.required],
    attendance: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
    enrolled: [new Date().toISOString().slice(0, 10), Validators.required],
  });
  ngAfterViewInit() {
    if (this.route.snapshot.queryParamMap.get('add') === 'true') this.openEditor();
  }
  initials(name: string) {
    return name
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('');
  }
  updateSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }
  clearFilters() {
    this.search.set('');
    this.program.set('');
    this.status.set('');
    this.attention.set(false);
    this.page.set(1);
  }
  openEditor(student?: Student) {
    this.editing.set(student ?? null);
    this.error.set('');
    this.form.reset(
      student ?? {
        name: '',
        email: '',
        program: PROGRAMS[0],
        year: 1,
        status: 'Active',
        attendance: 100,
        enrolled: new Date().toISOString().slice(0, 10),
      },
    );
    this.editor.nativeElement.showModal();
  }
  closeEditor() {
    this.editor.nativeElement.close();
  }
  invalid(field: keyof typeof this.form.controls) {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const error = this.store.save(this.form.getRawValue() as StudentInput, this.editing()?.id);
    if (error) {
      this.error.set(error);
      return;
    }
    this.message.set(this.editing() ? 'Student details updated.' : 'Student added successfully.');
    this.closeEditor();
    this.page.set(1);
  }
  confirmDelete(student: Student) {
    this.deleting.set(student);
    this.error.set('');
    this.deleteDialog.nativeElement.showModal();
  }
  deleteStudent() {
    const student = this.deleting();
    if (!student) return;
    const error = this.store.remove(student.id);
    if (error) {
      this.error.set(error);
      return;
    }
    this.deleteDialog.nativeElement.close();
    this.message.set(`${student.name} removed from the demo.`);
  }
  exportCsv() {
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + toCsv(this.filtered())], { type: 'text/csv;charset=utf-8;' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus-desk-students.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.message.set(`Exported ${this.filtered().length} matching students.`);
  }
}
