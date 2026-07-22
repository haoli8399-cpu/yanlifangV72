import { useCallback, useState } from "react";
import { message } from "antd";
import type { ChatMessage, Solution } from "../types";
import { streamAIResponse } from "../mock/ai";

export function useAIChat(initial: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<Solution[] | undefined>();

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const asstId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: asstId, role: "assistant", content: "", createdAt: new Date().toISOString(), streaming: true },
      ]);
      setLoading(true);

      try {
        // Snapshot history at call time
        const history = [...messages, userMsg];
        const gen = streamAIResponse(text, history);
        let acc = "";
        while (true) {
          const { value, done } = await gen.next();
          if (done) {
            const meta = value as { finalConfidence: "高" | "中" | "低"; recommended?: Solution[]; suggestions?: string[] };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === asstId
                  ? { ...m, streaming: false, confidence: meta.finalConfidence, suggestions: meta.suggestions }
                  : m,
              ),
            );
            if (meta.recommended) setRecommended(meta.recommended);
            break;
          }
          acc += value;
          setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, content: acc } : m)));
        }
      } catch (e) {
        message.error("AI 响应失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  return { messages, loading, send, recommended, setMessages };
}