import { useState, useCallback } from 'react';
import { type Node, type Edge } from '@xyflow/react';

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

/**
 * Personalized Hook to manage Undo and Redo functionality for nodes and edges.
 * @param initialNodes   Initial set of nodes
 * @param initialEdges   Initial set of edges
 * @returns  Functions and states to handle undo/redo operations
 */
export function useUndoRedo(initialNodes: Node[], initialEdges: Edge[]) {
  // History stacks
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  // Function to save the CURRENT state in the past before making a change
  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast((oldPast) => {
      // Limits the history to 50 steps to avoid memory bloat
      const newPast = [...oldPast, { nodes, edges }];
      return newPast.slice(-50);
    });
    setFuture([]); // If a new action is made, the "future" of Redo is cleared
  }, []);

  // Undo Logic (Ctrl+Z)
  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast((oldPast) => {
      if (oldPast.length === 0) return oldPast; // Nothing to undo

      const previousState = oldPast[oldPast.length - 1];
      const newPast = oldPast.slice(0, oldPast.length - 1);

      // Save the current state in the future (to enable Redo)
      setFuture((oldFuture) => [{ nodes: currentNodes, edges: currentEdges }, ...oldFuture]);

      return newPast;
    });

    // Returns the state that should be restored (or null if none)
    if (past.length > 0) {
      return past[past.length - 1];
    }
    return null;
  }, [past]);

  // Redo Logic (Ctrl+Y or Ctrl+Shift+Z)
  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setFuture((oldFuture) => {
      if (oldFuture.length === 0) return oldFuture;

      const nextState = oldFuture[0];
      const newFuture = oldFuture.slice(1);

      // Save the current state in the past (to enable Undo)
      setPast((oldPast) => [...oldPast, { nodes: currentNodes, edges: currentEdges }]);

      return newFuture;
    });

    if (future.length > 0) {
      return future[0];
    }
    return null;
  }, [future]);

  return {
    // Function to capture the current state before changes
    takeSnapshot,

    // Undo/Redo functions and states
    undo,

    // Redo function
    redo,

    // States to check if undo/redo is possible
    canUndo: past.length > 0,

    // State to check if redo is possible
    canRedo: future.length > 0,
  };
}