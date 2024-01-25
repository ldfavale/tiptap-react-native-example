import { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Blockquote from '@tiptap/extension-blockquote'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'



export type EditorState = {
  html: string;
  json: JSONContent;
  canBold: boolean;
  canItalic: boolean;
  canStrike: boolean;
  canUnderline: boolean;
  canHorizontalRule: boolean;
  canSinkListItem: boolean;
  canLiftListItem: boolean;
  canH1: boolean;
  canH2: boolean;
  canH3: boolean;
  canBlockquote: boolean
  isBulletListActive: boolean;
  isOrderedListActive: boolean;
  isTaskListActive: boolean;
  isBoldActive: boolean;
  isItalicActive: boolean;
  isStrikeActive: boolean;
  isUnderlineActive: boolean;
  isH1Active: boolean;
  isH2Active: boolean;
  isH3Active: boolean;
  isBlockquoteActive: boolean;
};

export type WebViewMessage =
  | {
      kind: "editorStateUpdate";
      payload: EditorState;
    }
  | { kind: "editorInitialised" };

function sendMessageFromWebView(params: WebViewMessage) {
  (window as any).ReactNativeWebView?.postMessage(JSON.stringify(params));
}

function getEditorState(editor: Editor): EditorState {
  return {
    html: editor.getHTML(),
    json: editor.getJSON(),
    canBold: editor.can().chain().focus().toggleBold().run(),
    canItalic: editor.can().chain().focus().toggleItalic().run(),
    canStrike: editor.can().chain().focus().toggleStrike().run(),
    canUnderline: editor.can().chain().focus().toggleUnderline().run(),
    canHorizontalRule: editor.can().chain().focus().setHorizontalRule().run(),
    canSinkListItem: editor.can().sinkListItem("listItem"),
    canLiftListItem: editor.can().liftListItem("listItem"),
    canH1: editor.can().chain().focus().toggleHeading({level: 1}).run(),
    canH2: editor.can().chain().focus().toggleHeading({level: 2}).run(),
    canH3: editor.can().chain().focus().toggleHeading({level: 3}).run(),
    canBlockquote: editor.can().chain().focus().toggleBlockquote().run(),
    isBulletListActive: editor.isActive("bulletList"),
    isOrderedListActive: editor.isActive("orderedList"),
    isTaskListActive: editor.isActive("taskList"),
    isBoldActive: editor.isActive("bold"),
    isItalicActive: editor.isActive("italic"),
    isStrikeActive: editor.isActive("strike"),
    isUnderlineActive: editor.isActive("underline"),
    isH1Active: editor.isActive("heading", { level: 1 }),
    isH2Active: editor.isActive("heading", { level: 2 }),
    isH3Active: editor.isActive("heading", { level: 3 }),
    isBlockquoteActive: editor.isActive("blockquote"),
  };
}

const editor = new Editor({
  element: document.getElementById("editor")!,
  extensions: [
    StarterKit,
    Heading.configure({levels: [1, 2, 3]}),
    Image.configure({allowBase64: true}),
    Blockquote.configure({
      HTMLAttributes: {
        class: 'blockquote',
      },
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Underline


],
  onCreate: () => {
    sendMessageFromWebView({ kind: "editorInitialised" });
  },
  onSelectionUpdate: ({ editor }) => {
        sendMessageFromWebView({
      kind: "editorStateUpdate",
      payload: getEditorState(editor),
    });
  },
  onUpdate: ({ editor }) => {
        sendMessageFromWebView({
      kind: "editorStateUpdate",
      payload: getEditorState(editor),
    });
  },
});

type EditorAction =
  | "toggleBold"
  | "toggleItalic"
  | "toggleStrike"
  | "toggleUnderline"
  | "toggleBulletListItem"
  | "toggleOrderedListItem"
  | "toggleTaskListItem"
  | "sinkListItem"
  | "liftListItem"
  | "toggleH1"
  | "toggleH2"
  | "toggleH3"
  | "toggleBlockquote"
  | "setHorizontalRule";

const editorActions: Record<EditorAction, VoidFunction> = {
  liftListItem: () => editor.chain().focus().liftListItem("listItem").run(),
  sinkListItem: () => editor.chain().focus().sinkListItem("listItem").run(),
  toggleBulletListItem: () => editor.chain().focus().toggleBulletList().run(),
  toggleOrderedListItem: () => editor.chain().focus().toggleOrderedList().run(),
  toggleTaskListItem: () => editor.chain().focus().toggleTaskList().run(),
  toggleBold: () => editor.chain().focus().toggleBold().run(),
  toggleItalic: () => editor.chain().focus().toggleItalic().run(),
  toggleStrike: () => editor.chain().focus().toggleStrike().run(),
  toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
  toggleH1: () => editor.chain().focus().toggleHeading({level:1}).run(),
  toggleH2: () => editor.chain().focus().toggleHeading({level:2}).run(),
  toggleH3: () => editor.chain().focus().toggleHeading({level:3}).run(),
  toggleBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
  setHorizontalRule: () => editor.chain().focus().setHorizontalRule().run()
};

export type NativeMessage =
  | { kind: "action"; payload: EditorAction }
  | { kind: "editor"; payload: "focus" | "blur" }
  | { kind: "initialContent"; payload: string }
  | { kind: "insertImage"; payload: string };

function handleMessageEvent(event: MessageEvent | Event) {
  const message: { data: string } = event as { data: string };
  const nativeMessage: NativeMessage = JSON.parse(message.data);
  if (nativeMessage.kind === "action") {
    const fn = editorActions[nativeMessage.payload];
    fn();
  }
  if (nativeMessage.kind === "initialContent") {
    editor.commands.setContent(nativeMessage.payload);
  }
  if (nativeMessage.kind === "insertImage") {
    editor.chain().focus().setImage({ src: nativeMessage.payload }).run();
  }
  if (nativeMessage.kind === "editor") {
    if (nativeMessage.payload === "focus") {
      editor.commands.focus();
    }
    if (nativeMessage.payload === "blur") {
      editor.commands.blur();
    }
  }
}

window.addEventListener("message", handleMessageEvent);

document.addEventListener("message", handleMessageEvent);
