import type { Node, BuiltInNode, Edge, BuiltInEdge } from "@xyflow/react";

// --- NODES ---
export type NodeData = {
  label: string;
  content?: string;
  image?: string;
  color?: string;
};
export type UniversalNode = Node<NodeData, "universal">;
export type AppNode = BuiltInNode | UniversalNode;

// --- EDGES ---
export type EdgeDirection = "none" | "forward" | "reverse" | "bidirectional";

export type EdgeData = {
  content?: string; 
  direction?: EdgeDirection;
};
export type UniversalEdge = Edge<EdgeData, "universal-edge">;
export type AppEdge = BuiltInEdge | UniversalEdge;