import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const initialNodes = [
  {
    id: 'trigger_1',
    type: 'agentflowNode',
    position: { x: 100, y: 180 },
    data: {
      label: 'Manual Trigger',
      provider: 'system',
      action: 'trigger',
      description: 'Manually starts execution on demand',
      config: { triggerType: 'manual' },
    },
  },
  {
    id: 'ai_1',
    type: 'agentflowNode',
    position: { x: 420, y: 180 },
    data: {
      label: 'AI Summarizer & Parser',
      provider: 'ai',
      action: 'ai_transform',
      description: 'Processes incoming payload with LLM',
      config: { model: 'gpt-4o-mini', promptTemplate: 'Summarize content and detect priority items.' },
    },
  },
  {
    id: 'slack_1',
    type: 'agentflowNode',
    position: { x: 740, y: 180 },
    data: {
      label: 'Slack Channel Dispatch',
      provider: 'slack',
      action: 'post_message',
      description: 'Posts output message to #ops-alerts',
      config: { channel: '#ops-alerts', message: 'Automation finished: {{ai.summary}}' },
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'trigger_1', target: 'ai_1', animated: true, label: 'Payload' },
  { id: 'e2-3', source: 'ai_1', target: 'slack_1', animated: true, label: 'Summary' },
];

export const useWorkflowStore = create((set, get) => ({
  id: null,
  name: 'New Operations Automation',
  description: '',
  status: 'draft',
  version: 1,
  tags: ['automation'],
  triggerConfig: { type: 'manual' },
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  isDirty: false,
  isSaving: false,

  setWorkflowMeta: (meta) => set((state) => ({ ...state, ...meta, isDirty: true })),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
      isDirty: true,
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  addNode: ({ provider, action, label, description, config = {}, position = null }) => {
    const nodes = get().nodes;
    const newId = `${provider}_${Date.now()}`;
    const defaultPos = position || {
      x: 100 + (nodes.length % 5) * 280,
      y: 180 + Math.floor(nodes.length / 5) * 160,
    };

    const newNode = {
      id: newId,
      type: 'agentflowNode',
      position: defaultPos,
      data: {
        label: label || `${provider.toUpperCase()} Action`,
        provider: provider || 'system',
        action: action || 'execute',
        description: description || '',
        config: config || {},
        inputs: {},
        outputs: {},
      },
    };

    set({
      nodes: [...nodes, newNode],
      selectedNode: newNode,
      isDirty: true,
    });

    return newNode;
  },

  updateNodeConfig: (nodeId, { label, description, config, action }) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              label: label !== undefined ? label : node.data.label,
              description: description !== undefined ? description : node.data.description,
              action: action !== undefined ? action : node.data.action,
              config: config !== undefined ? { ...node.data.config, ...config } : node.data.config,
            },
          };
          // Also keep selectedNode in sync if it's the one being edited
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updated });
          }
          return updated;
        }
        return node;
      }),
      isDirty: true,
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
  },

  loadWorkflow: (workflow) => {
    set({
      id: workflow._id || workflow.id,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      status: workflow.status || 'draft',
      version: workflow.version || 1,
      tags: workflow.tags || [],
      triggerConfig: workflow.triggerConfig || { type: 'manual' },
      nodes: (workflow.nodes || []).map((n) => ({
        ...n,
        type: 'agentflowNode',
      })),
      edges: (workflow.edges || []).map((e) => ({
        ...e,
        animated: true,
      })),
      selectedNode: null,
      isDirty: false,
    });
  },

  resetWorkflow: () => {
    set({
      id: null,
      name: 'New Operations Automation',
      description: '',
      status: 'draft',
      version: 1,
      tags: ['automation'],
      triggerConfig: { type: 'manual' },
      nodes: initialNodes,
      edges: initialEdges,
      selectedNode: null,
      isDirty: false,
    });
  },
}));
