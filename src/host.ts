import { GoogleGenAI } from '@google/genai';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

const mcpClient = new Client({
  name: 'studyhub-ai-host',
  version: '1.0.0',
});

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/index.ts'],
});

await mcpClient.connect(transport);

const { tools: mcpTools } = await mcpClient.listTools();

const geminiTools = mcpTools.map((tool) => {
  const { $schema: _schema, ...parameters } = tool.inputSchema;

  return {
    type: 'function' as const,
    name: tool.name,
    description: tool.description ?? '',
    parameters,
  };
});

let input: any =
  'Find my study notes about MCP and tell me what I have saved. Use the available tools when needed.';

let previousId: string | undefined;
let interaction: any;

while (true) {
  interaction = await ai.interactions.create({
    model: 'gemini-3.5-flash',
    input,
    tools: geminiTools,
    previous_interaction_id: previousId,
  });

  const functionResults = [];

  for (const step of interaction.steps) {
    if (step.type !== 'function_call') {
      continue;
    }

    console.log(`\nGemini selected MCP tool: ${step.name}`);
    console.log(`Arguments: ${JSON.stringify(step.arguments)}`);

    const toolResult = await mcpClient.callTool({
      name: step.name,
      arguments: step.arguments ?? {},
    });

    console.log('MCP tool executed successfully.');

    functionResults.push({
      type: 'function_result',
      name: step.name,
      call_id: step.id,
      result: [
        {
          type: 'text',
          text: JSON.stringify(toolResult),
        },
      ],
    });
  }

  if (functionResults.length === 0) {
    break;
  }

  input = functionResults;
  previousId = interaction.id;
}

console.log('\nGemini final answer:\n');
console.log(interaction.output_text);

await mcpClient.close();
