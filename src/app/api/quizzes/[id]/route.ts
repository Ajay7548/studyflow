import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { submitQuizSchema } from "@/lib/validations/quiz";
import { Quiz } from "@/models";

/**
 * GET /api/quizzes/[id]
 *
 * Returns a single quiz by ID, scoped to the authenticated user.
 */
export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const quiz = await Quiz.findOne({ _id: id, userId: session.user.id }).lean();
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: quiz });
};

/** Validates the quiz submission request body. */
const parseSubmitBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const result = submitQuizSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { data: null, error: firstError };
  }

  return { data: result.data, error: null };
};

/** Scores the quiz by comparing user answers against correct answers. */
const scoreQuiz = ({
  questions,
  answers,
}: {
  questions: Array<{ correctAnswer: number }>;
  answers: number[];
}) => {
  let correct = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) {
      correct += 1;
    }
  });

  const score = Math.round((correct / questions.length) * 100);
  return { correct, score };
};

/**
 * PUT /api/quizzes/[id]
 *
 * Submits answers for a quiz. Calculates the score, marks each
 * question's userAnswer, and transitions status to "completed".
 */
export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error: parseError } = await parseSubmitBody({ request });
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

  await connectDB();

  const quiz = await Quiz.findOne({ _id: id, userId: session.user.id });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  if (quiz.status === "completed") {
    return NextResponse.json(
      { error: "Quiz already completed" },
      { status: 400 }
    );
  }

  if (data!.answers.length !== quiz.questions.length) {
    return NextResponse.json(
      { error: "Answer count does not match question count" },
      { status: 400 }
    );
  }

  const { correct, score } = scoreQuiz({
    questions: quiz.questions,
    answers: data!.answers,
  });

  quiz.questions.forEach((q: { userAnswer: number | null }, i: number) => {
    q.userAnswer = data!.answers[i];
  });

  quiz.score = score;
  quiz.correctAnswers = correct;
  quiz.status = "completed";
  quiz.completedAt = new Date();
  quiz.timeTakenSeconds = data!.timeTakenSeconds;

  await quiz.save();

  return NextResponse.json({ success: true, data: quiz });
};
