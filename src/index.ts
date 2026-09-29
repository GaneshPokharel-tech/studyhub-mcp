import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { readNotes, writeNotes, readTasks, writeTasks } from './storage.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';

function createServer() {
  const server = new McpServer({
    name: 'studyhub-mcp',
    version: '1.0.0',
  });

  registerResources(server);
  registerPrompts(server);

  server.registerTool(
    'add-study-note',
    {
      description: 'Add a new study note to StudyHub',
      inputSchema: z.object({
        topic: z.string().min(1).describe('Topic of the study note'),
        content: z.string().min(1).describe('Content of the study note'),
      }),
    },
    async ({ topic, content }) => {
      const notes = await readNotes();

      notes.push({ topic, content });

      await writeNotes(notes);

      return {
        content: [
          {
            type: 'text',
            text: `Study note saved for topic: ${topic}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'list-study-notes',
    {
      description: 'List all persisted study notes',
    },
    async () => {
      const notes = await readNotes();

      if (notes.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No study notes found.',
            },
          ],
        };
      }

      const formattedNotes = notes
        .map(
          (note, index) =>
            `${index + 1}. ${note.topic}\n${note.content}`,
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: formattedNotes,
          },
        ],
      };
    },
  );


  server.registerTool(
    'search-study-notes',
    {
      description: 'Search persisted study notes by keyword',
      inputSchema: z.object({
        query: z.string().min(1).describe('Keyword to search for'),
      }),
    },
    async ({ query }) => {
      const notes = await readNotes();
      const normalizedQuery = query.toLowerCase();

      const matches = notes.filter((note) =>
        note.topic.toLowerCase().includes(normalizedQuery) ||
        note.content.toLowerCase().includes(normalizedQuery),
      );

      if (matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No study notes found for: ${query}`,
            },
          ],
        };
      }

      const formattedMatches = matches
        .map(
          (note, index) =>
            `${index + 1}. ${note.topic}\n${note.content}`,
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: formattedMatches,
          },
        ],
      };
    },
  );


  server.registerTool(
    'create-study-task',
    {
      description: 'Create a new study task',
      inputSchema: z.object({
        title: z.string().min(1).describe('Title of the study task'),
      }),
    },
    async ({ title }) => {
      const tasks = await readTasks();

      const nextId =
        tasks.length === 0
          ? 1
          : Math.max(...tasks.map((task) => task.id)) + 1;

      const newTask = {
        id: nextId,
        title,
        completed: false,
      };

      tasks.push(newTask);

      await writeTasks(tasks);

      return {
        content: [
          {
            type: 'text',
            text: `Study task created: [${newTask.id}] ${newTask.title}`,
          },
        ],
      };
    },
  );


  server.registerTool(
    'list-open-tasks',
    {
      description: 'List all incomplete study tasks',
    },
    async () => {
      const tasks = await readTasks();
      const openTasks = tasks.filter((task) => !task.completed);

      if (openTasks.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No open study tasks found.',
            },
          ],
        };
      }

      const formattedTasks = openTasks
        .map(
          (task) => `[${task.id}] ${task.title}`,
        )
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: formattedTasks,
          },
        ],
      };
    },
  );


  server.registerTool(
    'complete-study-task',
    {
      description: 'Mark a study task as completed',
      inputSchema: z.object({
        id: z.coerce.number().int().positive().describe('ID of the study task'),
      }),
    },
    async ({ id }) => {
      const tasks = await readTasks();

      const task = tasks.find((task) => task.id === id);

      if (!task) {
        return {
          content: [
            {
              type: 'text',
              text: `Study task not found: ${id}`,
            },
          ],
          isError: true,
        };
      }

      task.completed = true;

      await writeTasks(tasks);

      return {
        content: [
          {
            type: 'text',
            text: `Study task completed: [${task.id}] ${task.title}`,
          },
        ],
      };
    },
  );

  return server;
}

void serveStdio(createServer);

console.error('StudyHub MCP server running on stdio');
