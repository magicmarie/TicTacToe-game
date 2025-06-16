const WEBSOCKET_URL = 'wss://821gxv78hl.execute-api.us-east-2.amazonaws.com/production';

let socket: WebSocket | null = null;
let gamePageListeners: ((data: unknown) => void)[] = [];

export const connectSocket = (onMessage: (data: unknown) => void) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('Already connected');
    addGamePageListener(onMessage);
    return;
  }

  socket = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

  socket.onopen = () => console.log('WebSocket connected');

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    gamePageListeners.forEach((fn) => fn(data));
  };

  socket.onerror = (e) => console.error('WebSocket error', e);
  socket.onclose = () => {
    console.warn('WebSocket closed');
    socket = null;
    gamePageListeners = [];
  };

  addGamePageListener(onMessage);
};

export const addGamePageListener = (listener: (data: unknown) => void) => {
  if (!gamePageListeners.includes(listener)) gamePageListeners.push(listener);
};

export const sendMessage = (msg: object) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not open');
    return;
  }
  socket.send(JSON.stringify(msg));
};

export const closeSocket = () => {
  if (socket) {
    // Send the 'disconnect' message to the server before closing
    socket.send(JSON.stringify({ action: '$disconnect' }));

    // Gracefully close the socket
    socket.close();
  }

  // Clear socket and listeners
  socket = null;
  gamePageListeners = [];
};
