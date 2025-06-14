const WEBSOCKET_URL = 'wss://821gxv78hl.execute-api.us-east-2.amazonaws.com/production';

let socket: WebSocket | null = null;

export const connectSocket = (
  roomId: string,
  onMessage: (data: any) => void
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket already connected');
    return;
  }

  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('Connected to WebSocket');

    const joinMessage = {
      action: 'joinRoom',
      roomId,
    };
    if (socket) {
      socket.send(JSON.stringify(joinMessage));
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received from server:', data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.warn('WebSocket connection closed');
    socket = null;
  };
};

export const sendMove = (roomId: string, row: number, col: number) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not ready');
    return;
  }

  const moveMessage = {
    action: 'makeMove',
    roomId,
    row,
    col,
  };

  socket.send(JSON.stringify(moveMessage));
};

export const closeSocket = () => {
  socket?.close();
  socket = null;
};
