/**
 * ==============================================================================
 * CineSphere OS — Base Repository Architecture (Phase 2 – Part 16)
 * ==============================================================================
 * Foundational repository contract. Encapsulates database queries, handles
 * serverless connection resilience, and provides clean query abstractions.
 * ==============================================================================
 */

export interface IBaseRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findAll(filter?: Record<string, unknown>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: TId, data: Partial<T>): Promise<T | null>;
  delete(id: TId): Promise<boolean>;
}

export abstract class BaseRepository<T, TId = string> implements IBaseRepository<T, TId> {
  protected abstract entityName: string;

  abstract findById(id: TId): Promise<T | null>;
  abstract findAll(filter?: Record<string, unknown>): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: TId, data: Partial<T>): Promise<T | null>;
  abstract delete(id: TId): Promise<boolean>;

  protected logQuery(operation: string, details?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[REPO:${this.entityName}] ${operation}`, details || "");
    }
  }
}

