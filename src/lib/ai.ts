import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message, Schema, SchemaTable, SchemaField } from './db';
import path from 'path';
import fs from 'fs/promises';

// Initialize Gemini AI with API key

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(API_KEY);

const SCHEMA_GENERATION_MODEL = 'gemini-2.0-flash';
const CHAT_MODEL = 'gemini-2.0-flash';

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Convert our message format to Gemini's format
function convertMessagesToGeminiFormat(messages: Message[]) {
  return messages.map(msg => ({
    role: msg.isUser ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
}

// Check if the user's message is explicitly requesting schema generation
export function isSchemaGenerationRequest(message: string): boolean {
  // Direct and explicit schema generation trigger phrases
  const explicitTriggerPhrases = [
    'generate schema',
    'generate a schema',
    'create schema', 
    'create a schema',
    'generate the schema',
    'create the schema',
    'show me the schema',
    'give me the schema',
    'build the schema',
    'i want the schema',
    'i need the schema',
    'schema please',
    'please generate schema',
    'generate it now',
    'let\'s see the schema',
    'i\'m ready for the schema',
    'generate database schema'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Explicit schema request
  const hasExplicitRequest = explicitTriggerPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );
  
  // Detect if the message is a clear command to generate
  const isGenerationCommand = (
    (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('build')) &&
    (lowerMessage.includes('schema') || lowerMessage.includes('database')) &&
    // Check if it contains imperative words or explicit requests
    (lowerMessage.includes('now') || lowerMessage.includes('please') || lowerMessage.startsWith('generate') || lowerMessage.startsWith('create'))
  );
  
  return hasExplicitRequest || isGenerationCommand;
}

// Helper function to parse SQL statements and extract tables and fields
function parseCreateTableStatements(sqlCode: string): { tables: SchemaTable[], type: 'sql', code: string } {
  const tables: SchemaTable[] = [];
  const tableRegex = /CREATE\s+TABLE\s+([^\s(]+)\s*\(\s*([\s\S]*?)(?:\);|;)/gi;
  const fieldRegex = /\s*([^\s,]+)\s+([^,]+?)(?:(?:,)|(?:\s+PRIMARY\s+KEY)|(?:\s+FOREIGN\s+KEY)|(?:\s*\)))/gi;
  const primaryKeyRegex = /PRIMARY\s+KEY\s*\(\s*([^\s,)]+)/gi;
  const foreignKeyRegex = /FOREIGN\s+KEY\s*\(\s*([^\s,)]+)\s*\)\s*REFERENCES\s+([^\s(]+)\s*\(\s*([^\s,)]+)\s*\)/gi;
  
  let match;
  while ((match = tableRegex.exec(sqlCode)) !== null) {
    const tableName = match[1].replace(/['"]/g, '').trim();
    const tableContent = match[2];
    
    // Initialize table
    const table: SchemaTable = {
      name: tableName,
      fields: []
    };
    
    // Extract primary keys
    const primaryKeys: string[] = [];
    let pkMatch;
    while ((pkMatch = primaryKeyRegex.exec(tableContent)) !== null) {
      primaryKeys.push(pkMatch[1].replace(/['"]/g, '').trim());
    }
    
    // Extract foreign keys
    const foreignKeys: { field: string, refTable: string, refField: string }[] = [];
    let fkMatch;
    while ((fkMatch = foreignKeyRegex.exec(tableContent)) !== null) {
      foreignKeys.push({
        field: fkMatch[1].replace(/['"]/g, '').trim(),
        refTable: fkMatch[2].replace(/['"]/g, '').trim(),
        refField: fkMatch[3].replace(/['"]/g, '').trim()
      });
    }
    
    // Reset regex indices for fields
    fieldRegex.lastIndex = 0;
    
    // Extract fields
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(tableContent)) !== null) {
      const fieldName = fieldMatch[1].replace(/['"]/g, '').trim();
      const fieldType = fieldMatch[2].trim();
      
      // Skip if this is a constraint definition not a field
      if (fieldName.toLowerCase() === 'primary' || fieldName.toLowerCase() === 'foreign') {
        continue;
      }
      
      const field: SchemaField = {
        name: fieldName,
        type: fieldType,
        isPrimaryKey: primaryKeys.includes(fieldName),
        isForeignKey: foreignKeys.some(fk => fk.field === fieldName)
      };
      
      // Add reference if it's a foreign key
      const fkRef = foreignKeys.find(fk => fk.field === fieldName);
      if (fkRef) {
        field.references = {
          table: fkRef.refTable,
          field: fkRef.refField
        };
      }
      
      table.fields.push(field);
    }
    
    tables.push(table);
  }
  
  return {
    tables,
    type: 'sql',
    code: sqlCode
  };
}

// Generate a schema based on conversation history
export async function generateSchema(messages: Message[]): Promise<Schema> {
  const model = genAI.getGenerativeModel({ model: SCHEMA_GENERATION_MODEL });
  
  // Prepare conversation history
  const chatHistory = convertMessagesToGeminiFormat(messages);
  
  // Add a specific instruction to generate schema
  const prompt = `
Based on the conversation history, generate a detailed database schema.
Choose the most appropriate schema type (SQL or NoSQL) based on the requirements.

First, provide your schema in a structured JSON format:

{
  "tables": [
    {
      "name": "TableName",
      "fields": [
        {
          "name": "fieldName",
          "type": "dataType",
          "isPrimaryKey": true/false,
          "isForeignKey": true/false,
          "references": {
            "table": "ReferencedTableName",
            "field": "ReferencedFieldName"
          }
        }
      ]
    }
  ],
  "type": "sql" or "nosql",
  "code": "SQL CREATE TABLE statements or NoSQL schema definition"
}

Then, AFTER providing the JSON, explain your schema design in detail.

IMPORTANT REQUIREMENTS:
1. For SQL schemas, include proper CREATE TABLE statements with PRIMARY KEY and FOREIGN KEY constraints in the "code" field.
2. For NoSQL schemas, include a JSON document validation schema in the "code" field.
3. Make sure all relationships between tables/collections are properly defined with foreign keys.
4. The JSON MUST be valid - use double quotes for keys and string values, and ensure proper formatting.
5. Be sure to enclose the code in the "code" field within the JSON structure.
6. The JSON object MUST come first in your response, before any explanations.
`;

  try {
    // Use previous conversation history and add our specific prompt
    const result = await model.generateContent({
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      safetySettings,
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent, deterministic output
        maxOutputTokens: 8192, // Allow longer responses for complex schemas
      },
    });
    
    const response = result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*?\}\s*(?=[\n\r]|$)/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[0];
        const schema = JSON.parse(jsonStr);
        
        // Validate the schema has the required fields
        if (!schema.tables || !schema.type || !schema.code) {
          throw new Error('Invalid schema format - missing required fields');
        }
        
        // Option 1: Replace literal '\n' with actual newlines
        schema.code = schema.code.replace(/\\n/g, '\n');
        
        // Option 2: Alternative approach - strip out literal '\n' completely
        // schema.code = schema.code.replace(/\\n/g, '');
        
        return schema as Schema;
      } catch (jsonError) {
        console.error('Failed to parse JSON schema:', jsonError);
        // Fall through to SQL parsing approach
      }
    }
    
    // If JSON parsing fails, try to extract SQL CREATE TABLE statements directly
    const sqlMatch = text.match(/CREATE\s+TABLE[\s\S]*?;/gi);
    if (sqlMatch && sqlMatch.length > 0) {
      const sqlCode = sqlMatch.join('\n\n');
      return parseCreateTableStatements(sqlCode);
    }
    
    // If we can't extract anything valid, provide a fallback schema
    console.error('Failed to extract schema from AI response, using fallback schema');
    return {
      tables: [
        {
          name: 'Users',
          fields: [
            { name: 'id', type: 'int', isPrimaryKey: true },
            { name: 'name', type: 'varchar' },
            { name: 'email', type: 'varchar' },
          ]
        }
      ],
      type: 'sql',
      code: 'CREATE TABLE Users (\n  id INT PRIMARY KEY,\n  name VARCHAR(255),\n  email VARCHAR(255)\n);'
    };
  } catch (error) {
    console.error('Error generating schema:', error);
    
    // Fallback schema if generation fails
    return {
      tables: [
        {
          name: 'Users',
          fields: [
            { name: 'id', type: 'int', isPrimaryKey: true },
            { name: 'name', type: 'varchar' },
            { name: 'email', type: 'varchar' },
          ]
        }
      ],
      type: 'sql',
      code: 'CREATE TABLE Users (\n  id INT PRIMARY KEY,\n  name VARCHAR(255),\n  email VARCHAR(255)\n);'
    };
  }
}

// Get AI response to a message
export async function getChatResponse(messages: Message[]): Promise<string> {
  // Initialize chat model
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  
  // Convert messages to Gemini's format
  const chatHistory = convertMessagesToGeminiFormat(messages);
  
  // Check if this is a new conversation (only one user message)
  const isNewConversation = messages.length === 1 && messages[0].isUser;
  
  // Get the last message
  const lastMessage = messages[messages.length - 1];
  
  // Determine if the last message is asking to generate a schema
  const isSchemaRequest = lastMessage.isUser && isSchemaGenerationRequest(lastMessage.content);
  
  // Different system prompts based on conversation stage
  let systemPrompt = '';
  
  if (isNewConversation) {
    // Initial conversation - friendly greeting and clear guidance
    systemPrompt = `
You are a friendly database schema design assistant. Your goal is to help users create an appropriate database schema for their needs.

Begin with a warm greeting and ask what kind of database schema they're looking to create. For example:
"Hello! I'm here to help you design a database schema. What kind of database are you looking to create today?"

Make your response conversational and engaging. Do NOT generate a schema yet - first gather requirements through a natural conversation.
`;
  } else if (isSchemaRequest) {
    // User has explicitly asked for a schema - acknowledge and prepare to generate
    systemPrompt = `
The user has explicitly asked you to generate a database schema. In your response:
1. Acknowledge that you'll generate a schema based on the conversation
2. Summarize your understanding of their requirements in a brief list
3. Tell them the schema will appear above the chat area shortly
4. Ask if they'd like to make any adjustments to the schema after reviewing it

IMPORTANT: Do NOT include any SQL code or schema design in your message. The schema will be displayed separately above the chat.
Just confirm you're generating the schema and summarize what you understand about their requirements.

Keep your response friendly and concise.
`;
  } else if (messages.length >= 6) {
    // Ongoing conversation - might be refining schema or still gathering requirements
    systemPrompt = `
You are a database schema design assistant helping the user refine their requirements.

Based on the conversation so far, determine if you have enough information to generate a schema:

1. If you DON'T have enough information yet:
   - Ask specific follow-up questions about missing details
   - Focus on entity relationships, key fields, and business rules
   - Keep your questions conversational and provide examples

2. If you have ENOUGH information but the user HASN'T explicitly asked for the schema:
   - Summarize what you understand so far
   - Ask if they're ready for you to generate the schema
   - Use phrasing like: "I think I have enough information to generate a schema now. Would you like me to create it for you?"

3. If the user is asking for CHANGES to an existing schema:
   - Acknowledge their requested changes
   - Explain how they would improve the design
   - Let them know the updated schema will appear above the chat

Remember:
- Be friendly and helpful
- Use clear, concise language
- Don't generate a schema unless explicitly requested
- Don't include SQL code in your messages
`;
  } else {
    // Early conversation - actively gathering requirements
    systemPrompt = `
You are a database schema design assistant gathering requirements through conversation.

Based on what the user has shared so far:

1. Ask specific follow-up questions about:
   - The main entities/tables they need
   - Relationships between these entities
   - Important fields/attributes
   - Business rules or constraints

2. Keep your questions focused and provide examples to guide them. For instance:
   - "For your school database, would you need to track classes, enrollment, or grades?"
   - "How would students relate to courses? Can a student take multiple courses?"

3. If the user mentions a specific domain (e.g., "school database"):
   - Ask about typical entities for that domain
   - Suggest common relationships in that domain
   
Adopt a friendly, helpful tone and make your questions conversational rather than technical.
Don't suggest generating a schema until you have sufficient information about their requirements.
`;
  }

  try {
    const result = await model.generateContent({
      contents: [
        { role: 'model', parts: [{ text: systemPrompt }] },
        ...chatHistory,
      ],
      safetySettings,
      generationConfig: {
        temperature: 0.7, // Slightly higher temperature for more natural conversation
        maxOutputTokens: 2048,
      },
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    return "I'm sorry, I encountered an error processing your request. Could you please try again?";
  }
}

// Path to our JSON database file
const DB_PATH = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DB_PATH, 'projects.json');

async function initDB() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    // ...
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 