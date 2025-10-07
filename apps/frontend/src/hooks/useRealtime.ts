import { useEffect, useRef, useState } from 'react';
import { RealtimeManager } from '@/lib/realtime';

export function useRealtime(serverUrl?: string) {
  const realtimeRef = useRef<RealtimeManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectStatus, setReconnectStatus] = useState({ attempts: 0, maxAttempts: 5 });

  useEffect(() => {
    realtimeRef.current = new RealtimeManager(serverUrl);
    
    const connect = async () => {
      try {
        await realtimeRef.current!.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to realtime server:', error);
        setIsConnected(false);
      }
    };

    connect();

    // 监听连接状态变化
    const interval = setInterval(() => {
      if (realtimeRef.current) {
        setIsConnected(realtimeRef.current.getConnectionStatus());
        setReconnectStatus(realtimeRef.current.getReconnectStatus());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (realtimeRef.current) {
        realtimeRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  const emit = (event: string, data: any) => {
    if (realtimeRef.current) {
      realtimeRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (realtimeRef.current) {
      realtimeRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (realtimeRef.current) {
      realtimeRef.current.off(event, callback);
    }
  };

  // 协作相关方法
  const joinRoom = (roomId: string) => {
    if (realtimeRef.current) {
      realtimeRef.current.joinRoom(roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (realtimeRef.current) {
      realtimeRef.current.leaveRoom(roomId);
    }
  };

  const sendMessage = (roomId: string, message: string) => {
    if (realtimeRef.current) {
      realtimeRef.current.sendMessage(roomId, message);
    }
  };

  const updateCursor = (roomId: string, position: { x: number; y: number }) => {
    if (realtimeRef.current) {
      realtimeRef.current.updateCursor(roomId, position);
    }
  };

  const updateSelection = (roomId: string, selection: { start: number; end: number }) => {
    if (realtimeRef.current) {
      realtimeRef.current.updateSelection(roomId, selection);
    }
  };

  const updateContent = (roomId: string, content: any) => {
    if (realtimeRef.current) {
      realtimeRef.current.updateContent(roomId, content);
    }
  };

  return {
    isConnected,
    reconnectStatus,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendMessage,
    updateCursor,
    updateSelection,
    updateContent
  };
}


