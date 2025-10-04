// PWA配置和Service Worker管理
export class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // 监听更新
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新版本可用，提示用户刷新
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async updateAvailable(): Promise<boolean> {
    if (!this.registration) return false;
    
    return new Promise((resolve) => {
      this.registration!.addEventListener('updatefound', () => {
        resolve(true);
      });
    });
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private showUpdateNotification(): void {
    if (confirm('新版本可用，是否立即更新？')) {
      this.skipWaiting();
    }
  }
}

export const pwaManager = new PWAManager();

// PWA配置
export const PWA_CONFIG = {
  name: 'Athlete Ally',
  short_name: 'AthleteAlly',
  description: '智能训练计划生成和管理平台',
  theme_color: '#000000',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  scope: '/',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};