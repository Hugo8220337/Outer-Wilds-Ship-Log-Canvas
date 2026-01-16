import { useState, useCallback, useRef, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useUndoRedo } from "./useUndoRedo";
import { downloadBackup, parseBackupFile } from "../utils/fileSystem";
import { AppNode, AppEdge, NodeData, EdgeData } from "../types";

// Initial Configuration
const initialNodes: AppNode[] = [
  {
    id: "start",
    type: "universal",
    position: { x: 250, y: 100 },
    data: { label: "Landing Site", content: "The ship is intact.", color: "#1d4ed8" },
  },
];

/**
 * Custom hook that acts as the "Brain" of the application.
 * It centralizes all state management for Nodes, Edges, Selection, History, and File I/O.
 * * @description
 * - Manages React Flow nodes and edges state.
 * - Handles the "Connect Mode" logic (clicking two nodes to link them).
 * - Manages Selection state (which node/edge is currently active).
 * - Integrates Undo/Redo history.
 * - Handles JSON Export/Import logic.
 * * @returns {object} An object containing all state variables, setter functions, and event handlers required by the UI and ReactFlow component.
 */
export function useFlowLogic() {
  // --- STATE MANAGEMENT ---
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState<AppEdge>([]);
  const { setViewport, getViewport } = useReactFlow();
  
  // History (Undo/Redo) and Selection State
  const { takeSnapshot, undo, redo } = useUndoRedo(nodes, edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Custom Connection Mode State (Click-to-connect instead of drag)
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);

  // Ref for the invisible HTML file input element used for imports
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---

  /**
   * Adds a new "Universal" node to the canvas.
   * It calculates a random position near the center of the current viewport.
   * Triggers a history snapshot.
   */
  const addNode = useCallback(() => {
    takeSnapshot(nodes, edges);
    const id = Math.random().toString(36).substr(2, 9);
    const zoom = getViewport().zoom || 1;

    // Center the new node on the screen based on current view
    const centerX = -getViewport().x / zoom + 150 + Math.random() * 50;
    const centerY = -getViewport().y / zoom + 150 + Math.random() * 50;

    const newNode: AppNode = {
      id,
      type: "universal",
      position: { x: centerX, y: centerY },
      data: { label: "New Signal", content: "", color: "#c2410c" },
    };
    
    setNodes((nds) => nds.concat(newNode) as AppNode[]);
    
    // Automatically select the new node unless we are busy linking nodes
    if (!isConnectMode) {
      setSelectedNodeId(id);
      setSelectedEdgeId(null);
    }
  }, [nodes, edges, getViewport, isConnectMode, setNodes, takeSnapshot]);

  /**
   * Triggers the download of the current state as a JSON file.
   */
  const handleExport = useCallback(() => {
    downloadBackup(nodes, edges, getViewport());
  }, [nodes, edges, getViewport]);

  /**
   * Simulates a click on the invisible file input to open the OS file dialog.
   */
  const handleImportClick = () => fileInputRef.current?.click();

  /**
   * Handles the file selection event. Parses the JSON and replaces current state.
   * Triggers a history snapshot before overwriting data.
   */
  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    parseBackupFile(file, (data) => {
      takeSnapshot(nodes, edges);
      setNodes(data.nodes);
      setEdges(data.edges);
      if (data.viewport) setViewport(data.viewport);
      alert("Backup carregado!");
    });
    event.target.value = ""; // Reset input so same file can be selected again
  }, [nodes, edges, setNodes, setEdges, setViewport, takeSnapshot]);

  // --- REACT FLOW EVENT HANDLERS ---

  /**
   * React Flow handler for node changes (drag, selection, removal).
   * Snapshots history on removal.
   */
  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    if (changes.some((c) => c.type === 'remove')) takeSnapshot(nodes, edges);
    setNodes((nds) => applyNodeChanges(changes, nds) as AppNode[]);
  }, [nodes, edges, takeSnapshot, setNodes]);

  /**
   * React Flow handler for edge changes.
   * Snapshots history on removal.
   */
  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (changes.some((c) => c.type === 'remove')) takeSnapshot(nodes, edges);
    setEdges((eds) => applyEdgeChanges(changes, eds) as AppEdge[]);
  }, [nodes, edges, takeSnapshot, setEdges]);

  /**
   * Handles node clicks.
   * - If in Connect Mode: Sets source or target to create an edge.
   * - If Normal Mode: Selects the node for the editing panel.
   */
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Logic for "Connect Mode" (Linking two nodes)
    if (isConnectMode) {
      if (!connectionSource) {
        setConnectionSource(node.id); // Step 1: Set Source
      } else {
        if (connectionSource === node.id) {
          setConnectionSource(null); // Clicked same node: Cancel
          return;
        }
        // Step 2: Set Target & Create Edge
        takeSnapshot(nodes, edges);
        const newEdge: AppEdge = {
          id: `e${connectionSource}-${node.id}-${Date.now()}`,
          source: connectionSource,
          target: node.id,
          type: "universal-edge",
          data: { content: "", direction: "none" },
        };
        setEdges((eds) => eds.concat(newEdge));
        setConnectionSource(null);
        setIsConnectMode(false); // Exit mode after connecting
      }
      return;
    }

    // Logic for Normal Mode (Selection)
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, [isConnectMode, connectionSource, nodes, edges, takeSnapshot, setEdges]);

  /**
   * Handles edge clicks. Selects the edge for the Edge Panel.
   */
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  /**
   * Handles clicking on the empty canvas background.
   * Deselects items and cancels connection mode if active.
   */
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    if (isConnectMode) {
      setIsConnectMode(false);
      setConnectionSource(null);
    }
  }, [isConnectMode]);

  // --- DATA UPDATE HELPERS ---

  /** Updates specific data (label, color, content) for a specific Node ID */
  const updateNodeData = (id: string, newData: Partial<NodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n)) as AppNode[]);
  };

  /** Updates specific data (direction, content) for a specific Edge ID */
  const updateEdgeData = (id: string, newData: Partial<EdgeData>) => {
    setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, data: { ...e.data, ...newData } } : e)) as AppEdge[]);
  };

  // --- KEYBOARD LISTENERS ---
  // Handles Undo (Ctrl+Z), Redo (Ctrl+Y), and Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) return;
      
      if (event.key === "Escape" && isConnectMode) {
        setIsConnectMode(false);
        setConnectionSource(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        const state = undo(nodes, edges);
        if (state) { 
          setNodes(state.nodes as AppNode[]); 
          setEdges((state.edges as AppEdge[]) as any); 
        }
      }
      if (((event.ctrlKey || event.metaKey) && event.key === "y") || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "z")) {
        event.preventDefault();
        const state = redo(nodes, edges);
        if (state) { 
          setNodes(state.nodes as AppNode[]); 
          setEdges((state.edges as AppEdge[]) as any); 
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, nodes, edges, isConnectMode, setNodes, setEdges]);

  // --- RETURN OBJECT ---
  return {
    // === Data States ===
    /** Array of all nodes currently on the canvas */
    nodes, 
    /** Array of all edges (connections) currently on the canvas */
    edges, 
    /** ID of the currently selected Node (for the ShipLogPanel), or null */
    selectedNodeId, 
    /** ID of the currently selected Edge (for the EdgePanel), or null */
    selectedEdgeId, 
    
    // === Interaction States ===
    /** Boolean: Are we currently waiting for the user to click nodes to connect them? */
    isConnectMode, 
    /** ID of the first node clicked during connection mode (the source), or null */
    connectionSource, 
    /** React Ref to be attached to the hidden <input type="file"> element */
    fileInputRef, 
    
    // === State Setters ===
    /** Direct setter for nodes array */
    setNodes, 
    /** Direct setter for edges array */
    setEdges, 
    /** Helper to select a node manually */
    setSelectedNodeId, 
    /** Helper to select an edge manually */
    setSelectedEdgeId, 
    /** Helper to toggle connection mode */
    setIsConnectMode, 
    /** Helper to set connection source manually */
    setConnectionSource, 
    
    // === High Level Actions ===
    /** Creates a new node at center of screen */
    addNode, 
    /** Triggers JSON download */
    handleExport, 
    /** Triggers file dialog */
    handleImportClick, 
    /** Processes the selected file */
    handleImportFile, 
    /** Helper to update a Node's data object */
    updateNodeData, 
    /** Helper to update an Edge's data object */
    updateEdgeData,

    // === React Flow Event Handlers (Attach these to <ReactFlow />) ===
    onNodesChange, 
    onEdgesChange, 
    onNodeClick, 
    onEdgeClick, 
    onPaneClick, 
    /** Callback to snapshot history when user starts dragging a node */
    onNodeDragStart: () => takeSnapshot(nodes, edges),
  };
}