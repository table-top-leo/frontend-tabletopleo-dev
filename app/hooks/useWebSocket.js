"use client";
import { useEffect, useRef, useCallback } from "react";

// ── GLOBAL singleton client — one WebSocket connection per browser tab ──
let globalClient   = null;
let globalConnected = false;
const subscribers  = new Map(); // topicKey → Set of { id, handler }
let subIdCounter   = 0;

const WS_URL = "http://localhost:6163/ws";

async function getStompLib() {
  const { Client } = await import("@stomp/stompjs");
  const SockJS      = (await import("sockjs-client")).default;
  return { Client, SockJS };
}

// Internal subscribe — called every time topics or handlers change
function subscribeToTopic(topic, handlerId, handler) {
  if (!subscribers.has(topic)) {
    subscribers.set(topic, new Map());
  }
  subscribers.get(topic).set(handlerId, handler);

  // If already connected, subscribe on the STOMP client now
  if (globalClient && globalConnected) {
    const stompSubKey = `__stomp_sub_${topic}`;
    if (!globalClient[stompSubKey]) {
      const stompSub = globalClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          // Deliver to ALL current handlers for this topic
          if (subscribers.has(topic)) {
            subscribers.get(topic).forEach(h => h(topic, data));
          }
        } catch (e) {
          console.error("[WS] Parse error:", e);
        }
      });
      globalClient[stompSubKey] = stompSub;
    }
  }
}

function unsubscribeFromTopic(topic, handlerId) {
  if (!subscribers.has(topic)) return;
  subscribers.get(topic).delete(handlerId);
  // If no handlers left for this topic, unsubscribe from STOMP
  if (subscribers.get(topic).size === 0) {
    subscribers.delete(topic);
    if (globalClient && globalConnected) {
      const stompSubKey = `__stomp_sub_${topic}`;
      if (globalClient[stompSubKey]) {
        try { globalClient[stompSubKey].unsubscribe(); } catch {}
        delete globalClient[stompSubKey];
      }
    }
  }
}

async function ensureConnected() {
  if (globalClient && globalConnected) return;
  if (globalClient && globalClient.active) return; // connecting

  try {
    const { Client, SockJS } = await getStompLib();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay:   4000,
      debug:            () => {},
      onConnect: () => {
        globalConnected = true;
        console.log("[WS] Connected to", WS_URL);

        // Re-subscribe to ALL currently registered topics
        subscribers.forEach((handlers, topic) => {
          const stompSubKey = `__stomp_sub_${topic}`;
          if (!client[stompSubKey]) {
            const stompSub = client.subscribe(topic, (message) => {
              try {
                const data = JSON.parse(message.body);
                if (subscribers.has(topic)) {
                  subscribers.get(topic).forEach(h => h(topic, data));
                }
              } catch (e) {
                console.error("[WS] Parse error:", e);
              }
            });
            client[stompSubKey] = stompSub;
          }
        });
      },
      onDisconnect: () => {
        globalConnected = false;
        console.log("[WS] Disconnected — will reconnect");
      },
      onStompError: (frame) => {
        console.error("[WS] STOMP error:", frame.headers?.message || frame);
      },
    });

    globalClient = client;
    client.activate();
  } catch (err) {
    console.error("[WS] Connect error:", err);
  }
}

// ── THE HOOK ─────────────────────────────────────────────────────
const useWebSocket = ({ topics = [], onMessage, enabled = true }) => {
  const handlerIdRef  = useRef(++subIdCounter);
  const onMessageRef  = useRef(onMessage);
  const topicsRef     = useRef([]);

  // Keep onMessage ref always current — fixes stale closure
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!enabled || topics.length === 0) return;

    const handlerId = handlerIdRef.current;
    const handler   = (topic, data) => {
      if (onMessageRef.current) onMessageRef.current(topic, data);
    };

    // Unsubscribe from old topics that are no longer needed
    const oldTopics = topicsRef.current;
    const newTopics = topics;

    oldTopics.forEach(t => {
      if (!newTopics.includes(t)) {
        unsubscribeFromTopic(t, handlerId);
      }
    });

    // Subscribe to new topics
    newTopics.forEach(t => {
      subscribeToTopic(t, handlerId, handler);
    });

    topicsRef.current = newTopics;

    // Ensure WS is connected
    ensureConnected();

    return () => {
      // Cleanup on unmount
      newTopics.forEach(t => unsubscribeFromTopic(t, handlerId));
      topicsRef.current = [];
    };
  // Re-run whenever topics string changes (adminId loaded, topics change)
  }, [topics.join(","), enabled]);

  const publish = useCallback((destination, body) => {
    if (globalClient && globalConnected) {
      globalClient.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { publish };
};

export default useWebSocket;
