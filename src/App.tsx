import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Components
import { UniversalNode } from "./components/nodes/UniversalNode";
import { UniversalEdge } from "./components/edges/UniversalEdge";
import { ShipLogPanel } from "./components/panels/ShipLogPanel";
import { EdgePanel } from "./components/panels/EdgePanel";
import { ControlPanel } from "./components/HUD/ControlPanel";

// Hooks and Types
import { useFlowLogic } from "./hooks/useFlowLogic";
import { AppNode, AppEdge, EdgeData } from "./types";

const nodeTypes: NodeTypes = { universal: UniversalNode };
const edgeTypes: EdgeTypes = { "universal-edge": UniversalEdge };

function FlowCanvas() {
  const flow = useFlowLogic();

  // Helpers to find selected objects
  const selectedNode = flow.nodes.find((n: any) => n.id === flow.selectedNodeId) as AppNode | undefined;
  const selectedEdge = flow.edges.find((e: any) => e.id === flow.selectedEdgeId) as AppEdge | undefined;

  return (
    <div className={`w-screen h-screen bg-gray-950 relative overflow-hidden font-sans ${flow.isConnectMode ? 'cursor-crosshair' : ''}`}>
      
      {/* CONTROL PANEL (HUD) */}
      <ControlPanel 
        onAddNode={flow.addNode}
        onToggleConnect={() => {
          flow.setIsConnectMode(!flow.isConnectMode);
          flow.setConnectionSource(null);
          flow.setSelectedNodeId(null);
        }}
        onExport={flow.handleExport}
        onImportClick={flow.handleImportClick}
        onImportFile={flow.handleImportFile}
        fileInputRef={flow.fileInputRef}
        isConnectMode={flow.isConnectMode}
        connectionSource={flow.connectionSource}
      />

      {/* DRAWING AREA */}
      <ReactFlow
        nodes={flow.nodes.map(n => ({
          ...n,
          // Visual logic to highlight nodes during connection mode
          style: flow.isConnectMode && flow.connectionSource === n.id 
            ? { ...n.style, border: '2px solid #3b82f6', boxShadow: '0 0 20px #3b82f6' }
            : flow.isConnectMode 
              ? { ...n.style, cursor: 'crosshair', opacity: 1 }
              : { ...n.style }
        }))}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        
        // Event Handlers from the Hook
        onNodesChange={flow.onNodesChange}
        onEdgesChange={flow.onEdgesChange}
        onNodeDragStart={flow.onNodeDragStart}
        onNodeClick={flow.onNodeClick}
        onEdgeClick={flow.onEdgeClick}
        onPaneClick={flow.onPaneClick}
        
        fitView
        className="bg-gray-950"
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Control"
        nodesConnectable={false} 
      >
        <Background color="#555" gap={25} size={1} />
        <Controls className="bg-slate-800 border-slate-600 fill-white" />
      </ReactFlow>

      {/* EDIT PANELS (Appear if not connecting nodes) */}
      {!flow.isConnectMode && (
        <>
          <ShipLogPanel
            node={(selectedNode as any) || null}
            onClose={() => flow.setSelectedNodeId(null)}
            onUpdate={flow.updateNodeData}
          />
          <EdgePanel
            edge={(selectedEdge as any) || null}
            onClose={() => flow.setSelectedEdgeId(null)}
            onUpdate={(id: string, data: Partial<EdgeData | undefined>) => {
              if (data !== undefined) {
                flow.updateEdgeData(id, data);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

// Principal Wrapper
export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}