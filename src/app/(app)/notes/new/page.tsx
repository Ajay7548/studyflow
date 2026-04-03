import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoteForm } from "@/components/notes/note-form";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Note creation page. Requires authentication, then renders
 * the NoteForm component in create mode (no initial data).
 */
const NewNotePage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Note</h1>
        <p className="text-sm text-muted-foreground">
          Write a new study note using the rich text editor below.
        </p>
      </div>
      <NoteForm />
    </div>
  );
};

export default NewNotePage;
