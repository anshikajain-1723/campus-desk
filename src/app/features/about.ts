import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentStore } from '../core/student-store';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">BUILT TO BE EXPLORED</p>
        <h1>Small details. Real interactions<span class="green">.</span></h1>
        <p class="subtitle">
          An original Angular portfolio demo by Anshika Jain, developed with AI assistance.
        </p>
      </div>
      <a routerLink="/students" class="button primary">Explore the directory →</a>
    </div>
    <div class="about-grid">
      <section class="panel about-card">
        <span class="feature-icon">▦</span>
        <h2>One focused workflow</h2>
        <p>
          Campus Desk demonstrates the everyday work behind a student administration interface:
          finding records, validating inputs, keeping statistics in sync, and handling empty states.
        </p>
        <ul>
          <li>Create, edit and delete fictional student records</li>
          <li>Search, combine filters, sort and paginate</li>
          <li>Review attendance and enrollment metrics</li>
          <li>Export the matching records as CSV</li>
        </ul>
      </section>
      <section class="panel about-card">
        <span class="feature-icon">⌘</span>
        <h2>Built with Angular</h2>
        <p>
          Standalone components, lazy-loaded routes, signals, computed state and reactive forms. A
          small typed store keeps business rules separate from the screen.
        </p>
        <p>
          Responsive SCSS, keyboard-friendly native dialogs, explicit validation messages and safe
          CSV output are part of the implementation.
        </p>
        <span class="tag">Angular 22 · TypeScript · SCSS</span>
      </section>
      <section class="panel about-card">
        <span class="feature-icon">◉</span>
        <h2>A transparent demo</h2>
        <p>
          Northfield Academy and all student records are fictional. This is a frontend
          demonstration, not a deployed school system or a client delivery.
        </p>
        <p>
          Records stay in your browser's local storage. There is no backend, authentication,
          multi-user sync or email delivery. Please do not enter personal or confidential
          information.
        </p>
      </section>
      <section class="panel about-card">
        <span class="feature-icon">↺</span>
        <h2>A fresh start, anytime</h2>
        <p>
          Reset restores the original 24 sample students and replaces changes you made in this
          browser. It does not affect anyone else's demo.
        </p>
        <button class="button" (click)="resetDialog.showModal()">Reset demo data</button>
        @if (message()) {
          <p role="status">{{ message() }}</p>
        }
      </section>
    </div>
    <dialog #resetDialog class="small-dialog" aria-labelledby="reset-title">
      <h2 id="reset-title">Restore sample records?</h2>
      <p>
        This replaces this browser's records with the 24 original fictional students. Export your
        records first if you want to keep your edits.
      </p>
      <div class="dialog-actions">
        <button class="button" (click)="resetDialog.close()">Cancel</button
        ><button class="button danger" (click)="reset(); resetDialog.close()">
          Restore sample data
        </button>
      </div>
    </dialog>
  `,
})
export class About {
  readonly store = inject(StudentStore);
  readonly message = signal('');
  reset() {
    const error = this.store.reset();
    this.message.set(error ?? 'The 24 sample students have been restored.');
    if (!error) this.store.notice.set('');
  }
}
