const axios = require('axios');
const env = require('../config/env');

class AIService {
  /**
   * Main entry point to generate a workflow graph from a prompt
   */
  async generateWorkflow(prompt, userApiKey = null) {
    const trimmedPrompt = (prompt || '').trim();
    if (!trimmedPrompt) {
      throw new Error('Prompt cannot be empty');
    }

    const openRouterKey = userApiKey || env.OPENROUTER_API_KEY;
    const geminiKey = env.GEMINI_API_KEY;

    // 1. Try OpenRouter
    if (openRouterKey) {
      try {
        console.log('[AI Service] Attempting workflow generation via OpenRouter API...');
        return await this.generateViaOpenRouter(trimmedPrompt, openRouterKey);
      } catch (err) {
        console.warn('[AI Service] OpenRouter generation failed, falling back:', err.message);
      }
    }

    // 2. Try Gemini
    if (geminiKey) {
      try {
        console.log('[AI Service] Attempting workflow generation via Google Gemini...');
        return await this.generateViaGemini(trimmedPrompt, geminiKey);
      } catch (err) {
        console.warn('[AI Service] Gemini generation failed, falling back:', err.message);
      }
    }

    // 3. Fallback to Deterministic Rule Engine
    console.log('[AI Service] Generating workflow via Deterministic Rule Engine...');
    return this.generateDeterministicWorkflow(trimmedPrompt);
  }

  getSystemPrompt() {
    return `You are an expert AI Operations Architect for Agentflow_AI.
Given an automation request in natural language, generate a visual workflow graph formatted as strict JSON matching this structure:
{
  "name": "Short Descriptive Title",
  "description": "Clear overview of what the workflow achieves",
  "tags": ["email", "slack", "ai"],
  "triggerConfig": {
    "type": "manual" | "gmail_event" | "slack_event" | "schedule" | "webhook",
    "schedule": "cron string if schedule",
    "eventFilter": {}
  },
  "nodes": [
    {
      "id": "node_1",
      "type": "custom",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Read Incoming Email",
        "provider": "gmail" | "slack" | "discord" | "google-sheets" | "ai" | "system",
        "action": "read_emails" | "send_email" | "post_message" | "append_row" | "ai_transform" | "condition",
        "config": { ...parameters... },
        "description": "Step description"
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node_1",
      "target": "node_2",
      "animated": true,
      "label": "Triggered"
    }
  ]
}
IMPORTANT: Only output the raw JSON string without markdown backticks or commentary. Position nodes with x incrementing by 280-320px for clear horizontal layout.`;
  }

