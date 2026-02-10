import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  logger?: Logger;
  operationName?: string;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    exponentialBackoff = false,
    logger,
    operationName = 'operation',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (logger && attempt > 1) {
        logger.debug(
          `Retry attempt ${attempt}/${maxRetries} for ${operationName}`,
        );
      }

      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const currentDelay = exponentialBackoff
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs;

        if (logger) {
          logger.warn(
            `${operationName} failed (attempt ${attempt}/${maxRetries}): ${lastError.message}. Retrying in ${currentDelay}ms...`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  if (logger) {
    logger.error(
      `${operationName} failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  throw lastError!;
}
