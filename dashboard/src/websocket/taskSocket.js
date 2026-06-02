import { Client } from '@stomp/stompjs';

/**
 * STOMP client for /topic/tasks. Caller handles envelope parsing and state updates.
 */
export function createTaskSocket({ brokerURL, topic, onMessage, onConnect, onDisconnect, onStompError }) {
  const client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    onConnect: () => {
      onConnect?.();
      client.subscribe(topic, (message) => {
        onMessage(message.body);
      });
    },
    onWebSocketClose: () => {
      onDisconnect?.();
    },
    onStompError: (frame) => {
      onDisconnect?.();
      onStompError?.(frame);
    },
  });

  return {
    activate: () => client.activate(),
    deactivate: () => client.deactivate(),
  };
}
