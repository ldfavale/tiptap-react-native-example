import { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'

export type EditorState = {
  html: string;
  json: JSONContent;
  canBold: boolean;
  canItalic: boolean;
  canStrike: boolean;
  canSinkListItem: boolean;
  canLiftListItem: boolean;
  canH1: boolean;
  canH2: boolean;
  canH3: boolean;
  isBulletListActive: boolean;
  isBoldActive: boolean;
  isItalicActive: boolean;
  isStrikeActive: boolean;
  isH1Active: boolean;
  isH2Active: boolean;
  isH3Active: boolean;
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
    canSinkListItem: editor.can().sinkListItem("listItem"),
    canLiftListItem: editor.can().liftListItem("listItem"),
    canH1: editor.can().chain().focus().toggleHeading({level: 1}).run(),
    canH2: editor.can().chain().focus().toggleHeading({level: 2}).run(),
    canH3: editor.can().chain().focus().toggleHeading({level: 3}).run(),
    isBulletListActive: editor.isActive("bulletList"),
    isBoldActive: editor.isActive("bold"),
    isItalicActive: editor.isActive("italic"),
    isStrikeActive: editor.isActive("strike"),
    isH1Active: editor.isActive("heading", { level: 1 }),
    isH2Active: editor.isActive("heading", { level: 2 }),
    isH3Active: editor.isActive("heading", { level: 3 }),
  };
}

const editor = new Editor({
  element: document.getElementById("editor")!,
  extensions: [
    StarterKit,
    Heading.configure({levels: [1, 2, 3]}),
    Image.configure({allowBase64: true})
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
  | "toggleListItem"
  | "sinkListItem"
  | "liftListItem"
  | "toggleH1"
  | "toggleH2"
  | "toggleH3";

const editorActions: Record<EditorAction, VoidFunction> = {
  liftListItem: () => editor.chain().focus().liftListItem("listItem").run(),
  sinkListItem: () => editor.chain().focus().sinkListItem("listItem").run(),
  toggleListItem: () => editor.chain().focus().toggleBulletList().run(),
  toggleBold: () => editor.chain().focus().toggleBold().run(),
  toggleItalic: () => editor.chain().focus().toggleItalic().run(),
  toggleStrike: () => editor.chain().focus().toggleStrike().run(),
  toggleH1: () => editor.chain().focus().toggleHeading({level:1}).run(),
  toggleH2: () => editor.chain().focus().toggleHeading({level:2}).run(),
  toggleH3: () => editor.chain().focus().toggleHeading({level:3}).run()
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
