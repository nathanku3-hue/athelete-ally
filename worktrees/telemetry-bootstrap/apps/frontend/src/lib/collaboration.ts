// 实时协作功能
import React, { useEffect } from 'react';

interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'cursor_move' | 'selection_change' | 'content_change';
  userId: string;
  timestamp: number;
  data: any;
}

interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: number;
}

interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

interface Selection {
  start: number;
  end: number;
  elementId: string;
}

export class CollaborationManager {
  private ws: WebSocket | null = null;
  private users = new Map<string, User>();
  private cursors = new Map<string, CursorPosition>();
  private selections = new Map<string, Selection>();
  private eventHandlers = new Map<string, Function[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private wsUrl: string) {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('Collaboration WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Collaboration WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: CollaborationEvent): void {
    switch (data.type) {
      case 'user_joined':
        this.handleUserJoined(data);
        break;
      case 'user_left':
        this.handleUserLeft(data);
        break;
      case 'cursor_move':
        this.handleCursorMove(data);
        break;
      case 'selection_change':
        this.handleSelectionChange(data);
        break;
      case 'content_change':
        this.handleContentChange(data);
        break;
    }
  }

  private handleUserJoined(data: CollaborationEvent): void {
    const user: User = {
      id: data.userId,
      name: data.data.name,
      color: data.data.color,
      avatar: data.data.avatar,
      isOnline: true,
      lastSeen: data.timestamp,
    };
    this.users.set(user.id, user);
    this.emit('user_joined', user);
  }

  private handleUserLeft(data: CollaborationEvent): void {
    const user = this.users.get(data.userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = data.timestamp;
      this.cursors.delete(data.userId);
      this.selections.delete(data.userId);
      this.emit('user_left', user);
    }
  }

  private handleCursorMove(data: CollaborationEvent): void {
    const position: CursorPosition = data.data;
    this.cursors.set(data.userId, position);
    this.emit('cursor_move', { userId: data.userId, position });
  }

  private handleSelectionChange(data: CollaborationEvent): void {
    const selection: Selection = data.data;
    this.selections.set(data.userId, selection);
    this.emit('selection_change', { userId: data.userId, selection });
  }

  private handleContentChange(data: CollaborationEvent): void {
    this.emit('content_change', { userId: data.userId, data: data.data });
  }

  // 公共方法
  join(user: Omit<User, 'isOnline' | 'lastSeen'>): void {
    this.sendEvent({
      type: 'user_joined',
      userId: user.id,
      timestamp: Date.now(),
      data: user,
    });
  }

  leave(userId: string): void {
    this.sendEvent({
      type: 'user_left',
      userId,
      timestamp: Date.now(),
      data: {},
    });
  }

  moveCursor(position: CursorPosition): void {
    this.sendEvent({
      type: 'cursor_move',
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      data: position,
    });
  }

  changeSelection(selection: Selection): void {
    this.sendEvent({
      type: 'selection_change',
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      data: selection,
    });
  }

  changeContent(content: any): void {
    this.sendEvent({
      type: 'content_change',
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      data: content,
    });
  }

  private sendEvent(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  private getCurrentUserId(): string {
    // 这里应该从用户认证状态获取
    return 'current_user_id';
  }

  // 事件监听
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // 获取协作状态
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getCursors(): Map<string, CursorPosition> {
    return new Map(this.cursors);
  }

  getSelections(): Map<string, Selection> {
    return new Map(this.selections);
  }

  // 清理资源
  destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.users.clear();
    this.cursors.clear();
    this.selections.clear();
    this.eventHandlers.clear();
  }
}

// React Hook for collaboration
export function useCollaboration(wsUrl: string) {
  const [collaboration, setCollaboration] = React.useState<CollaborationManager | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [cursors, setCursors] = React.useState<Map<string, CursorPosition>>(new Map());
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    const collab = new CollaborationManager(wsUrl);
    setCollaboration(collab);

    collab.on('connected', () => setIsConnected(true));
    collab.on('disconnected', () => setIsConnected(false));
    collab.on('user_joined', () => setUsers(collab.getUsers()));
    collab.on('user_left', () => setUsers(collab.getUsers()));
    collab.on('cursor_move', () => setCursors(collab.getCursors()));

    return () => {
      collab.destroy();
    };
  }, [wsUrl]);

  return {
    collaboration,
    users,
    cursors,
    isConnected,
  };
}