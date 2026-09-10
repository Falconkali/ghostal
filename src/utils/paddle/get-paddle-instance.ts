import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

let paddleInstance: Paddle | null = null;

export function getPaddleInstance(): Paddle {
  if (paddleInstance) return paddleInstance;

  if (!process.env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY environment variable is not set");
  }

  paddleInstance = new Paddle(process.env.PADDLE_API_KEY, {
    environment:
      (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ??
      Environment.production,
    logLevel: LogLevel.error,
  });

  return paddleInstance;
}
