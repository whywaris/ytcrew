"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Trash2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-400 underline font-medium hover:text-indigo-300 transition-colors",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl border border-[#2b2b3d] max-w-full my-4 h-auto shadow-lg",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[340px] w-full p-4 sm:p-5 text-sm text-[#f5f5f7] leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Keep editor content in sync when loaded/changed externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set content if it's different to prevent resetting cursor
      const currentHTML = editor.getHTML();
      if (!currentHTML || currentHTML === "<p></p>") {
        editor.commands.setContent(content || "");
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[340px] rounded-2xl border border-[#2b2b3d] bg-[#0e0e16] p-6 flex items-center justify-center text-xs text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: formattedUrl })
        .run();
    }
    setLinkUrl("");
    setShowLinkModal(false);
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setShowImageModal(false);
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const isTableActive = editor.isActive("table");

  return (
    <div className="rounded-2xl border border-[#252538] bg-[#0e0e16] overflow-hidden shadow-md transition-all focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2.5 bg-[#161624] border-b border-[#252538] text-foreground">
        {/* Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("bold") && "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold"
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Italic */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("italic") && "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("underline") && "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          )}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-[#2b2b3d] mx-1" />

        {/* Heading 2 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-8 px-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#202032] gap-1",
            editor.isActive("heading", { level: 2 }) &&
              "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          )}
          title="Heading 2 (H2)"
        >
          <Heading2 className="h-4 w-4" />
          <span>H2</span>
        </Button>

        {/* Heading 3 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "h-8 px-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#202032] gap-1",
            editor.isActive("heading", { level: 3 }) &&
              "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          )}
          title="Heading 3 (H3)"
        >
          <Heading3 className="h-4 w-4" />
          <span>H3</span>
        </Button>

        <div className="h-4 w-px bg-[#2b2b3d] mx-1" />

        {/* Bullet List */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("bulletList") && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        {/* Ordered List */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("orderedList") && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Blockquote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("blockquote") && "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          )}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-[#2b2b3d] mx-1" />

        {/* Link Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href || "";
            setLinkUrl(previousUrl);
            setShowLinkModal(true);
          }}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            editor.isActive("link") && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          )}
          title="Add / Edit Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {editor.isActive("link") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}

        {/* Image Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageModal(true)}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]"
          )}
          title="Insert Image by URL"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Insert Table Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertTable}
          className={cn(
            "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-[#202032]",
            isTableActive && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          )}
          title="Insert Table (3x3 with Header)"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-[#2b2b3d] mx-1 ml-auto" />

        {/* Undo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white disabled:opacity-25"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        {/* Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white disabled:opacity-25"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Contextual Table Controls Toolbar (shown when cursor is inside a table) */}
      {isTableActive && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-[#12121e] border-b border-[#252538] text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mr-1 pr-2 border-r border-[#252538]">
            <TableIcon className="h-3.5 w-3.5" /> Table
          </span>

          {/* Row actions */}
          <div className="flex items-center gap-0.5 bg-[#181826] p-0.5 rounded-lg border border-[#2b2b3d]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="h-6.5 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-[#25253c]"
              title="Add row above current cell"
            >
              + Row Above
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-6.5 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-[#25253c]"
              title="Add row below current cell"
            >
              + Row Below
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="h-6.5 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              title="Delete current row"
            >
              Delete Row
            </Button>
          </div>

          {/* Column actions */}
          <div className="flex items-center gap-0.5 bg-[#181826] p-0.5 rounded-lg border border-[#2b2b3d]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="h-6.5 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-[#25253c]"
              title="Add column to the left"
            >
              + Col Left
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-6.5 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-[#25253c]"
              title="Add column to the right"
            >
              + Col Right
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="h-6.5 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              title="Delete current column"
            >
              Delete Col
            </Button>
          </div>

          {/* Toggle Header Row */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="h-6.5 px-2 text-[11px] text-slate-300 hover:text-white bg-[#181826] hover:bg-[#25253c] border border-[#2b2b3d] rounded-lg"
            title="Toggle Header Row"
          >
            Toggle Header
          </Button>

          {/* Delete Table */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="h-6.5 px-2 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg ml-auto flex items-center gap-1"
            title="Delete entire table"
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete Table</span>
          </Button>
        </div>
      )}

      {/* Link Input Bar */}
      {showLinkModal && (
        <div className="flex items-center gap-2 p-3 bg-[#161624] border-b border-[#252538] text-xs animate-in fade-in">
          <LinkIcon className="h-4 w-4 text-cyan-400 shrink-0" />
          <Input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              }
            }}
            className="h-8 text-xs bg-[#0e0e16] border-[#2b2b3d] focus-visible:ring-cyan-500/20"
            autoFocus
          />
          <Button type="button" size="sm" onClick={setLink} className="h-8 text-xs px-3 bg-cyan-600 hover:bg-cyan-500 text-white">
            Apply
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkModal(false)}
            className="h-8 text-xs px-2.5 text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Image Input Bar */}
      {showImageModal && (
        <div className="flex items-center gap-2 p-3 bg-[#161624] border-b border-[#252538] text-xs animate-in fade-in">
          <ImageIcon className="h-4 w-4 text-violet-400 shrink-0" />
          <Input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            className="h-8 text-xs bg-[#0e0e16] border-[#2b2b3d] focus-visible:ring-violet-500/20"
            autoFocus
          />
          <Button type="button" size="sm" onClick={addImage} className="h-8 text-xs px-3 bg-violet-600 hover:bg-violet-500 text-white">
            Insert
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageModal(false)}
            className="h-8 text-xs px-2.5 text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Editor Content Area with clean typography */}
      <div className="bg-[#0e0e16] font-sans">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .tiptap p {
          margin-bottom: 1em;
          line-height: 1.75;
          color: #e2e8f0;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #ffffff;
        }
        .tiptap h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25em;
          margin-bottom: 0.4em;
          color: #ffffff;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
          color: #e2e8f0;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 1em;
          color: #e2e8f0;
        }
        .tiptap li {
          margin-bottom: 0.35em;
        }
        .tiptap blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          margin-bottom: 1em;
          font-style: italic;
          color: #94a3b8;
          background-color: rgba(99, 102, 241, 0.05);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        /* Table Styles inside Editor */
        .tiptap .tableWrapper {
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .tiptap table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5em 0;
          overflow: hidden;
          border-radius: 0.5rem;
          border: 1px solid #2b2b3d;
        }
        .tiptap table td,
        .tiptap table th {
          min-width: 100px;
          border: 1px solid #2b2b3d;
          padding: 0.65rem 0.85rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          text-align: left;
        }
        .tiptap table th {
          font-weight: 600;
          background-color: #1a1a2c;
          color: #ffffff;
          border-bottom: 2px solid #3b3b52;
        }
        .tiptap table td {
          background-color: #0e0e16;
          color: #e2e8f0;
        }
        .tiptap table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(99, 102, 241, 0.15);
          pointer-events: none;
        }
        .tiptap table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #6366f1;
          pointer-events: none;
        }
        .tiptap table p {
          margin-bottom: 0;
        }
        .tiptap .resize-cursor {
          cursor: col-resize;
        }
      `}</style>
    </div>
  );
}
