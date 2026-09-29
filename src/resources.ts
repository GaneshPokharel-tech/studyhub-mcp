import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/server';

import { readNotes, readTasks } from './storage.js';

export function registerResources(server: McpServer): void {
  server.registerResource(
    'all-study-notes',
    'study://notes/all',
    {
      title: 'All Study Notes',
      description: 'All persisted StudyHub notes',
      mimeType: 'application/json',
    },
    async (uri) => {
      const notes = await readNotes();

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(notes, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    'open-study-tasks',
    'study://tasks/open',
    {
      title: 'Open Study Tasks',
      description: 'All incomplete StudyHub tasks',
      mimeType: 'application/json',
    },
    async (uri) => {
      const tasks = await readTasks();
      const openTasks = tasks.filter((task) => !task.completed);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(openTasks, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    'notes-by-topic',
    new ResourceTemplate(
      'study://notes/topic/{topic}',
      { list: undefined },
    ),
    {
      title: 'Study Notes By Topic',
      description: 'Study notes matching a specific topic',
      mimeType: 'application/json',
    },
    async (uri, { topic }) => {
      const notes = await readNotes();

      const topicValue =
        typeof topic === 'string'
          ? topic
          : Array.isArray(topic)
            ? topic[0] ?? ''
            : '';

      const decodedTopic = decodeURIComponent(topicValue);
      const normalizedTopic = decodedTopic.toLowerCase();

      const matches = notes.filter((note) =>
        note.topic.toLowerCase().includes(normalizedTopic),
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    },
  );
}
