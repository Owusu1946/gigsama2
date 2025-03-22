'use client';

import React, { useState } from 'react';
import { Schema, SchemaTable, SchemaField } from '@/lib/db';
import { Modal } from './Modal';

interface SchemaDisplayProps {
  isVisible: boolean;
  schema?: Schema | null;
  isGenerating?: boolean;
}

// Define relationship type
interface TableRelationship {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
}

export function SchemaDisplay({ isVisible, schema, isGenerating = false }: SchemaDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  
  // Function to copy SQL code to clipboard
  const copyToClipboard = () => {
    if (schema?.code) {
      navigator.clipboard.writeText(schema.code.replace(/\\n/g, '\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Copy button component for modal actions
  const CopyButton = () => (
    <button
      onClick={copyToClipboard}
      className="mr-3 text-gray-300 hover:text-white transition-colors text-sm flex items-center"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
  
  if (!isVisible) return null;
  
  // If no schema is provided, show a helpful empty state
  if (!schema) {
    return (
      <div className="w-full py-8 px-4">
        <div className="bg-white rounded-lg p-6 overflow-x-auto">
          <div className="text-sm text-gray-600 mb-4 inline-block px-3 py-1 bg-gray-100 rounded-full">
            schema
          </div>
          
          <div className="text-center py-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Schema Generated Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Chat with the AI to describe your database needs. When you're ready, 
              ask it to "generate a schema" based on your requirements.
            </p>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 max-w-lg mx-auto text-left">
              <div className="text-sm text-gray-500 font-medium mb-2">Example requests:</div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• "Can you generate a schema based on what we've discussed?"</li>
                <li>• "Create a database schema for this project"</li>
                <li>• "I'm ready to see the schema now"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get relationships between tables for visualization
  const getRelationships = (): TableRelationship[] => {
    const relationships: TableRelationship[] = [];
    
    schema.tables.forEach(table => {
      table.fields.forEach(field => {
        if (field.isForeignKey && field.references) {
          relationships.push({
            fromTable: table.name,
            fromField: field.name,
            toTable: field.references.table,
            toField: field.references.field
          });
        }
      });
    });
    
    return relationships;
  };
  
  const relationships = getRelationships();
  
  // Show "Generating Schema" message when generation is in progress
  if (isGeneratingSchema) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-pulse text-xl font-medium mb-2">Generating Schema</div>
          <div className="flex justify-center space-x-2">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show the actual schema when it's not generating and schema exists
  return (
    <div className="w-full py-8 px-4">
      <div className="bg-white rounded-lg p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 inline-block px-3 py-1 bg-gray-100 rounded-full">
            {schema.type === 'sql' ? 'SQL Schema' : 'NoSQL Schema'}
          </div>
          
          <div className="text-xs text-gray-500">
            {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6">
          {schema.tables.map((table: SchemaTable) => (
            <div key={table.name} className="border rounded-lg overflow-hidden shadow-s border-white">
            <div className="py-3 px-4 bg-gray-50 font-medium text-sm border-w border-white">
                {table.name.replace(/\\n/g, '')}
            </div>
            <table className="w-full text-sm">
              <tbody>
                  {table.fields.map((field: SchemaField, index: number) => (
                    <tr 
                      key={`${table.name}-${field.name}-${index}`} 
                      className={index < table.fields.length - 1 ? "border-w border-white" : ""}
                    >
                      <td className="px-4 py-2 flex items-center">
                        {field.isPrimaryKey && (
                          <span className="mr-1 text-yellow-500" title="Primary Key">🔑</span>
                        )}
                        {field.isForeignKey && (
                          <span className="mr-1 text-blue-500" title="Foreign Key">🔗</span>
                        )}
                        {field.name.replace(/\\n/g, '')}
                      </td>
                      <td className="px-4 py-2 text-gray-500">{field.type.replace(/\\n/g, '')}</td>
                </tr>
                  ))}
              </tbody>
            </table>
            </div>
          ))}
        </div>
        
        {/* SQL Code Button */}
        {schema.code && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center hover:opacity-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Get SQL Code
            </button>
          </div>
        )}
        
        {/* SQL Code Modal using the reusable Modal component with terminal styling */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="SQL Definition"
          actions={<CopyButton />}
          isTerminal={true}
        >
          <div className="text-gray-200">
            <div className="flex items-center mb-3">
              <span className="text-green-400 font-semibold">sql@schema</span>
              <span className="text-gray-500 mx-1">:</span>
              <span className="text-blue-400 font-semibold">~</span>
              <span className="text-gray-500 mx-1">$</span>
              <span className="ml-1 text-gray-300">KeyMap database.sql</span>
            </div>
            <pre className="whitespace-pre-wrap my-3 p-0">
              {schema.code && schema.code.replace(/\\n/g, '\n').split('\n').map((line, index) => {
                // Skip empty lines
                if (!line.trim()) return <div key={index} className="line">&nbsp;</div>;
                
                // Create a clean copy of the line for manipulation
                let cleanLine = line;
                const indentLevel = line.search(/\S|$/);
                const indent = " ".repeat(indentLevel);
                cleanLine = cleanLine.trimStart();
                
                // Prepare an array of segments to render with appropriate highlighting
                const segments: React.ReactNode[] = [];
                
                // Helper function to safely escape regex special characters
                const escapeRegExp = (string: string): string => {
                  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                };
                
                // Define SQL keywords for highlighting - these will be matched as whole words
                const sqlKeywords = [
                  "CREATE", "TABLE", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", 
                  "INT", "VARCHAR", "TEXT", "BOOLEAN", "TIMESTAMP", "DATETIME", "DATE",
                  "UNIQUE", "NOT NULL", "AUTO_INCREMENT", "DEFAULT", "ON DELETE",
                  "ON UPDATE", "CASCADE", "RESTRICT", "SET NULL", "CONSTRAINT",
                  "ALTER", "ADD", "DROP", "DECIMAL", "ENUM", "SELECT", "FROM", "WHERE",
                  "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "JOIN", "LEFT JOIN",
                  "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "UNION", "INSERT", "UPDATE", "DELETE"
                ];
                
                // Replace SQL keywords with marker for later highlighting
                const keywordPattern = new RegExp(`\\b(${sqlKeywords.map(escapeRegExp).join('|')})\\b`, 'gi');
                cleanLine = cleanLine.replace(keywordPattern, '§k§$1§k§');
                
                // Replace backticked identifiers with marker
                cleanLine = cleanLine.replace(/`([^`]+)`/g, '§i§`$1`§i§');
                
                // Replace punctuation with marker
                cleanLine = cleanLine.replace(/([(),;])/g, '§p§$1§p§');
                
                // Replace numeric literals with marker
                cleanLine = cleanLine.replace(/\b(\d+(?:\.\d+)?)\b/g, '§n§$1§n§');
                
                // Replace string literals with marker
                cleanLine = cleanLine.replace(/'([^']*)'/g, "§s§'$1'§s§");
                
                // Split by markers and rebuild with proper styling
                const parts = cleanLine.split(/§[kpins]§/);
                
                parts.forEach((part, i) => {
                  if (i % 2 === 0) {
                    // Regular text
                    if (part) segments.push(<span key={`${index}-${i}`}>{part}</span>);
                  } else {
                    // Find the marker type that precedes this part
                    let markerType = '';
                    try {
                      // Find the start of the current part in the original string
                      const prevPartEnd = parts.slice(0, i).join('').length;
                      // Find the position of the marker before this part
                      const markerPos = cleanLine.lastIndexOf('§', prevPartEnd) + 1;
                      // Get the marker type (one character after §)
                      markerType = cleanLine.charAt(markerPos);
                    } catch (e) {
                      // If we can't determine the marker type, just use default styling
                      console.warn('Could not determine marker type', e);
                    }
                    
                    switch (markerType) {
                      case 'k':
                        segments.push(<span key={`${index}-${i}`} className="text-pink-400">{part}</span>);
                        break;
                      case 'i':
                        segments.push(<span key={`${index}-${i}`} className="text-green-400">{part}</span>);
                        break;
                      case 'p':
                        segments.push(<span key={`${index}-${i}`} className="text-yellow-300">{part}</span>);
                        break;
                      case 'n':
                        segments.push(<span key={`${index}-${i}`} className="text-blue-300">{part}</span>);
                        break;
                      case 's':
                        segments.push(<span key={`${index}-${i}`} className="text-orange-300">{part}</span>);
                        break;
                      default:
                        segments.push(<span key={`${index}-${i}`}>{part}</span>);
                    }
                  }
                });
                
                return (
                  <div key={index} className="line">
                    {indent}{segments}
                  </div>
                );
              })}
            </pre>
          </div>
        </Modal>
      </div>
    </div>
  );
} 