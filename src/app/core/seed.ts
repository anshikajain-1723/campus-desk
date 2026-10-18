import { PROGRAMS, Student } from './student';
// Fictional demo records, never real student or employer data.
export function createSeed(): Student[] {
  const names = [
    'Aarav Mehta',
    'Isha Kapoor',
    'Kabir Shah',
    'Maya Rao',
    'Arjun Sen',
    'Tara Das',
    'Rohan Iyer',
    'Naina Joshi',
    'Dev Malhotra',
    'Sara Khan',
    'Aditya Bose',
    'Anaya Nair',
    'Vihaan Patel',
    'Diya Sharma',
    'Reyansh Gupta',
    'Avni Verma',
    'Ishaan Sethi',
    'Myra Jain',
    'Ayaan Ali',
    'Kiara Roy',
    'Neel Menon',
    'Riya Bhat',
    'Ved Sinha',
    'Zoya Mir',
  ];
  return names.map((name, i) => ({
    id: `ST-${1001 + i}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    program: PROGRAMS[i % 4],
    year: (i % 4) + 1,
    status: i === 3 || i === 17 ? 'On leave' : i === 9 || i === 21 ? 'Graduated' : 'Active',
    attendance: [96, 91, 87, 68, 98, 72, 92, 84, 95, 100, 79, 94][i % 12],
    enrolled: `2026-${String(5 + Math.floor(i / 4)).padStart(2, '0')}-${String(3 + (i % 17)).padStart(2, '0')}`,
  }));
}
