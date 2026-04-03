import Link from "next/link";
import {
  Brain,
  Sparkles,
  Repeat,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";

/** Returns the CTA destination based on login status. */
const getCtaDestination = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (isLoggedIn) return "/dashboard";
  return "/signin";
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Flashcards",
    description:
      "Generate flashcards from your notes instantly using AI. Focus on learning, not card creation.",
  },
  {
    icon: Brain,
    title: "Smart Quizzes",
    description:
      "AI-powered quizzes that adapt to your knowledge gaps and help you retain more.",
  },
  {
    icon: Repeat,
    title: "Spaced Repetition",
    description:
      "Science-backed SM-2 algorithm schedules reviews at the optimal time for long-term memory.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track your study streaks, mastery levels, and progress across all subjects.",
  },
] as const;

/** Renders a single feature card with icon, title, and description. */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <Card>
    <CardHeader>
      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

/**
 * Landing page with hero section, features, and CTA.
 * Redirects logged-in users to dashboard via the CTA link.
 */
const Page = async () => {
  const session = await auth();
  const ctaHref = getCtaDestination({ isLoggedIn: !!session?.user });

  return (
  <div className="flex min-h-full flex-col">
    <main className="flex-1">
      <section className="flex flex-col items-center gap-8 px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Study Smarter with AI
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Create flashcards, take quizzes, and master any subject with
          spaced repetition — all powered by AI.
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Get Started
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </main>

    <Footer />
  </div>
  );
};

export default Page;
