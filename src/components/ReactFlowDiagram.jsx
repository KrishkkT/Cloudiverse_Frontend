import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

/**
 * REACT FLOW ARCHITECTURE DIAGRAM
 * 
 * Professional graph-based diagram using React Flow + Dagre auto-layout
 * - Interactive pan/zoom
 * - Deterministic layout from canonical services
 * - Clean PNG export
 * - Industry-standard approach
 */

// Category-based color schemes
const CATEGORY_COLORS = {
  client: { bg: '#4B5563', border: '#9CA3AF', text: '#F9FAFB' },
  network: { bg: '#1E40AF', border: '#3B82F6', text: '#DBEAFE' },
  compute: { bg: '#7C3AED', border: '#A78BFA', text: '#EDE9FE' },
  database: { bg: '#059669', border: '#10B981', text: '#D1FAE5' },
  storage: { bg: '#DC2626', border: '#EF4444', text: '#FEE2E2' },
  security: { bg: '#EA580C', border: '#F97316', text: '#FFEDD5' },
  messaging: { bg: '#DB2777', border: '#EC4899', text: '#FCE7F3' },
  observability: { bg: '#0891B2', border: '#06B6D4', text: '#CFFAFE' },
  integration: { bg: '#65A30D', border: '#84CC16', text: '#ECFCCB' },
  other: { bg: '#6B7280', border: '#9CA3AF', text: '#F3F4F6' }
};

// Service icons mapping
const SERVICE_ICONS = {
  client: '👥',
  cdn: '🌐',
  load_balancer: '⚖️',
  api_gateway: '🚪',
  websocket_gateway: '🔌',
  app_compute: '⚙️',
  serverless_compute: '⚡',
  compute_container: '📦',
  compute_vm: '🖥️',
  batch_compute: '📊',
  ml_inference_service: '🤖',
  relational_database: '🗄️',
  nosql_database: '📑',
  analytical_database: '📈',
  cache: '⚡',
  object_storage: '📁',
  block_storage: '💾',
  identity_auth: '🔐',
  message_queue: '📬',
  messaging_queue: '📬',
  event_bus: '🚌',
  logging: '📝',
  monitoring: '📊',
  payment_gateway: '💳',
  push_notification_service: '🔔',
  secrets_management: '🔑',
  networking: '🔗'
};

/**
 * Apply Dagre auto-layout algorithm
 * This eliminates manual positioning math
 */
function getLayoutedElements(nodes, edges, direction = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // LR = Left to Right, TB = Top to Bottom
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,  // Horizontal spacing
    ranksep: 150,  // Vertical spacing
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
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
        x: nodeWithPosition.x - 100, // Center the node
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Convert backend architecture data to React Flow format
 */
function convertToReactFlowFormat(architectureData) {
  if (!architectureData?.architecture) {
    return { nodes: [], edges: [] };
  }

  const { nodes: rawNodes = [], edges: rawEdges = [] } = architectureData.architecture;

  // Convert nodes
  const nodes = rawNodes.map((node) => {
    const category = node.category || 'other';
    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
    const icon = SERVICE_ICONS[node.type] || '☁️';

    return {
      id: node.id,
      type: 'default',
      data: {
        label: (
          <div className="flex flex-col items-center justify-center space-y-1 p-3">
            <div className="text-2xl">{icon}</div>
            <div className="text-xs font-bold text-center leading-tight" style={{ color: colors.text }}>
              {node.label}
            </div>
            {node.role && (
              <div className="text-[9px] opacity-70 italic" style={{ color: colors.text }}>
                {node.role.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        ),
      },
      position: { x: 0, y: 0 }, // Will be set by Dagre
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '8px',
        width: 200,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px ${colors.border}40`,
      },
      draggable: false, // Lock nodes (users shouldn't break layout)
    };
  });

  // Convert edges
  const edges = rawEdges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.label || '',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6B7280', strokeWidth: 2 },
    labelStyle: { fill: '#9CA3AF', fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: '#1F2937', fillOpacity: 0.8 },
  }));

  return { nodes, edges };
}

const ReactFlowDiagram = ({ architectureData, provider, pattern }) => {
  // 🔥 FIX: Include provider in dependency so diagram updates when provider changes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertToReactFlowFormat(architectureData),
    [architectureData, provider]  // Provider change triggers re-render
  );

  // Apply Dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Download diagram as PNG
  const downloadDiagram = useCallback(() => {
    const diagramElement = document.querySelector('.react-flow');
    if (!diagramElement) {
      console.error('Diagram element not found');
      return;
    }

    toPng(diagramElement, {
      backgroundColor: '#0F172A',
      width: diagramElement.offsetWidth,
      height: diagramElement.offsetHeight,
      style: {
        width: `${diagramElement.offsetWidth}px`,
        height: `${diagramElement.offsetHeight}px`,
      },
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `architecture-${provider}-${pattern}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export diagram:', err);
        alert('Failed to export diagram. Please try again.');
      });
  }, [provider, pattern]);

  if (nodes.length === 0) {
    return (
      <div className="bg-black/20 rounded-xl p-12 min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-icons text-gray-500 text-6xl">cloud_off</span>
          <p className="text-gray-400 text-lg">No architecture data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={downloadDiagram}
          className="px-4 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center space-x-2 text-sm font-semibold"
        >
          <span className="material-icons text-lg">download</span>
          <span>Download PNG</span>
        </button>
      </div>

      {/* React Flow Diagram */}
      <div className="bg-[#0F172A] rounded-xl border border-white/10 overflow-hidden" style={{ height: '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          preventScrolling
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
          <MiniMap
            nodeColor={(node) => {
              const style = node.style || {};
              return style.background || '#6B7280';
            }}
            maskColor="#0F172A99"
            style={{
              background: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Categories</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
            <div key={category} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ background: colors.bg, border: `2px solid ${colors.border}` }}
              />
              <span className="text-xs text-gray-300 capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactFlowDiagram;
