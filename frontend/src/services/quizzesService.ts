import { addToQueue } from '../offline/syncQueue';
import { storeData, getData } from '../offline/offlineStorage';
import { useNetInfo } from '@react-native-community/netinfo';
import api from './api';

export interface Question {
    _id: string;
    question: string;
    options: string[];
    correctIndex: number;
    difficulty?: string;
    explanation?: string;
}

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
}

export interface QuizResult {
    quizId: string;
    score: number;
    totalQuestions: number;
    timestamp: number;
}

export interface TopicQuizParams {
    classNumber: string;
    subject: string;
    chapter: string;
    subchapter?: string;
}

export const getTopicQuiz = async (params: TopicQuizParams): Promise<Question[]> => {
    try {
        const response = await api.get('/quizzes', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch topic quiz:', error);
        throw error;
    }
};

export const getRandomQuiz = async (classNum: number = 6, subject: string = 'science', difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Quiz> => {
    try {
        // Import contentService dynamically to avoid circular dependencies
        const { getQuizzes } = require('./contentService');

        const quizData = getQuizzes(classNum, subject);

        if (quizData && quizData.quiz && quizData.quiz[difficulty]) {
            const questions = quizData.quiz[difficulty];

            // Transform to Quiz format
            const transformedQuestions: Question[] = questions.map((q: any) => ({
                _id: q.id,
                question: q.question,
                options: q.options,
                correctIndex: q.answer_index,
                difficulty: difficulty,
                explanation: q.explanation,
            }));

            return {
                id: `quiz_${classNum}_${subject}_${difficulty}`,
                title: `Class ${classNum} ${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
                questions: transformedQuestions.sort(() => Math.random() - 0.5).slice(0, 15), // Randomize and limit to 15 questions
            };
        }

        // Fallback to mock data if no content found
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: 'quiz_1',
            title: 'General Knowledge',
            questions: [
                {
                    _id: 'q1',
                    question: 'Which crop needs the most water?',
                    options: ['Rice', 'Wheat', 'Millets', 'Mustard'],
                    correctIndex: 0,
                },
                {
                    _id: 'q2',
                    question: 'What is the best way to prevent soil erosion?',
                    options: ['Overgrazing', 'Planting Trees', 'Deforestation', 'Burning Stubble'],
                    correctIndex: 1,
                },
                {
                    _id: 'q3',
                    question: 'Which of these is a renewable energy source?',
                    options: ['Coal', 'Solar', 'Petrol', 'Natural Gas'],
                    correctIndex: 1,
                },
                {
                    _id: 'q4',
                    question: 'What should you do before eating food?',
                    options: ['Sleep', 'Wash Hands', 'Run', 'Drink Soda'],
                    correctIndex: 1,
                },
                {
                    _id: 'q5',
                    question: 'Which animal is known as the ship of the desert?',
                    options: ['Horse', 'Elephant', 'Camel', 'Donkey'],
                    correctIndex: 2,
                },
            ],
        };
    } catch (error) {
        console.error('Error loading quiz:', error);
        // Return fallback mock data
        return {
            id: 'quiz_fallback',
            title: 'Quiz',
            questions: [],
        };
    }
};

export const submitQuizResult = async (result: QuizResult, isConnected: boolean) => {
    if (isConnected) {
        try {
            await api.post('/student/quiz/submit', result);
            console.log('Quiz result submitted online:', result);
        } catch (e) {
            console.error('Failed to submit quiz result, queuing...', e);
            await addToQueue('SUBMIT_QUIZ_RESULT', result);
        }
    } else {
        console.log('Offline, queuing quiz result:', result);
        await addToQueue('SUBMIT_QUIZ_RESULT', result);
    }
};
