const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let bullQueue = null;
let bullWorker = null;
let isUsingBull = false;

const initQueue = () => {
  if (env.REDIS_URL) {
    try {
      const { Queue, Worker } = require('bullmq');
      const IORedis = require('ioredis');

      const connection = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 4000,
      });

      connection.on('connect', () => {
        console.log('[Queue] Redis connected. BullMQ background queue active.');
        isUsingBull = true;
      });

      connection.on('error', (err) => {
        console.warn(`[Queue] Redis connection error (${err.message}). Using in-memory execution fallback.`);
        isUsingBull = false;
      });

      bullQueue = new Queue('workflow-executions', { connection });
      bullWorker = new Worker(
        'workflow-executions',
        async (job) => {
          const { executionId } = job.data;
          return orchestrator.runExecution(executionId);
        },
        { connection }
      );
    } catch (err) {
      console.warn('[Queue] BullMQ init failed, falling back to in-memory executor:', err.message);
      isUsingBull = false;
    }
  } else {
    console.log('[Queue] No REDIS_URL provided. Using in-memory asynchronous execution queue.');
  }
};

const addExecutionJob = async (executionId, options = {}) => {
  if (isUsingBull && bullQueue) {
    try {
      return await bullQueue.add('run-execution', { executionId }, options);
    } catch (err) {
      console.warn('[Queue] BullMQ add failed, falling back to in-memory dispatch:', err.message);
    }
  }

  // In-memory asynchronous execution
  setImmediate(async () => {
    try {
      await orchestrator.runExecution(executionId);
    } catch (err) {
      console.error(`[Queue] In-memory execution error for ${executionId}:`, err.message);
    }
  });

  return { id: `inmem_${executionId}`, data: { executionId } };
};

module.exports = {
  initQueue,
  addExecutionJob,
};
