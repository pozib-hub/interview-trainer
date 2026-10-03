import { useEffect, useRef, useState } from "react";
import type { RunResult, TaskFull } from "@lib/types";

export interface LiveParticipant {
  id: string;
  name: string;
}

export interface LiveState {
  roomId: string;
  participants: LiveParticipant[];
  driverId: string;
  content: string;
  running: boolean;
  lastRun: RunResult | null;
}

export interface LiveChatMsg {
  from: string;
  text: string;
  at: number;
}

export type LiveStatus = "connecting" | "connected" | "error";

function wsBase(): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/live`;
}

export function useLiveRoom(roomId: string, name: string) {
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [error, setError] = useState("");
  const [task, setTask] = useState<TaskFull | null>(null);
  const [state, setState] = useState<LiveState | null>(null);
  const [chat, setChat] = useState<LiveChatMsg[]>([]);
  const [myId, setMyId] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const nameRef = useRef(name);
  nameRef.current = name;

  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`${wsBase()}/${encodeURIComponent(roomId)}?name=${encodeURIComponent(nameRef.current)}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onerror = () => {
      setStatus("error");
      setError("Не удалось подключиться к комнате");
    };
    ws.onclose = () => {
      setStatus((s) => (s === "error" ? s : "error"));
      setError((e) => e || "Соединение потеряно");
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "task") {
          setTask(msg.task);
        } else if (msg.type === "hello") {
          setMyId(msg.id);
        } else if (msg.type === "state") {
          setState({
            roomId: msg.roomId,
            participants: msg.participants ?? [],
            driverId: msg.driverId,
            content: msg.content,
            running: msg.running,
            lastRun: msg.lastRun ?? null,
          });
          setStatus("connected");
        } else if (msg.type === "chat") {
          setChat((prev) => [...prev, msg.msg]);
        }
      } catch {
        // игнорируем битые сообщения
      }
    };

    return () => {
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = (payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return {
    status,
    error,
    task,
    state,
    chat,
    myId,
    sendCode: (content: string) => send({ type: "code", content }),
    takeWheel: () => send({ type: "take_wheel" }),
    run: () => send({ type: "run" }),
    sendChat: (text: string) => send({ type: "chat", text }),
  };
}
