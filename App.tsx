
import React, { useState, createContext, useContext, ReactNode, useMemo, useRef, useEffect } from 'react';
// FIX: Renamed `Partial` to `PartialGrade` to match the change in `types.ts` and resolve the name conflict with TypeScript's built-in `Partial` utility type.
import { User, Student, Teacher, NavItem, Course, AttendanceStatus, Subject, PartialGrade, Conversation, Message, UserRole, AttendanceRecord, CustomEvent, DataContextType } from './types';
import { MOCK_STUDENT, MOCK_TEACHER, ALL_USERS, ATTENDANCE_STATUS, MOCK_COURSE_MATH_1A, MOCK_CONVERSATIONS, SAMPLE_AVATARS } from './constants';
import {
    HomeIcon, CalendarIcon, BookOpenIcon, UserCircleIcon, CogIcon, BellIcon, ArrowLeftIcon,
    CheckCircleIcon, XCircleIcon, JustifyIcon, MinusCircleIcon, LateIcon, ChevronRightIcon,
    LogoutIcon, DocumentTextIcon, ShieldCheckIcon, GlobeAltIcon, ChevronLeftIcon, ChatBubbleLeftRightIcon,
    PaperAirplaneIcon, DocumentCheckIcon, PlusIcon, PaintBrushIcon, SwatchIcon, RectangleStackIcon
} from './components/Icons';

// --- APPEARANCE PROVIDER CONTEXT ---

interface AppearanceContextType {
    theme: string;
    setTheme: (theme: string) => void;
    borderStyle: string;
    setBorderStyle: (style: string) => void;
    themes: Record<string, Theme>;
    borderStyles: Record<string, BorderStyle>;
}

interface Theme {
    id: string;
    name: string;
    colors: { c1: string, c2: string, c3: string };
}
interface BorderStyle {
    id: string;
    name: string;
}

const AppearanceContext = createContext<AppearanceContextType | null>(null);

const useAppearance = () => {
    const context = useContext(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within an AppearanceProvider');
    }
    return context;
};

const THEMES: Record<string, Theme> = {
    original: { id: 'original', name: 'Original', colors: { c1: '#1E232B', c2: '#2A303A', c3: '#14B8A6' } },
    ensoñacion: { id: 'ensoñacion', name: 'Ensoñación', colors: { c1: '#FDF2F8', c2: '#FFFFFF', c3: '#DB2777' } },
    celestial: { id: 'celestial', name: 'Celestial', colors: { c1: '#f0f9ff', c2: '#ffffff', c3: '#ca8a04' } },
    oscuro: { id: 'oscuro', name: 'Oscuro', colors: { c1: '#171717', c2: '#262626', c3: '#ca8a04' } },
    enfoque: { id: 'enfoque', name: 'Enfoque', colors: { c1: '#17252A', c2: '#2B7A78', c3: '#DEF2F1' } },
    fantasma: { id: 'fantasma', name: 'Fantasma', colors: { c1: '#1C1D21', c2: '#31353D', c3: '#E11D48' } },
    rebelde: { id: 'rebelde', name: 'Rebelde', colors: { c1: '#1A1A1A', c2: '#2A2A2A', c3: '#F7DF1E' } },
};

const BORDER_STYLES: Record<string, BorderStyle> = {
    default: { id: 'default', name: 'Predeterminado' },
    sencillo: { id: 'sencillo', name: 'Sencillo' },
    redondeado: { id: 'redondeado', name: 'Redondeado' },
    marcado: { id: 'marcado', name: 'Marcado' },
};

const AppearanceProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState(() => localStorage.getItem('app-theme') || 'original');
    const [borderStyle, setBorderStyleState] = useState(() => localStorage.getItem('app-border-style') || 'default');

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.dataset.borderStyle = borderStyle;
        localStorage.setItem('app-border-style', borderStyle);
    }, [borderStyle]);

    const value: AppearanceContextType = {
        theme,
        setTheme: setThemeState,
        borderStyle,
        setBorderStyle: setBorderStyleState,
        themes: THEMES,
        borderStyles: BORDER_STYLES,
    };
    return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}


// --- DATA PROVIDER CONTEXT ---

const DataContext = createContext<DataContextType | null>(null);

const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

const DataProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<(Student | Teacher)[]>(ALL_USERS);
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

    const findUserById = (id: number) => users.find(u => u.id === id);

    const updateUserAvatar = (userId: number, newAvatarUrl: string) => {
        setUsers(prevUsers => {
            const newUsers = JSON.parse(JSON.stringify(prevUsers));
    
            const userToUpdate = newUsers.find((u: User) => u.id === userId);
            if (userToUpdate) {
                userToUpdate.avatar = newAvatarUrl;
            }
    
            const teachers = newUsers.filter((u: User) => u.role === 'teacher') as Teacher[];
            teachers.forEach(teacher => {
                teacher.managedCourses.forEach(course => {
                    const studentInCourse = course.students.find(s => s.id === userId);
                    if (studentInCourse) {
                        studentInCourse.avatar = newAvatarUrl;
                    }
                });
            });
    
            return newUsers;
        });
    };

    const addCustomEvent = (userId: number, eventData: Omit<CustomEvent, 'id'>) => {
        setUsers(prevUsers => {
            const newUsers = JSON.parse(JSON.stringify(prevUsers));
            const user = newUsers.find((u: User) => u.id === userId);
            if (user) {
                if (!user.customEvents) {
                    user.customEvents = [];
                }
                const newEvent = {
                    ...eventData,
                    id: `evt-${Date.now()}`
                };
                user.customEvents.push(newEvent);
            }
            return newUsers;
        });
    };

    const updateUserAttendance = (studentId: number, subjectId: string, date: string, updates: Partial<AttendanceRecord>) => {
        setUsers(prevUsers => {
            const newUsers = JSON.parse(JSON.stringify(prevUsers));
            
            const applyUpdate = (student: Student) => {
                if (!student?.subjects) return;
                const subject = student.subjects.find(s => s.id === subjectId);
                if(subject) {
                    const attendance = subject.attendance?.find(a => a.date === date);
                    if (attendance) {
                        Object.assign(attendance, updates);
                    } else if (updates.status) { // Handle case where attendance record doesn't exist yet for today
                         subject.attendance.push({ date, ...updates } as AttendanceRecord);
                    }
                }
            };

            const mainStudent = newUsers.find((u: User) => u.id === studentId);
            if(mainStudent?.role === 'student') applyUpdate(mainStudent as Student);
            
            // This logic ensures that if student data is duplicated in courses, it gets updated there too.
            const teachers = newUsers.filter((u: User) => u.role === 'teacher') as Teacher[];
            teachers.forEach(teacher => {
                teacher.managedCourses.forEach(course => {
                    const studentInCourse = course.students.find(s => s.id === studentId);
                    if (studentInCourse) {
                        const fullStudentInCourse = newUsers.find(u => u.id === studentInCourse.id);
                        if (fullStudentInCourse?.role === 'student') {
                            applyUpdate(fullStudentInCourse as Student);
                        }
                    }
                });
            });
            
            return newUsers;
        });
    };

    const submitJustification = (studentId: number, subjectId: string, date: string, note: string) => {
        updateUserAttendance(studentId, subjectId, date, {
            justificationStatus: 'pending',
            justificationNote: note,
        });
    };

    const reviewJustification = (studentId: number, subjectId: string, date: string, approved: boolean) => {
        if (approved) {
            updateUserAttendance(studentId, subjectId, date, {
                status: AttendanceStatus.Justified,
                justificationStatus: 'approved',
            });
        } else {
            updateUserAttendance(studentId, subjectId, date, {
                justificationStatus: 'rejected',
            });
        }
    };
    
    const updateStudentData = (studentId: number, courseId: string, date: string, newStatus: AttendanceStatus) => {
       updateUserAttendance(studentId, courseId, date, { status: newStatus });
    };


    const addMessage = (senderId: number, receiverId: number, text: string) => {
        setConversations(prev => {
            const newConversations = JSON.parse(JSON.stringify(prev));
            let conversation = newConversations.find((c: Conversation) => 
                c.participantIds.includes(senderId) && c.participantIds.includes(receiverId)
            );

            const newMessage: Message = {
                id: `msg${Date.now()}`,
                senderId,
                text,
                timestamp: new Date().toISOString(),
            };

            if (conversation) {
                conversation.messages.push(newMessage);
            } else {
                conversation = {
                    id: `conv${Date.now()}`,
                    participantIds: [senderId, receiverId],
                    messages: [newMessage],
                };
                newConversations.push(conversation);
            }
            return newConversations;
        });
    };

    const value: DataContextType = {
        users,
        conversations,
        updateStudentData,
        addMessage,
        findUserById,
        submitJustification,
        reviewJustification,
        updateUserAvatar,
        addCustomEvent,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};


