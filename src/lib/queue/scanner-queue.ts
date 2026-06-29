import Bull from "bull";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const scannerQueue = new Bull("scanner", REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export type ScanJobData = {
  scanId: string;
  url: string;
};
