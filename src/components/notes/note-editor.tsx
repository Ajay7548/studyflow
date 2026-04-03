"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Code,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NoteEditorProps {
  /** Initial HTML content for the editor. */
  initialContent?: string;
  /** Callback fired on every content change with the current HTML. */
  onChange: ({ html }: { html: string }) => void;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Returns the button variant based on active state. */
const getToolbarButtonVariant = ({ isActive }: { isActive?: boolean }): "secondary" | "ghost" => {
  if (isActive) return "secondary";
  return "ghost";
};

/** A single toolbar formatting button. */
const ToolbarButton = ({
  icon: Icon,
  label,
  isActive = false,
  onPress,
}: ToolbarButtonProps) => (
  <Button
    type="button"
    variant={getToolbarButtonVariant({ isActive })}
    size="icon-sm"
    onClick={onPress}
    aria-label={label}
    title={label}
  >
    <Icon className="size-4" />
  </Button>
);

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor> | null;
}

/** Formatting toolbar for the TipTap editor. */
const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 border-b p-2">
      <ToolbarButton
        icon={Bold}
        label="Bold"
        isActive={editor.isActive("bold")}
        onPress={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label="Italic"
        isActive={editor.isActive("italic")}
        onPress={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={Heading2}
        label="Heading"
        isActive={editor.isActive("heading", { level: 2 })}
        onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        icon={List}
        label="Bullet List"
        isActive={editor.isActive("bulletList")}
        onPress={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Ordered List"
        isActive={editor.isActive("orderedList")}
        onPress={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={Code}
        label="Code Block"
        isActive={editor.isActive("codeBlock")}
        onPress={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarButton
        icon={Highlighter}
        label="Highlight"
        isActive={editor.isActive("highlight")}
        onPress={() => editor.chain().focus().toggleHighlight().run()}
      />
      <div className="mx-1 w-px bg-border" />
      <ToolbarButton
        icon={Undo}
        label="Undo"
        onPress={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={Redo}
        label="Redo"
        onPress={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// NoteEditor
// ---------------------------------------------------------------------------

/**
 * Rich text editor built on TipTap with a formatting toolbar.
 * Exposes content changes via the `onChange` callback.
 */
export const NoteEditor = ({
  initialContent = "",
  onChange,
}: NoteEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your note..." }),
      Highlight,
    ],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      onChange({ html: e.getHTML() });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
