// 国际化配置
export const locales = ['zh-CN', 'en-US'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'zh-CN';

// 翻译资源
export const translations = {
  'zh-CN': {
    common: {
      loading: '加载中...',
      error: '出现错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      filter: '筛选',
      clear: '清除',
    },
    navigation: {
      home: '首页',
      plans: '训练计划',
      sessions: '训练会话',
      progress: '进度',
      settings: '设置',
    },
    plans: {
      title: '训练计划',
      subtitle: '选择或创建你的训练计划',
      createPlan: '创建计划',
      selectPlan: '选择计划',
      editPlan: '编辑计划',
      deletePlan: '删除计划',
      noPlans: '没有找到训练计划',
      noPlansDescription: '开始创建你的第一个训练计划',
      searchPlaceholder: '搜索训练计划...',
      difficulty: {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级',
      },
      category: {
        strength: '力量训练',
        cardio: '有氧训练',
        flexibility: '柔韧性训练',
        functional: '功能性训练',
      },
      duration: '持续时间',
      sessionsPerWeek: '次/周',
      estimatedTime: '分钟/次',
      weeks: '周',
    },
    sessions: {
      title: '训练会话',
      subtitle: '管理你的训练会话',
      createSession: '新建会话',
      startSession: '开始训练',
      pauseSession: '暂停',
      completeSession: '完成',
      resetSession: '重新开始',
      noSessions: '没有找到训练会话',
      noSessionsDescription: '开始创建你的第一个训练会话',
      searchPlaceholder: '搜索训练会话...',
      status: {
        pending: '待开始',
        inProgress: '进行中',
        completed: '已完成',
        skipped: '已跳过',
      },
      progress: '进度',
      exercises: '个动作',
    },
    exercises: {
      complete: '完成',
      sets: '组',
      reps: '次',
      weight: '重量',
      notes: '备注',
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
    },
    navigation: {
      home: 'Home',
      plans: 'Training Plans',
      sessions: 'Training Sessions',
      progress: 'Progress',
      settings: 'Settings',
    },
    plans: {
      title: 'Training Plans',
      subtitle: 'Choose or create your training plans',
      createPlan: 'Create Plan',
      selectPlan: 'Select Plan',
      editPlan: 'Edit Plan',
      deletePlan: 'Delete Plan',
      noPlans: 'No training plans found',
      noPlansDescription: 'Start creating your first training plan',
      searchPlaceholder: 'Search training plans...',
      difficulty: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      },
      category: {
        strength: 'Strength Training',
        cardio: 'Cardio Training',
        flexibility: 'Flexibility Training',
        functional: 'Functional Training',
      },
      duration: 'Duration',
      sessionsPerWeek: 'sessions/week',
      estimatedTime: 'min/session',
      weeks: 'weeks',
    },
    sessions: {
      title: 'Training Sessions',
      subtitle: 'Manage your training sessions',
      createSession: 'New Session',
      startSession: 'Start Training',
      pauseSession: 'Pause',
      completeSession: 'Complete',
      resetSession: 'Reset',
      noSessions: 'No training sessions found',
      noSessionsDescription: 'Start creating your first training session',
      searchPlaceholder: 'Search training sessions...',
      status: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        skipped: 'Skipped',
      },
      progress: 'Progress',
      exercises: 'exercises',
    },
    exercises: {
      complete: 'Complete',
      sets: 'sets',
      reps: 'reps',
      weight: 'weight',
      notes: 'notes',
    },
  },
} as const;

// 翻译函数
export function t(key: string, locale: Locale = defaultLocale): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// 获取当前语言
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const stored = localStorage.getItem('locale') as Locale;
  return locales.includes(stored) ? stored : defaultLocale;
}

// 设置语言
export function setLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
  window.location.reload();
}