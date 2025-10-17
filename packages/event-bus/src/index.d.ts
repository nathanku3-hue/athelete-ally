import { NatsConnection, JetStreamManager, JetStreamClient } from 'nats';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent, HRVRawReceivedEvent, HRVNormalizedStoredEvent, SleepRawReceivedEvent, SleepNormalizedStoredEvent } from '@athlete-ally/contracts';
import { AppStreamConfig } from './config.js';
import { Counter, Histogram, Gauge } from 'prom-client';
export declare const eventBusMetrics: {
    eventsPublished: Counter<"status" | "topic">;
    eventsConsumed: Counter<"status" | "topic">;
    schemaValidation: Counter<"status" | "topic">;
    schemaValidationFailures: Counter<"topic" | "error_type">;
    eventProcessingDuration: Histogram<"status" | "topic" | "operation">;
    eventsRejected: Counter<"topic" | "reason">;
    eventsNak: Counter<"topic" | "reason">;
    eventsAckPermanent: Counter<"topic">;
    consumerLag: Gauge<"topic" | "durable">;
    consumerAckPending: Gauge<"topic" | "durable">;
};
/** Determine if stream needs update (subjects/retention/replicas/etc.) */
export declare function streamNeedsUpdate(existing: unknown, desired: AppStreamConfig): boolean;
/** Ensure stream exists with desired config (update-if-different) */
export declare function ensureStream(jsm: JetStreamManager, cfg: AppStreamConfig): Promise<void>;
/** Ensure all configured streams exist */
export declare function ensureAllStreams(jsm: JetStreamManager): Promise<void>;
export declare class EventBus {
    private nc;
    private js;
    private jsm;
    private publishEvent;
    connect(url?: string, options?: {
        manageStreams?: boolean;
    }): Promise<void>;
    private ensureStreams;
    publishOnboardingCompleted(event: OnboardingCompletedEvent): Promise<void>;
    publishPlanGenerationRequested(event: PlanGenerationRequestedEvent): Promise<void>;
    publishPlanGenerated(event: PlanGeneratedEvent): Promise<void>;
    publishPlanGenerationFailed(event: PlanGenerationFailedEvent): Promise<void>;
    publishHRVRawReceived(event: HRVRawReceivedEvent): Promise<void>;
    publishHRVNormalizedStored(event: HRVNormalizedStoredEvent): Promise<void>;
    publishSleepRawReceived(event: SleepRawReceivedEvent): Promise<void>;
    publishSleepNormalizedStored(event: SleepNormalizedStoredEvent): Promise<void>;
    subscribeToOnboardingCompleted(callback: (event: OnboardingCompletedEvent) => Promise<void>): Promise<void>;
    private shouldRetry;
    subscribeToPlanGenerationRequested(callback: (event: PlanGenerationRequestedEvent) => Promise<void>): Promise<void>;
    subscribeToPlanGenerated(callback: (event: PlanGeneratedEvent) => Promise<void>): Promise<void>;
    close(): Promise<void>;
    getMetrics(): Promise<string>;
    getValidatorStatus(): {
        cacheSize: number;
        cacheHits: number;
        cacheMisses: number;
        hitRate: number;
    };
    getNatsConnection(): NatsConnection;
    getJetStream(): JetStreamClient;
    /**
     * Ensure a JetStream consumer exists with the desired configuration
     * @param streamName - The stream name
     * @param consumerConfig - Consumer configuration
     * @returns Promise<void>
     */
    ensureConsumer(streamName: string, consumerConfig: {
        durable_name: string;
        filter_subject: string;
        ack_policy: 'explicit' | 'none' | 'all';
        deliver_policy: 'all' | 'last' | 'new' | 'by_start_sequence' | 'by_start_time' | 'last_per_subject';
        max_deliver: number;
        ack_wait: number;
        max_ack_pending: number;
    }): Promise<void>;
    getJetStreamManager(): JetStreamManager;
}
export declare const eventBus: EventBus;
export { eventValidator } from './validator.js';
export { getStreamMode, getStreamCandidates } from './config.js';
//# sourceMappingURL=index.d.ts.map