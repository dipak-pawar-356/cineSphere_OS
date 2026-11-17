import {
  HallDesignerDomainEvent,
  HallDesignerDomainEventType,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Domain Event Bus (Phase 4 – Parts 15 & 16)
 * ==============================================================================
 * Decoupled event-driven messaging hub enabling Analytics Projections,
 * Notifications, Search Indexing, AI Recommendations, Digital Twin, and future
 * Enterprise Extensions to react to Hall Designer lifecycle events without
 * creating tight coupling to the Layout Core.
 * ==============================================================================
 */

export type HallDesignerEventListener<T = Record<string, unknown>> = (
  event: HallDesignerDomainEvent<T>
) => void | Promise<void>;

interface RegisteredListener {
  id: string;
  eventType: HallDesignerDomainEventType | "*";
  priority: number;
  subscriberName: string;
  listener: HallDesignerEventListener;
}

export class HallDesignerEventBus {
  private static instance: HallDesignerEventBus | null = null;
  private listeners: RegisteredListener[] = [];
  private eventLog: HallDesignerDomainEvent[] = [];
  private readonly MAX_LOG_SIZE = 500;

  private constructor() {}

  public static getInstance(): HallDesignerEventBus {
    if (!HallDesignerEventBus.instance) {
      HallDesignerEventBus.instance = new HallDesignerEventBus();
    }
    return HallDesignerEventBus.instance;
  }

  /**
   * Subscribe a decoupled consumer (e.g., Analytics Projection Engine, AI Advisor)
   * to a specific Hall Designer domain event or "*" wildcard.
   */
  public subscribe<T = Record<string, unknown>>(params: {
    eventType: HallDesignerDomainEventType | "*";
    subscriberName: string;
    priority?: number;
    listener: HallDesignerEventListener<T>;
  }): string {
    const id = `sub-${params.subscriberName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.listeners.push({
      id,
      eventType: params.eventType,
      priority: params.priority ?? 100,
      subscriberName: params.subscriberName,
      listener: params.listener as HallDesignerEventListener,
    });
    // Lower numeric priority executes earlier
    this.listeners.sort((a, b) => a.priority - b.priority);
    return id;
  }

  public unsubscribe(subscriptionId: string): boolean {
    const before = this.listeners.length;
    this.listeners = this.listeners.filter((l) => l.id !== subscriptionId);
    return this.listeners.length < before;
  }

  /**
   * Emit a typed domain event. Listener errors are isolated so one faulty
   * subscriber never disrupts the Layout Core or other consumers.
   */
  public async publish<T = Record<string, unknown>>(params: {
    eventType: HallDesignerDomainEventType;
    theatreId: string;
    hallId?: string;
    actorId: string;
    correlationId?: string;
    payload: T;
  }): Promise<HallDesignerDomainEvent<T>> {
    const event: HallDesignerDomainEvent<T> = {
      eventId: `evt-${params.eventType.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      eventType: params.eventType,
      theatreId: params.theatreId,
      hallId: params.hallId,
      actorId: params.actorId,
      correlationId: params.correlationId,
      occurredAt: new Date().toISOString(),
      payload: params.payload,
    };

    this.eventLog.unshift(event as HallDesignerDomainEvent);
    if (this.eventLog.length > this.MAX_LOG_SIZE) {
      this.eventLog.length = this.MAX_LOG_SIZE;
    }

    const matching = this.listeners.filter(
      (l) => l.eventType === params.eventType || l.eventType === "*"
    );

    for (const reg of matching) {
      try {
        await reg.listener(event as HallDesignerDomainEvent);
      } catch (err) {
        // Error isolation: never crash publisher on subscriber failure
        console.error(
          `[HallDesignerEventBus] Isolated subscriber error in '${reg.subscriberName}' for '${params.eventType}':`,
          err
        );
      }
    }

    return event;
  }

  public getEventLog(
    theatreId: string,
    eventType?: HallDesignerDomainEventType,
    limit = 50
  ): HallDesignerDomainEvent[] {
    return this.eventLog
      .filter((e) => {
        const matchesTenant = e.theatreId === theatreId;
        const matchesType = eventType ? e.eventType === eventType : true;
        return matchesTenant && matchesType;
      })
      .slice(0, limit);
  }

  public getSubscribers(): Array<{
    id: string;
    eventType: HallDesignerDomainEventType | "*";
    subscriberName: string;
    priority: number;
  }> {
    return this.listeners.map((l) => ({
      id: l.id,
      eventType: l.eventType,
      subscriberName: l.subscriberName,
      priority: l.priority,
    }));
  }
}

export const hallDesignerEventBus = HallDesignerEventBus.getInstance();
