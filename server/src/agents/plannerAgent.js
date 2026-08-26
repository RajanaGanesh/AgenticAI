const monitoringAgent = require('./monitoringAgent');

class PlannerAgent {
  /**
   * Plans the execution order of nodes in the graph
   * @param {object} workflow - workflow object with nodes & edges
   * @param {object} execution - execution document
   */
  async createPlan(workflow, execution) {
    const { nodes = [], edges = [] } = workflow;
    const executionId = execution._id;
    const workflowId = workflow._id;

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      message: `Analyzing graph topology for workflow "${workflow.name}" with ${nodes.length} nodes and ${edges.length} edges.`,
      metadata: { totalNodes: nodes.length, totalEdges: edges.length },
    });

    if (nodes.length === 0) {
      const err = new Error('Workflow contains no nodes to execute');
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'error',
        message: 'Planning failed: Graph contains zero executable nodes.',
      });
      throw err;
    }

    // Build Adjacency List and In-degree Map
    const adjList = new Map();
    const inDegree = new Map();
    const nodeMap = new Map();

    nodes.forEach((node) => {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
      nodeMap.set(node.id, node);
    });

    edges.forEach((edge) => {
      if (adjList.has(edge.source) && inDegree.has(edge.target)) {
        adjList.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // Kahn's Algorithm for Topological Sort
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const executionSequence = [];
    while (queue.length > 0) {
      const current = queue.shift();
      executionSequence.push(current);

      const neighbors = adjList.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles
    if (executionSequence.length !== nodes.length) {
      // Find remaining nodes
      const remaining = nodes.filter((n) => !executionSequence.includes(n.id)).map((n) => n.id);
      executionSequence.push(...remaining); // fallback sequence
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'warning',
        message: `Graph contains non-standard cycle or disconnected branches. Appending remaining ${remaining.length} nodes to plan.`,
        metadata: { cyclicNodes: remaining },
      });
    }

    // Compute Confidence Score based on parameter completeness and graph structure
    let completeParamsCount = 0;
    nodes.forEach((n) => {
      const cfg = n.data?.config || {};
      if (Object.keys(cfg).length > 0) completeParamsCount++;
    });

    const paramRatio = nodes.length > 0 ? completeParamsCount / nodes.length : 1;
    const structureFactor = edges.length >= nodes.length - 1 ? 0.5 : 0.4;
    const confidenceScore = Math.min(1.0, Number((0.5 + structureFactor * 0.5 * paramRatio + 0.2).toFixed(2)));

    const plannedNodes = executionSequence.map((id) => nodeMap.get(id));

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      message: `Optimal execution plan established with confidence score ${(confidenceScore * 100).toFixed(0)}%. Sequence: ${executionSequence.join(' ➔ ')}`,
      metadata: { sequence: executionSequence, confidenceScore },
    });

    return {
      sequence: executionSequence,
      plannedNodes,
      confidenceScore,
    };
  }
}

module.exports = new PlannerAgent();
