import { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Blockquote from '@tiptap/extension-blockquote'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Youtube from "@tiptap/extension-youtube";
import { SmilieReplacer } from './SmilieReplacer'




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
  canUndo: boolean
  canRedo: boolean
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
    canUndo: editor.can().chain().focus().undo().run(),
    canRedo: editor.can().chain().focus().redo().run(),
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
    Underline,
    Color,
    TextStyle,
    Highlight.configure({ multicolor: true }),
    Youtube.configure({
      width: 320,
      interfaceLanguage: 'en',
    }),
    SmilieReplacer


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
  | "undo"
  | "redo"
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
  | "setHorizontalRule"
  | "unsetColor"
  | "unsetHighlight";

const editorActions: Record<EditorAction, VoidFunction> = {
  undo: () => editor.chain().focus().undo().run(),
  redo: () => editor.chain().focus().redo().run(),
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
  setHorizontalRule: () => editor.chain().focus().setHorizontalRule().run(),
  unsetColor: () => editor.chain().focus().unsetColor().run(),
  unsetHighlight: () => editor.chain().focus().unsetHighlight().run()
};

export type NativeMessage =
  | { kind: "action"; payload: EditorAction }
  | { kind: "editor"; payload: "focus" | "blur" }
  | { kind: "initialContent"; payload: string }
  | { kind: "insertImage"; payload: string }
  | { kind: "setColor"; payload: string }
  | { kind: "setHighlight"; payload: string }
  | { kind: "insertVideo"; payload: {url: string, width:number, height:number} };

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
  if (nativeMessage.kind === "insertVideo") {
      editor.commands.setYoutubeVideo({
        src: nativeMessage.payload.url,
        width: Math.max(320, nativeMessage.payload.width) || 640,
        height: Math.max(180, nativeMessage.payload.height) || 480,
      })
  }
  if (nativeMessage.kind === "setColor") {
    editor.chain().focus().setColor(nativeMessage.payload).run();
  }
  if (nativeMessage.kind === "setHighlight") {
    editor.chain().focus().setHighlight({color: nativeMessage.payload}).run();
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
