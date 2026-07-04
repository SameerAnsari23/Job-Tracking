# Ingestion Platform Architecture

> Architecture Decision Record ADR-001  
> Status: Current  
> Module: `backend/src/modules/ingestion`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architectural Principles](#2-architectural-principles)
3. [High-Level Flow](#3-high-level-flow)
4. [Scheduling Architecture](#4-scheduling-architecture)
5. [Provider Framework](#5-provider-framework)
6. [Crawl Execution](#6-crawl-execution)
7. [Persistence](#7-persistence)
8. [Failure Recovery](#8-failure-recovery)
9. [Extension Points](#9-extension-points)
10. [Repository Structure](#10-repository-structure)
11. [Architectural Invariants](#11-architectural-invariants)
12. [Current Architecture Status](#12-current-architecture-status)

---

## 1. System Overview

The ingestion platform discovers, fetches, and persists job postings from third-party provider APIs. It is structured as six subsystems with explicit ownership boundaries.

### Scheduling

Scheduling owns the question of *when* a target is crawled. Each `CrawlTarget` aggregate holds a `CrawlSchedule` value object that carries the crawl priority, interval, and next-due timestamp. The scheduling subsystem derives crawl frequency from priority and supports per-target custom intervals. All scheduling decisions are expressed through the `CrawlTarget` state machine; no scheduling logic exists in the worker or provider layers.

### Dispatch

Dispatch translates due `CrawlTarget` records into BullMQ jobs. `CrawlDispatchWorker` runs every 15 minutes as a serial sweep, queries `ICrawlTargetRepository.findDue()` for targets whose `nextCrawlAt` is at or before now and whose state is `IDLE` or `BACKOFF`, and enqueues one `crawl-execution` job per result. Dispatch does not claim targets and never calls provider adapters.

### Crawl Execution

`CrawlCompanyWorker` processes crawl-execution jobs with concurrency 3. It claims a target with an optimistic-concurrency write before any provider call, performs a paginated fetch, ingests each listing, and marks the target as succeeded or failed. All mutations go through use cases; no direct repository access occurs in the worker layer.

### Provider Framework

The provider framework is a self-contained package inside the ingestion module. It exposes `IJobProvider` as its public contract and owns HTTP transport, retry, timeout, circuit-breaker, and provider-specific parsing. The framework is isolated from the application layer through `ProviderRegistryAdapter`, which translates between the framework's `ProviderJob` type and the application layer's `RawJobListing`. Provider types never cross into the application layer.

### Persistence

Persistence is split across two MongoDB collections: `crawl_targets` and `job_postings`. All writes use optimistic concurrency control (OCC). Job posting creation uses two-layer idempotency: an application-level pre-check followed by a unique index enforcement. Content updates use a MongoDB aggregation pipeline conditional write to avoid rewriting large description fields when the content hash is unchanged.

### Recovery

Recovery is shared between two mechanisms with distinct responsibilities. BullMQ retry (`attempts: 3`, exponential backoff from 2 s) handles infrastructure crashes that occur before a claim is persisted to the database. `StuckCrawlRecoveryWorker` handles all in-progress recovery: it runs every 15 minutes and resets any `CrawlTarget` that has been `RUNNING` for more than 30 minutes back to `IDLE` for re-dispatch.

---

## 2. Architectural Principles

### Single Responsibility Principle

Each component owns exactly one concern:

| Component | Single responsibility |
|---|---|
| `CrawlSchedule` | Crawl frequency and due-time arithmetic |
| `CrawlTarget` | Crawl state machine and backoff computation |
| `CrawlDispatchWorker` | Finding due targets and enqueuing execution jobs |
| `CrawlCompanyWorker` | Claiming, fetching, ingesting, and completing one crawl |
| `StuckCrawlRecoveryWorker` | Resetting in-progress stuck crawls to idle |
| `ProviderRegistryAdapter` | Translating between provider and application types |
| `ProviderRegistry` | Storing and retrieving registered provider instances |
| `JobProviderFactory` | Creating and memoizing provider instances |
| `MongoCrawlTargetRepository` | Persisting and querying `CrawlTarget` aggregates |
| `MongoJobPostingRepository` | Persisting and querying `JobPosting` aggregates |

No component reaches across its boundary. Workers do not access repositories directly. Providers do not access domain aggregates. Repositories do not contain business logic.

### Open/Closed Principle

The system is open for extension and closed for modification in three dimensions:

**Provider extension**: Adding a new provider requires creating an `IJobProvider` implementation, adding the source identifier to the `JobSource` union type and `JOB_SOURCES` set in `domain/enums`, and registering the provider in the DI container. No existing component is modified. `CrawlCompanyWorker`, `ProviderRegistryAdapter`, and all use cases are unaffected.

**Scheduling policy extension**: Custom crawl frequencies are supported through `CrawlTarget.updateIntervalMs()` and the optional `intervalMs` parameter on `CreateCrawlTargetCommand`. Priority recalculation via `derivePriority()` is a pure function that can be replaced without modifying the domain model. `CrawlSchedule.withPriority()` preserves custom intervals when the target has been given a non-default frequency.

**Ingestion strategy extension**: `IJobProviderAdapter.fetchJobs()` accepts a `ProviderRequest` that includes cursor, since, and limit, making it compatible with paginated, incremental, and bulk strategies without changes to `CrawlCompanyWorker`.

### Dependency Inversion Principle

All cross-layer dependencies point inward toward the domain:

- Workers depend on use case interfaces and application ports (`IJobProviderRegistry`, `IFindCanonicalJobQuery`), not on infrastructure or providers directly.
- Use cases depend on repository interfaces (`ICrawlTargetRepository`, `IJobPostingRepository`) injected via tsyringe, not on MongoDB implementations.
- The provider framework (`IJobProvider`) is never imported by the application or worker layers. Only `IJobProviderAdapter` and `RawJobListing` cross into the application layer, via `ProviderRegistryAdapter`.
- `IFindCanonicalJobQuery` exists as an application port so that `CrawlCompanyWorker` never imports repository interfaces directly.

---

## 3. High-Level Flow

```
SchedulePlanningWorker (every 6 h)
  → discovers companies from IIngestionDiscoveryProjectionReader
  → creates CrawlTarget records for new companies via CreateCrawlTargetUseCase
  → derives initial priority from derivePriority(watcherCount)

CrawlDispatchWorker (every 15 min, serial)
  → queries ICrawlTargetRepository.findDue(now, limit=100)
    • state IN [IDLE, BACKOFF] AND nextCrawlAt <= now
    • ordered by priorityOrder ASC, nextCrawlAt ASC
  → enqueues one crawl-execution job per result
    • stable jobId: crawl-{crawlTargetId} (BullMQ deduplication)
    • attempts=3, exponential backoff from 2 s

BullMQ crawl-execution queue
  → concurrency 3
  → delivers CrawlExecutionJobPayload (identity fields only; no content)

CrawlCompanyWorker (per job)
  1. MarkCrawlTargetRunningUseCase
       → findById → markRunning() → OCC update
       → OCC conflict: another worker claimed first → return (job completed, no retry)
       → InvalidCrawlTargetTransitionError: target not claimable → return
  2. IJobProviderRegistry.getAdapter(source)
       → null: no adapter registered → markCrawlFailed, return
  3. Paginated fetch loop
       → adapter.fetchJobs({ providerHandle, cursor, since })
       → ingestListing() for each result (isolation: one listing failure skips that listing)
       → repeat-cursor detection via seenCursors Set → ProviderParseError on violation
  4. MarkCrawlTargetSucceededUseCase
       → findById → recordSuccess(at) → OCC update
       → advances lastSuccessAt (incremental sync watermark)
       → computes nextCrawlAt = at + intervalMs
       → resets consecutiveFailures to 0

  On ProviderError (isTransient=false — permanent):
       → markCrawlFailed → recordFailure → BACKOFF with computeBackoff()
       → return (no BullMQ retry)

  On ProviderError (isTransient=true) or unknown exception:
       → re-throw → BullMQ schedules retry
       → retry attempt fails claim check (target still RUNNING) → returns normally
       → StuckCrawlRecoveryWorker resets to IDLE after 30 min threshold
       (see §8 — Transient Provider Errors for the full recovery sequence)

ingestListing() per listing
  (canonical = primary cross-source record for a company+title pair;
   secondary = duplicate listing from another source pointing to it — see §7)
  → UpdateJobPostingContentUseCase (update existing listing)
  → if NOT_FOUND:
      → IFindCanonicalJobQuery.execute(normalizedCompany, normalizedTitle)
      → canonical found (ACTIVE): CreateSecondaryJobPostingUseCase (no JOB_POSTED event)
      → canonical not found or EXPIRED: CreateCanonicalJobPostingUseCase (emits JOB_POSTED)

Persistence
  → MongoCrawlTargetRepository: OCC via { _id, version } filter
  → MongoJobPostingRepository:  OCC via aggregation pipeline with $cond content write

StuckCrawlRecoveryWorker (every 15 min, serial)
  → findStuck(stuckAfter = now - 30 min, limit=50)
  → resetStuck() → RUNNING → IDLE (no consecutiveFailures increment)
  → OCC update (conflict on OCC: silently skip — another process already handled it)
```

---

## 4. Scheduling Architecture

### CrawlTarget

`CrawlTarget` is the scheduling aggregate. It owns the `CrawlSchedule` value object and is the single authority for crawl state, backoff, and failure counting. All scheduling mutations return `Result<void, Error>` and enforce valid state transitions.

**State machine:**

```
              ┌──────────────────────────────────────────────────────────────┐
              │                                                              ↓
  [create] → IDLE ──markRunning()──► RUNNING ──recordSuccess()──────────► IDLE
              ↑                         │
              │                         ├──recordFailure() (< 10 failures)─► BACKOFF
              │                         │
              │                         ├──recordFailure() (≥ 10 failures)─► PAUSED
              │                         │
              │                         └──markInvalid()────────────────────► INVALID (terminal)
              │
              BACKOFF ──markRunning()──► RUNNING
              PAUSED  ──resume()───────► IDLE
              IDLE, RUNNING, or BACKOFF ──pause()──► PAUSED (explicit admin pause)
```

`resetStuck()` transitions `RUNNING → IDLE` without incrementing `consecutiveFailures`. It is called exclusively by `ResetStuckCrawlTargetUseCase`.

### CrawlSchedule

`CrawlSchedule` is an immutable value object. Every mutation returns a new instance. It carries three fields:

| Field | Description |
|---|---|
| `priority` | `CrawlPriority` enum value |
| `intervalMs` | Crawl frequency in milliseconds |
| `nextCrawlAt` | Absolute timestamp of the next scheduled crawl |

`CrawlSchedule` is never shared between aggregates and is never persisted independently — it is embedded in `CrawlTarget`.

### Priority and Default Intervals

Priority drives the default crawl interval. Priority is derived from `watcherCount` by `derivePriority()`:

| Priority | watcherCount | Default interval |
|---|---|---|
| `CRITICAL` | ≥ 100 | 1 hour |
| `HIGH` | ≥ 50 | 6 hours |
| `MEDIUM` | ≥ 10 | 12 hours |
| `LOW` | ≥ 2 | 24 hours |
| `MINIMAL` | < 2 | 72 hours |

### Custom Intervals

A `CrawlTarget` may be given a custom interval at creation (`CreateCrawlTargetCommand.intervalMs`) or updated post-creation (`CrawlTarget.updateIntervalMs()`). `CrawlSchedule.withPriority()` preserves a custom interval when priority changes: if `intervalMs !== INTERVAL_MS[currentPriority]` (i.e., the target has a non-default frequency), the interval is carried through. If the target uses the priority default, the new priority's default is adopted.

### nextCrawlAt

`nextCrawlAt` is advanced by `recordSuccess()`:

```
nextCrawlAt = successAt + intervalMs
```

On failure routing to `BACKOFF` (fewer than 10 consecutive failures), `nextCrawlAt` is advanced by `computeBackoff(consecutiveFailures)`:

```
backoffMs = min(BASE_BACKOFF_MS × 2^(consecutiveFailures − 1), MAX_BACKOFF_MS)
BASE_BACKOFF_MS = 5 minutes
MAX_BACKOFF_MS  = 8 hours
```

On auto-pause (`PAUSED`, when `consecutiveFailures` reaches `MAX_CONSECUTIVE_FAILURES = 10`), `nextCrawlAt` is advanced by `intervalMs` instead of `computeBackoff()`.

`nextCrawlAt` is only updated after a successful OCC write. A failed `markCrawlSucceeded` persistence write leaves `nextCrawlAt` unchanged; the target is recovered by `StuckCrawlRecoveryWorker` and re-crawled from the previous watermark.

### Due Selection

`ICrawlTargetRepository.findDue(now, limit)` returns targets where:

```
state IN [IDLE, BACKOFF]
AND nextCrawlAt <= now
ORDER BY priorityOrder ASC, nextCrawlAt ASC
LIMIT limit
```

`priorityOrder` is a numeric field persisted alongside the enum value to enable index-backed priority sorting. `CrawlDispatchWorker` uses a fixed limit of 100 targets per sweep.

### Dispatch

`CrawlDispatchWorker` (serial, concurrency 1) performs a sweep every 15 minutes. For each due target it enqueues one BullMQ job in the `crawl-execution` queue with a stable `jobId: crawl-{crawlTargetId}`. The stable jobId ensures that a slow dispatch sweep or a delayed execution job never results in double-queueing the same target.

---

## 5. Provider Framework

The provider framework is a contained sub-package within the ingestion module. Nothing outside this package imports provider-specific types. For the step-by-step procedure to add a new provider, see [Adding a New Provider](#adding-a-new-provider) at the end of this section.

### Provider Interfaces

**`IJobProvider`** is the primary contract for all provider implementations:

```
IJobProvider
  providerId: string
  metadata():     ProviderMetadata       — identity, display name, rate-limit characteristics
  capabilities(): ProviderCapabilities   — feature flags (pagination, incremental sync, health check)
  fetchJobs(request: ProviderRequest): Promise<ProviderResponse>
  fetchJob(providerHandle, externalJobId): Promise<ProviderJob | null>
  healthCheck(): Promise<ProviderHealthStatus>
```

**`ProviderRequest`** carries all parameters for one fetch operation:

```
providerHandle: string       — company-specific identifier (e.g. "stripe-greenhouse")
cursor?:        string|null  — opaque pagination cursor
since?:         Date|null    — watermark for incremental sync
limit?:         number|null  — page size hint
```

**`ProviderResponse`** wraps one page of results:

```
jobs:        readonly ProviderJob[]
nextCursor:  string | null
hasMore:     boolean
fetchedAt:   Date
```

**`ProviderJob`** is the internal provider type. It never crosses into the application layer. `ProviderRegistryAdapter.toRawListing()` is the only place where `ProviderJob` is mapped to `RawJobListing`.

### ProviderMetadata and ProviderCapabilities

Each provider declares its metadata and capabilities via `metadata()` and `capabilities()`. The `ProviderCapabilities` interface includes:

| Field | Description |
|---|---|
| `supportsHealthCheck` | Provider exposes a dedicated health endpoint |
| `supportsFetchSingleJob` | Provider supports single-job lookup |
| `supportsPagination` | Provider supports cursor-based pagination |
| `supportsIncrementalSync` | Provider supports `since` watermark filtering |
| `supportedAuthMethods` | `AuthMethod[]` — `API_KEY`, `OAUTH2`, `BASIC`, or `NONE` |

`ProviderMetadata` includes `rateLimitCharacteristics` with `requestsPerMinute`, `requestsPerHour`, and `burstAllowed` fields. These fields are currently populated with `null` (unknown) for all supported providers except `burstAllowed`, which is `true` by inference.

### BaseProvider

`BaseProvider` is the abstract base class for all provider implementations. It provides a default `healthCheck()` implementation that probes `fetchJobs()` with `limit: 1`. Providers with dedicated health endpoints override this method.

### JobProviderFactory

`JobProviderFactory` accepts a map of creator functions and memoizes instances. Each creator is invoked at most once per `providerId`. This ensures singleton provider instances across the application lifecycle without a service locator.

```
const factory = new JobProviderFactory(new Map([
  ['greenhouse', () => new GreenhouseProvider(config)],
  ['lever',      () => new LeverProvider(config)],
]));
```

### ProviderRegistry

`ProviderRegistry` stores registered `IJobProvider` instances and enforces a freeze-after-bootstrap policy. After `freeze()` is called, no further `register()` calls are accepted. `DuplicateProviderError` is thrown on duplicate registration, ensuring misconfigured DI containers fail fast at startup.

### ProviderRegistryAdapter

`ProviderRegistryAdapter` is the sole boundary between the provider framework and the application layer. It implements `IJobProviderRegistry` (the application port) by adapting `IProviderRegistry` (the framework interface).

Responsibilities:
- Source identifier normalisation: `source.toLowerCase()` → `providerId` (e.g. `"GREENHOUSE"` → `"greenhouse"`)
- `ProviderJob → RawJobListing` field mapping via the module-private `toRawListing()` function
- Inline `IJobProviderAdapter` construction per `getAdapter()` call

`CrawlCompanyWorker` depends only on `IJobProviderRegistry`. It is unaware of `ProviderRegistryAdapter`, `IProviderRegistry`, or any provider-specific type.

### HTTP Transport

The provider framework owns a complete HTTP transport stack under `providers/http/`:

| Component | Responsibility |
|---|---|
| `IHttpClient` | Interface for HTTP operations (get, post, head, send) |
| `RetryPolicy` | Exponential backoff retry for transient HTTP errors |
| `TimeoutPolicy` | Per-request timeout enforcement |
| `CircuitBreaker` | Failure-rate circuit breaker |
| `ExponentialBackoff` | Backoff computation for the retry policy |
| `RequestIdMiddleware` | Injects a unique request ID header on each outbound request |
| `UserAgentMiddleware` | Injects the application User-Agent header |
| `HttpMetrics` | Records per-provider request counts and latencies |
| `HttpLogger` | Structured logging for requests and responses |
| `FakeHttpClient` | Test double for all unit and integration tests |

No component outside the `providers/` package may import `IHttpClient` or any HTTP transport type. All tests use `FakeHttpClient`; no real HTTP requests are made in tests.

### ProviderError Hierarchy

All provider errors extend `ProviderError`, which carries `providerId` and the `isTransient` discriminator.

| Error class | `isTransient` | Meaning |
|---|---|---|
| `ProviderAuthenticationError` | `false` | Credentials invalid or absent |
| `ProviderParseError` | `false` | Response could not be parsed; includes repeated-cursor detection |
| `ProviderRetryExhaustedError` | `false` | HTTP transport exhausted all retry attempts |
| `ProviderRateLimitError` | `true` | Rate limit response received; carries `retryAfterMs` (currently not consumed by the scheduler) |
| `ProviderUnavailableError` | `true` | Provider temporarily unreachable |

`isTransient` determines retry eligibility in `CrawlCompanyWorker`: permanent errors (`isTransient=false`) call `markCrawlFailed` immediately and do not re-throw. Transient errors re-throw to BullMQ.

### Adding a New Provider

1. Create a class extending `BaseProvider`. Implement `fetchJobs()`, `fetchJob()`, `metadata()`, and `capabilities()`. Throw the appropriate `ProviderError` subclass on failure.
2. Add the new source identifier to the `JobSource` union type alias and to the `JOB_SOURCES` `ReadonlySet` in `domain/enums`.
3. Register the provider in the DI container: add a creator to the `JobProviderFactory` map and call `registry.register(factory.create('newprovider'))` before `registry.freeze()`.

No other file requires modification.

---

## 6. Crawl Execution

### CrawlCompanyWorker

`CrawlCompanyWorker` processes one crawl-execution job at a time (three concurrent workers). It is injected with use cases and application ports only; no repository or provider type is imported directly.

**Claim-before-crawl**: the first operation in every job is `MarkCrawlTargetRunningUseCase`, which loads the target, calls `markRunning()`, and persists the state change with OCC. No provider call is made before a successful claim write. An OCC conflict at claim time means another worker (from a parallel dispatch or a BullMQ retry) already claimed the target; the job completes normally without executing a crawl.

### Pagination

`CrawlCompanyWorker` drives a `do/while` loop over `adapter.fetchJobs()`. Each page is fully ingested before the next request is made. This ensures that the system is always catching up from the last successfully ingested page if a transient error interrupts a multi-page crawl.

Cursor integrity is enforced by a `seenCursors` Set. If a provider returns a cursor it has already returned in the same crawl session, `ProviderParseError` is thrown (permanent), which terminates the crawl.

### Incremental Sync

`CrawlTarget.lastSuccessAt` is the incremental sync watermark. It is passed to the provider as `ProviderRequest.since`. Providers that declare `supportsIncrementalSync: true` use this value to filter results to listings that have changed since the last successful crawl.

`lastSuccessAt` is updated exclusively by `recordSuccess()` inside `MarkCrawlTargetSucceededUseCase`, which advances it to the crawl's start timestamp only after a successful OCC write.

### ProviderError Routing

```
catch (err)
  isPermanent = err instanceof ProviderError && !err.isTransient

  if (isPermanent):
    markCrawlFailedUC.execute() → recordFailure() → BACKOFF / PAUSED
    return (no BullMQ retry)

  else (transient or unknown):
    throw err → BullMQ schedules retry
    (retry attempt will fail the claim check; see §8 for recovery)
```

Permanent errors advance `consecutiveFailures` via `recordFailure()`. After 10 consecutive failures the target is auto-paused (`PAUSED` state) and `CRAWL_TARGET_PAUSED` is emitted.

### Execution Summary

After each crawl (success or failure), `CrawlCompanyWorker` constructs and logs a `CrawlExecutionSummary` containing:

- `pagesProcessed`, `jobsDiscovered`, `jobsCreated`, `jobsUpdated`, `jobsSkipped`
- `durationMs`, `startedAt`, `finishedAt`
- `providerStats`: provider name, handle, whether the crawl was incremental, whether pagination was used, total request count
- `errorSummary` (on failure): error type, transience classification, attempt number

### ingestListing

Each listing is processed in isolation. A failure on one listing logs a warning and returns `'skipped'` without propagating the error. The paginated fetch loop continues.

Processing order per listing:
1. `UpdateJobPostingContentUseCase` — attempt to update an existing posting
2. If `NOT_FOUND`: `IFindCanonicalJobQuery.execute(normalizedCompany, normalizedTitle)`
   - Canonical `ACTIVE` found → `CreateSecondaryJobPostingUseCase` (no `JOB_POSTED` event)
   - `null` returned (no ACTIVE canonical, or canonical is EXPIRED) → `CreateCanonicalJobPostingUseCase` (emits `JOB_POSTED`)
3. If `CompanyName` or `JobTitle` normalisation fails → skip deduplication and proceed directly to `CreateCanonicalJobPostingUseCase`

---

## 7. Persistence

### Collections

| Collection | Aggregate | Primary key |
|---|---|---|
| `crawl_targets` | `CrawlTarget` | `_id` (string UUID) |
| `job_postings` | `JobPosting` | `_id` (string UUID) |

### Optimistic Concurrency Control

Every mutable document carries a `version` field (integer, starts at 0). All update operations include `version` in the filter predicate and increment it atomically:

**CrawlTarget**:
```
findOneAndUpdate(
  { _id: id, version: target.version },
  { $set: { ...fields }, $inc: { version: 1 } }
)
→ null result → IngestionConcurrentModificationError
```

**JobPosting**:
```
updateOne(
  { _id: id, version: posting.version },
  [aggregation pipeline with $inc version and $cond content write]
)
→ matchedCount === 0 → IngestionConcurrentModificationError
```

OCC conflicts are surfaced as `Result.fail(IngestionConcurrentModificationError)`. No caller retries on OCC conflict; each failure path has documented handling.

### Canonical Job Creation and Idempotency

Creating a canonical `JobPosting` is idempotent at two layers:

1. **Application pre-check**: `CreateCanonicalJobPostingUseCase` calls `findByExternalJobId(externalJobId)` before any write. If a record already exists, it is returned without a write.
2. **Database enforcement**: `job_postings` carries a unique index on `compositeKey` (a compound of `source` and `externalId`). A concurrent insert that passes the pre-check will produce an E11000 duplicate key error, which is caught and mapped to `ConflictError`.

`$setOnInsert` protects immutable fields (`firstSeenAt`, `createdAt`) from being overwritten on upsert.

### Secondary Job Creation

Secondary postings (cross-source duplicates) are created by `CreateSecondaryJobPostingUseCase`. The same two-layer idempotency applies. `JobPosting.createAsSecondary()` never adds domain events; `IEventBus` is not injected into `CreateSecondaryJobPostingUseCase`. No `JOB_POSTED` event is emitted for secondary postings.

### Conditional Content Write

`MongoJobPostingRepository.update()` uses a MongoDB aggregation pipeline update to avoid rewriting large content fields when the content is unchanged:

```
$set: {
  jobDescription: {
    $cond: [
      { $eq: ['$contentHash', incomingHash] },
      '$jobDescription',   // keep existing — content unchanged
      incomingDescription  // replace — content changed
    ]
  }
}
```

This prevents writing 50–70 KB of description text per listing on unchanged crawls, reducing write amplification in steady state.

### Immutable Fields

`firstSeenAt` and `createdAt` are set by `$setOnInsert` and are never updated after initial persistence. `lastSuccessAt` on `CrawlTarget` is updated only by `recordSuccess()`.

### Cross-Source Deduplication

`IFindCanonicalJobQuery.execute(normalizedCompanyName, normalizedTitle)` returns the canonical `ACTIVE` posting for a company-title pair, or `null`. EXPIRED and ARCHIVED canonicals return `null`, triggering canonical resurrection: a new canonical is created and `JOB_POSTED` is re-emitted. This is intentional — attaching a secondary to an expired canonical would suppress `JOB_POSTED` for what is effectively a re-posted role.

Implementations must filter `{ canonicalJobId: null, state: 'ACTIVE' }` exactly. Widening either filter changes observable product behavior.

### Repository Ownership

Workers access repositories exclusively through use cases and application query ports:

| Access path | Who uses it |
|---|---|
| `ICrawlTargetRepository` | Use cases (`MarkCrawlTargetRunning*`, `MarkCrawlTargetSucceeded*`, `MarkCrawlTargetFailed*`, `ScheduleCrawlTarget*`, `ResetStuckCrawlTarget*`) |
| `IJobPostingRepository` | Use cases (`CreateCanonical*`, `CreateSecondary*`, `UpdateJobPostingContent*`, `Expire*`, `Archive*`) |
| `IFindCanonicalJobQuery` | `CrawlCompanyWorker` (read-only cross-source deduplication check) |

`CrawlCompanyWorker` does not import any repository interface.

---

## 8. Failure Recovery

### Recovery Model

The system uses two complementary recovery mechanisms with distinct responsibilities:

| Mechanism | Handles |
|---|---|
| BullMQ retry (`attempts=3`, exp. backoff from 2 s) | Infrastructure crashes before a claim is persisted |
| `StuckCrawlRecoveryWorker` (15 min cadence, 30 min threshold) | All in-progress recovery: post-claim crashes, transient provider errors, `markCrawlSucceeded` write failures |

### BullMQ Retry

Crawl-execution jobs are enqueued with `attempts: 3, backoff: { type: 'exponential', delay: 2_000 }`. BullMQ retries a job when `process()` throws. A retry is effective when the worker process is killed after the job is dequeued but before the claim write reaches MongoDB: the target remains `IDLE` or `BACKOFF` in the database, so the retry attempt can claim it fresh.

When a crash occurs after a successful claim write (target is `RUNNING` in the database), a BullMQ retry attempt calls `MarkCrawlTargetRunningUseCase`, which calls `markRunning()` on a `RUNNING` target. `markRunning()` rejects the `RUNNING → RUNNING` transition with `InvalidCrawlTargetTransitionError`. The worker logs a warning and returns normally. BullMQ marks the job `COMPLETED`. Recovery falls to `StuckCrawlRecoveryWorker`.

### Transient Provider Errors

When a transient `ProviderError` is thrown:

1. The catch block re-throws the error.
2. BullMQ schedules a retry.
3. The retry attempt fails the claim check (target is still `RUNNING`) and returns normally.
4. BullMQ marks the retry `COMPLETED`.
5. The target remains `RUNNING`.
6. `StuckCrawlRecoveryWorker` resets the target to `IDLE` at the next sweep after the 30-minute threshold.
7. `CrawlDispatchWorker` re-enqueues the target on the next 15-minute dispatch sweep.

The effective recovery time for a transient provider failure is 30–60 minutes from the original crawl start (30-minute stuck threshold + up to 15-minute recovery sweep + up to 15-minute dispatch sweep).

### StuckCrawlRecoveryWorker

`StuckCrawlRecoveryWorker` runs every 15 minutes as a serial sweep (concurrency 1). It calls `ResetStuckCrawlTargetUseCase`, which:

1. Calls `ICrawlTargetRepository.findStuck(stuckAfter = now − 30min, limit=50)` to find `RUNNING` targets older than the threshold.
2. For each target: calls `target.resetStuck()` (`RUNNING → IDLE`) and persists with OCC.
3. OCC conflicts are silently skipped with `continue` — another process already handled the target.

`resetStuck()` does not increment `consecutiveFailures`. Targets reset by the recovery worker are treated as if no failure occurred at the scheduling level. They are immediately eligible for re-dispatch on the next `findDue()` sweep.

### Permanent ProviderError Recovery

Permanent errors (`isTransient=false`) call `MarkCrawlTargetFailedUseCase`, which calls `recordFailure()`:

- `consecutiveFailures` is incremented.
- State transitions to `BACKOFF` with `nextCrawlAt = now + computeBackoff(consecutiveFailures)`.
- After 10 consecutive failures: state transitions to `PAUSED` and `CRAWL_TARGET_PAUSED` is emitted.

`PAUSED` targets are not selected by `findDue()`. Resume requires an explicit call to `CrawlTarget.resume()` through the admin use case layer.

### markCrawlSucceeded Failure Window

If `MarkCrawlTargetSucceededUseCase` fails its persistence write after all listings have been successfully ingested, the target remains `RUNNING` despite a completed crawl. `StuckCrawlRecoveryWorker` resets it to `IDLE` after the 30-minute threshold. Because `nextCrawlAt` was not advanced, the target is immediately due again and produces one additional full-catalogue crawl on recovery. All re-crawled listings are handled idempotently; no data corruption occurs. The incremental sync watermark (`lastSuccessAt`) is not advanced until the next successful crawl completion.

### OCC Conflict Handling Summary

| Location | OCC conflict response |
|---|---|
| `MarkCrawlTargetRunningUseCase` | `CrawlCompanyWorker` returns normally (job completed, no retry) |
| `MarkCrawlTargetSucceededUseCase` | `CrawlCompanyWorker` logs error; target stays `RUNNING` |
| `MarkCrawlTargetFailedUseCase` | `CrawlCompanyWorker` logs error; target stays `RUNNING` |
| `ResetStuckCrawlTargetUseCase` | `continue` (skip this target; another process handled it) |
| `UpdateJobPostingContentUseCase` | Listing skipped with `'skipped'` outcome |
| `CreateCanonicalJobPostingUseCase` | E11000 → `ConflictError` → handled by pre-check idempotency layer |

---

## 9. Extension Points

### Adding a Provider

The provider framework is the only system that requires changes. No application, worker, or scheduling component is modified.

1. Create `providers/greenhouse/GreenhouseProvider.ts` (or equivalent) extending `BaseProvider`.
2. Implement `fetchJobs()`, `fetchJob()`, `metadata()`, and `capabilities()`. Use `IHttpClient` for all HTTP operations. Throw the appropriate `ProviderError` subclass on failure.
3. Add `'NEWPROVIDER'` to the `JobSource` union type alias and to the `JOB_SOURCES` `ReadonlySet` in `domain/enums`.
4. In the DI container (`container/index.ts`): add a creator to the `JobProviderFactory` map. Call `registry.register(factory.create('newprovider'))`. The `ProviderRegistryAdapter` resolves it automatically — `source.toLowerCase()` equals `providerId`.

### Changing Scheduling Policy

- **Priority-driven frequency**: modify `derivePriority(watcherCount)` in `application/derivePriority.ts`.
- **Per-target custom frequency**: set `intervalMs` on `CreateCrawlTargetCommand`, or call `CrawlTarget.updateIntervalMs()` after creation.
- **Priority-independent scheduling** (time windows, maintenance blocks): introduce a new application port and inject it into `ScheduleCrawlTargetUseCase` or `CrawlDispatchWorker`. No domain or provider changes are required.

### Adding an Ingestion Strategy

Providers that fit the existing `IJobProvider` / `ProviderRequest` / `ProviderResponse` contract (paginated REST, GraphQL, bulk import) require only a new `BaseProvider` implementation.

Strategies with fundamentally different delivery models (webhook push, event stream) require a new worker and a new application port. The domain layer, use cases, and repository interfaces are unaffected.

### Adjusting Execution Policies

- **Concurrency**: `CRAWL_CONCURRENCY` in `CrawlCompanyWorker` is a module constant. Per-provider concurrency requires either separate queues per provider or in-worker rate limiting.
- **BullMQ retry parameters** (`attempts`, `backoff`): set in `CrawlDispatchWorker` when enqueuing execution jobs.
- **Dispatch batch size**: `DISPATCH_BATCH_SIZE` in `CrawlDispatchWorker`.
- **Recovery threshold and batch size**: `STUCK_THRESHOLD_MS` and `RECOVERY_BATCH_SIZE` in `StuckCrawlRecoveryWorker`.
- **Worker cadences**: constants in `startIngestionWorkers.ts` (`PLANNING_INTERVAL_MS`, `DISPATCH_INTERVAL_MS`, etc.).

---

## 10. Repository Structure

```
backend/src/modules/ingestion/
│
├── domain/                         Pure domain — no framework imports
│   ├── aggregates/
│   │   ├── CrawlTarget.ts          Scheduling aggregate; state machine owner
│   │   ├── JobPosting.ts           Canonical/secondary job posting aggregate
│   │   └── SourceMapping.ts        Company-to-provider mapping aggregate
│   ├── value-objects/
│   │   ├── CrawlSchedule.ts        Immutable frequency + next-due VO
│   │   ├── CompanyName.ts          Normalized company name VO
│   │   ├── JobTitle.ts             Normalized job title VO
│   │   ├── ExternalJobId.ts        (source, externalId) composite VO
│   │   ├── ContentHash.ts          SHA-256 content hash VO
│   │   └── ...                     Other value objects
│   ├── entities/
│   │   ├── JobLocation.ts          Location entity
│   │   └── CompensationRange.ts    Compensation entity
│   ├── repositories/
│   │   ├── ICrawlTargetRepository.ts   OCC contract + claim-before-crawl docs
│   │   ├── IJobPostingRepository.ts    OCC contract + matching projection docs
│   │   └── ISourceMappingRepository.ts
│   ├── events/                     Domain event factory functions
│   ├── errors/                     IngestionValidationError, transition errors
│   └── enums/                      JOB_SOURCES, CRAWL_PRIORITIES, states
│
├── application/                    Orchestration — depends on domain interfaces
│   ├── use-cases/
│   │   ├── CreateCrawlTargetUseCase.ts
│   │   ├── ScheduleCrawlTargetUseCase.ts
│   │   ├── MarkCrawlTargetRunningUseCase.ts
│   │   ├── MarkCrawlTargetSucceededUseCase.ts
│   │   ├── MarkCrawlTargetFailedUseCase.ts
│   │   ├── ResetStuckCrawlTargetUseCase.ts
│   │   ├── CreateCanonicalJobPostingUseCase.ts
│   │   ├── CreateSecondaryJobPostingUseCase.ts
│   │   ├── UpdateJobPostingContentUseCase.ts
│   │   ├── ExpireJobPostingUseCase.ts
│   │   ├── ArchiveJobPostingUseCase.ts
│   │   └── Find*UseCase.ts         Read-model queries (by company, role, skill)
│   ├── ports/
│   │   ├── IJobProviderRegistry.ts     Application port (narrow — getAdapter only)
│   │   ├── IJobProviderAdapter.ts      RawJobListing + RawJobPage + adapter contract
│   │   ├── IFindCanonicalJobQuery.ts   Cross-source dedup read port
│   │   └── IIngestionDiscoveryProjectionReader.ts
│   ├── dtos/
│   │   └── IngestionDtos.ts        Commands, result DTOs, toCrawlTargetDto mapper
│   └── derivePriority.ts           watcherCount → CrawlPriority pure function
│
├── infrastructure/                 Framework — MongoDB, Redis, concrete impls
│   ├── repositories/
│   │   ├── MongoCrawlTargetRepository.ts   OCC via { _id, version } filter
│   │   └── MongoJobPostingRepository.ts    OCC + $cond aggregation pipeline
│   ├── models/
│   │   ├── CrawlTargetModel.ts     Mongoose model + mapper
│   │   ├── JobPostingModel.ts      Mongoose model + mapper + index definitions
│   │   └── SourceMappingModel.ts
│   ├── queries/
│   │   └── MongoFindCanonicalJobQuery.ts   IFindCanonicalJobQuery implementation
│   └── readers/
│       └── StubDiscoveryProjectionReader.ts    Test/dev stub
│
├── providers/                      Provider framework — self-contained
│   ├── contracts/
│   │   ├── IJobProvider.ts         Primary provider contract
│   │   ├── IProviderRegistry.ts    Framework registry (register, resolve, freeze)
│   │   ├── IJobProviderFactory.ts  Factory contract
│   │   ├── ProviderMetadata.ts     Identity + rate-limit characteristics
│   │   └── ProviderCapabilities.ts Feature flags
│   ├── types/
│   │   ├── ProviderJob.ts          Internal provider job type (never leaves package)
│   │   ├── ProviderRequest.ts      fetchJobs() input
│   │   └── ProviderResponse.ts     fetchJobs() output
│   ├── errors/
│   │   ├── ProviderError.ts        Abstract base (providerId + isTransient)
│   │   ├── ProviderAuthenticationError.ts   isTransient=false
│   │   ├── ProviderParseError.ts            isTransient=false
│   │   ├── ProviderRetryExhaustedError.ts   isTransient=false
│   │   ├── ProviderRateLimitError.ts        isTransient=true
│   │   └── ProviderUnavailableError.ts      isTransient=true
│   ├── base/
│   │   └── BaseProvider.ts         Abstract base; default healthCheck() via fetchJobs
│   ├── factory/
│   │   └── JobProviderFactory.ts   Memoized creator-function factory
│   ├── registry/
│   │   └── ProviderRegistry.ts     Register + freeze lifecycle
│   ├── adapter/
│   │   └── ProviderRegistryAdapter.ts  Framework → application boundary
│   ├── http/                       HTTP transport stack (IHttpClient implementations)
│   │   ├── contracts/              IHttpClient, IHttpRequest, IHttpResponse, IHttpMiddleware
│   │   ├── errors/                 HttpTransportError, HttpTimeoutError, HttpConnectionError, etc.
│   │   ├── retry/                  RetryPolicy, ExponentialBackoff
│   │   ├── timeout/                TimeoutPolicy
│   │   ├── circuit-breaker/        CircuitBreaker
│   │   ├── middleware/             RequestIdMiddleware, UserAgentMiddleware
│   │   ├── logging/                HttpLogger
│   │   ├── metrics/                HttpMetrics
│   │   └── testing/                FakeHttpClient (test double)
│   └── [greenhouse|lever|smartrecruiters|ashby|workday]/
│       └── *Provider.ts            Concrete provider implementations
│
├── workers/                        BullMQ worker layer
│   ├── startIngestionWorkers.ts    Bootstrap + queue registration
│   ├── CrawlDispatchWorker.ts      15-min dispatch sweep
│   ├── CrawlCompanyWorker.ts       Execution worker (concurrency 3)
│   ├── StuckCrawlRecoveryWorker.ts 15-min recovery sweep
│   ├── SchedulePlanningWorker.ts   6-h planning sweep
│   ├── ExpireJobsWorker.ts         1-h ACTIVE → EXPIRED sweep
│   ├── ArchiveJobsWorker.ts        24-h EXPIRED → ARCHIVED sweep
│   ├── payloads.ts                 BullMQ job payload type definitions
│   └── queues.ts                   QUEUE_NAMES constants
│
└── api/                            HTTP API layer (job search)
    ├── JobSearchController.ts
    ├── ingestion.router.ts
    ├── dtos/                       Request/response DTOs
    └── schemas/                    Validation schemas
```

---

## 11. Architectural Invariants

The following invariants must never be violated. They are grouped by enforcement level:

- **Implementation** — guaranteed by the type system, private field access, database constraints, or queue deduplication; violations require actively circumventing a mechanism
- **Convention** — required for architectural integrity; enforced by developer discipline and code review
- **Policy** — non-negotiable operational constraints

### Implementation-Enforced

**CrawlSchedule immutability**

6. `CrawlSchedule` is immutable. All mutations return new instances via its private constructor. No caller can produce a mutated schedule in place.

**Watermark write path**

9. `CrawlTarget.lastSuccessAt` advances only inside `recordSuccess()`, which is called only after `MarkCrawlTargetSucceededUseCase` completes a successful OCC write.

**OCC on both collections**

11. Every `CrawlTarget` state transition that is persisted uses `ICrawlTargetRepository.update()` with the version filter.
12. Every `JobPosting` content update uses `IJobPostingRepository.update()` with the version filter and the `$cond` pipeline.

**Event emission**

16. `JOB_POSTED` is emitted from `CreateCanonicalJobPostingUseCase` (the primary emission path). `JobPosting.markActive()` also emits `JOB_POSTED` for canonical records on EXPIRED→ACTIVE resurrection; no application-layer caller for `markActive()` currently exists.
17. `CreateSecondaryJobPostingUseCase` never injects `IEventBus` and never emits domain events. `JobPosting.createAsSecondary()` is guaranteed to produce no domain events.
18. `CRAWL_TARGET_PAUSED` is emitted only from `MarkCrawlTargetFailedUseCase` (via `pullDomainEvents()`) when `recordFailure()` transitions to `PAUSED`.

**Dispatch idempotency**

20. Dispatch is idempotent: the stable `jobId: crawl-{crawlTargetId}` prevents double-queuing the same target. BullMQ enforces uniqueness by rejecting duplicate job IDs.

### Convention-Enforced

These rules are not enforced by the type system alone. They must be respected in all future development.

**Provider isolation**

1. Provider implementations (`IJobProvider` and all concrete subclasses) never import domain aggregates, repository interfaces, or application use cases.
2. `ProviderJob` never appears in a function signature, class field, or return type outside the `providers/` package. The only permitted crossing is inside `ProviderRegistryAdapter.toRawListing()`.
3. `IHttpClient` and all HTTP transport types are never imported outside `providers/`.
4. All tests use `FakeHttpClient`. No real HTTP requests are made in any test.

**Scheduling isolation**

5. Scheduling logic (interval computation, backoff computation, `nextCrawlAt` advancement) lives exclusively in `CrawlSchedule` and `CrawlTarget`. No scheduling logic exists in workers, use cases, or providers.

**Claim-before-crawl**

7. `CrawlCompanyWorker` never calls a provider adapter before `MarkCrawlTargetRunningUseCase` returns a successful result.
8. Workers never call `ICrawlTargetRepository.save()` to update state. State updates use `ICrawlTargetRepository.update()` with the OCC version filter.

**Watermark source**

10. `ProviderRequest.since` is always derived from `lastSuccessAt`. No other value is used as the incremental sync watermark.

**OCC conflict handling**

13. OCC conflicts are never silently swallowed except in `ResetStuckCrawlTargetUseCase` (where `continue` is the documented and correct handling).

**Worker layer dependencies**

14. Workers import only use case classes and application ports. No repository interface or domain aggregate appears in worker import statements. Provider error types (`ProviderError`, `ProviderParseError`) cross into the worker layer for failure classification; no provider implementation, `IJobProvider`, `IHttpClient`, or `ProviderJob` may appear in worker imports.
15. `CrawlCompanyWorker` accesses `IFindCanonicalJobQuery` exclusively for the cross-source deduplication read. It never imports `IJobPostingRepository`.

**Idempotency pre-check**

19. `findByExternalJobId` is called before every canonical or secondary job posting creation. The two-layer idempotency guarantee (application pre-check + unique index) must be preserved.

### Security Policy

These constraints are non-negotiable. Violations may expose secrets, compromise observability, or introduce unauthorized external dependencies.

21. Authorization headers, cookies, API keys, tokens, and secrets must never appear in log output at any level.
22. `ProviderHandle` values (company-specific provider identifiers) must not be forwarded to external observability vendors without policy review; they may indirectly reveal company identity.
23. `fetch()`, `axios`, `node:http`, and `node:https` must never be used directly in any file. All HTTP is routed through `IHttpClient`.

---

## 12. Current Architecture Status

### Supported Providers

| Provider | `providerId` | `supportsIncrementalSync` |
|---|---|---|
| Greenhouse | `greenhouse` | `false` |
| Lever | `lever` | `false` |
| SmartRecruiters | `smartrecruiters` | `true` |
| Ashby | `ashby` | `false` |
| Workday | `workday` | `false` |

All providers: `requestsPerMinute: null`, `requestsPerHour: null`, `burstAllowed: true`, `supportedAuthMethods: ['NONE']`.

`JOB_SOURCES` defines 7 source identifiers (`GREENHOUSE`, `LEVER`, `WORKDAY`, `ICIMS`, `ASHBY`, `SMARTRECRUITERS`, `CAREER_PAGE`). `ICIMS` and `CAREER_PAGE` are declared in the domain enum but have no registered provider implementations. Adding a provider for either requires the standard three-step procedure in §5.

### BullMQ Queue Configuration

| Queue | Worker | Cadence | Concurrency | Job attempts |
|---|---|---|---|---|
| `crawl-planning` | `SchedulePlanningWorker` | 6 hours | 1 (serial) | 2 |
| `crawl-dispatch` | `CrawlDispatchWorker` | 15 minutes | 1 (serial) | 2 |
| `crawl-execution` | `CrawlCompanyWorker` | on demand | 3 | 3 |
| `crawl-recovery` | `StuckCrawlRecoveryWorker` | 15 minutes | 1 (serial) | 2 |
| `job-expire` | `ExpireJobsWorker` | 1 hour | 1 (serial) | 2 |
| `job-archive` | `ArchiveJobsWorker` | 24 hours | 1 (serial) | 2 |

Crawl-execution jobs use exponential backoff from 2 s. Repeat trigger jobs use exponential backoff from 5 s.

### Known Limitations

The following items do not affect production correctness but should be addressed before sustained feature development.

1. **`CrawlCompanyWorker` JSDoc Step 8** — documents that transient failures mark the target failed on the last BullMQ attempt. The actual implementation re-throws on all transient failures and relies on `StuckCrawlRecoveryWorker` for in-progress recovery. The `isLastAttempt` guard in the transient catch path is dead code under the current recovery model.

2. **`CrawlTarget.markInvalid()`** — the domain method exists with JSDoc indicating use for permanent provider errors. No application use case calls it. Permanent `ProviderError` routes through `recordFailure()` → BACKOFF/PAUSED. The `INVALID` state is unreachable from any current code path.

3. **`IJobProviderRegistry` stale comment** — contains a note referencing a completed migration task that is no longer relevant.

4. **`ProviderRateLimitError.retryAfterMs`** — captured by providers but not consumed by any component in the scheduling or dispatch path.

5. **`markCrawlSucceeded` failure window** — a persistence failure after successful ingestion leaves the target `RUNNING` with `lastSuccessAt` and `nextCrawlAt` unadvanced until `StuckCrawlRecoveryWorker` resets it (up to 60 minutes). One additional full-catalogue crawl is produced per occurrence. All re-crawled listings are handled idempotently.

6. **`SchedulePlanningWorker` priority updates** — the planning worker creates new `CrawlTarget` records and derives initial priority from `derivePriority(watcherCount)`. It does not update the priority of existing targets when `watcherCount` changes; a TODO exists in the implementation.
