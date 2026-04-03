import mongoose, { Schema } from "mongoose";
import type { INote } from "@/types";

const NoteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be 200 characters or fewer"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    contentPlainText: {
      type: String,
      required: [true, "Plain text content is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    flashcardCount: {
      type: Number,
      default: 0,
    },
    quizCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

NoteSchema.index({ userId: 1, subject: 1 });
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index(
  { title: "text", contentPlainText: "text", tags: "text" },
  { weights: { title: 10, tags: 5, contentPlainText: 1 } }
);

/** Mongoose model for user-created study notes with rich text content. */
export const Note =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
