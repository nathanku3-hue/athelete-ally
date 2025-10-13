"use client";

import type { MovementStageStatus } from '@/lib/api/curation';

export const movementStatusLabel = (status: MovementStageStatus) => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'READY_FOR_REVIEW':
      return 'Ready for review';
    case 'CHANGES_REQUESTED':
      return 'Changes requested';
    case 'APPROVED':
      return 'Approved';
    case 'PUBLISHED':
      return 'Published';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
};

export const statusBadgeClass = (status: MovementStageStatus) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-slate-700 text-slate-100';
    case 'READY_FOR_REVIEW':
      return 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
    case 'CHANGES_REQUESTED':
      return 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
    case 'APPROVED':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
    case 'PUBLISHED':
      return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
    case 'ARCHIVED':
      return 'bg-slate-800 text-slate-400 border border-slate-700';
    default:
      return 'bg-slate-700 text-slate-100';
  }
};

export const formatList = (values: string[]) => (values.length > 0 ? values.join(', ') : '—');

