import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TEACHER"]),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const classroomSchema = z.object({
  name: z.string().min(3, "Classroom name must be at least 3 characters"),
  description: z.string().optional(),
  subject: z.string().optional(),
});

export const quizSchema = z.object({
  title: z.string().min(3, "Quiz title must be at least 3 characters"),
  description: z.string().optional(),
  duration: z.number().min(60, "Duration must be at least 60 seconds"),
  scheduledAt: z.string().datetime().optional(),
  showLeaderboard: z.boolean().default(true),
});

export const questionSchema = z.object({
  questionType: z.enum(["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER", "NUMERICAL", "POLL"]),
  questionText: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any().optional(),
  points: z.number().min(1).default(1),
  timeLimit: z.number().optional(),
});

export const assignmentSchema = z.object({
  title: z.string().min(3, "Assignment title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().datetime(),
  totalPoints: z.number().min(1).default(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ClassroomInput = z.infer<typeof classroomSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
