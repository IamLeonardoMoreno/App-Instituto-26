import { Student, Teacher, Course, AttendanceStatus, Subject, Conversation, Message } from "./types";

export const ATTENDANCE_STATUS = {
    [AttendanceStatus.Present]: { label: 'Presente', color: 'text-green-400', bg: 'bg-green-800', iconName: 'CheckCircleIcon' },
    [AttendanceStatus.Absent]: { label: 'Ausente', color: 'text-red-400', bg: 'bg-red-800', iconName: 'XCircleIcon' },
    [AttendanceStatus.Justified]: { label: 'Justificado', color: 'text-orange-400', bg: 'bg-orange-800', iconName: 'JustifyIcon' },
    [AttendanceStatus.Pending]: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-800', iconName: 'MinusCircleIcon' },
    [AttendanceStatus.Late]: { label: 'Tarde', color: 'text-blue-400', bg: 'bg-blue-800', iconName: 'LateIcon' },
};

// More detailed and unique students
export const DETAILED_MOCK_STUDENTS: Student[] = [
    {
        id: 101, name: 'Lautaro Perez', studentId: '12346', role: 'student', email: 'lautaro@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=lautaro`,
        customEvents: [],
        subjects: [
            { id: 'M1A', name: 'Matemáticas', teacher: 'Profesora Julieta', schedule: 'Jueves 09:00 AM', classroom: 'Aula 2B', attendance: [{ date: '2024-11-07', status: AttendanceStatus.Present }, { date: '2024-11-14', status: AttendanceStatus.Absent, justificationStatus: 'pending', justificationNote: 'Certificado Medico.pdf' }], partials: [{ name: 'Parcial 1', date: '2024-10-15', grade: 8 }], isRegisteredForFinal: true },
            { id: 'F2B', name: 'Física', teacher: 'Profesor Ricardo', schedule: 'Viernes 11:00 AM', classroom: 'Aula 3A', attendance: [{ date: '2024-11-08', status: AttendanceStatus.Present }], partials: [{ name: 'Parcial 1', date: '2024-10-18', grade: 7 }], isRegisteredForFinal: false },
        ]
    },
    {
        id: 102, name: 'Sofia Rodriguez', studentId: '12346', role: 'student', email: 'sofia@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=sofia`,
        customEvents: [],
        subjects: [
            { id: 'M1A', name: 'Matemáticas', teacher: 'Profesora Julieta', schedule: 'Jueves 09:00 AM', classroom: 'Aula 2B', attendance: [{ date: '2024-11-07', status: AttendanceStatus.Present }, { date: '2024-11-14', status: AttendanceStatus.Present }], partials: [{ name: 'Parcial 1', date: '2024-10-15', grade: 9 }], isRegisteredForFinal: true },
            { id: 'H3C', name: 'Historia', teacher: 'Profesor Suarez', schedule: 'Lunes 08:00 AM', classroom: 'Aula 1C', attendance: [{ date: '2024-11-04', status: AttendanceStatus.Late }], partials: [{ name: 'Parcial 1', date: '2024-10-14', grade: 10 }], isRegisteredForFinal: true },
        ]
    },
    {
        id: 103, name: 'Martina Gomez', studentId: '12347', role: 'student', email: 'martina@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=martina`,
        customEvents: [],
        subjects: [
            { id: 'M1A', name: 'Matemáticas', teacher: 'Profesora Julieta', schedule: 'Jueves 09:00 AM', classroom: 'Aula 2B', attendance: [{ date: '2024-11-07', status: AttendanceStatus.Absent, justificationStatus: 'none' }, { date: '2024-11-14', status: AttendanceStatus.Absent, justificationStatus: 'none' }], partials: [{ name: 'Parcial 1', date: '2024-10-15', grade: 4 }], isRegisteredForFinal: false },
        ]
    },
     {
        id: 104, name: 'Mateo Fernandez', studentId: '12349', role: 'student', email: 'mateo@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=mateo`,
        customEvents: [],
        subjects: [
            { id: 'M1A', name: 'Matemáticas', teacher: 'Profesora Julieta', schedule: 'Jueves 09:00 AM', classroom: 'Aula 2B', attendance: [{ date: '2024-11-07', status: AttendanceStatus.Present }, { date: '2024-11-14', status: AttendanceStatus.Justified, justificationStatus: 'approved' }], partials: [{ name: 'Parcial 1', date: '2024-10-15', grade: 6 }], isRegisteredForFinal: true },
        ]
    },
];

