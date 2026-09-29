import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const client = new Client({
  name: 'studyhub-client',
  version: '1.0.0',
});

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/index.ts'],
});

await client.connect(transport);

console.log('Connected to StudyHub MCP Server');

const result = await client.getPrompt({
  name: 'review-topic',
  arguments: {
    topic: 'MCP Server',
  },
});

console.log('\nPrompt result:');
console.log(JSON.stringify(result, null, 2));

await client.close();
