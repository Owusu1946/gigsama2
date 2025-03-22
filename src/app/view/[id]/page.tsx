'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SchemaDisplay } from '@/components/SchemaDisplay';
import Link from 'next/link';
import { Modal } from '@/components/Modal';

export default function ViewSchemaPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('Shared Schema');
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relationshipView, setRelationshipView] = useState(false);
  
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
  
  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Schema not found. It may have been deleted or the link is incorrect.');
            setIsLoading(false);
            return;
          } else {
            throw new Error('Failed to fetch schema');
          }
        }
        
        const project = await response.json();
        
        setProjectTitle(project.title);
        setSchema(project.schema);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
    
    fetchProject();
  }, [projectId]);
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">KeyMap</h1>
            <Link href="/" className="text-sm text-[color:var(--secondary-text)] hover:underline">
              Create your own schema
            </Link>
          </div>
          
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error: {error}
            <div className="mt-4">
              <Link href="/" className="text-red-700 underline hover:text-red-800">
                Go to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold">KeyMap</h1>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRelationshipView(!relationshipView)}
              className="text-sm flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {relationshipView ? 'Hide Relationships' : 'Show Relationships'}
            </button>
            {schema?.code && (
              <button 
                onClick={() => setShowSqlModal(true)}
                className="bg-[color:var(--foreground)] text-[color:var(--background)] px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View SQL
              </button>
            )}
            <Link href="/" className="text-sm text-[color:var(--secondary-text)] hover:underline">
              Create your own
            </Link>
          </div>
        </div>
        
        {/* Project Title with metadata */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">{projectTitle}</h2>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 text-xs rounded-full">Shared View</span>
          </div>
          
          <div className="flex items-center text-[color:var(--secondary-text)] text-sm gap-4">
            <p>Read-only database schema</p>
            {schema && (
              <p className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {schema.type === 'sql' ? 'SQL Schema' : 'NoSQL Schema'}
              </p>
            )}
            {schema && (
              <p className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'}
              </p>
            )}
          </div>
        </div>
        
        {/* Schema Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
            <h2 className="text-xl font-medium mb-2">Loading schema...</h2>
          </div>
        ) : (
          <>
            <SchemaDisplay 
              isVisible={true} 
              schema={schema} 
              readOnly={true}
              isGenerating={false}
            />
            
            {/* Simple diagram visualization placeholder - this would be replaced with a proper diagram in a real implementation */}
            {relationshipView && schema && schema.tables.length > 0 && (
              <div className="mt-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Schema Relationships</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {schema.tables.map((table: any) => (
                    <div key={table.name} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 min-w-[120px]">
                      <div className="font-medium text-sm mb-2 text-center">{table.name}</div>
                      {table.fields.filter((f: any) => f.isPrimaryKey || f.isForeignKey).map((field: any, i: number) => (
                        <div key={i} className="text-xs flex items-center mb-1">
                          {field.isPrimaryKey && <span className="mr-1 text-yellow-500" title="Primary Key">🔑</span>}
                          {field.isForeignKey && <span className="mr-1 text-blue-500" title="Foreign Key">🔗</span>}
                          {field.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500 mt-4">
                  This is a simplified view of relationships. Primary and foreign keys are highlighted.
                </div>
              </div>
            )}
          </>
        )}
        
        {/* SQL Code Modal */}
        <Modal
          isOpen={showSqlModal}
          onClose={() => setShowSqlModal(false)}
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
              {schema?.code && schema.code.replace(/\\n/g, '\n')}
            </pre>
          </div>
        </Modal>
        
        {/* Footer with additional information */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>This schema was created with KeyMap - AI-Powered Database Schema Designer</p>
          <div className="mt-2">
            <Link href="/" className="text-blue-500 hover:underline">
              Create your own schema for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 