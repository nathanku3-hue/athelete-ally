export interface ProficiencyLevel {
  id: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  characteristics: string[];
  trainingFocus: string;
  icon: string;
  experienceRange: string;
  keyPoints: string[];
}

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  {
    id: 'beginner',
    title: '初學者',
    description: '剛開始規律訓練，需要學習基本動作模式',
    experienceRange: '訓練經驗 < 6個月',
    characteristics: [
      '訓練經驗 < 6個月',
      '需要學習基本動作',
      '重點在動作質量而非重量',
      '需要教練指導'
    ],
    trainingFocus: '動作學習與基礎建立',
    icon: '🌱',
    keyPoints: [
      '學習正確的動作模式',
      '建立穩定的訓練習慣',
      '避免過度訓練',
      '專注於技術而非重量'
    ]
  },
  {
    id: 'intermediate',
    title: '中級',
    description: '有基礎訓練經驗，可以進行複雜動作',
    experienceRange: '訓練經驗 6個月-2年',
    characteristics: [
      '訓練經驗 6個月-2年',
      '掌握基本動作模式',
      '可以進行負重訓練',
      '開始理解訓練原理'
    ],
    trainingFocus: '力量提升與技術精進',
    icon: '💪',
    keyPoints: [
      '提升訓練強度',
      '學習複雜動作',
      '開始週期化訓練',
      '建立個人記錄'
    ]
  },
  {
    id: 'advanced',
    title: '高級',
    description: '經驗豐富，可以進行高強度複雜訓練',
    experienceRange: '訓練經驗 > 2年',
    characteristics: [
      '訓練經驗 > 2年',
      '掌握複雜動作模式',
      '可以進行高強度訓練',
      '深度理解訓練科學'
    ],
    trainingFocus: '競技表現與專業化訓練',
    icon: '🏆',
    keyPoints: [
      '追求競技表現',
      '精細化訓練計劃',
      '高級訓練技術',
      '專業化指導'
    ]
  }
];

export const PROFICIENCY_DESCRIPTIONS = {
  beginner: {
    title: '初學者階段',
    subtitle: '建立基礎，學習動作',
    description: '這個階段的重點是學習正確的動作模式，建立穩定的訓練習慣，為未來的進步打下堅實基礎。',
    trainingApproach: '以技術為重，重量為輔',
    recoveryTime: '48-72小時',
    volumeGuidance: '低到中等訓練量'
  },
  intermediate: {
    title: '中級階段',
    subtitle: '提升力量，精進技術',
    description: '在掌握基本動作的基礎上，開始提升訓練強度，學習更複雜的動作，並開始理解訓練的科學原理。',
    trainingApproach: '技術與力量並重',
    recoveryTime: '24-48小時',
    volumeGuidance: '中等到高訓練量'
  },
  advanced: {
    title: '高級階段',
    subtitle: '追求表現，專業訓練',
    description: '具備豐富的訓練經驗和深度理解，可以進行高強度的專業化訓練，追求競技表現和個人極限。',
    trainingApproach: '專業化高強度訓練',
    recoveryTime: '12-24小時',
    volumeGuidance: '高訓練量，精細化控制'
  }
};

export const PROFICIENCY_VALIDATION = {
  beginner: {
    minExperience: 0,
    maxExperience: 6, // months
    requiredSkills: ['基本動作模式'],
    recommendedFocus: ['動作學習', '習慣建立']
  },
  intermediate: {
    minExperience: 6,
    maxExperience: 24, // months
    requiredSkills: ['基本動作模式', '負重訓練'],
    recommendedFocus: ['力量提升', '技術精進']
  },
  advanced: {
    minExperience: 24,
    maxExperience: Infinity, // months
    requiredSkills: ['複雜動作模式', '高強度訓練'],
    recommendedFocus: ['競技表現', '專業化訓練']
  }
};
