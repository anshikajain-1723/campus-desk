import { StudentStore } from './student-store';
import { createSeed } from './seed';
import { filterStudents, isStudent, STORAGE_KEY, toCsv } from './student';
import { vi } from 'vitest';

describe('Student workflow', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());
  it('starts with consistent fictional seed metrics', () => {
    const store = new StudentStore();
    expect(store.total()).toBe(24);
    expect(store.active().length).toBe(20);
    expect(store.attention().length).toBe(2);
    expect(createSeed().every(isStudent)).toBe(true);
  });
  it('persists create and edit across store reloads, then deletes', () => {
    const store = new StudentStore();
    const input = { ...createSeed()[0], name: 'Demo Person', email: 'demo@example.com' };
    expect(store.save(input)).toBeNull();
    expect(store.total()).toBe(25);
    const student = store.students()[0];
    expect(store.save({ ...student, attendance: 40 }, student.id)).toBeNull();
    const reloaded = new StudentStore();
    expect(reloaded.students().find((s) => s.id === student.id)?.attendance).toBe(40);
    expect(reloaded.attention().length).toBe(3);
    reloaded.remove(student.id);
    expect(new StudentStore().total()).toBe(24);
  });
  it('rejects duplicate emails ignoring case and whitespace', () => {
    const store = new StudentStore();
    expect(store.save({ ...createSeed()[0], email: ' AARAV.MEHTA@EXAMPLE.COM ' })).toContain(
      'already exists',
    );
    expect(store.total()).toBe(24);
  });
  it('rejects out-of-range attendance and invalid date', () => {
    const store = new StudentStore();
    expect(store.save({ ...createSeed()[0], attendance: 120 })).toBeTruthy();
    expect(store.save({ ...createSeed()[0], enrolled: 'not-a-date' })).toBeTruthy();
  });
  it('does not change memory when persistence fails', () => {
    const store = new StudentStore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(store.remove(store.students()[0].id)).toContain('not saved');
    expect(store.total()).toBe(24);
  });
  it('recovers gracefully from corrupt or incorrect saved data', () => {
    localStorage.setItem(STORAGE_KEY, '{bad');
    const store = new StudentStore();
    expect(store.total()).toBe(24);
    expect(store.notice()).toBeTruthy();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'bad' }]));
    expect(new StudentStore().total()).toBe(24);
  });
  it('keeps an intentionally empty directory on reload', () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    expect(new StudentStore().total()).toBe(0);
  });
  it('combines search, program and status and supports no results', () => {
    const rows = createSeed();
    expect(filterStudents(rows, 'aarav', 'Computer Science', 'Active')).toHaveLength(1);
    expect(filterStudents(rows, 'aarav', 'Design', 'Active')).toHaveLength(0);
    expect(filterStudents(rows, ' ST-1001 ', '', '')).toHaveLength(1);
  });
  it('escapes CSV quotes, commas and spreadsheet formulas', () => {
    const csv = toCsv([{ ...createSeed()[0], name: '=CMD("x,y")' }]);
    expect(csv).toContain('"\'=CMD(""x,y"")"');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
  it('restores original data after changes', () => {
    const store = new StudentStore();
    store.remove(store.students()[0].id);
    expect(store.reset()).toBeNull();
    expect(store.total()).toBe(24);
  });
});
