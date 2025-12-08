import api from './api';

export interface ClassroomItem {
    id: string;
    type: 'chapter' | 'quiz';
    title: string;
    subtitle: string;
    description: string;
    fullContent?: string;
    teacher: string;
    date: string;
    icon: string;
    questions?: any[];
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    avatar: string;
}

export interface ClassroomMeta {
    className: string;
    schoolName: string;
    teachers: Teacher[];
}

export interface ClassroomResponse {
    meta: ClassroomMeta;
    content: ClassroomItem[];
}

export const fetchClassroomContent = async (): Promise<ClassroomResponse> => {
    try {
        const response = await api.get('/student/classroom');
        // Handle backward compatibility if response is just an array
        if (Array.isArray(response.data)) {
            return {
                meta: { className: 'Class', schoolName: '', teachers: [] },
                content: response.data
            };
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching classroom content:', error);
        throw error;
    }
};
