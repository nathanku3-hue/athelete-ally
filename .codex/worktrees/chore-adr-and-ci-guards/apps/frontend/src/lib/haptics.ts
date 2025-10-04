// src/lib/haptics.ts

/**
 * 定義不同反饋類型的震動模式
 * 格式：[震動時長, 暫停時長, 震動時長, ...]
 */
const HAPTIC_PATTERNS = {
  light: [50],         // 輕微提示，如按鈕點擊
  success: [100, 50, 100], // 成功操作，如完成一組
  notification: [200], // 通知，如休息結束
};

type HapticFeedbackType = keyof typeof HAPTIC_PATTERNS;

/**
 * HapticsService 提供了在支持的設備上觸發震動反饋的標準方法。
 * 如果設備不支持 Vibration API，它將靜默失敗，不會拋出錯誤。
 */
export const Haptics = {
  /**
   * 觸發指定類型的震動反饋。
   * @param type - 反饋類型 ('light', 'success', 'notification')
   */
  trigger: (type: HapticFeedbackType): void => {
    // 檢查 window 和 navigator.vibrate 是否存在，以確保代碼在服務器端渲染或舊瀏覽器中不會出錯
    if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
      try {
        const pattern = HAPTIC_PATTERNS[type];
        window.navigator.vibrate(pattern);
        console.log(`Haptic feedback triggered: ${type}`);
      } catch (error) {
        console.error("Haptic feedback failed:", error);
      }
    } else {
      console.log(`Haptic feedback not supported. Type: ${type}`);
    }
  },
};

// 使用範例:
// import { Haptics } from './lib/haptics';
//
// // 在休息計時器開始時
// Haptics.trigger('light');
//
// // 在休息計時器結束時
// Haptics.trigger('notification');
