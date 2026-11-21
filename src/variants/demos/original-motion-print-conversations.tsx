"use client";

import * as React from "react";
import { ChatThread, type ChatMessage, type ChatParticipant } from "@/variants/vendor/registry/components/chat-thread/chat-thread";
import { CommentThread, type CommentAuthor, type ThreadComment } from "@/variants/vendor/registry/components/comment-thread/comment-thread";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-surface-measure)",
  gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

const printParticipants: ChatParticipant[] = [
  { id: "paper-desk", name: "Paper desk" },
  { id: "ink-desk", name: "Ink desk" },
  { id: "editor", name: "Local editor" },
];

function startingMessages(): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: "edition-08-paper",
      authorId: "paper-desk",
      text: "Edition 08: 32 pages on 120 gsm uncoated stock, 180 sample copies.",
      createdAt: now - 7 * 60_000,
    },
    {
      id: "edition-08-ink",
      authorId: "ink-desk",
      text: "Black carries the text; river blue is reserved for the cover rule.",
      createdAt: now - 5 * 60_000,
      reactions: [{ emoji: "✅", count: 1 }],
    },
    {
      id: "edition-08-editor",
      authorId: "editor",
      text: "Keep the blue rule inside the 4 mm trim margin on the cover proof.",
      createdAt: now - 3 * 60_000,
      status: "read",
    },
  ];
}

export function Edition08PrintRoomChatDemo() {
  const [messages] = React.useState(startingMessages);
  return (
    <section style={sceneStyle} aria-labelledby="edition-08-chat-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Sample print-room exchange · Edition 08</p>
        <h2 id="edition-08-chat-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Cover proof notes</h2>
      </header>
      <div style={{ height: "var(--rams-detail-preview-chat-thread-block-size)", minHeight: 0, display: "grid", gridTemplateRows: "minmax(0, 1fr)", overflow: "hidden", border: "var(--rams-detail-primitive-border-width) solid var(--border, var(--rams-detail-preview-panel-border-fallback))", borderRadius: "var(--radius-panel, var(--rams-detail-native-panel-radius-fallback))", background: "var(--card, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))" }}>
        <ChatThread
          participants={printParticipants}
          currentUserId="editor"
          defaultMessages={messages}
          reactions={["✅", "👍", "👀"]}
          allowAttachments={false}
          label="Edition 08 print-room exchange"
          placeholder="Write a proof note"
          locale="en-US"
        />
      </div>
    </section>
  );
}

const printAuthors: CommentAuthor[] = [
  { id: "paper-desk", name: "Paper desk" },
  { id: "ink-desk", name: "Ink desk" },
  { id: "editor", name: "Local editor" },
];

const initialComments: ThreadComment[] = [
  {
    id: "signature-plan",
    author: printAuthors[0]!,
    body: "Edition 08 is 32 pages: four 8-page signatures on 120 gsm uncoated stock.",
    createdAt: "9:10",
    reactions: [{ emoji: "✅", users: ["ink-desk"] }],
    replies: [
      {
        id: "margin-note",
        author: printAuthors[2]!,
        body: "Keep a 4 mm inner margin at the fold; the cover rule can stay 4 mm from trim.",
        createdAt: "9:14",
      },
    ],
  },
  {
    id: "plate-plan",
    author: printAuthors[1]!,
    body: "The sample uses black for text and river blue for the cover rule. No third plate is listed.",
    createdAt: "9:18",
    reactions: [{ emoji: "👍", users: ["paper-desk"] }],
  },
];

export function Edition08PrintProofCommentsDemo() {
  const [comments] = React.useState(initialComments);
  const [resolved, setResolved] = React.useState(false);
  return (
    <section style={sceneStyle} aria-labelledby="edition-08-comments-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Sample proof annotations · Edition 08</p>
        <h2 id="edition-08-comments-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Signature and plate review</h2>
      </header>
      <CommentThread
        currentUser={printAuthors[2]!}
        people={printAuthors}
        defaultComments={comments}
        resolved={resolved}
        onResolvedChange={setResolved}
        title="32-page booklet proof"
        reactions={["✅", "👍", "👀"]}
        placeholder="Add a proof note or @mention a desk"
      />
    </section>
  );
}
