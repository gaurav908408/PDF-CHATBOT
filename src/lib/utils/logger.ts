type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const meta = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${meta}`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
    console.error(this.formatMessage("error", message, { ...context, error: errorDetails }));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();
