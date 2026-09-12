/**
 * Observability contracts — structured telemetry with tenant context and PII minimization.
 * Never log secrets.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  action?: string;
}

export interface StructuredLogger {
  log(level: LogLevel, message: string, context?: LogContext, data?: Record<string, unknown>): void;
}

const FORBIDDEN_LOG_KEYS = ["password", "token", "secret", "authorization", "apiKey", "cookie", "creditCard"];

function sanitizeData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (FORBIDDEN_LOG_KEYS.some((f) => k.toLowerCase().includes(f.toLowerCase()))) continue;
    out[k] = v;
  }
  return out;
}

/** In-memory structured logger — reference implementation for tests/dev. */
export class InMemoryStructuredLogger implements StructuredLogger {
  readonly entries: Array<{ level: LogLevel; message: string; context?: LogContext; data?: Record<string, unknown>; at: string }> = [];

  log(level: LogLevel, message: string, context?: LogContext, data?: Record<string, unknown>): void {
    this.entries.push({
      level,
      message,
      context,
      data: sanitizeData(data),
      at: new Date().toISOString(),
    });
  }

  error(message: string, context?: LogContext, data?: Record<string, unknown>): void {
    this.log("error", message, context, data);
  }
  warn(message: string, context?: LogContext, data?: Record<string, unknown>): void {
    this.log("warn", message, context, data);
  }
  info(message: string, context?: LogContext, data?: Record<string, unknown>): void {
    this.log("info", message, context, data);
  }
  debug(message: string, context?: LogContext, data?: Record<string, unknown>): void {
    this.log("debug", message, context, data);
  }
}
