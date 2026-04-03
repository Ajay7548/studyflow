import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/note";
import { createNoteSchema, noteSearchSchema } from "@/lib/validations/note";
import { stripHtmlTags } from "@/lib/sanitize";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BuildNoteQueryParams {
  userId: string;
  search?: string;
  subject?: string;
}

/** Builds a MongoDB filter from search parameters. */
const buildNoteQuery = ({ userId, search, subject }: BuildNoteQueryParams) => {
  const query: Record<string, unknown> = { userId };

  if (subject) {
    query.subject = subject;
  }

  if (search) {
    query.$text = { $search: search };
  }

  return query;
};

import type { SortOrder } from "mongoose";

interface BuildSortParams {
  search?: string;
}

/** Returns sort criteria, preferring text score when searching. */
const buildSort = ({
  search,
}: BuildSortParams): Record<string, SortOrder | { $meta: string }> => {
  if (search) {
    return { score: { $meta: "textScore" } };
  }
  return { createdAt: -1 };
};

// ---------------------------------------------------------------------------
// GET /api/notes
// ---------------------------------------------------------------------------

/** Lists paginated notes for the authenticated user with optional search and subject filter. */
export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());
    const parsed = noteSearchSchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { search, subject, page, limit } = parsed.data;
    const skip = (page - 1) * limit;
    const query = buildNoteQuery({ userId: session.user.id, search, subject });
    const sort = buildSort({ search });

    const [notes, total] = await Promise.all([
      Note.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Note.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ notes, total, page, totalPages });
  } catch (error) {
    console.error("[GET /api/notes]", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 },
    );
  }
};

// ---------------------------------------------------------------------------
// POST /api/notes
// ---------------------------------------------------------------------------

/** Creates a new note for the authenticated user. */
export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const contentPlainText = stripHtmlTags({ html: parsed.data.content });

    const note = await Note.create({
      ...parsed.data,
      contentPlainText,
      userId: session.user.id,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notes]", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
};
