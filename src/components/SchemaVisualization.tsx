'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge,
  NodeTypes,
  Panel,
  NodeMouseHandler,
  EdgeMouseHandler,
  ConnectionLineType,
  MarkerType,
  MiniMap,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Schema, SchemaTable, SchemaField } from '@/lib/db';
import { toPng } from 'html-to-image';

// Define the props for the SchemaVisualization component
interface SchemaVisualizationProps {
  schema: Schema;
  readOnly?: boolean;
  onSchemaChange?: (schema: Schema) => void;
}

// Custom node for tables
const TableNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`px-0 py-0 shadow-md bg-white rounded-md border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[200px] transition-colors duration-200`}>
      <div className={`py-2 px-3 font-medium text-sm ${selected ? 'bg-blue-100' : 'bg-blue-50'} border-b border-gray-200 rounded-t-md flex justify-between items-center`}>
        <span>{data.label.replace(/\\n/g, ' ')}</span>
        {selected && !data.readOnly && (
          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            Draggable
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {data.fields.map((field: any, index: number) => (
          <div key={index} className="flex items-center px-3 py-1.5 text-xs">
            <div className="flex items-center flex-1">
              {field.isPrimaryKey && (
                <span className="mr-1 text-yellow-500" title="Primary Key">🔑</span>
              )}
              {field.isForeignKey && (
                <span className="mr-1 text-blue-500" title="Foreign Key">🔗</span>
              )}
              <span className="font-medium">{field.name.replace(/\\n/g, ' ')}</span>
            </div>
            <div className="text-gray-500 ml-2">{field.type.replace(/\\n/g, ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Register custom node types
const nodeTypes: NodeTypes = {
  tableNode: TableNode,
};

// Main component
export function SchemaVisualization({ schema, readOnly = true, onSchemaChange }: SchemaVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [nodePositions, setNodePositions] = useState<{[key: string]: {x: number, y: number}}>({});

  // Calculate positions for nodes in a grid layout
  const calculateNodePositions = (tables: SchemaTable[]) => {
    const NODE_WIDTH = 250;
    const NODE_HEIGHT = 300;
    const GRID_GAP_X = 400; // Increased horizontal spacing
    const GRID_GAP_Y = 400; // Increased vertical spacing
    const GRID_COLS = Math.ceil(Math.sqrt(tables.length));
    
    return tables.map((table, index) => {
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      
      // Use saved position if available, otherwise use calculated position
      const savedPosition = nodePositions[table.name];
      const position = savedPosition || {
        x: col * GRID_GAP_X + 100, // Increased starting offset
        y: row * GRID_GAP_Y + 100  // Increased starting offset
      };
      
      return {
        id: table.name,
        type: 'tableNode',
        position,
        data: { 
          label: table.name,
          fields: table.fields,
          readOnly,
        },
        style: {
          width: NODE_WIDTH,
          height: Math.min(NODE_HEIGHT, 80 + table.fields.length * 30),
        },
        draggable: !readOnly,
        selected: false,
      };
    });
  };

  // Create edges from relationships
  const createEdgesFromRelationships = (tables: SchemaTable[]) => {
    const edges: Edge[] = [];
    
    // Track tables by name for easier lookup
    const tableMap = tables.reduce((map, table) => {
      map[table.name] = table;
      return map;
    }, {} as Record<string, SchemaTable>);
    
    // First try to create edges based on explicitly defined foreign keys
    tables.forEach(table => {
      table.fields.forEach(field => {
        if (field.isForeignKey && field.references) {
          try {
            console.log(`Creating edge from ${table.name} to ${field.references.table}, field: ${field.name}`);
            
            edges.push({
              id: `${table.name}-${field.name}-to-${field.references.table}-${field.references.field}`,
              source: table.name,
              target: field.references.table,
              type: 'default',
              animated: true,
              style: { 
                strokeWidth: 3,
                stroke: '#ff0000',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: '#ff0000',
              },
              label: field.name,
              labelStyle: { fill: '#000000', fontWeight: 700, fontSize: 12 },
              labelBgStyle: { fill: 'white', fillOpacity: 1 },
              zIndex: 1000,
            });
          } catch (error) {
            console.error('Error creating edge:', error);
          }
        }
      });
    });
    
    // If no edges were created from explicit foreign keys, try to infer them from naming conventions
    if (edges.length === 0) {
      console.log('No explicit foreign keys found. Trying to infer relationships from field names...');
      
      tables.forEach(sourceTable => {
        sourceTable.fields.forEach(field => {
          // Look for field names that follow common foreign key naming patterns
          if (
            (field.name.toLowerCase().includes('_id') || field.name.toLowerCase().endsWith('id')) &&
            !field.isPrimaryKey
          ) {
            const fieldNameWithoutId = field.name.toLowerCase()
              .replace('_id', '')
              .replace('id', '');
            
            // Try to find a matching table
            for (const targetTableName in tableMap) {
              const normalizedTargetName = targetTableName.toLowerCase();
              const isMatch = (
                normalizedTargetName === fieldNameWithoutId ||
                normalizedTargetName === `${fieldNameWithoutId}s` || // Plural form
                (fieldNameWithoutId.length > 2 && normalizedTargetName.includes(fieldNameWithoutId))
              );
              
              if (isMatch && sourceTable.name !== targetTableName) {
                // Find the primary key of the target table, or default to 'id'
                const targetTable = tableMap[targetTableName];
                const targetPrimaryKey = targetTable.fields.find(f => f.isPrimaryKey)?.name || 'id';
                
                console.log(`Inferred relation: ${sourceTable.name}.${field.name} -> ${targetTableName}.${targetPrimaryKey}`);
                
                edges.push({
                  id: `inferred-${sourceTable.name}-${field.name}-to-${targetTableName}-${targetPrimaryKey}`,
                  source: sourceTable.name,
                  target: targetTableName,
                  type: 'default',
                  animated: true,
                  style: { 
                    strokeWidth: 3,
                    stroke: '#ff7700', // Different color for inferred relationships
                    strokeDasharray: '5 5', // Dashed line for inferred relationships
                  },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 25,
                    height: 25,
                    color: '#ff7700',
                  },
                  label: `${field.name} (inferred)`,
                  labelStyle: { fill: '#ff7700', fontWeight: 700, fontSize: 10 },
                  labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
                  zIndex: 999,
                });
                
                // Once we find a match, no need to check other tables
                break;
              }
            }
          }
        });
      });
    }
    
    console.log(`Created ${edges.length} edges (${edges.filter(e => e.id.startsWith('inferred')).length} inferred)`);
    return edges;
  };

  // Save node positions when they change
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position
    }));
  }, []);

  // Initialize nodes and edges when schema changes
  useEffect(() => {
    if (schema && schema.tables) {
      // Debug: Log the schema structure to verify foreign keys are correctly defined
      console.log('Schema tables:', schema.tables);
      
      // Debug: Check for foreign keys
      const foreignKeyFields = schema.tables.flatMap(table => 
        table.fields.filter(field => field.isForeignKey && field.references)
      );
      console.log('Foreign key fields found:', foreignKeyFields);
      
      if (foreignKeyFields.length === 0) {
        console.warn('No foreign key fields with references found. This is why no relationship lines are shown.');
        
        // Attempt to identify potential foreign keys by field naming convention
        const potentialForeignKeys = schema.tables.flatMap(table => 
          table.fields.filter(field => 
            (field.name.toLowerCase().includes('_id') || 
             field.name.toLowerCase().endsWith('id')) && 
            !field.isPrimaryKey
          )
        );
        
        console.log('Potential foreign key fields (based on naming):', potentialForeignKeys);
        
        // Look for matching table names based on field names
        potentialForeignKeys.forEach(field => {
          const fieldNameWithoutId = field.name.toLowerCase().replace('_id', '').replace('id', '');
          const matchingTable = schema.tables.find(t => 
            t.name.toLowerCase() === fieldNameWithoutId || 
            t.name.toLowerCase() === `${fieldNameWithoutId}s` || // Check plural form
            t.name.toLowerCase() === fieldNameWithoutId.replace('_', '')
          );
          
          if (matchingTable) {
            console.log(`Potential relation: Field ${field.name} might reference table ${matchingTable.name}`);
          }
        });
      }
      
      const newNodes = calculateNodePositions(schema.tables);
      const newEdges = createEdgesFromRelationships(schema.tables);
      
      console.log('Created nodes:', newNodes);
      console.log('Created edges:', newEdges);
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [schema, setNodes, setEdges, nodePositions]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(prevSelected => prevSelected?.id === node.id ? null : node);
    
    // Update nodes to reflect selection state
    setNodes(nds => 
      nds.map(n => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  }, [setNodes]);

  // Handle zoom change
  const onMove = (event: any) => {
    if (event.zoom) {
      setZoomLevel(event.zoom);
    }
  };

  // Export schema as SQL script
  const exportAsSQL = () => {
    if (schema?.code) {
      const blob = new Blob([schema.code.replace(/\\n/g, '\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schema.sql';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Export schema as ER diagram in PNG format
  const exportAsPNG = () => {
    const reactFlowContainer = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowContainer) return;

    // Use html-to-image to capture the ReactFlow container
    toPng(reactFlowContainer, { 
      backgroundColor: '#f9fafb',
      quality: 1,
      pixelRatio: 2,
      style: {
        border: 'none'
      }
    })
    .then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'schema-diagram.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error exporting diagram:', error);
      alert('Failed to export diagram. Please try again.');
    });
  };

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg shadow-inner border border-gray-200" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        onMove={onMove}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineType={ConnectionLineType.Straight}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { strokeWidth: 3, stroke: '#ff0000' },
        }}
        minZoom={0.1}
        maxZoom={4}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
      >
        <Background color="#aaa" gap={16} size={1} />
        <Controls showInteractive={true} />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-right" className="bg-white p-2 rounded-md shadow-md">
          <div className="flex space-x-2">
            <button
              onClick={exportAsSQL}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
            >
              Export SQL
            </button>
            <button
              onClick={exportAsPNG}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition-colors"
            >
              Export Diagram
            </button>
            <button
              onClick={() => {
                setNodePositions({});
                setNodes(calculateNodePositions(schema.tables));
                setEdges(createEdgesFromRelationships(schema.tables));
              }}
              className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700 transition-colors"
            >
              Reset Layout
            </button>
          </div>
        </Panel>
        
        {!readOnly && (
          <Panel position="bottom-center" className="bg-white p-2 rounded-t-md shadow-md mb-1">
            <div className="text-xs text-gray-500">
              Click on a table to select it. Drag tables to rearrange them. Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}