// --- UTILITY & HELPER COMPONENTS ---

const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-brand-dark text-theming-text-primary w-full h-full font-sans antialiased">
        <div className="max-w-md mx-auto h-screen flex flex-col">{children}</div>
    </div>
);

const Header: React.FC<{ title: string; onBack?: () => void; children?: React.ReactNode; }> = ({ title, onBack, children }) => (
    <header className="bg-brand-dark-2 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
            {onBack && (
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-brand-dark-light">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div>{children}</div>
    </header>
);

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <div className={`bg-brand-dark-2 rounded-theme p-4 border-theme border-theming-border ${className} ${onClick ? 'cursor-pointer hover:bg-brand-dark-light transition-colors' : ''}`} onClick={onClick}>
        {children}
    </div>
);

const Button: React.FC<React.ComponentProps<'button'>> = ({ children, className = '', ...props }) => (
    <button
        className={`w-full text-center font-bold py-3 px-4 rounded-theme transition-colors ${className}`}
        {...props}
    >
        {children}
    </button>
);

const Toggle: React.FC<{label: string, enabled: boolean, onToggle: () => void}> = ({label, enabled, onToggle}) => (
    <div className="flex justify-between items-center p-3">
        <span>{label}</span>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-brand-green' : 'bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);

// --- NAVIGATION ---
type ScreenName = 'login' | 'studentDashboard' | 'teacherDashboard' | 'studentSubjects' | 'studentSubjectDetail' | 'studentCalendar' | 'studentProfile' | 'teacherCourses' | 'courseAttendance' | 'teacherStudentProfile' | 'teacherCalendar' | 'teacherProfile' | 'notificationsSettings' | 'privacySettings' | 'languageSettings' | 'messages' | 'chat' | 'teacherJustifications' | 'appearanceSettings';

const BottomNavBar: React.FC<{ active: string; onNavigate: (item: NavItem) => void; navItems: NavItem[] }> = ({ active, onNavigate, navItems }) => (
    <nav className="bg-brand-dark-2 mt-auto">
        <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item)}
                    className={`flex flex-col items-center justify-center w-full h-full text-xs transition-colors ${active === item.id ? 'text-brand-green' : 'text-theming-text-secondary hover:text-theming-text-primary'}`}
                    aria-label={item.label}
                >
                    <item.icon className="w-6 h-6 mb-1" />
                    {item.label}
                </button>
            ))}
        </div>
    </nav>
);

