import React from 'react';

export interface Message {
    id: string;
    senderId: number;
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    participantIds: number[];
    messages: Message[];
}

export type UserRole = 'student' | 'teacher';

export interface CustomEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  customEvents?: CustomEvent[];
}

export interface Student extends User {
  role: 'student';
  subjects: Subject[];
  studentId?: string; // Legajo
}

export interface Teacher extends User {
  role: 'teacher';
  managedCourses: Course[];
}

export interface Course {
    id: string;
    name: string;
    schedule: string;
    classroom: string;
    students: Student[];
}

export interface Subject {
    id: string;
    name: string;
    teacher: string;
    schedule: string;
    classroom: string;
    attendance: AttendanceRecord[];
    // FIX: Updated to use PartialGrade to avoid name conflict with TypeScript's built-in Partial utility type.
    partials: PartialGrade[];
    isRegisteredForFinal?: boolean;
}

export interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
    justificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    justificationNote?: string | null;
}

// FIX: Renamed `Partial` interface to `PartialGrade` to avoid name conflict with TypeScript's built-in `Partial` utility type.
export interface PartialGrade {
    name: string;
    date: string;
    grade: number | null;
}

export enum AttendanceStatus {
    Present = 'present',
    Absent = 'absent',
    Justified = 'justified',
    Pending = 'pending',
    Late = 'late'
}

export interface NavItem {
    id: string;
    label: string;
    icon: React.FC<{className?: string}>;
}

export interface DataContextType {
    users: (Student | Teacher)[];
    conversations: Conversation[];
    updateStudentData: (studentId: number, courseId: string, date: string, newStatus: AttendanceStatus) => void;
    addMessage: (senderId: number, receiverId: number, text: string) => void;
    findUserById: (id: number) => Student | Teacher | undefined;
    submitJustification: (studentId: number, subjectId: string, date: string, note: string) => void;
    reviewJustification: (studentId: number, subjectId: string, date: string, approved: boolean) => void;
    updateUserAvatar: (userId: number, newAvatarUrl: string) => void;
    addCustomEvent: (userId: number, event: Omit<CustomEvent, 'id'>) => void;
}
