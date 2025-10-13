import { MovementStageStatus } from '../../prisma/generated/client/index.js';
import { meter } from '../telemetry.js';

type PublishResult = 'success' | 'failure';

type StatusCount = {
  status: MovementStageStatus;
  count: number;
};

const draftStatusGaugeState = new Map<MovementStageStatus, number>();

for (const status of Object.values(MovementStageStatus)) {
  draftStatusGaugeState.set(status, 0);
}

const draftStatusGauge = meter.createObservableGauge('movement_curation_drafts_total', {
  description: 'Current number of movement drafts by status',
});

draftStatusGauge.addCallback((observableResult) => {
  for (const [status, count] of draftStatusGaugeState.entries()) {
    observableResult.observe(count, { status });
  }
});

const statusTransitionCounter = meter.createCounter('movement_curation_status_transitions_total', {
  description: 'Number of movement draft status transitions',
});

const publishAttemptCounter = meter.createCounter('movement_curation_publish_attempts_total', {
  description: 'Number of movement publish attempts grouped by result',
});

const draftCreatedCounter = meter.createCounter('movement_curation_drafts_created_total', {
  description: 'Total number of drafts created through curation tooling',
});

export const movementCurationMetrics = {
  recordDraftCreated() {
    draftCreatedCounter.add(1);
  },

  recordStatusTransition(from: MovementStageStatus, to: MovementStageStatus) {
    statusTransitionCounter.add(1, { from, to });
  },

  recordPublishAttempt(result: PublishResult, details?: { from?: MovementStageStatus; reason?: string }) {
    publishAttemptCounter.add(1, {
      result,
      from: details?.from ?? 'unknown',
      reason: details?.reason ?? (result === 'success' ? 'completed' : 'error'),
    });
  },

  setDraftStatusCounts(counts: StatusCount[]) {
    const seen = new Set<MovementStageStatus>();

    for (const { status, count } of counts) {
      draftStatusGaugeState.set(status, count);
      seen.add(status);
    }

    for (const status of draftStatusGaugeState.keys()) {
      if (!seen.has(status)) {
        draftStatusGaugeState.set(status, 0);
      }
    }
  },
};