// --- AUTHENTICATION ---
const LoginScreen: React.FC<{ onLoginSuccess: (user: User) => void; }> = ({ onLoginSuccess }) => {
    const { users } = useData();

    const handleLogin = (role: UserRole) => {
        let user;
        if (role === 'student') {
            user = users.find(u => u.email === 'alumno@test.com');
        } else {
            user = users.find(u => u.email === 'preceptor@test.com');
        }

        if (user) {
            onLoginSuccess(user);
        } else {
            console.error(`Mock ${role} not found`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark text-theming-text-primary p-4">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-4xl font-bold mb-4">Mi Instituto</h1>
                <p className="text-theming-text-secondary mb-12">Selecciona tu rol para continuar</p>

                <div className="space-y-4">
                    <Button onClick={() => handleLogin('student')} className="bg-brand-green text-theming-text-on-accent hover:bg-brand-green-dark flex items-center justify-center space-x-2">
                        <UserCircleIcon className="w-6 h-6" />
                        <span>Iniciar como Alumno</span>
                    </Button>
                    <Button onClick={() => handleLogin('teacher')} className="bg-brand-dark-2 text-theming-text-primary hover:bg-brand-dark-light flex items-center justify-center space-x-2">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <span>Iniciar como Preceptor</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};


// --- STUDENT SCREENS ---

const StudentDashboard: React.FC<{ student: Student, onNavigate: (screen: ScreenName) => void }> = ({ student, onNavigate }) => {
    const nextClass = student.subjects[0];
    const totalAttendance = student.subjects.reduce((acc, s) => acc + s.attendance.length, 0);
    const presentAttendance = student.subjects.reduce((acc, s) => acc + s.attendance.filter(a => a.status === AttendanceStatus.Present).length, 0);
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

    return (
        <>
            <Header title="Dashboard">
                <div className="flex items-center space-x-4">
                    <img src={student.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                </div>
            </Header>
            <main className="p-4 flex-grow overflow-y-auto space-y-6">
                <h2 className="text-2xl font-bold">¡Hola, {student.name}!</h2>

                <Card className="space-y-3">
                    <p className="text-theming-text-secondary text-sm">Tu Próxima Clase</p>
                    <h3 className="text-xl font-bold">{nextClass.name}</h3>
                    <div className="flex items-center text-gray-300 text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{nextClass.schedule} - {nextClass.classroom}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <p className="font-bold">Asistencia General: {attendancePercentage}%</p>
                        <CheckCircleIcon className="w-6 h-6 text-brand-green" />
                    </div>
                </Card>

                <Card>
                    <h3 className="font-bold mb-3">Calendario de Parciales</h3>
                    <ul className="space-y-2">
                        {student.subjects.flatMap(s => s.partials.filter(p => p.grade === null)).slice(0, 2).map((p, i) => (
                            <li key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-brand-green mr-3"></span>
                                    <span>{p.name} - {student.subjects.find(s => s.partials.includes(p))?.name}</span>
                                </div>
                                <span className="text-theming-text-secondary">{new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h3 className="font-bold mb-3">Inscripción a Exámenes Finales</h3>
                    <Button onClick={() => onNavigate('studentSubjects')} className="bg-brand-green text-theming-text-on-accent text-sm hover:bg-brand-green-dark">Explorar Materias</Button>
                </Card>
            </main>
        </>
    );
};

const StudentSubjectsScreen: React.FC<{ student: Student, onSelectSubject: (subject: Subject) => void }> = ({ student, onSelectSubject }) => (
    <>
        <Header title="Materias" />
        <main className="p-4 flex-grow overflow-y-auto space-y-4">
            {student.subjects.map(subject => (
                <Card key={subject.id} onClick={() => onSelectSubject(subject)} className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{subject.name}</h3>
                        <p className="text-sm text-theming-text-secondary">{subject.teacher}</p>
                        <p className="text-sm text-theming-text-secondary">{subject.schedule} - {subject.classroom}</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                </Card>
            ))}
        </main>
    </>
);

const StudentSubjectDetailScreen: React.FC<{ student: Student, subjectId: string, onBack: () => void }> = ({ student, subjectId, onBack }) => {
    const [activeTab, setActiveTab] = useState('asistencia');
    const { submitJustification } = useData();
    
    // Always get the latest subject data from the student prop
    const subject = student.subjects.find(s => s.id === subjectId);

    if (!subject) {
        return (
            <div className="h-full flex flex-col">
                <Header title="Error" onBack={onBack} />
                <main className="p-4 flex-grow flex items-center justify-center">
                    <p>Materia no encontrada.</p>
                </main>
            </div>
        );
    }

    const handleJustify = (date: string) => {
        const note = prompt("Por favor, ingresa el nombre del archivo o una nota para la justificación (ej: Certificado.pdf):");
        if (note && note.trim() !== '') {
            submitJustification(student.id, subject.id, date, note);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Header title={subject.name} onBack={onBack} />
            <div className="border-b border-theming-border">
                <div className="flex justify-around">
                    <button onClick={() => setActiveTab('asistencia')} className={`py-3 px-4 font-bold ${activeTab === 'asistencia' ? 'text-brand-green border-b-2 border-brand-green' : 'text-theming-text-secondary'}`}>Asistencia</button>
                    <button onClick={() => setActiveTab('parciales')} className={`py-3 px-4 font-bold ${activeTab === 'parciales' ? 'text-brand-green border-b-2 border-brand-green' : 'text-theming-text-secondary'}`}>Parciales</button>
                    <button onClick={() => setActiveTab('recursos')} className={`py-3 px-4 font-bold ${activeTab === 'recursos' ? 'text-brand-green border-b-2 border-brand-green' : 'text-theming-text-secondary'}`}>Recursos</button>
                </div>
            </div>
            <main className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'asistencia' && (
                    <ul className="space-y-3">
                        {subject.attendance.map(record => {
                             let justificationContent = null;
                             if (record.status === AttendanceStatus.Absent) {
                                 switch (record.justificationStatus) {
                                     case 'pending':
                                         justificationContent = <span className="text-xs text-yellow-400">Pendiente de revisión</span>;
                                         break;
                                     case 'rejected':
                                         justificationContent = <span className="text-xs text-red-400">Justificación rechazada</span>;
                                         break;
                                     case 'none':
                                     case undefined:
                                         justificationContent = <button onClick={() => handleJustify(record.date)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">Justificar</button>;
                                         break;
                                 }
                             } else if (record.justificationStatus === 'approved') {
                                 justificationContent = <span className="text-xs text-green-400">Justificación aprobada</span>;
                             }
                            
                            return (
                                <li key={record.date} className="bg-brand-dark-2 p-3 rounded-theme">
                                    <div className="flex justify-between items-center">
                                       <span>{new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                       <span className={`font-bold ${ATTENDANCE_STATUS[record.status].color}`}>{ATTENDANCE_STATUS[record.status].label}</span>
                                    </div>
                                    {justificationContent && <div className="text-right mt-2">{justificationContent}</div>}
                                </li>
                           );
                        })}
                         {subject.attendance.length === 0 && <p className="text-theming-text-secondary text-center">No hay registros de asistencia.</p>}
                    </ul>
                )}
                {activeTab === 'parciales' && (
                     <ul className="space-y-3">
                        {subject.partials.map(p => (
                             <li key={p.date} className="flex justify-between items-center bg-brand-dark-2 p-3 rounded-theme">
                                 <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-sm text-theming-text-secondary">{new Date(p.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                 </div>
                                 <span className={`font-bold text-lg ${p.grade && p.grade >= 6 ? 'text-green-400' : 'text-red-400'}`}>{p.grade ?? '-'}</span>
                             </li>
                        ))}
                     </ul>
                )}
                {activeTab === 'recursos' && (
                    <div className="text-center text-theming-text-secondary pt-8">
                        <DocumentTextIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p>No hay recursos disponibles.</p>
                    </div>
                )}
            </main>
            <div className="p-4 bg-brand-dark-2">
                 <Button className={`text-theming-text-on-accent ${subject.isRegisteredForFinal ? 'bg-gray-500' : 'bg-brand-green hover:bg-brand-green-dark'}`} disabled={subject.isRegisteredForFinal}>
                    {subject.isRegisteredForFinal ? 'Ya inscripto al Final' : 'Inscribirse a Final'}
                </Button>
            </div>
        </div>
    );
};

// --- TEACHER SCREENS ---

const TeacherDashboard: React.FC<{ teacher: Teacher, onTakeAttendance: (course: Course) => void, onNavigate: (screen: ScreenName) => void }> = ({ teacher, onTakeAttendance, onNavigate }) => {
    const { users } = useData();
    const teacherUser = users.find(u => u.id === teacher.id) as Teacher;

    const pendingJustifications = useMemo(() => {
        if (!teacherUser) return [];
        return teacherUser.managedCourses.flatMap(course =>
            course.students.flatMap(student =>
                (users.find(u => u.id === student.id) as Student)?.subjects?.flatMap(subject =>
                    subject.attendance
                        ?.filter(att => att.justificationStatus === 'pending')
                        .map(att => ({ ...att, student, subject, course })) ?? []
                ) ?? []
            )
        );
    }, [users, teacherUser]);

    return (
        <>
            <Header title="Mi Instituto">
                 <div className="flex items-center space-x-4">
                    <button onClick={() => onNavigate('messages')} aria-label="Notifications" className="relative">
                        <BellIcon className="w-6 h-6 text-theming-text-secondary" />
                    </button>
                    <button onClick={() => onNavigate('teacherProfile')} aria-label="Settings">
                        <CogIcon className="w-6 h-6 text-theming-text-secondary" />
                    </button>
                </div>
            </Header>
            <main className="p-4 flex-grow overflow-y-auto space-y-6">
                 <div className="flex items-center space-x-4">
                     <img src={teacher.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
                     <div>
                        <p className="text-theming-text-secondary">Mi Día</p>
                        <h2 className="text-2xl font-bold">¡Hola, {teacher.name}!</h2>
                     </div>
                 </div>

                <Card className="bg-brand-dark-light space-y-3">
                    <p className="text-sm">Curso: {teacher.managedCourses[0].name}</p>
                    <p className="text-sm">Hora: {teacher.managedCourses[0].schedule} - {teacher.managedCourses[0].classroom}</p>
                    <Button onClick={() => onTakeAttendance(teacher.managedCourses[0])} className="bg-brand-green text-theming-text-on-accent hover:bg-brand-green-dark">
                        Tomar Asistencia
                    </Button>
                </Card>
                
                <Card className="cursor-pointer hover:bg-brand-dark-light" onClick={() => onNavigate('teacherJustifications')}>
                    <h3 className="font-bold mb-2">Justificaciones Pendientes</h3>
                    {pendingJustifications.length > 0 ? (
                        <p className="text-brand-orange font-bold text-lg">{pendingJustifications.length} {pendingJustifications.length === 1 ? 'justificación' : 'justificaciones'} por revisar</p>
                    ) : (
                        <p className="text-theming-text-secondary text-sm">No hay justificaciones pendientes.</p>
                    )}
                </Card>

                <Card>
                    <h3 className="font-bold mb-3">Próximos Eventos</h3>
                     <ul className="space-y-2">
                        <li className="flex items-center text-sm"><span className="w-2 h-2 rounded-full bg-brand-green mr-3"></span>Parcial: 2do Año B - Física: 15/11</li>
                        <li className="flex items-center text-sm"><span className="w-2 h-2 rounded-full bg-brand-green mr-3"></span>Entrega Trabajos - 3er C - Historia: 20/11</li>
                     </ul>
                </Card>

                 <Card>
                    <h3 className="font-bold mb-3">Alumnos con Inasistencias Críticas</h3>
                     <ul className="space-y-2">
                        <li className="flex justify-between items-center text-sm"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-red mr-3"></span>Lautaro Perez (30% Asistencia)</div><span className="w-2 h-2 rounded-full bg-brand-red"></span></li>
                        <li className="flex justify-between items-center text-sm"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-red mr-3"></span>Martina Gomez (25% Asistencia)</div><span className="w-2 h-2 rounded-full bg-brand-red"></span></li>
                     </ul>
                </Card>
            </main>
        </>
    );
};

const TeacherCoursesScreen: React.FC<{ teacher: Teacher, onSelectCourse: (course: Course) => void }> = ({ teacher, onSelectCourse }) => (
    <>
        <Header title="Mis Cursos" />
        <main className="p-4 flex-grow overflow-y-auto space-y-4">
            {teacher.managedCourses.map(course => (
                 <Card key={course.id} onClick={() => onSelectCourse(course)} className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{course.name}</h3>
                        <p className="text-sm text-theming-text-secondary">{course.schedule} - {course.classroom}</p>
                        <p className="text-sm text-theming-text-secondary">{course.students.length} alumnos</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                </Card>
            ))}
        </main>
    </>
);

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CourseAttendanceScreen: React.FC<{ course: Course, onBack: () => void, onSelectStudent: (student: Student) => void }> = ({ course, onBack, onSelectStudent }) => {
    const { updateStudentData, findUserById } = useData();
    const today = getTodayDateString();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const getInitialAttendance = (studentId: number, courseId: string) => {
        const student = findUserById(studentId) as Student;
        if (!student?.subjects) return AttendanceStatus.Pending;
        
        const subject = student.subjects.find(s => s.id === courseId);
        const todayRecord = subject?.attendance.find(att => att.date === today);
        return todayRecord?.status || AttendanceStatus.Pending;
    };
    
    const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>(() => {
        const initialState: Record<number, AttendanceStatus> = {};
        course.students.forEach(student => {
            initialState[student.id] = getInitialAttendance(student.id, course.id);
        });
        return initialState;
    });

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
        const allPresent: Record<number, AttendanceStatus> = {};
        course.students.forEach(student => {
            allPresent[student.id] = AttendanceStatus.Present;
        });
        setAttendance(allPresent);
    };

    const handleConfirm = () => {
        Object.entries(attendance).forEach(([studentId, status]) => {
            updateStudentData(Number(studentId), course.id, today, status);
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 2500);
    };
    
    const attendanceButtons: {status: AttendanceStatus, label: string, color: string}[] = [
        { status: AttendanceStatus.Present, label: 'P', color: 'bg-green-500 hover:bg-green-600' },
        { status: AttendanceStatus.Absent, label: 'A', color: 'bg-red-500 hover:bg-red-600' },
        { status: AttendanceStatus.Justified, label: 'J', color: 'bg-orange-500 hover:bg-orange-600' },
        { status: AttendanceStatus.Late, label: 'T', color: 'bg-blue-500 hover:bg-blue-600' },
    ];


    return (
        <div className="h-full flex flex-col">
            <Header title="Tomar Asistencia" onBack={onBack} />
            <div className="bg-brand-green p-4 text-theming-text-on-accent">
                <h2 className="font-bold">{course.name}</h2>
                <p>{course.schedule} - {course.classroom}</p>
                <p>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="p-4">
                <Button onClick={markAllPresent} className="bg-brand-dark-light text-theming-text-primary mb-4">Marcar Todos Presentes</Button>
            </div>
            <main className="flex-grow overflow-y-auto px-4 space-y-2">
                {course.students.map(student => (
                    <div key={student.id} className="bg-brand-dark-2 p-3 rounded-theme flex items-center justify-between">
                        <div onClick={() => onSelectStudent(student)} className="cursor-pointer">
                            <p className="font-bold">{student.name}</p>
                            <p className="text-xs text-theming-text-secondary">Legajo: {student.studentId}</p>
                        </div>
                        <div className="flex space-x-1">
                           {attendanceButtons.map(btn => (
                               <button
                                 key={btn.status}
                                 onClick={() => handleStatusChange(student.id, btn.status)}
                                 className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center transition-transform transform
                                 ${attendance[student.id] === btn.status ? `${btn.color} text-white scale-110` : 'bg-brand-dark-light text-gray-300 hover:scale-105'}`}
                                >
                                {btn.label}
                               </button>
                           ))}
                        </div>
                    </div>
                ))}
            </main>
            <div className="p-4 mt-auto bg-brand-dark-2">
                <Button onClick={handleConfirm} className="bg-brand-green text-theming-text-on-accent hover:bg-brand-green-dark">Confirmar Asistencia</Button>
            </div>
            <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${showSuccessMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="font-bold">¡Asistencia guardada con éxito!</span>
                </div>
            </div>
        </div>
    );
};

const TeacherStudentProfileScreen: React.FC<{ student: Student, teacher: Teacher, onBack: () => void, onNavigateToChat: (partner: Student) => void }> = ({ student, teacher, onBack, onNavigateToChat }) => {
    const { conversations } = useData();

    const calculateAttendancePercentage = (subject: Subject) => {
        const total = subject.attendance.length;
        if (total === 0) return 100;
        const present = subject.attendance.filter(a => a.status === AttendanceStatus.Present || a.status === AttendanceStatus.Justified).length;
        return Math.round((present / total) * 100);
    };

    const justificationHistory = useMemo(() => {
        return student.subjects.flatMap(subject =>
            subject.attendance
                .filter(att => att.justificationStatus && att.justificationStatus !== 'none')
                .map(att => ({
                    ...att,
                    subjectName: subject.name
                }))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [student.subjects]);

    const conversation = useMemo(() => {
        return conversations.find(c =>
            c.participantIds.includes(student.id) && c.participantIds.includes(teacher.id)
        );
    }, [conversations, student, teacher]);

    return (
        <div className="h-full flex flex-col">
            <Header title="Perfil del Alumno" onBack={onBack}/>
            <main className="p-4 flex-grow overflow-y-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <img src={student.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold">{student.name}</h2>
                        <p className="text-theming-text-secondary">Legajo: {student.studentId}</p>
                    </div>
                </div>

                <Card>
                    <h3 className="font-bold mb-3 text-lg">Asistencia por Materia</h3>
                    <ul className="space-y-3">
                        {student.subjects.map(subject => (
                            <li key={subject.id}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <p>{subject.name}</p>
                                    <p className="font-bold">{calculateAttendancePercentage(subject)}%</p>
                                </div>
                                <div className="w-full bg-brand-dark-light rounded-full h-2.5">
                                    <div className="bg-brand-green h-2.5 rounded-full" style={{width: `${calculateAttendancePercentage(subject)}%`}}></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                     <h3 className="font-bold mb-3 text-lg">Notas de Parciales</h3>
                     <ul className="space-y-2">
                        {student.subjects.flatMap(s => s.partials.map(p => ({...p, subjectName: s.name}))).map((p, i) => (
                             <li key={i} className="flex justify-between items-center bg-brand-dark-light p-3 rounded-md">
                                 <div>
                                    <p className="font-bold">{p.name} - {p.subjectName}</p>
                                    <p className="text-xs text-theming-text-secondary">{new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}</p>
                                 </div>
                                 <span className={`text-xl font-bold ${p.grade && p.grade >= 6 ? 'text-green-400' : 'text-red-400'}`}>{p.grade ?? '-'}</span>
                             </li>
                        ))}
                     </ul>
                </Card>

                <Card>
                     <h3 className="font-bold mb-3 text-lg">Inscripción a Finales</h3>
                      <ul className="space-y-2">
                         {student.subjects.map(subject => (
                              <li key={subject.id} className="flex justify-between items-center text-sm">
                                  <span>{subject.name}</span>
                                  {subject.isRegisteredForFinal ? 
                                    <span className="flex items-center text-green-400"><CheckCircleIcon className="w-5 h-5 mr-1"/> Inscripto</span> :
                                    <span className="flex items-center text-theming-text-secondary"><XCircleIcon className="w-5 h-5 mr-1"/> No Inscripto</span>
                                  }
                              </li>
                         ))}
                      </ul>
                </Card>

                <Card>
                    <h3 className="font-bold mb-3 text-lg">Historial de Justificaciones</h3>
                    {justificationHistory.length > 0 ? (
                        <ul className="space-y-3">
                            {justificationHistory.map((att, i) => {
                                const statusInfo = {
                                    approved: { text: 'Aprobado', color: 'text-green-400', Icon: CheckCircleIcon },
                                    rejected: { text: 'Rechazado', color: 'text-red-400', Icon: XCircleIcon },
                                    pending: { text: 'Pendiente', color: 'text-yellow-400', Icon: MinusCircleIcon },
                                }[att.justificationStatus!] || {};

                                return (
                                    <li key={i} className="bg-brand-dark-light p-3 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm">{att.subjectName}</p>
                                                <p className="text-xs text-theming-text-secondary">Falta del: {new Date(att.date).toLocaleDateString('es-ES')}</p>
                                                <p className="text-sm italic mt-1 text-gray-300">"{att.justificationNote}"</p>
                                            </div>
                                            {statusInfo.Icon && (
                                                <div className={`flex items-center text-xs font-bold ${statusInfo.color}`}>
                                                    <statusInfo.Icon className="w-4 h-4 mr-1" />
                                                    <span>{statusInfo.text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-theming-text-secondary">El alumno no ha enviado justificaciones.</p>
                    )}
                </Card>
                
                <Card>
                    <h3 className="font-bold mb-3 text-lg">Historial de Mensajes</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-brand-dark-light p-2 rounded-md mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {conversation && conversation.messages.length > 0 ? (
                            conversation.messages.slice(-5).map(message => (
                                <div key={message.id} className={`text-sm ${message.senderId === teacher.id ? 'text-right' : 'text-left'}`}>
                                    <p className={`inline-block px-2 py-1 rounded-lg ${message.senderId === teacher.id ? 'bg-brand-green text-theming-text-on-accent' : 'bg-brand-dark'}`}>
                                        {message.text}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-theming-text-secondary text-center py-4">No hay mensajes en esta conversación.</p>
                        )}
                    </div>
                    <Button onClick={() => onNavigateToChat(student)} className="bg-brand-dark-light text-theming-text-primary text-sm w-full hover:bg-opacity-80">
                        Ver Chat Completo
                    </Button>
                </Card>
            </main>
        </div>
    );
};

const TeacherJustificationsScreen: React.FC<{ teacher: Teacher, onBack: () => void }> = ({ teacher, onBack }) => {
    const { reviewJustification, users } = useData();

    const pendingJustifications = useMemo(() => {
        return users
            .filter((u): u is Student => u.role === 'student')
            .flatMap(student =>
                student.subjects?.flatMap(subject =>
                    subject.attendance
                        ?.filter(att => att.justificationStatus === 'pending')
                        .map(att => ({ ...att, student, subject })) ?? []
                ) ?? []
            );
    }, [users]);
    
    const handleReview = (att: any, approved: boolean) => {
        reviewJustification(att.student.id, att.subject.id, att.date, approved);
    };

    return (
        <div className="h-full flex flex-col">
            <Header title="Justificaciones" onBack={onBack} />
            <main className="p-4 flex-grow overflow-y-auto space-y-4">
                {pendingJustifications.length > 0 ? pendingJustifications.map((att, index) => (
                    <Card key={`${att.student.id}-${att.date}-${index}`}>
                        <div className="flex items-start space-x-3">
                           <img src={att.student.avatar} alt={att.student.name} className="w-10 h-10 rounded-full"/>
                           <div>
                                <p className="font-bold">{att.student.name}</p>
                                <p className="text-sm text-theming-text-secondary">{att.subject.name}</p>
                                <p className="text-xs text-gray-500">Fecha de falta: {new Date(att.date).toLocaleDateString('es-ES')}</p>
                           </div>
                        </div>
                        <div className="bg-brand-dark-light p-3 rounded-md mt-3">
                            <p className="text-sm font-semibold">Justificación presentada:</p>
                            <p className="text-sm text-gray-300 italic">"{att.justificationNote}"</p>
                        </div>
                        <div className="flex space-x-2 mt-4">
                            <Button onClick={() => handleReview(att, true)} className="bg-brand-green text-theming-text-on-accent text-sm flex-1 hover:bg-brand-green-dark">Aprobar</Button>
                            <Button onClick={() => handleReview(att, false)} className="bg-brand-red text-white text-sm flex-1 hover:bg-red-600">Rechazar</Button>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center text-theming-text-secondary pt-16">
                        <DocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                        <h3 className="text-lg font-bold">Todo al día</h3>
                        <p>No hay justificaciones pendientes de revisión.</p>
                    </div>
                )}
            </main>
        </div>
    );
};


// --- MESSAGING SCREENS ---

const ConversationsScreen: React.FC<{ user: User, onSelectChat: (partner: User) => void }> = ({ user, onSelectChat }) => {
    const { conversations, findUserById } = useData();

    const userConversations = conversations
        .filter(c => c.participantIds.includes(user.id))
        .map(c => {
            const partnerId = c.participantIds.find(id => id !== user.id);
            const partner = partnerId ? findUserById(partnerId) : null;
            const lastMessage = c.messages[c.messages.length - 1];
            return { conversation: c, partner, lastMessage };
        })
        .filter(data => data.partner && data.lastMessage) // Ensure partner and message exist
        .sort((a, b) => new Date(b.lastMessage!.timestamp).getTime() - new Date(a.lastMessage!.timestamp).getTime());

    return (
        <>
            <Header title="Mensajes" />
            <main className="p-4 flex-grow overflow-y-auto space-y-3">
                {userConversations.map(({ partner, lastMessage }) => (
                    partner && lastMessage && (
                        <Card key={partner.id} onClick={() => onSelectChat(partner)} className="flex items-center space-x-4">
                            <img src={partner.avatar} alt={partner.name} className="w-12 h-12 rounded-full" />
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold truncate">{partner.name}</h3>
                                    <p className="text-xs text-theming-text-secondary flex-shrink-0">{new Date(lastMessage.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <p className="text-sm text-gray-300 truncate">{lastMessage.text}</p>
                            </div>
                        </Card>
                    )
                ))}
                {userConversations.length === 0 && <p className="text-theming-text-secondary text-center pt-8">No tienes mensajes.</p>}
            </main>
        </>
    );
};

const ChatScreen: React.FC<{ user: User, partner: User, onBack: () => void }> = ({ user, partner, onBack }) => {
    const { conversations, addMessage } = useData();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversation = conversations.find(c => 
        c.participantIds.includes(user.id) && c.participantIds.includes(partner.id)
    ) || { messages: [] };

    const handleSend = () => {
        if (newMessage.trim()) {
            addMessage(user.id, partner.id, newMessage.trim());
            setNewMessage('');
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.messages]);

    return (
        <div className="h-full flex flex-col">
            <Header title={partner.name} onBack={onBack} />
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {conversation.messages.map(message => (
                    <div key={message.id} className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === user.id ? 'bg-brand-green text-theming-text-on-accent' : 'bg-brand-dark-2'}`}>
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${message.senderId === user.id ? 'text-gray-800' : 'text-theming-text-secondary'} text-right`}>
                                {new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <div className="p-2 bg-brand-dark-2 flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow bg-brand-dark-light rounded-full py-2 px-4 focus:outline-none"
                />
                <button onClick={handleSend} className="p-2 ml-2 text-brand-green hover:text-brand-green-dark">
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

// --- COMMON SCREENS ---

const AddEventModal: React.FC<{
    initialDate: Date;
    onClose: () => void;
    onSave: (title: string, date: string) => void;
}> = ({ initialDate, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    // Format date to YYYY-MM-DD for the input[type="date"]
    const [date, setDate] = useState(initialDate.toISOString().split('T')[0]);

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, date);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-brand-dark-2 rounded-lg p-6 w-11/12 max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Agregar Evento</h3>
                    <button onClick={onClose} className="text-theming-text-secondary hover:text-theming-text-primary">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                        <input
                            type="text"
                            id="event-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 bg-brand-dark-light border border-brand-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="Ej: Estudiar para parcial"
                        />
                    </div>
                    <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                        <input
                            type="date"
                            id="event-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 bg-brand-dark-light border border-brand-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <Button onClick={onClose} className="bg-brand-dark-light text-theming-text-primary text-sm w-auto px-4 py-2">Cancelar</Button>
                    <Button onClick={handleSave} className="bg-brand-green text-theming-text-on-accent text-sm w-auto px-4 py-2">Guardar</Button>
                </div>
            </div>
        </div>
    );
};

const CalendarScreen: React.FC<{ user: User }> = ({ user }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { addCustomEvent } = useData();

    const events = useMemo(() => {
        let academicEvents: { date: Date, title: string }[] = [];
        if (user.role === 'student') {
            const student = user as Student;
            student.subjects.forEach(subject => {
                subject.partials.forEach(partial => {
                    academicEvents.push({ date: new Date(partial.date), title: `${partial.name} - ${subject.name}` });
                });
            });
        } else {
            // Mock events for teacher
            academicEvents = [
                { date: new Date(2024, 10, 15), title: 'Parcial: Física - Aula 2B' },
                { date: new Date(2024, 10, 28), title: 'Parcial: Historia - Aula Magna' },
            ];
        }
        
        const customUserEvents = user.customEvents?.map(e => ({
            date: new Date(`${e.date}T00:00:00`), // Use T00:00:00 to avoid timezone issues
            title: e.title,
        })) || [];

        return [...academicEvents, ...customUserEvents];
    }, [user]);

    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setSelectedDate(null);
    };

    const handleSaveEvent = (title: string, date: string) => {
        addCustomEvent(user.id, { title, date });
        setIsAddModalOpen(false);
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startDay }, (_, i) => i);

    const eventsOnSelectedDate = selectedDate ? events.filter(e => e.date.toDateString() === selectedDate.toDateString()) : [];
    const upcomingEvents = events.filter(e => 
        e.date.getMonth() === currentDate.getMonth() && 
        e.date.getFullYear() === currentDate.getFullYear() &&
        e.date >= new Date()
    ).sort((a,b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="h-full flex flex-col relative">
            <Header title="Calendario" />
            <main className="p-4 flex-grow overflow-y-auto">
                <Card className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)}><ChevronLeftIcon className="w-6 h-6" /></button>
                        <h3 className="font-bold text-lg">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h3>
                        <button onClick={() => changeMonth(1)}><ChevronRightIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs text-theming-text-secondary mb-2">
                        {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 text-center">
                        {blanks.map(b => <div key={`blank-${b}`}></div>)}
                        {days.map(day => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isToday = date.toDateString() === new Date().toDateString();
                            const hasEvent = events.some(e => e.date.toDateString() === date.toDateString());
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            
                            return (
                                <div key={day} className="relative py-2">
                                    <button
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto
                                            ${isToday ? 'bg-brand-green text-theming-text-on-accent font-bold' : ''}
                                            ${isSelected ? 'ring-2 ring-brand-green' : ''}
                                            ${!isToday && !isSelected ? 'hover:bg-brand-dark-light' : ''}
                                        `}
                                    >
                                        {day}
                                    </button>
                                    {hasEvent && <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-brand-green rounded-full"></div>}
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold mb-3">{selectedDate ? `Eventos del ${selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}` : 'Próximos Eventos'}</h3>
                    <ul className="space-y-3">
                        {(selectedDate ? eventsOnSelectedDate : upcomingEvents).map((event, i) => (
                             <li key={i}>
                                <p className="font-bold">{event.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                <p className="text-sm text-gray-300">{event.title}</p>
                             </li>
                        ))}
                        {(selectedDate ? eventsOnSelectedDate : upcomingEvents).length === 0 && (
                            <p className="text-sm text-theming-text-secondary">No hay eventos programados.</p>
                        )}
                    </ul>
                </Card>
            </main>
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="absolute bottom-6 right-6 bg-brand-green text-theming-text-on-accent rounded-full p-4 shadow-lg hover:bg-brand-green-dark transition-colors z-20"
                aria-label="Agregar evento"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
            {isAddModalOpen && (
                <AddEventModal
                    initialDate={selectedDate || new Date()}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveEvent}
                />
            )}
        </div>
    );
};

const AvatarSelectionModal: React.FC<{ onSelect: (avatarUrl: string) => void, onClose: () => void }> = ({ onSelect, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-brand-dark-2 rounded-lg p-6 w-11/12 max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Selecciona un nuevo avatar</h3>
                <button onClick={onClose} className="text-theming-text-secondary hover:text-theming-text-primary">
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {SAMPLE_AVATARS.map(avatarUrl => (
                    <button key={avatarUrl} onClick={() => onSelect(avatarUrl)} className="rounded-full overflow-hidden aspect-square hover:ring-2 hover:ring-brand-green transition-all">
                        <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const ProfileScreen: React.FC<{ user: User, onLogout: () => void, onNavigate: (screen: ScreenName) => void }> = ({ user, onLogout, onNavigate }) => {
    const { updateUserAvatar } = useData();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const handleAvatarChange = (newAvatarUrl: string) => {
        updateUserAvatar(user.id, newAvatarUrl);
        setIsAvatarModalOpen(false);
    };
    
    const profileOptions = [
        { id: 'notifications', label: 'Notificaciones', icon: BellIcon, screen: 'notificationsSettings' as ScreenName },
        { id: 'appearance', label: 'Apariencia', icon: PaintBrushIcon, screen: 'appearanceSettings' as ScreenName },
        { id: 'privacy', label: 'Privacidad', icon: ShieldCheckIcon, screen: 'privacySettings' as ScreenName },
        { id: 'language', label: 'Idioma', icon: GlobeAltIcon, screen: 'languageSettings' as ScreenName },
    ];
    
    return (
         <>
            <Header title="Perfil" />
            <main className="p-4 flex-grow overflow-y-auto space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <button onClick={() => setIsAvatarModalOpen(true)} className="relative group">
                        <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full group-hover:opacity-75 transition-opacity" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <p className="text-white text-sm font-bold">Cambiar</p>
                        </div>
                    </button>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-theming-text-secondary">{user.email}</p>
                </div>
                
                <Card>
                    <h3 className="font-bold text-lg mb-2">Configuración</h3>
                    <ul className="space-y-1">
                        {profileOptions.map(option => (
                           <li key={option.id} onClick={() => onNavigate(option.screen)} className="flex items-center p-3 rounded-theme hover:bg-brand-dark-light cursor-pointer">
                                <option.icon className="w-6 h-6 mr-4 text-theming-text-secondary" />
                                <span>{option.label}</span>
                                <ChevronRightIcon className="w-5 h-5 ml-auto text-gray-500" />
                           </li>
                        ))}
                    </ul>
                </Card>

                <div className="pt-4">
                     <Button onClick={onLogout} className="bg-brand-dark-light text-brand-red flex items-center justify-center space-x-2 hover:bg-opacity-80">
                         <LogoutIcon className="w-5 h-5" />
                         <span>Cerrar Sesión</span>
                     </Button>
                </div>
            </main>
            {isAvatarModalOpen && (
                <AvatarSelectionModal
                    onSelect={handleAvatarChange}
                    onClose={() => setIsAvatarModalOpen(false)}
                />
            )}
        </>
    )
};

const NotificationsSettingsScreen: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [settings, setSettings] = useState({
        reminders: true,
        classroomChanges: true,
        messages: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({...prev, [key]: !prev[key]}));
    }
    
    return (
        <div className="h-full flex flex-col">
            <Header title="Notificaciones" onBack={onBack}/>
            <main className="p-4 flex-grow overflow-y-auto">
                <Card>
                    <Toggle label="Recordatorios de parciales" enabled={settings.reminders} onToggle={() => toggleSetting('reminders')} />
                    <hr className="border-theming-border"/>
                    <Toggle label="Cambios de aula" enabled={settings.classroomChanges} onToggle={() => toggleSetting('classroomChanges')} />
                    <hr className="border-theming-border"/>
                    <Toggle label="Mensajes nuevos" enabled={settings.messages} onToggle={() => toggleSetting('messages')} />
                </Card>
            </main>
        </div>
    );
};

const PrivacySettingsScreen: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [isProfilePublic, setIsProfilePublic] = useState(false);

    const handleChangePassword = () => {
        alert("Funcionalidad para cambiar contraseña no implementada en esta demo.");
    };

    return (
        <div className="h-full flex flex-col">
            <Header title="Privacidad" onBack={onBack}/>
            <main className="p-4 flex-grow overflow-y-auto">
                 <Card>
                    <div onClick={handleChangePassword} className="flex items-center p-3 rounded-theme hover:bg-brand-dark-light cursor-pointer">
                        <span>Cambiar contraseña</span>
                        <ChevronRightIcon className="w-5 h-5 ml-auto text-gray-500" />
                    </div>
                     <hr className="border-theming-border"/>
                     <Toggle label="Mantener perfil público" enabled={isProfilePublic} onToggle={() => setIsProfilePublic(prev => !prev)} />
                </Card>
            </main>
        </div>
    );
};

const LanguageSettingsScreen: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [selectedLanguage, setSelectedLanguage] = useState('es');
    const languages = [
        {id: 'es', label: 'Español'},
        {id: 'en', label: 'English'},
        {id: 'pt', label: 'Português'},
    ];

    return (
        <div className="h-full flex flex-col">
            <Header title="Idioma" onBack={onBack}/>
            <main className="p-4 flex-grow overflow-y-auto">
                <Card>
                    {languages.map(lang => (
                        <div key={lang.id} onClick={() => setSelectedLanguage(lang.id)} className="flex items-center p-3 rounded-theme hover:bg-brand-dark-light cursor-pointer">
                            <span>{lang.label}</span>
                            {selectedLanguage === lang.id && <CheckCircleIcon className="w-6 h-6 ml-auto text-brand-green" />}
                        </div>
                    ))}
                </Card>
            </main>
        </div>
    );
};

const AppearanceSettingsScreen: React.FC<{onBack: () => void}> = ({onBack}) => {
    const { theme, setTheme, themes, borderStyle, setBorderStyle, borderStyles } = useAppearance();

    return (
        <div className="h-full flex flex-col">
            <Header title="Modelos de Apariencia" onBack={onBack}/>
            <main className="p-4 flex-grow overflow-y-auto space-y-8">
                 <div>
                    <h2 className="text-xl font-bold text-theming-text-primary mb-1">Modelos de Apariencia</h2>
                    <p className="text-theming-text-secondary">Personaliza la apariencia de la aplicación.</p>
                </div>

                <section>
                    <h3 className="text-lg font-bold flex items-center mb-4">
                        <SwatchIcon className="w-6 h-6 mr-3 text-theming-text-secondary" />
                        Temas de Color
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(themes).map(t => (
                            <div key={t.id} onClick={() => setTheme(t.id)}
                                className={`p-3 rounded-theme cursor-pointer border-2 transition-all ${theme === t.id ? 'border-brand-green' : 'border-brand-dark-2'}`}>
                                <h4 className="font-bold mb-3 flex items-center">
                                    {t.name}
                                </h4>
                                <div className="flex space-x-2">
                                    <div className="w-6 h-6 rounded-full border border-black/10" style={{backgroundColor: t.colors.c1}}></div>
                                    <div className="w-6 h-6 rounded-full border border-black/10" style={{backgroundColor: t.colors.c2}}></div>
                                    <div className="w-6 h-6 rounded-full border border-black/10" style={{backgroundColor: t.colors.c3}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold flex items-center mb-4">
                        <RectangleStackIcon className="w-6 h-6 mr-3 text-theming-text-secondary" />
                        Estilos de Borde
                    </h3>
                     <div className="bg-brand-dark-2 rounded-theme p-2 space-y-1">
                        {Object.values(borderStyles).map(bs => (
                            <button key={bs.id} onClick={() => setBorderStyle(bs.id)}
                                className={`w-full text-left p-3 rounded-md transition-colors ${borderStyle === bs.id ? 'bg-brand-green text-theming-text-on-accent' : 'hover:bg-brand-dark-light'}`}>
                                {bs.name}
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

// --- MAIN APP COMPONENT ---

const AppContent: React.FC = () => {
    const { users, findUserById } = useData();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [activeScreen, setActiveScreen] = useState<ScreenName>('login');
    
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<number | null>(null);
    const [chatReturnScreen, setChatReturnScreen] = useState<ScreenName>('messages');

    const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);

    const selectedCourse = useMemo(() => {
        if (!selectedCourseId || !currentUser || currentUser.role !== 'teacher') return null;
        const teacher = currentUser as Teacher;
        const course = teacher.managedCourses.find(c => c.id === selectedCourseId);
        if (!course) return null;
        // Ensure student data in course is fresh
        course.students = course.students.map(s => findUserById(s.id) as Student || s);
        return course;
    }, [currentUser, selectedCourseId, findUserById]);
    
    const selectedStudent = useMemo(() => {
        if (!selectedStudentId) return null;
        return findUserById(selectedStudentId) as Student || null;
    }, [findUserById, selectedStudentId]);

    const selectedChatPartner = useMemo(() => {
        if (!selectedChatPartnerId) return null;
        return findUserById(selectedChatPartnerId) || null;
    }, [findUserById, selectedChatPartnerId]);


    const handleLoginSuccess = (user: User) => {
        setCurrentUserId(user.id);
        setActiveScreen(user.role === 'student' ? 'studentDashboard' : 'teacherDashboard');
    };

    const handleLogout = () => {
        setCurrentUserId(null);
        setActiveScreen('login');
    };

    const handleNav = (item: NavItem) => {
        if (currentUser?.role === 'student') {
            if (item.id === 'home') setActiveScreen('studentDashboard');
            if (item.id === 'materias') setActiveScreen('studentSubjects');
            if (item.id === 'calendario') setActiveScreen('studentCalendar');
            if (item.id === 'mensajes') setActiveScreen('messages');
            if (item.id === 'perfil') setActiveScreen('studentProfile');
        } else if (currentUser?.role === 'teacher') {
            if (item.id === 'home') setActiveScreen('teacherDashboard');
            if (item.id === 'materias') setActiveScreen('teacherCourses');
            if (item.id === 'calendario') setActiveScreen('teacherCalendar');
            if (item.id === 'mensajes') setActiveScreen('messages');
            if (item.id === 'perfil') setActiveScreen('teacherProfile');
        }
    };
    
    const studentNavItems: NavItem[] = [
        { id: 'home', label: 'Inicio', icon: HomeIcon },
        { id: 'calendario', label: 'Calendario', icon: CalendarIcon },
        { id: 'materias', label: 'Materias', icon: BookOpenIcon },
        { id: 'mensajes', label: 'Mensajes', icon: ChatBubbleLeftRightIcon },
        { id: 'perfil', label: 'Perfil', icon: UserCircleIcon },
    ];
    
    const teacherNavItems: NavItem[] = [
        { id: 'home', label: 'Inicio', icon: HomeIcon },
        { id: 'calendario', label: 'Calendario', icon: CalendarIcon },
        { id: 'materias', label: 'Materias', icon: BookOpenIcon },
        { id: 'mensajes', label: 'Mensajes', icon: ChatBubbleLeftRightIcon },
        { id: 'perfil', label: 'Perfil', icon: UserCircleIcon },
    ];
    
    const navIdMap: Record<string, string> = {
        'studentDashboard': 'home', 'teacherDashboard': 'home',
        'studentSubjects': 'materias', 'teacherCourses': 'materias',
        'studentCalendar': 'calendario', 'teacherCalendar': 'calendario',
        'messages': 'mensajes',
        'studentProfile': 'perfil', 'teacherProfile': 'perfil',
    };
    
    const activeNavId = navIdMap[activeScreen] || '';

    const renderContent = () => {
        if (!currentUser) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

        const handleSelectChat = (partner: User) => {
            setSelectedChatPartnerId(partner.id);
            setChatReturnScreen('messages');
            setActiveScreen('chat');
        };

        // Student Screens
        if (currentUser.role === 'student') {
            const student = currentUser as Student;
            switch (activeScreen) {
                case 'studentDashboard': return <StudentDashboard student={student} onNavigate={setActiveScreen} />;
                case 'studentSubjects': return <StudentSubjectsScreen student={student} onSelectSubject={(s) => { setSelectedSubjectId(s.id); setActiveScreen('studentSubjectDetail'); }} />;
                case 'studentSubjectDetail': return selectedSubjectId && <StudentSubjectDetailScreen student={student} subjectId={selectedSubjectId} onBack={() => setActiveScreen('studentSubjects')} />;
                case 'studentCalendar': return <CalendarScreen user={student} />;
                case 'messages': return <ConversationsScreen user={student} onSelectChat={handleSelectChat} />;
                case 'chat': return selectedChatPartner && <ChatScreen user={student} partner={selectedChatPartner} onBack={() => setActiveScreen(chatReturnScreen)} />;
                case 'studentProfile': return <ProfileScreen user={student} onLogout={handleLogout} onNavigate={setActiveScreen} />;
                case 'notificationsSettings': return <NotificationsSettingsScreen onBack={() => setActiveScreen('studentProfile')} />;
                case 'privacySettings': return <PrivacySettingsScreen onBack={() => setActiveScreen('studentProfile')} />;
                case 'languageSettings': return <LanguageSettingsScreen onBack={() => setActiveScreen('studentProfile')} />;
                case 'appearanceSettings': return <AppearanceSettingsScreen onBack={() => setActiveScreen('studentProfile')} />;
                default: return <StudentDashboard student={student} onNavigate={setActiveScreen} />;
            }
        }

        // Teacher Screens
        if (currentUser.role === 'teacher') {
            const teacher = currentUser as Teacher;
            switch (activeScreen) {
                case 'teacherDashboard': return <TeacherDashboard teacher={teacher} onTakeAttendance={(c) => { setSelectedCourseId(c.id); setActiveScreen('courseAttendance'); }} onNavigate={setActiveScreen} />;
                case 'teacherCourses': return <TeacherCoursesScreen teacher={teacher} onSelectCourse={(c) => { setSelectedCourseId(c.id); setActiveScreen('courseAttendance'); }} />;
                case 'courseAttendance': return selectedCourse && <CourseAttendanceScreen course={selectedCourse} onBack={() => setActiveScreen('teacherCourses')} onSelectStudent={(s) => { setSelectedStudentId(s.id); setActiveScreen('teacherStudentProfile'); }} />;
                case 'teacherStudentProfile': return selectedStudent && <TeacherStudentProfileScreen 
                    student={selectedStudent} 
                    teacher={teacher}
                    onBack={() => setActiveScreen('courseAttendance')} 
                    onNavigateToChat={(partner) => {
                        setSelectedChatPartnerId(partner.id);
                        setChatReturnScreen('teacherStudentProfile');
                        setActiveScreen('chat');
                    }}
                />;
                case 'teacherCalendar': return <CalendarScreen user={teacher} />;
                case 'teacherJustifications': return <TeacherJustificationsScreen teacher={teacher} onBack={() => setActiveScreen('teacherDashboard')} />;
                case 'messages': return <ConversationsScreen user={teacher} onSelectChat={handleSelectChat} />;
                case 'chat': return selectedChatPartner && <ChatScreen user={teacher} partner={selectedChatPartner} onBack={() => setActiveScreen(chatReturnScreen)} />;
                case 'teacherProfile': return <ProfileScreen user={teacher} onLogout={handleLogout} onNavigate={setActiveScreen} />;
                case 'notificationsSettings': return <NotificationsSettingsScreen onBack={() => setActiveScreen('teacherProfile')} />;
                case 'privacySettings': return <PrivacySettingsScreen onBack={() => setActiveScreen('teacherProfile')} />;
                case 'languageSettings': return <LanguageSettingsScreen onBack={() => setActiveScreen('teacherProfile')} />;
                case 'appearanceSettings': return <AppearanceSettingsScreen onBack={() => setActiveScreen('teacherProfile')} />;
                default: return <TeacherDashboard teacher={teacher} onTakeAttendance={(c) => { setSelectedCourseId(c.id); setActiveScreen('courseAttendance'); }} onNavigate={setActiveScreen} />;
            }
        }
        return null;
    };
    
    const showNavBar = currentUser && ['studentDashboard', 'teacherDashboard', 'studentSubjects', 'teacherCourses', 'studentCalendar', 'teacherCalendar', 'messages', 'studentProfile', 'teacherProfile'].includes(activeScreen);

    return (
        <Screen>
            <div className="flex flex-col h-full relative">
                {renderContent()}
                {showNavBar && (
                     <BottomNavBar 
                        active={activeNavId}
                        onNavigate={handleNav}
                        navItems={currentUser.role === 'student' ? studentNavItems : teacherNavItems}
                    />
                )}
            </div>
        </Screen>
    );
};


const App: React.FC = () => {
    return (
        <AppearanceProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AppearanceProvider>
    );
};

export default App;