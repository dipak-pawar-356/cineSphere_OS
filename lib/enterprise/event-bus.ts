/**
 * ==============================================================================
 * CineSphere OS — Enterprise Domain Event Bus (Phase 3 – Part 16)
 * ==============================================================================
 * Central event-driven pub/sub architecture supporting asynchronous, decoupled
 * message dispatch, subscriber priority sorting, predicate-based filtering,
 * error isolation, and historical event replay/auditing.
 * ==============================================================================
 */

import {
  EnterpriseDomainEventType,
  DomainEventPayload,
  DomainEventHandler,
  DomainEventSubscription,
} from "@/types/enterprise-extension-framework.types";

export type DomainEventType = EnterpriseDomainEventType;

export interface PublishResult {
  deliveredCount: number;
  errors: Array<{
    subscriptionId: string;
    subscriberModuleId: string;
    error: string;
  }>;
}

export class EnterpriseDomainEventBus {
  private static instance: EnterpriseDomainEventBus | null = null;
  private subscriptions: Map<string, DomainEventSubscription> = new Map();
  private eventHistory: DomainEventPayload[] = [];
  private maxHistorySize: number = 500;

  private constructor() {}

  /**
   * Access the singleton instance of the Enterprise Domain Event Bus
   */
  public static getInstance(): EnterpriseDomainEventBus {
    if (!EnterpriseDomainEventBus.instance) {
      EnterpriseDomainEventBus.instance = new EnterpriseDomainEventBus();
    }
    return EnterpriseDomainEventBus.instance;
  }

  /**
   * Subscribe an enterprise module or listener to one or more domain event types.
   */
  public subscribe(
    subscription: Omit<DomainEventSubscription, "subscriptionId"> & { subscriptionId?: string }
  ): string {
    const id = subscription.subscriptionId || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fullSub: DomainEventSubscription = {
      ...subscription,
      subscriptionId: id,
    };
    this.subscriptions.set(id, fullSub);
    return id;
  }

  /**
   * Unsubscribe a listener by its subscription ID.
   */
  public unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Asynchronously publish a domain event to all registered matching subscribers.
   * Subscriber execution is isolated so that errors in one handler do not abort
   * delivery to other subscribers. Subscribers run in descending priority order.
   */
  public async publish<T = unknown>(
    eventInput: Omit<DomainEventPayload<T>, "eventId" | "timestamp"> & {
      eventId?: string;
      timestamp?: string;
    }
  ): Promise<PublishResult> {
    const event: DomainEventPayload<T> = {
      eventId: eventInput.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: eventInput.timestamp || new Date().toISOString(),
      ...eventInput,
    };

    // Store in historical buffer for auditing and replay
    this.eventHistory.unshift(event as DomainEventPayload<unknown>);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Filter matching subscribers
    const matchingSubs = Array.from(this.subscriptions.values())
      .filter((sub) => {
        if (!sub.eventTypes.includes(event.eventType)) {
          return false;
        }
        if (sub.filterPredicate && !sub.filterPredicate(event as DomainEventPayload<unknown>)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    const result: PublishResult = {
      deliveredCount: 0,
      errors: [],
    };

    for (const sub of matchingSubs) {
      try {
        await Promise.resolve(sub.handler(event));
        result.deliveredCount++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push({
          subscriptionId: sub.subscriptionId,
          subscriberModuleId: sub.subscriberModuleId,
          error: errorMsg,
        });
      }
    }

    return result;
  }

  /**
   * Retrieve list of active subscriptions, optionally filtered by event type.
   */
  public getSubscribers(eventType?: DomainEventType): DomainEventSubscription[] {
    const all = Array.from(this.subscriptions.values());
    if (!eventType) return all;
    return all.filter((s) => s.eventTypes.includes(eventType));
  }

  /**
   * Retrieve in-memory event history for diagnostics, reporting, or replay.
   */
  public getEventHistory(filter?: {
    eventType?: DomainEventType;
    tenantId?: string;
    limit?: number;
  }): DomainEventPayload[] {
    let result = [...this.eventHistory];
    if (filter?.eventType) {
      result = result.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.tenantId) {
      result = result.filter((e) => e.tenantId === filter.tenantId);
    }
    if (filter?.limit && filter.limit > 0) {
      result = result.slice(0, filter.limit);
    }
    return result;
  }

  /**
   * Clear recorded event history.
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Reset the event bus to initial pristine state (for testing).
   */
  public reset(): void {
    this.subscriptions.clear();
    this.eventHistory = [];
  }
}

export const eventBus = EnterpriseDomainEventBus.getInstance();
