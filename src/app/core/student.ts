export const PROGRAMS = [
  'Computer Science',
  'Business Administration',
  'Design',
  'Data Science',
] as const;
export type Program = (typeof PROGRAMS)[number];
export type StudentStatus = 'Active' | 'On leave' | 'Graduated';
export interface Student {
  id: string;
  name: string;
  email: string;
  program: Program;
  year: number;
  status: StudentStatus;
  attendance: number;
  enrolled: string;
}
export type StudentInput = Omit<Student, 'id'>;
export const STORAGE_KEY = 'campus-desk.students.v1';
export function isStudent(value: unknown): value is Student {
  if (!value || typeof value !== 'object') return false;
  const s = value as Student;
  return (
    typeof s.id === 'string' &&
    s.id.length > 0 &&
    typeof s.name === 'string' &&
    s.name.trim().length >= 2 &&
    typeof s.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) &&
    PROGRAMS.includes(s.program) &&
    ['Active', 'On leave', 'Graduated'].includes(s.status) &&
    Number.isInteger(s.year) &&
    s.year >= 1 &&
    s.year <= 4 &&
    Number.isFinite(s.attendance) &&
    s.attendance >= 0 &&
    s.attendance <= 100 &&
    typeof s.enrolled === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.enrolled) &&
    !Number.isNaN(Date.parse(s.enrolled))
  );
}
export function filterStudents(
  students: readonly Student[],
  search: string,
  program: string,
  status: string,
): Student[] {
  const term = search.trim().toLowerCase();
  return students.filter(
    (s) =>
      (!program || s.program === program) &&
      (!status || s.status === status) &&
      `${s.name} ${s.email} ${s.id}`.toLowerCase().includes(term),
  );
}
export function toCsv(students: readonly Student[]): string {
  const cell = (value: unknown) => {
    const text = String(value);
    const safe = /^[\s]*[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [
    ['ID', 'Name', 'Email', 'Program', 'Year', 'Status', 'Attendance', 'Enrolled'],
    ...students.map((s) => [
      s.id,
      s.name,
      s.email,
      s.program,
      s.year,
      s.status,
      s.attendance,
      s.enrolled,
    ]),
  ]
    .map((row) => row.map(cell).join(','))
    .join('\r\n');
}
