import mongoose, { Schema } from "mongoose";
import type { IFlashcard } from "@/types";

const FlashcardSchema = new Schema<IFlashcard>(
  {
    front: {
      type: String,
      required: [true, "Front side is required"],
      maxlength: [1000, "Front side must be 1000 characters or fewer"],
    },
    back: {
      type: String,
      required: [true, "Back side is required"],
      maxlength: [2000, "Back side must be 2000 characters or fewer"],
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
    difficulty: {
      type: Number,
      default: 2.5,
      min: [1.3, "Difficulty cannot be below 1.3"],
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

FlashcardSchema.index({ userId: 1, nextReviewDate: 1 });
FlashcardSchema.index({ noteId: 1, userId: 1 });

/** Mongoose model for SM-2 spaced-repetition flashcards linked to notes. */
export const Flashcard =
  mongoose.models.Flashcard ||
  mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);
