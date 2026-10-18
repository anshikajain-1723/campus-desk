import { computed, Injectable, signal } from '@angular/core';
import { createSeed } from './seed';
import { isStudent, PROGRAMS, STORAGE_KEY, Student, StudentInput } from './student';
@Injectable({ providedIn: 'root' })
export class StudentStore {
  readonly notice = signal('');
  private readonly records = signal<Student[]>(this.read());
  readonly students = this.records.asReadonly();
  readonly total = computed(() => this.students().length);
  readonly active = computed(() => this.students().filter((s) => s.status === 'Active'));
  readonly attention = computed(() =>
    this.active()
      .filter((s) => s.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance),
  );
  readonly averageAttendance = computed(() =>
    this.active().length
      ? Math.round(this.active().reduce((n, s) => n + s.attendance, 0) / this.active().length)
      : 0,
  );
  readonly programs = computed(() =>
    PROGRAMS.map((name) => ({
      name,
      count: this.students().filter((s) => s.program === name).length,
    })),
  );
  save(input: StudentInput, id?: string): string | null {
    const clean = { ...input, name: input.name.trim(), email: input.email.trim().toLowerCase() };
    const student = { ...clean, id: id ?? `ST-${crypto.randomUUID().slice(0, 8).toUpperCase()}` };
    if (!isStudent(student)) return 'Please check the student details.';
    if (this.students().some((s) => s.id !== id && s.email.toLowerCase() === clean.email))
      return 'A student with this email already exists.';
    if (id && !this.students().some((s) => s.id === id))
      return 'This record no longer exists. Please refresh the list.';
    return this.commit(
      id ? this.students().map((s) => (s.id === id ? student : s)) : [student, ...this.students()],
    );
  }
  remove(id: string): string | null {
    return this.commit(this.students().filter((s) => s.id !== id));
  }
  reset(): string | null {
    return this.commit(createSeed());
  }
  private commit(students: Student[]): string | null {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      return 'Browser storage is unavailable or full. Your changes were not saved.';
    }
    this.records.set(students);
    return null;
  }
  private read(): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createSeed();
      const data: unknown = JSON.parse(raw);
      if (
        Array.isArray(data) &&
        data.every(isStudent) &&
        new Set(data.map((s) => s.id)).size === data.length &&
        new Set(data.map((s) => s.email.toLowerCase())).size === data.length
      )
        return data;
      this.notice.set(
        'Saved demo data could not be read. Sample records are shown; reset the demo to replace invalid data.',
      );
    } catch {
      this.notice.set('Browser storage could not be read. Sample records are shown.');
    }
    return createSeed();
  }
}
