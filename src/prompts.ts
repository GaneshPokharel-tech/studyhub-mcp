import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'review-topic',
    {
      title: 'Review Study Topic',
      description: 'Create a focused revision prompt for a study topic',
      argsSchema: z.object({
        topic: z.string().min(1).describe('Topic to review'),
      }),
    },
    async ({ topic }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Review my study topic "${topic}".

Explain:
1. The core concept
2. Why it is used
3. The main components
4. One practical example
5. Three questions to test my understanding

Keep the explanation clear and practical.`,
            },
          },
        ],
      };
    },
  );
}
