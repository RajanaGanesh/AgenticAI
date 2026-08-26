import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentflowNode from './AgentflowNode';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTypes = {
  agentflowNode: AgentflowNode,
  custom: AgentflowNode,
};

function CanvasInner() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
  } = useWorkflowStore();

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/agentflow-node');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        addNode({
          provider: item.provider,
          action: item.action,
          label: item.label,
          description: item.description,
          config: item.config || {},
          position,
        });
      } catch (err) {
        console.error('Drop error:', err);
      }
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
        }}
      >
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const provider = n.data?.provider;
            if (provider === 'gmail') return '#f43f5e';
            if (provider === 'slack') return '#10b981';
            if (provider === 'discord') return '#6366f1';
            if (provider === 'google-sheets') return '#14b8a6';
            if (provider === 'ai') return '#06b6d4';
            return '#f59e0b';
          }}
          maskColor="rgba(9, 13, 22, 0.7)"
          position="bottom-right"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#1e293b" />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
