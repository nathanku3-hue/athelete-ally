// 实时协作功能管理
import { io, Socket } from 'socket.io-client';

interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: number;
  userId: string;
}

interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: number;
}

export class RealtimeManager {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(private serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket'],
          timeout: 20000,
          forceNew: true
        });
        
        this.socket.on('connect', () => {
          console.log('Connected to realtime server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from realtime server:', reason);
          this.isConnected = false;
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.handleReconnect();
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('Realtime error:', error);
        });

        // 监听所有事件
        this.socket.onAny((event, ...args) => {
          this.handleEvent(event, args);
        });

      } catch (error) {
        console.error('Failed to connect to realtime server:', error);
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect().catch(() => {
          // 重连失败，继续尝试
        });
      }, delay);
    }
  }

  private handleEvent(event: string, args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, {
        type: event,
        data,
        timestamp: Date.now(),
        userId: this.getCurrentUserId()
      });
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback && this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else if (!callback) {
      this.listeners.delete(event);
    }
  }

  private getCurrentUserId(): string {
    try {
      return localStorage.getItem('userId') || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  // 协作相关方法
  joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
  }

  sendMessage(roomId: string, message: string): void {
    this.emit('send_message', { roomId, message });
  }

  updateCursor(roomId: string, position: { x: number; y: number }): void {
    this.emit('update_cursor', { roomId, position });
  }

  updateSelection(roomId: string, selection: { start: number; end: number }): void {
    this.emit('update_selection', { roomId, selection });
  }

  updateContent(roomId: string, content: any): void {
    this.emit('update_content', { roomId, content });
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 获取重连状态
  getReconnectStatus(): { attempts: number; maxAttempts: number } {
    return {
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    };
  }
}

// 全局实时管理器实例
export const realtimeManager = new RealtimeManager();


