import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socketInstance = null;

export const useSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [latestEvents, setLatestEvents] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, { transports: ['websocket', 'polling'], reconnectionAttempts: 5 });
    }
    socketRef.current = socketInstance;
    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      if (userId) socket.emit('join:dashboard', { userId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('users:count', ({ count }) => setOnlineCount(count));

    const handleEvent = (type) => (data) => {
      setLatestEvents(prev => [{ type, data, ts: Date.now() }, ...prev].slice(0, 20));
    };

    socket.on('assessment:new', handleEvent('assessment'));
    socket.on('revenue:new', handleEvent('revenue'));
    socket.on('churn:new', handleEvent('churn'));
    socket.on('leads:new', handleEvent('leads'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('users:count');
      socket.off('assessment:new');
      socket.off('revenue:new');
      socket.off('churn:new');
      socket.off('leads:new');
    };
  }, [userId]);

  const subscribe = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { connected, onlineCount, latestEvents, subscribe, socket: socketRef.current };
};
