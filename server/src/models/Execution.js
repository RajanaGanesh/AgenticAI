const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: {
      type: String,
      default: null,
    },
    completedNodes: {
      type: [String],
      default: [],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // in milliseconds
      default: 0,
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    nodeResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    triggerType: {
      type: String,
      default: 'manual',
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Execution', executionSchema);
