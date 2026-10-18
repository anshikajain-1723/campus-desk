import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentStore } from '../core/student-store';
@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">YOUR CAMPUS, AT A GLANCE</p>
        <h1>A clearer view of every student<span class="green">.</span></h1>
        <p class="subtitle">A little less admin. A little more focus on what matters.</p>
      </div>
      <a class="button primary" routerLink="/students" [queryParams]="{ add: 'true' }"
        ><span>＋</span> Add student</a
      >
    </div>
    <div class="stats-grid">
      <article class="stat">
        <div><span>Total students</span><span class="stat-icon">♧</span></div>
        <strong>{{ store.total() }}</strong
        ><small>Across {{ store.programs().length }} academic programs</small>
      </article>
      <article class="stat">
        <div><span>Active students</span><span class="stat-icon">✓</span></div>
        <strong>{{ store.active().length }}</strong
        ><small><i class="tiny-dot"></i> Currently enrolled</small>
      </article>
      <article class="stat">
        <div><span>Average attendance</span><span class="stat-icon">▥</span></div>
        <strong>{{ store.averageAttendance() }}<em>%</em></strong
        ><small>Among active students</small>
      </article>
      <article class="stat attention">
        <div><span>Needs attention</span><span class="stat-icon">!</span></div>
        <strong>{{ store.attention().length }}</strong
        ><small>Active students below 75% attendance</small>
      </article>
    </div>
    <div class="overview-grid">
      <section class="panel enrollment">
        <div class="panel-heading">
          <div>
            <h2>Enrollment by program</h2>
            <p>A balanced picture of your campus.</p>
          </div>
          <span class="tag">All records</span>
        </div>
        <div class="program-bars">
          @for (p of store.programs(); track p.name; let i = $index) {
            <div class="program-row">
              <div>
                <span><i [class]="'color-key tone-' + i"></i>{{ p.name }}</span
                ><strong>{{ p.count }} <small>students</small></strong>
              </div>
              <div class="bar-track">
                <div
                  [class]="'bar-fill tone-' + i"
                  [style.width.%]="store.total() ? (p.count / store.total()) * 100 : 0"
                ></div>
              </div>
            </div>
          }
        </div>
        <div class="panel-foot">Live totals from your student directory <span>↗</span></div>
      </section>
      <section class="panel focus-panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">STUDENT WELLBEING</span>
            <h2>A timely check-in matters.</h2>
            <p>Keep an eye on students who may need support.</p>
          </div>
        </div>
        <div class="focus-list">
          @for (s of store.attention().slice(0, 3); track s.id) {
            <a routerLink="/students" [queryParams]="{ search: s.id }" class="focus-student"
              ><span class="avatar">{{ initials(s.name) }}</span>
              <div>
                <strong>{{ s.name }}</strong
                ><small>{{ s.program }}</small>
              </div>
              <span class="attendance-low">{{ s.attendance }}%</span></a
            >
          } @empty {
            <p class="empty-inline">All active students are above the attendance threshold.</p>
          }
        </div>
        <a routerLink="/students" [queryParams]="{ attention: 'true' }" class="text-link"
          >Review attendance <span>→</span></a
        >
      </section>
    </div>
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Recent enrollments</h2>
          <p>The newest additions to your campus.</p>
        </div>
        <a routerLink="/students" class="text-link">View all students →</a>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Program</th>
              <th>Enrollment date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (s of recent(); track s.id) {
              <tr>
                <td>
                  <a class="student-cell" routerLink="/students" [queryParams]="{ search: s.id }"
                    ><span class="avatar">{{ initials(s.name) }}</span
                    ><span
                      ><strong>{{ s.name }}</strong
                      ><small>{{ s.id }}</small></span
                    ></a
                  >
                </td>
                <td>{{ s.program }}</td>
                <td>{{ s.enrolled | date: 'dd MMM yyyy' }}</td>
                <td>
                  <span
                    class="status"
                    [class.active]="s.status === 'Active'"
                    [class.leave]="s.status === 'On leave'"
                    >{{ s.status }}</span
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty-inline">
                  No students yet. Add your first sample record.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class Overview {
  readonly store = inject(StudentStore);
  readonly recent = computed(() =>
    [...this.store.students()].sort((a, b) => b.enrolled.localeCompare(a.enrolled)).slice(0, 4),
  );
  initials(name: string) {
    return name
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('');
  }
}
