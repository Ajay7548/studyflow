import type { Document, Types } from "mongoose";

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface IUserPreferences {
  dailyGoalMinutes: number;
  reviewBatchSize: number;
  theme: "light" | "dark" | "system";
}

export interface IUserStreak {
  current: number;
  longest: number;
  lastStudyDate: Date | null;
}

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  hashedPassword: string | null;
  role: "user" | "admin";
  preferences: IUserPreferences;
  streak: IUserStreak;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Note
// ---------------------------------------------------------------------------

export interface INote extends Document {
  title: string;
  content: string;
  contentPlainText: string;
  subject: string;
  tags: string[];
  userId: Types.ObjectId;
  flashcardCount: number;
  quizCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Flashcard
// ---------------------------------------------------------------------------

export interface IFlashcard extends Document {
  front: string;
  back: string;
  noteId: Types.ObjectId;
  userId: Types.ObjectId;
  difficulty: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number | null;
}

export interface IQuiz extends Document {
  title: string;
  noteId: Types.ObjectId;
  userId: Types.ObjectId;
  questions: IQuizQuestion[];
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  status: "pending" | "completed";
  completedAt: Date | null;
  timeTakenSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// StudySession
// ---------------------------------------------------------------------------

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  type: "review" | "quiz" | "note-reading";
  duration: number;
  cardsReviewed: number;
  correctCards: number;
  quizId: Types.ObjectId | null;
  score: number | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

/** Standard API response wrapper. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/** Paginated list response with cursor metadata. */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
