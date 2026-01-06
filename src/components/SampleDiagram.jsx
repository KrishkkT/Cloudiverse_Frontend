import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

/**
 * SAMPLE DIAGRAM FOR LANDING PAGE
 * Shows a pre-configured serverless web app architecture
 */

const CATEGORY_COLORS = {
  client: { bg: '#4B5563', border: '#9CA3AF' },
  network: { bg: '#1E40AF', border: '#3B82F6' },
  compute: { bg: '#7C3AED', border: '#A78BFA' },
  database: { bg: '#059669', border: '#10B981' },
  storage: { bg: '#DC2626', border: '#EF4444' },
  security: { bg: '#EA580C', border: '#F97316' },
};

const SERVICE_ICONS = {
  client: '👥',
  cdn: '🌐',
  api_gateway: '🚪',
  serverless_compute: '⚡',
  relational_database: '🗄️',
  object_storage: '📁',
  identity_auth: '🔐',
  cache: '⚡',
};

// Sample architecture data (Serverless Web App)
const sampleArchitecture = {
  nodes: [
    { id: 'client', label: 'Users', type: 'client', category: 'client' },
    { id: 'cdn', label: 'CDN', type: 'cdn', category: 'network' },
    { id: 'api_gateway', label: 'API Gateway', type: 'api_gateway', category: 'network' },
    { id: 'serverless_compute', label: 'Lambda Functions', type: 'serverless_compute', category: 'compute' },
    { id: 'relational_database', label: 'RDS Database', type: 'relational_database', category: 'database' },
    { id: 'object_storage', label: 'S3 Storage', type: 'object_storage', category: 'storage' },
    { id: 'identity_auth', label: 'Cognito Auth', type: 'identity_auth', category: 'security' },
    { id: 'cache', label: 'ElastiCache', type: 'cache', category: 'database' },
  ],
  edges: [
    { from: 'client', to: 'cdn', label: 'requests' },
    { from: 'cdn', to: 'api_gateway', label: 'routes' },
    { from: 'api_gateway', to: 'serverless_compute', label: 'invokes' },
    { from: 'serverless_compute', to: 'relational_database', label: 'reads/writes' },
    { from: 'serverless_compute', to: 'cache', label: 'caches' },
    { from: 'serverless_compute', to: 'object_storage', label: 'stores' },
    { from: 'serverless_compute', to: 'identity_auth', label: 'authenticates' },
  ],
};

function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 120,
    marginx: 30,
    marginy: 30
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 70 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 35,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

const SampleDiagram = () => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes = sampleArchitecture.nodes.map((node) => {
      const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.client;
      const icon = SERVICE_ICONS[node.type] || '☁️';

      return {
        id: node.id,
        type: 'default',
        data: {
          label: (
            <div className="flex flex-col items-center justify-center space-y-1 p-2">
              <div className="text-xl">{icon}</div>
              <div className="text-[10px] font-bold text-center leading-tight text-white">
                {node.label}
              </div>
            </div>
          ),
        },
        position: { x: 0, y: 0 },
        style: {
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: '10px',
          padding: '6px',
          width: 180,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${colors.border}40`,
        },
        draggable: false,
      };
    });

    const edges = sampleArchitecture.edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6B7280', strokeWidth: 2 },
      labelStyle: { fill: '#9CA3AF', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#1F2937', fillOpacity: 0.8 },
    }));

    return { nodes, edges };
  }, []);

  const { nodes, edges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  return (
    <div className="w-full h-[500px] bg-[#0F172A] rounded-xl border border-white/10 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls 
          showInteractive={false}
          style={{
            background: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default SampleDiagram;
