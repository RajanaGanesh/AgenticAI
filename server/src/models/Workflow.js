const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: {
      label: { type: String, default: 'Workflow Node' },
      provider: { type: String, default: 'system' }, // gmail, slack, discord, google-sheets, ai, system
      action: { type: String, default: '' },
      config: { type: mongoose.Schema.Types.Mixed, default: {} },
      description: { type: String, default: '' },
      inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
      outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String, default: null },
    targetHandle: { type: String, default: null },
    animated: { type: Boolean, default: true },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    triggerConfig: {
      type: {
        type: String,
        enum: ['manual', 'webhook', 'schedule', 'gmail_event', 'slack_event'],
        default: 'manual',
      },
      schedule: { type: String, default: '' }, // cron string
      webhookSecret: { type: String, default: '' },
      eventFilter: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    promptSource: {
      type: String,
      default: '',
    },
    executionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workflow', workflowSchema);
