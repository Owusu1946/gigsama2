import { promises as fs } from 'fs';
import path from 'path';
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

// Path to our JSON database file
const DB_PATH = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DB_PATH, 'projects.json');

// Initialize database
async function initDB() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    
    try {
      await fs.access(PROJECTS_FILE);
    } catch (error) {
      // File doesn't exist, create it with empty projects array
      await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects: [] }, null, 2));
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  await initDB();
  
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8');
    const { projects } = JSON.parse(data);
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
  await initDB();
  
  const projects = await getProjects();
  
  const newProject: Project = {
    id: nanoid(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
  
  projects.push(newProject);
  
  await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2));
  
  return newProject;
}

// Update a project
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id'>>
): Promise<Project | null> {
  const projects = await getProjects();
  const projectIndex = projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) return null;
  
  const updatedProject = {
    ...projects[projectIndex],
    ...updates,
    updatedAt: Date.now()
  };
  
  projects[projectIndex] = updatedProject;
  
  await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2));
  
  return updatedProject;
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filteredProjects = projects.filter(project => project.id !== id);
  
  if (filteredProjects.length === projects.length) {
    return false; // No project was deleted
  }
  
  await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects: filteredProjects }, null, 2));
  
  return true;
}

// Add a message to a project
export async function addMessage(projectId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Project | null> {
  const project = await getProject(projectId);
  
  if (!project) return null;
  
  const newMessage: Message = {
    ...message,
    id: nanoid(),
    timestamp: Date.now()
  };
  
  const updatedMessages = [...(project.messages || []), newMessage];
  
  return updateProject(projectId, { messages: updatedMessages });
}

// Update project schema
export async function updateSchema(projectId: string, schema: Schema): Promise<Project | null> {
  return updateProject(projectId, { schema });
} 