import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export type StudyNote = {
  topic: string;
  content: string;
};

const notesFileUrl = new URL('../data/notes.json', import.meta.url);
const notesFilePath = fileURLToPath(notesFileUrl);

export async function readNotes(): Promise<StudyNote[]> {
  const fileContent = await readFile(notesFilePath, 'utf-8');

  return JSON.parse(fileContent) as StudyNote[];
}

export async function writeNotes(notes: StudyNote[]): Promise<void> {
  await writeFile(
    notesFilePath,
    JSON.stringify(notes, null, 2),
    'utf-8',
  );
}

export type StudyTask = {
  id: number;
  title: string;
  completed: boolean;
};

const tasksFileUrl = new URL('../data/tasks.json', import.meta.url);
const tasksFilePath = fileURLToPath(tasksFileUrl);

export async function readTasks(): Promise<StudyTask[]> {
  const fileContent = await readFile(tasksFilePath, 'utf-8');

  return JSON.parse(fileContent) as StudyTask[];
}

export async function writeTasks(tasks: StudyTask[]): Promise<void> {
  await writeFile(
    tasksFilePath,
    JSON.stringify(tasks, null, 2),
    'utf-8',
  );
}
