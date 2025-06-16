import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, sendMessage as wsSendMessage } from '../lib/websocket';

type WebSocketContextType = {
  sendMessage: (msg: object) => void;
  connected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connectSocket(() => {});
    setConnected(true);
  }, []);

  const sendMessage = (msg: object) => wsSendMessage(msg);

  return (
    <WebSocketContext.Provider value={{ sendMessage, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
};
