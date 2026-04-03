import mongoose, { Schema } from "mongoose";
import type { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    hashedPassword: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    preferences: {
      dailyGoalMinutes: {
        type: Number,
        default: 30,
      },
      reviewBatchSize: {
        type: Number,
        default: 20,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastStudyDate: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

UserSchema.index({ email: 1 });

/** Mongoose model for application users with preferences and study streaks. */
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
