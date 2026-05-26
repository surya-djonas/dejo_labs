import type { User, Classroom, Quiz, QuizQuestion, QuizAnswer, LiveSession, ClassroomMember, ActivityLog } from "@prisma/client";

export type { User, Classroom, Quiz, QuizQuestion, QuizAnswer, LiveSession };

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface ClassroomWithMembers extends Classroom {
  members: ClassroomMember[];
  teacher: User;
}

export interface QuizSubmission {
  questionId: string;
  answer: string | number | string[];
  timeTaken: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage?: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  rank: number;
}

export interface QuizStatistics {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  totalTimeTaken: number;
  score: number;
  maxScore: number;
}

export interface TimerState {
  startTime: number;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface SocketEvents {
  // Quiz events
  "quiz:start": (data: { quizId: string; duration: number }) => void;
  "quiz:question": (data: { questionId: string; question: QuizQuestion }) => void;
  "quiz:timer:update": (data: { remainingTime: number }) => void;
  "quiz:timer:pause": () => void;
  "quiz:timer:resume": () => void;
  "quiz:end": () => void;
  "quiz:answer:submit": (data: QuizSubmission) => void;
  "quiz:leaderboard": (data: LeaderboardEntry[]) => void;
  
  // Session events
  "session:join": (data: { sessionId: string; userId: string }) => void;
  "session:leave": (data: { sessionId: string; userId: string }) => void;
  "session:participants": (data: { count: number; users: User[] }) => void;
  
  // Notification events
  "notification:new": (notification: Notification) => void;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
  isLate: boolean;
}

export interface AnalyticsData {
  participationRate: number;
  averageScore: number;
  totalQuizzes: number;
  totalStudents: number;
  attendanceRate: number;
  engagementScore: number;
  topPerformers: User[];
  weakStudents: User[];
  recentActivity: ActivityLog[];
}
