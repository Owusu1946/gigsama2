import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

// Define the types for our database
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface Schema {
  tables: SchemaTable[];
  type: 'sql' | 'nosql';
  code: string;
}

export interface SchemaTable {
  name: string;
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: {
    table: string;
    field: string;
  };
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  schema?: Schema;
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    // Get projects from KV store
    const projects = await kv.get('projects') as Project[] || [];
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

// Get a project by ID
export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(project => project.id === id) || null;
}

// Create a new project
export async function createProject(title: string = 'New Project'): Promise<Project> {
  const projects = await getProjects();
  
  const newProject: Project = {
    id: nanoid(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
  
  projects.push(newProject);
  
  // Store updated projects list
  await kv.set('projects', projects);
  
  return newProject;
}

// Update a project
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex(project => project.id === id);
  
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now()
  };
  
  await kv.set('projects', projects);
  return projects[index];
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const index = projects.findIndex(project => project.id === id);
  
  if (index === -1) return false;
  
  projects.splice(index, 1);
  await kv.set('projects', projects);
  
  return true;
}

// Add message to a project
export async function addMessage(projectId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Project | null> {
  return updateProject(projectId, {
    messages: [
      ...(await getProject(projectId))?.messages || [],
      {
        id: nanoid(),
        content: message.content,
        isUser: message.isUser,
        timestamp: Date.now()
      }
    ]
  });
}

// Update schema
export async function updateSchema(projectId: string, schema: Schema): Promise<Project | null> {
  return updateProject(projectId, { schema });
} 