export const MOCK_STUDENT: Student = {
    id: 1,
    name: 'Lautaro',
    email: 'alumno@test.com',
    password: '123',
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?u=lautaro',
    customEvents: [],
    subjects: [
        { id: 'M1', name: 'Matemáticas', teacher: 'Julieta Martinez', schedule: 'Jueves 09:00 AM', classroom: 'Aula 2B',
          attendance: [
              { date: '2024-11-07', status: AttendanceStatus.Present },
              { date: '2024-10-31', status: AttendanceStatus.Present },
              { date: '2024-10-24', status: AttendanceStatus.Absent, justificationStatus: 'none' },
              { date: '2024-10-17', status: AttendanceStatus.Present },
          ],
          partials: [
              { name: 'Parcial 1', date: '2024-10-15', grade: 8 },
              { name: 'Parcial 2', date: '2024-11-20', grade: null },
          ],
          isRegisteredForFinal: true,
        },
        { id: 'P1', name: 'Física', teacher: 'Ricardo Gomez', schedule: 'Viernes 11:00 AM', classroom: 'Aula 3A',
          attendance: [
              { date: '2024-11-08', status: AttendanceStatus.Present },
              { date: '2024-11-01', status: AttendanceStatus.Present },
              { date: '2024-10-25', status: AttendanceStatus.Present },
              { date: '2024-10-18', status: AttendanceStatus.Present },
          ],
          partials: [
              { name: 'Parcial 1', date: '2024-10-20', grade: 7 },
              { name: 'Parcial 2', date: '2024-11-22', grade: null },
          ],
          isRegisteredForFinal: false,
        },
         { id: 'Q1', name: 'Química', teacher: 'Ana Lopez', schedule: 'Lunes 08:00 AM', classroom: 'Laboratorio 1',
          attendance: [],
          partials: [],
          isRegisteredForFinal: false,
        },
    ]
};

export const MOCK_COURSE_MATH_1A: Course = {
    id: 'M1A',
    name: '1er Año A - Matemáticas',
    schedule: 'Jueves 09:00 AM',
    classroom: 'Aula 2B',
    students: DETAILED_MOCK_STUDENTS
};

export const DETAILED_MOCK_STUDENTS_PHYSICS: Student[] = [
    {
        id: 201, name: 'Valentina Sanchez', studentId: '22345', role: 'student', email: 'valentina@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=valentina`,
        customEvents: [],
        subjects: [
            { id: 'F2B', name: 'Física', teacher: 'Profesor Ricardo', schedule: 'Viernes 11:00 AM', classroom: 'Aula 3A', attendance: [{ date: '2024-11-08', status: AttendanceStatus.Present }], partials: [{ name: 'Parcial 1', date: '2024-10-18', grade: 9 }], isRegisteredForFinal: true },
            { id: 'Q2C', name: 'Química', teacher: 'Profesora Ana', schedule: 'Martes 10:00 AM', classroom: 'Lab 2', attendance: [{ date: '2024-11-05', status: AttendanceStatus.Present }], partials: [{ name: 'Parcial 1', date: '2024-10-15', grade: 8 }], isRegisteredForFinal: false },
        ]
    },
    {
        id: 202, name: 'Matias Rodriguez', studentId: '22346', role: 'student', email: 'matias@test.com', password: '123', avatar: `https://i.pravatar.cc/150?u=matias`,
        customEvents: [],
        subjects: [
             { id: 'F2B', name: 'Física', teacher: 'Profesor Ricardo', schedule: 'Viernes 11:00 AM', classroom: 'Aula 3A', attendance: [{ date: '2024-11-08', status: AttendanceStatus.Late }], partials: [{ name: 'Parcial 1', date: '2024-10-18', grade: 5 }], isRegisteredForFinal: false },
        ]
    }
];

export const MOCK_COURSE_PHYSICS_2B: Course = {
    id: 'F2B',
    name: '2do Año B - Física',
    schedule: 'Viernes 11:00 AM',
    classroom: 'Aula 3A',
    students: DETAILED_MOCK_STUDENTS_PHYSICS
};

export const MOCK_TEACHER: Teacher = {
    id: 100,
    name: 'Julieta',
    email: 'preceptor@test.com',
    password: '123',
    role: 'teacher',
    avatar: 'https://i.pravatar.cc/150?u=julieta',
    managedCourses: [MOCK_COURSE_MATH_1A, MOCK_COURSE_PHYSICS_2B],
    customEvents: [],
};

export const ALL_USERS = [MOCK_STUDENT, MOCK_TEACHER, ...DETAILED_MOCK_STUDENTS, ...DETAILED_MOCK_STUDENTS_PHYSICS];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        participantIds: [100, 101], // Teacher Julieta and Lautaro Perez
        messages: [
            { id: 'msg1', senderId: 101, text: 'Hola profe, ¿puedo justificar la falta de la semana pasada?', timestamp: '2024-11-18T10:00:00Z' },
            { id: 'msg2', senderId: 100, text: 'Hola Lautaro. Sí, por favor tráeme el certificado médico.', timestamp: '2024-11-18T10:05:00Z' },
        ]
    },
    {
        id: 'conv2',
        participantIds: [100, 102], // Teacher Julieta and Sofia Rodriguez
        messages: [
            { id: 'msg3', senderId: 100, text: 'Sofia, recordá que mañana es la entrega del trabajo práctico.', timestamp: '2024-11-19T15:30:00Z' },
        ]
    },
    {
        id: 'conv3',
        participantIds: [100, 1], // Teacher Julieta and MOCK_STUDENT Lautaro
        messages: [
            { id: 'msg4', senderId: 1, text: 'Hola, quería saber la nota del último parcial.', timestamp: '2024-11-20T09:00:00Z' },
        ]
    }
];

export const SAMPLE_AVATARS = [
    'https://i.pravatar.cc/150?u=a',
    'https://i.pravatar.cc/150?u=b',
    'https://i.pravatar.cc/150?u=c',
    'https://i.pravatar.cc/150?u=d',
    'https://i.pravatar.cc/150?u=e',
    'https://i.pravatar.cc/150?u=f',
    'https://i.pravatar.cc/150?u=g',
    'https://i.pravatar.cc/150?u=h',
];