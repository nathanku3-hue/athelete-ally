export interface SeasonPhase {
  id: 'offseason' | 'preseason' | 'inseason';
  title: string;
  description: string;
  duration: string;
  trainingFocus: string;
  icon: string;
  characteristics: string[];
  competitionDistance: string;
  keyPoints: string[];
}

export const SEASON_PHASES: SeasonPhase[] = [
  {
    id: 'offseason',
    title: '休赛期',
    description: '比赛结束后的恢复和基础建设阶段',
    duration: '3-6个月',
    trainingFocus: '基础力量建设和技术改进',
    icon: '🏗️',
    characteristics: [
      '重点发展基础力量',
      '技术动作改进',
      '体能基础建设',
      '伤病预防和恢复'
    ],
    competitionDistance: '距离比赛 > 6个月',
    keyPoints: [
      '建立力量基础',
      '改进技术动作',
      '预防伤病',
      '恢复身体状态'
    ]
  },
  {
    id: 'preseason',
    title: '赛前准备期',
    description: '比赛前的专项准备和强度提升阶段',
    duration: '2-4个月',
    trainingFocus: '专项能力提升和比赛模拟',
    icon: '⚡',
    characteristics: [
      '专项力量提升',
      '比赛强度训练',
      '心理准备',
      '战术演练'
    ],
    competitionDistance: '距离比赛 2-6个月',
    keyPoints: [
      '提升专项能力',
      '模拟比赛强度',
      '心理状态调整',
      '战术策略演练'
    ]
  },
  {
    id: 'inseason',
    title: '赛季中',
    description: '比赛期间的维持和微调阶段',
    duration: '比赛期间',
    trainingFocus: '状态维持和比赛表现',
    icon: '🏆',
    characteristics: [
      '状态维持',
      '比赛恢复',
      '战术执行',
      '心理调整'
    ],
    competitionDistance: '正在比赛期间',
    keyPoints: [
      '维持最佳状态',
      '快速恢复',
      '执行战术',
      '心理调整'
    ]
  }
];

export const COMPETITION_TYPES = [
  { id: 'basketball', name: '篮球', icon: '🏀' },
  { id: 'football', name: '足球', icon: '⚽' },
  { id: 'tennis', name: '网球', icon: '🎾' },
  { id: 'swimming', name: '游泳', icon: '🏊' },
  { id: 'running', name: '跑步', icon: '🏃' },
  { id: 'cycling', name: '自行车', icon: '🚴' },
  { id: 'weightlifting', name: '举重', icon: '🏋️' },
  { id: 'other', name: '其他', icon: '🎯' }
];

export const SEASON_DESCRIPTIONS = {
  offseason: {
    title: '休赛期阶段',
    subtitle: '基础建设，技术改进',
    description: '这个阶段是建立基础力量、改进技术动作、预防伤病的黄金时期。',
    trainingApproach: '以基础力量为主，技术为辅',
    recoveryTime: '48-72小时',
    volumeGuidance: '中等到高训练量'
  },
  preseason: {
    title: '赛前准备期',
    subtitle: '专项提升，强度训练',
    description: '在基础建设完成后，开始专项能力提升和比赛强度训练。',
    trainingApproach: '专项力量与比赛强度并重',
    recoveryTime: '24-48小时',
    volumeGuidance: '高训练量，精細化控制'
  },
  inseason: {
    title: '赛季中阶段',
    subtitle: '状态维持，比赛表现',
    description: '比赛期间的重点是维持最佳状态，快速恢复，执行战术。',
    trainingApproach: '维持状态，快速恢复',
    recoveryTime: '12-24小时',
    volumeGuidance: '维持性训练量'
  }
};

export const SEASON_VALIDATION = {
  offseason: {
    minDuration: 3, // months
    maxDuration: 6, // months
    requiredSkills: ['基础力量', '技术动作'],
    recommendedFocus: ['力量建设', '技术改进']
  },
  preseason: {
    minDuration: 2, // months
    maxDuration: 4, // months
    requiredSkills: ['专项力量', '比赛强度'],
    recommendedFocus: ['专项提升', '强度训练']
  },
  inseason: {
    minDuration: 0, // months
    maxDuration: 12, // months
    requiredSkills: ['状态维持', '快速恢复'],
    recommendedFocus: ['状态维持', '比赛表现']
  }
};
