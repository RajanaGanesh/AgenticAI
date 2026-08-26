/**
 * Automated Verification Script for Agentflow_AI Platform
 * Runs against live running server to test end-to-end API and multi-agent execution
 */
const axios = require('axios');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Agentflow_AI Automated End-to-End Suite');
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`▶ Test: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  }

  let authToken = '';
  let userId = '';
  let generatedGraph = null;
  let createdWorkflowId = '';
  let executionId = '';

  // 1. Health Check
  await test('GET /api/health (System Heartbeat)', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (!res.data?.success || res.data?.data?.status !== 'healthy') {
      throw new Error('Health check response invalid');
    }
  });

  // 2. User Registration / Login
  const testEmail = `test_operator_${Date.now()}@agentflow.ai`;
  await test('POST /api/auth/register (Create Operator)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Verification Bot',
      email: testEmail,
      password: 'SecurePassword123!',
    });
    if (!res.data?.data?.token) throw new Error('No JWT token returned');
    authToken = res.data.data.token;
    userId = res.data.data.user.id;
  });

  // 3. User Profile
  await test('GET /api/auth/me (Protected Route)', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.data?.data?.email !== testEmail) throw new Error('Email mismatch');
  });

  // 4. AI Prompt-to-Workflow Generation
  await test('POST /api/workflows/generate (Prompt-to-Graph Engine)', async () => {
    const res = await axios.post(
      `${BASE_URL}/workflows/generate`,
      {
        prompt: 'When a new lead email arrives in Gmail, extract lead details with AI and post an alert to Slack #ops-alerts and append row to Google Sheets',
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data?.data?.nodes || res.data.data.nodes.length < 3) {
      throw new Error('Generated graph must have at least 3 nodes');
    }
    generatedGraph = res.data.data;
  });

  // 5. Create Workflow from Graph
  await test('POST /api/workflows (Persist Workflow in MongoDB)', async () => {
    const res = await axios.post(
      `${BASE_URL}/workflows`,
      {
        name: generatedGraph.name,
        description: generatedGraph.description,
        status: 'active',
        nodes: generatedGraph.nodes,
        edges: generatedGraph.edges,
        tags: generatedGraph.tags,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data?.data?._id) throw new Error('No workflow ID created');
    createdWorkflowId = res.data.data._id;
  });

  // 6. Fetch Workflow by ID
  await test('GET /api/workflows/:id (Retrieve Workflow)', async () => {
    const res = await axios.get(`${BASE_URL}/workflows/${createdWorkflowId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.data?.data?._id !== createdWorkflowId) throw new Error('Workflow not found');
  });

  // 7. Duplicate Workflow
  await test('POST /api/workflows/:id/duplicate (Clone Workflow)', async () => {
    const res = await axios.post(
      `${BASE_URL}/workflows/${createdWorkflowId}/duplicate`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data?.data?._id) throw new Error('Clone failed');
  });

  // 8. Trigger 5-Agent Execution Run
  await test('POST /api/workflows/:id/execute (Trigger Multi-Agent Chain)', async () => {
    const res = await axios.post(
      `${BASE_URL}/workflows/${createdWorkflowId}/execute`,
      { triggerType: 'automated_test_runner' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data?.data?._id) throw new Error('Execution run not created');
    executionId = res.data.data._id;
  });

  // 9. Wait for Execution and Poll Timeline Logs
  await test('GET /api/executions/:id/timeline (5-Agent Audit Trail Verification)', async () => {
    // Wait 2.5s for async background agents (Planner, Exec, Val, Mon) to complete
    await new Promise((r) => setTimeout(r, 2500));

    const res = await axios.get(`${BASE_URL}/executions/${executionId}/timeline`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const logs = res.data?.data?.logs || [];
    if (logs.length === 0) throw new Error('No agent logs generated');

    const agentsPresent = new Set(logs.map((l) => l.agent));
    console.log(` [Agents active: ${Array.from(agentsPresent).join(', ')}]`);
  });

  // 10. Integrations Status Check
  await test('GET /api/integrations/status (Third-Party Connectors Health)', async () => {
    const res = await axios.get(`${BASE_URL}/integrations/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.data?.data) throw new Error('Integration status missing');
  });

  console.log('\n====================================================');
  console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// If executed directly
if (require.main === module) {
  runTests().catch((err) => {
    console.error('Fatal test runner failure:', err);
    process.exit(1);
  });
}

module.exports = runTests;
