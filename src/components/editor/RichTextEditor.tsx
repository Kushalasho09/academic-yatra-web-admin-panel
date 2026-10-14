"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List as BulletListIcon,
  ListOrdered as NumberListIcon,
  Quote as QuoteIcon,
  Code as CodeIcon,
  Minus as DividerIcon,
  Link2,
  Unlink,
  Table as TableIcon,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Check,
  X,
  ChevronDown,
  Code2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article body here with headings, tables, links, and formatting...",
  minHeight = "420px",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(2);
  const [tableHeader, setTableHeader] = useState(true);

  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  // Convert legacy markdown into basic HTML if needed
  const formatInitialContent = (raw: string) => {
    if (!raw) return "<p></p>";
    // If it already looks like HTML (has HTML tags)
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      return raw;
    }
    // Convert common markdown to HTML for seamless backward compatibility
    let html = raw
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\> (.*$)/gim, "<blockquote><p>$1</p></blockquote>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    const paragraphs = html.split(/\n\s*\n/);
    return paragraphs
      .map((p) => {
        p = p.trim();
        if (!p) return "";
        if (p.startsWith("<h") || p.startsWith("<blockquote") || p.startsWith("<ul") || p.startsWith("<ol") || p.startsWith("<table")) {
          return p;
        }
        return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
      })
      .filter(Boolean)
      .join("");
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "w-full border-collapse border border-slate-200 my-4 text-left shadow-xs rounded-xl overflow-hidden",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-slate-200 hover:bg-slate-50/60 transition-colors",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-slate-200 bg-slate-100/80 p-3.5 font-bold text-slate-900 text-left text-xs uppercase tracking-wider",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-slate-200 p-3.5 text-slate-700 text-sm align-top leading-relaxed",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-6 border border-slate-200 shadow-md mx-auto",
        },
      }),
    ],
    content: formatInitialContent(value),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setRawHtml(html);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update content if value changes externally (e.g. async fetch from server)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      // Check if value is significantly different before resetting
      const current = editor.getHTML();
      if (current === "<p></p>" || Math.abs(current.length - value.length) > 10) {
        editor.commands.setContent(formatInitialContent(value));
      }
    }
  }, [value, editor]);

  // Open Link modal with currently selected text/url
  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setLinkOpenInNewTab(true);
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/") && !url.startsWith("mailto:") && !url.startsWith("tel:")) {
      url = "https://" + url;
    }

    // If text was typed and none was originally selected, insert with link
    const { from, to } = editor.state.selection;
    if (from === to && linkText.trim()) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="${linkOpenInNewTab ? "_blank" : "_self"}" rel="noopener noreferrer">${linkText.trim()}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: url,
          target: linkOpenInNewTab ? "_blank" : "_self",
        })
        .run();
    }

    setShowLinkModal(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkModal(false);
  };

  const handleInsertImage = () => {
    if (!editor || !imageUrl.trim()) return;
    let url = imageUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      url = "https://" + url;
    }
    editor.chain().focus().setImage({ src: url, alt: imageAlt.trim() || "Article image" }).run();
    setImageUrl("");
    setImageAlt("");
    setShowImageModal(false);
  };

  const handleInsertTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({
        rows: Math.max(1, tableRows),
        cols: Math.max(1, tableCols),
        withHeaderRow: tableHeader,
      })
      .run();
    setShowTableModal(false);
  };

  if (!mounted) {
    return (
      <div
        style={{ minHeight }}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400"
      >
        Loading rich text editor...
      </div>
    );
  }

  const isInsideTable = editor?.isActive("table");

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
      {/* Top Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1 select-none sticky top-0 z-20 backdrop-blur-md">
        
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Headings Dropdown / Buttons */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setParagraph().run()}
            title="Normal Paragraph"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              editor?.isActive("paragraph") && !editor?.isActive("heading")
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Pilcrow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">P</span>
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1 (Main Header)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              editor?.isActive("heading", { level: 1 })
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (Section Title)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              editor?.isActive("heading", { level: 2 })
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3 (Sub-section)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              editor?.isActive("heading", { level: 3 })
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            H3
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
            title="Heading 4 (Minor Title)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              editor?.isActive("heading", { level: 4 })
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            H4
          </button>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Text Formats (Bold, Italic, Underline, Strikethrough, Code) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor?.isActive("bold")
                ? "bg-emerald-100 text-emerald-800 font-extrabold"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <BoldIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor?.isActive("italic")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <ItalicIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor?.isActive("underline")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor?.isActive("strike")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <StrikeIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            title="Inline Code"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor?.isActive("code")
                ? "bg-emerald-100 text-emerald-800 font-mono"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <CodeIcon className="w-4 h-4" />
          </button>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            title="Align Left"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive({ textAlign: "left" })
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            title="Align Center"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive({ textAlign: "center" })
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            title="Align Right"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive({ textAlign: "right" })
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive("bulletList")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <BulletListIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive("orderedList")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <NumberListIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            className={`p-1.5 rounded-lg transition-colors ${
              editor?.isActive("blockquote")
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <QuoteIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Divider Line"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            <DividerIcon className="w-4 h-4" />
          </button>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Link Button (Opens Link Manager Modal) */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          title={editor?.isActive("link") ? "Edit Link" : "Insert Link"}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            editor?.isActive("link")
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 shadow-2xs"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{editor?.isActive("link") ? "Edit Link" : "Link"}</span>
        </button>

        {/* Table Button (Opens Table Creator) */}
        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          title="Insert Table (Like upGrad fees table)"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isInsideTable
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 shadow-2xs"
          }`}
        >
          <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Table</span>
        </button>

        {/* Image Button */}
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title="Insert Image"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-slate-600" />
        </button>

        {/* Source HTML Toggle */}
        <button
          type="button"
          onClick={() => {
            if (isRawHtmlMode) {
              editor?.commands.setContent(rawHtml);
            } else {
              setRawHtml(editor?.getHTML() || "");
            }
            setIsRawHtmlMode(!isRawHtmlMode);
          }}
          title="View / Edit Raw HTML Source"
          className={`ml-auto p-1.5 rounded-lg text-xs font-mono transition-colors ${
            isRawHtmlMode
              ? "bg-slate-900 text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
          }`}
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Table Helper Bar (Active when cursor is inside any table cell) */}
      {isInsideTable && !isRawHtmlMode && (
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-3 py-1.5 flex flex-wrap items-center gap-1.5 text-xs text-emerald-950 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800 mr-1 flex items-center gap-1">
            <TableIcon className="w-3 h-3 text-emerald-600" /> Table Controls:
          </span>

          <button
            type="button"
            onClick={() => editor?.chain().focus().addRowBefore().run()}
            className="px-2 py-1 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
          >
            + Row Above
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().addRowAfter().run()}
            className="px-2 py-1 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
          >
            + Row Below
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteRow().run()}
            className="px-2 py-1 rounded bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px] transition-colors"
          >
            Delete Row
          </button>

          <span className="w-px h-4 bg-emerald-200 mx-0.5" />

          <button
            type="button"
            onClick={() => editor?.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
          >
            + Col Left
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
          >
            + Col Right
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteColumn().run()}
            className="px-2 py-1 rounded bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px] transition-colors"
          >
            Delete Col
          </button>

          <span className="w-px h-4 bg-emerald-200 mx-0.5" />

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
            className="px-2 py-1 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
          >
            Toggle Header
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteTable().run()}
            className="ml-auto px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Remove Table
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative flex-1 p-6" style={{ minHeight }}>
        {isRawHtmlMode ? (
          <textarea
            value={rawHtml}
            onChange={(e) => {
              setRawHtml(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full h-full min-h-[380px] font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none resize-y leading-relaxed"
            placeholder="Edit raw HTML source code here..."
          />
        ) : (
          <EditorContent
            editor={editor}
            className="prose prose-slate max-w-none focus:outline-none blog-rich-editor-content text-sm sm:text-base leading-relaxed text-slate-800"
          />
        )}
      </div>

      {/* Interactive Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Insert / Edit Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/course"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports full web links, email (mailto:), phone numbers (tel:), or internal paths.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Text to Display (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Visit University Page"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkOpenInNewTab}
                  onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Open link in new tab (Recommended)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {editor?.isActive("link") && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold mr-auto transition-colors"
                >
                  Remove Link
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-600" />
                <span>Create New Table</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Create clean comparison or fee tables just like UpGrad. You can add or delete rows and columns anytime later.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={tableHeader}
                onChange={(e) => setTableHeader(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Include Header Row (Recommended)</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Insert Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alt Text / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Study abroad university campus"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
