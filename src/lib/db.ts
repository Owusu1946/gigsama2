import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

// Create client with clearer parameters
const redis = new Redis({
  url: process.env.keymap_KV_REST_API_URL || 'https://superb-pigeon-25964.upstash.io',
  token: process.env.keymap_KV_REST_API_TOKEN || '',
});
  
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

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // This will store hashed password
  createdAt: number;
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  schema?: Schema;
  userId?: string; // Associate projects with users
}

// User-related functions
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await redis.get('users') as User[] || [];
    return users.find(user => user.email === email) || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await redis.get('users') as User[] || [];
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  try {
    const users = await redis.get('users') as User[] || [];
    
    const newUser: User = {
      id: nanoid(),
      ...userData,
      createdAt: Date.now()
    };
    
    users.push(newUser);
    await redis.set('users', users);
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

// Get all projects for a specific user
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const projects = await redis.get('projects') as Project[] || [];
    return projects.filter(project => project.userId === userId);
  } catch (error) {
    console.error('Error getting projects for user:', error);
    return [];
  }
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await redis.get('projects') as Project[] || [];
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
export async function createProject(title: string = 'New Project', userId?: string): Promise<Project> {
  const projects = await getProjects();
  
  const newProject: Project = {
    id: nanoid(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    userId // Associate the project with a user if provided
  };
  
  projects.push(newProject);
  
  await redis.set('projects', projects);
  
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
  
  await redis.set('projects', projects);
  return projects[index];
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const index = projects.findIndex(project => project.id === id);
  
  if (index === -1) return false;
  
  projects.splice(index, 1);
  await redis.set('projects', projects);
  
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