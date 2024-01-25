import * as React from "react";
import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TouchableWithoutFeedback,
  FlatList
} from "react-native";
import { WebView } from "react-native-webview";
import editorHtml from "../editor/dist/index.html";
import type {
  EditorState,
  NativeMessage,
  WebViewMessage,
} from "../editor/main";

interface RichTextEditorProps {
  content?: string;
}
export const RichTextEditor = (props: RichTextEditorProps) => {
  const { content = "" } = props;
  const [editorState, setEditorState] = useState<EditorState>({
    html: "",
    json: {},
    canBold: false,
    canItalic: false,
    canStrike: false,
    canSinkListItem: false,
    canLiftListItem: false,
    canH1: false,
    canH2: false,
    canH3: false,
    canBlockquote: false,
    isBulletListActive: false,
    isOrderedListActive: false,
    isTaskListActive: false,
    isBoldActive: false,
    isItalicActive: false,
    isStrikeActive: false,
    isH1Active: false,
    isH2Active: false,
    isH3Active: false,
    isBlockquoteActive: false,
  });

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    sendMessageToWebView({ kind: "initialContent", payload: content });
  }, [content]);

  function sendMessageToWebView(message: NativeMessage) {
    webViewRef?.current?.postMessage(JSON.stringify(message));
  }

  const editorCommands = [
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleBold" }),
      style: [
        styles.actionDefault,
        editorState.isBoldActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "Bold"
    },
    {
      onPress: () => {
        sendMessageToWebView({ kind: "action", payload: "toggleItalic" })
      },
        style: [
        styles.actionDefault,
        editorState.isItalicActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "Italic"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleBulletListItem" }),
      style: [
        styles.actionDefault,
        editorState.isBulletListActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "ul"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleOrderedListItem" }),
      style: [
        styles.actionDefault,
        editorState.isOrderedListActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "ol"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleTaskListItem" }),
      style: [
        styles.actionDefault,
        editorState.isTaskListActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "task"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleH1" }),
      style: [
        styles.actionDefault,
        editorState.isBoldActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "H1"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleH2" }),
      style: [
        styles.actionDefault,
        editorState.isH1Active
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "H2"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleH3" }),
      style: [
        styles.actionDefault,
        editorState.isH2Active
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "H3"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "toggleBlockquote" }),
      style: [
        styles.actionDefault,
        editorState.isBlockquoteActive
          ? styles.actionActive
          : styles.actionInactive,
      ],
      text: "Quote"
    },
    {
      onPress: () => sendMessageToWebView({ kind: "action", payload: "sinkListItem" }),
      style: [
        styles.actionDefault,
        !editorState.canSinkListItem ? styles.actionDisabled : {},
      ],
      text: "Sink"
    },
    {
      onPress: () => {

        sendMessageToWebView({ kind: "action", payload: "liftListItem" })
      },
      style: [
        styles.actionDefault,
        !editorState.canLiftListItem ? styles.actionDisabled : {},
      ],
      text: "Lift",
    },
    {
      onPress: () => {
        const url = "https://educacionplasticayvisual.com/wp-content/uploads/imagen-funcion-estetica.jpg"
        sendMessageToWebView({ kind: "insertImage", payload: url });
    },
      style: [
        styles.actionDefault
      ],
      text: "Img",
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.actions}>

      <FlatList
        data={editorCommands}
        horizontal
        renderItem={({item, index, separators}) => (
          <TouchableOpacity
            key={item.text}
            onPress={item.onPress}
            style={item.style}
            >
            <Text>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
      </View>
      <TouchableWithoutFeedback
        onPress={() => {
          sendMessageToWebView({ kind: "editor", payload: "focus" });
        }}
      >
        <WebView
          ref={webViewRef}
          style={styles.webview}
          originWhitelist={["*"]}
          scrollEnabled={false}
          onMessage={(event) => {
            const webViewMessage = JSON.parse(
              event.nativeEvent.data
            ) as WebViewMessage;

            if (webViewMessage.kind === "editorStateUpdate") {
              setEditorState(webViewMessage.payload);
            }
            if (webViewMessage.kind === "editorInitialised") {
              sendMessageToWebView({
                kind: "initialContent",
                payload: content,
              });
            }
          }}
          source={{ html: `${editorHtml}` }}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = {
  ...StyleSheet.create({
    container: {
      flex: 1,
    },
    actions: { flexDirection: "row", gap: 4, padding: 4 },
    actionDefault: {
      padding: 6,
      borderRadius: 6,
    },
    actionActive: { backgroundColor: "rgba(0,0,0,0.1)" },
    actionInactive: {},
    actionDisabled: {
      opacity: 0.5,
    },
    webview: {
      flex: 1,
      minHeight: 140,
    },
  }),
};
