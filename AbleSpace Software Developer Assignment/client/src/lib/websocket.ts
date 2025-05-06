// WebSocket client utility

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000; // 3 seconds

type MessageCallback = (data: any) => void;
const messageListeners: MessageCallback[] = [];

/**
 * Connect to the WebSocket server
 * @param userId The user ID to authenticate with
 */
export function connectWebSocket(userId: number): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  try {
    // Use a different path than Vite's WebSocket to avoid conflicts
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket at', wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0;
      
      // Authenticate
      if (userId) {
        socket?.send(JSON.stringify({
          type: 'auth',
          userId
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Notify all listeners
        messageListeners.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      
      // Attempt to reconnect if not intentionally closed
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
        
        setTimeout(() => {
          connectWebSocket(userId);
        }, reconnectDelay);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error);
  }
}

/**
 * Disconnect from the WebSocket server
 */
export function disconnectWebSocket(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
}

/**
 * Add a listener for WebSocket messages
 * @param callback The callback to call when a message is received
 */
export function addMessageListener(callback: MessageCallback): void {
  messageListeners.push(callback);
}

/**
 * Remove a listener for WebSocket messages
 * @param callback The callback to remove
 */
export function removeMessageListener(callback: MessageCallback): void {
  const index = messageListeners.indexOf(callback);
  if (index !== -1) {
    messageListeners.splice(index, 1);
  }
}

/**
 * Send a message to the WebSocket server
 * @param message The message to send
 */
export function sendMessage(message: any): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket not connected, cannot send message');
  }
}