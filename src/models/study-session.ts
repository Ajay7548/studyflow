import mongoose, { Schema } from "mongoose";
import type { IStudySession } from "@/types";

const StudySessionSchema = new Schema<IStudySession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: ["review", "quiz", "note-reading"],
      required: [true, "Session type is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    cardsReviewed: {
      type: Number,
      default: 0,
    },
    correctCards: {
      type: Number,
      default: 0,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    score: {
      type: Number,
      default: null,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

StudySessionSchema.index({ userId: 1, date: -1 });
StudySessionSchema.index({ userId: 1, type: 1, date: -1 });

/** Mongoose model for tracking individual study sessions and progress. */
export const StudySession =
  mongoose.models.StudySession ||
  mongoose.model<IStudySession>("StudySession", StudySessionSchema);
