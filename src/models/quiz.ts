import mongoose, { Schema } from "mongoose";
import type { IQuiz, IQuizQuestion } from "@/types";

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    options: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: "Exactly 4 options are required",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Correct answer index must be at least 0"],
      max: [3, "Correct answer index must be at most 3"],
    },
    explanation: {
      type: String,
      required: [true, "Explanation is required"],
    },
    userAnswer: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: [true, "Note ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    questions: {
      type: [QuizQuestionSchema],
      required: [true, "Questions are required"],
    },
    score: {
      type: Number,
      default: null,
    },
    totalQuestions: {
      type: Number,
      required: [true, "Total questions count is required"],
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    timeTakenSeconds: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ noteId: 1, userId: 1 });

/** Mongoose model for multiple-choice quizzes generated from notes. */
export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