  async generateViaOpenRouter(prompt, apiKey) {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://agentflow.ai',
          'X-Title': 'Agentflow AI Automation Platform',
        },
        timeout: 15000,
      }
    );

    const content = res.data.choices?.[0]?.message?.content;
    return this.parseAndValidateGraphJson(content, prompt);
  }

  async generateViaGemini(prompt, apiKey) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `${this.getSystemPrompt()}\n\nUser Request: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return this.parseAndValidateGraphJson(text, prompt);
  }

  parseAndValidateGraphJson(rawText, originalPrompt) {
    if (!rawText) throw new Error('Empty AI response');
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.nodes || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      throw new Error('Generated graph must contain at least one node');
    }

    return {
      name: parsed.name || 'AI Generated Automation',
      description: parsed.description || originalPrompt,
      tags: parsed.tags || ['automation', 'agentic'],
      triggerConfig: parsed.triggerConfig || { type: 'manual' },
      nodes: parsed.nodes.map((n, i) => ({
        id: n.id || `node_${i + 1}`,
        type: n.type || 'custom',
        position: n.position || { x: 100 + i * 280, y: 150 },
        data: {
          label: n.data?.label || `Step ${i + 1}`,
          provider: n.data?.provider || 'system',
          action: n.data?.action || 'execute',
          config: n.data?.config || {},
          description: n.data?.description || '',
          inputs: n.data?.inputs || {},
          outputs: n.data?.outputs || {},
        },
      })),
      edges: parsed.edges || [],
      promptSource: originalPrompt,
    };
  }

  /**
   * Deterministic Rule-Based Graph Builder (zero-API key fallback)
   */
  generateDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();
    const nodes = [];
    const edges = [];
    let name = 'Automated Workflow';
    let description = prompt;
    let tags = ['automation'];

    // 1. Initial Trigger Node
    let triggerType = 'manual';
    let triggerLabel = 'Manual Trigger';
    let triggerProvider = 'system';
    let triggerAction = 'trigger';

    if (p.includes('email') || p.includes('gmail') || p.includes('inbox')) {
      triggerType = 'gmail_event';
      triggerLabel = 'Gmail Inbox Listener';
      triggerProvider = 'gmail';
      triggerAction = 'read_emails';
      tags.push('gmail', 'inbox');
    } else if (p.includes('slack') || p.includes('channel')) {
      triggerType = 'slack_event';
      triggerLabel = 'Slack Event Trigger';
      triggerProvider = 'slack';
      triggerAction = 'listen_events';
      tags.push('slack');
    } else if (p.includes('schedule') || p.includes('every') || p.includes('daily') || p.includes('hourly')) {
      triggerType = 'schedule';
      triggerLabel = 'Cron Schedule Trigger';
      triggerProvider = 'system';
      triggerAction = 'cron';
      tags.push('scheduled');
    } else if (p.includes('webhook') || p.includes('http') || p.includes('api')) {
      triggerType = 'webhook';
      triggerLabel = 'Webhook Ingest';
      triggerProvider = 'system';
      triggerAction = 'webhook';
      tags.push('webhook');
    }

    nodes.push({
      id: 'node_1',
      type: 'custom',
      position: { x: 100, y: 150 },
      data: {
        label: triggerLabel,
        provider: triggerProvider,
        action: triggerAction,
        description: 'Initiates the execution chain upon trigger event',
        config: { triggerType },
      },
    });

    let currentX = 380;
    let nodeIndex = 2;
    let previousNodeId = 'node_1';

    // 2. AI Summarization / Extraction step
    if (p.includes('summariz') || p.includes('extract') || p.includes('analyze') || p.includes('ai') || p.includes('classify') || p.includes('sentiment')) {
      const aiNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: aiNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'AI Data Analyzer & Extractor',
          provider: 'ai',
          action: 'ai_transform',
          description: 'Uses LLM to summarize content and structure output fields',
          config: {
            model: 'gpt-4o-mini',
            promptTemplate: 'Analyze the incoming data, summarize the key points, and extract critical action items.',
            outputFormat: 'json',
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${aiNodeId}`,
        source: previousNodeId,
        target: aiNodeId,
        animated: true,
        label: 'Payload Data',
      });

      previousNodeId = aiNodeId;
      currentX += 280;
      nodeIndex++;
      tags.push('ai-processing');
    }

    // 3. Condition / Filter step (if requested)
    if (p.includes('if') || p.includes('filter') || p.includes('condition') || p.includes('priority')) {
      const condNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: condNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'Priority Filter & Guardrail',
          provider: 'system',
          action: 'condition',
          description: 'Evaluates priority and routes execution flow',
          config: {
            field: 'priority',
            operator: 'equals',
            value: 'high',
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${condNodeId}`,
        source: previousNodeId,
        target: condNodeId,
        animated: true,
        label: 'Validated',
      });

      previousNodeId = condNodeId;
      currentX += 280;
      nodeIndex++;
    }

    // 4. Google Sheets append step
    if (p.includes('sheet') || p.includes('spreadsheet') || p.includes('excel') || p.includes('table') || p.includes('log')) {
      const sheetNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: sheetNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'Append to Google Sheets',
          provider: 'google-sheets',
          action: 'append_row',
          description: 'Appends extracted records to target spreadsheet',
          config: {
            spreadsheetId: 'default_sheet_101',
            range: 'Sheet1!A:Z',
            values: ['{{payload.name}}', '{{payload.email}}', '{{ai.summary}}', '{{timestamp}}'],
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${sheetNodeId}`,
        source: previousNodeId,
        target: sheetNodeId,
        animated: true,
        label: 'Sync Row',
      });

      previousNodeId = sheetNodeId;
      currentX += 280;
      nodeIndex++;
      tags.push('google-sheets');
    }

    // 5. Notification step (Slack, Discord, or Email)
    if (p.includes('slack') || (!p.includes('discord') && !p.includes('email') && nodeIndex === 2)) {
      const slackNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: slackNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'Send Slack Notification',
          provider: 'slack',
          action: 'post_message',
          description: 'Broadcasts workflow execution alert to team channel',
          config: {
            channel: '#ops-alerts',
            message: '🚀 [Agentflow AI] Workflow completed: {{ai.summary || "Action processed successfully"}}',
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${slackNodeId}`,
        source: previousNodeId,
        target: slackNodeId,
        animated: true,
        label: 'Dispatch Alert',
      });

      currentX += 280;
      nodeIndex++;
      tags.push('slack-dispatch');
    } else if (p.includes('discord')) {
      const discordNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: discordNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'Post to Discord Channel',
          provider: 'discord',
          action: 'post_message',
          description: 'Sends execution payload to Discord webhook or channel',
          config: {
            channelId: 'ops-feed',
            content: '⚡ **[Agentflow Alert]** New automation processed: {{ai.summary}}',
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${discordNodeId}`,
        source: previousNodeId,
        target: discordNodeId,
        animated: true,
        label: 'Send Webhook',
      });

      currentX += 280;
      nodeIndex++;
      tags.push('discord-feed');
    } else if (p.includes('send email') || p.includes('send mail') || p.includes('notify via email')) {
      const emailNodeId = `node_${nodeIndex}`;
      nodes.push({
        id: emailNodeId,
        type: 'custom',
        position: { x: currentX, y: 150 },
        data: {
          label: 'Send Gmail Notification',
          provider: 'gmail',
          action: 'send_email',
          description: 'Sends email summary report',
          config: {
            to: 'operator@example.com',
            subject: 'Agentflow Automation Summary',
            body: '<p>Workflow completed. Summary: {{ai.summary}}</p>',
          },
        },
      });

      edges.push({
        id: `e_${previousNodeId}-${emailNodeId}`,
        source: previousNodeId,
        target: emailNodeId,
        animated: true,
        label: 'Send Mail',
      });

      currentX += 280;
      nodeIndex++;
      tags.push('gmail-outbox');
    }

    // Determine intuitive Name
    if (p.includes('lead') || p.includes('inquiry')) {
      name = 'Lead Intake & Automated Notification Pipeline';
    } else if (p.includes('invoice') || p.includes('billing')) {
      name = 'Invoice Processing & Sheet Ingestion';
    } else if (p.includes('incident') || p.includes('alert')) {
      name = 'Ops Incident Multi-Channel Escalation';
    } else {
      name = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
    }

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description: prompt,
      tags: Array.from(new Set(tags)),
      triggerConfig: { type: triggerType },
      nodes,
      edges,
      promptSource: prompt,
    };
  }
}

module.exports = new AIService();
