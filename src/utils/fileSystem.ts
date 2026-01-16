import { AppNode, AppEdge } from "../types";
import { Viewport } from "@xyflow/react";

/**
 * Downloads the current flow state as a JSON backup file.
 * @param nodes The array of nodes in the flow.
 * @param edges The array of edges in the flow.
 * @param viewport The current viewport state.
 */
export const downloadBackup = (nodes: AppNode[], edges: AppEdge[], viewport: Viewport) => {
  const flowData = { nodes, edges, viewport, version: "1.0.0" };
  const jsonString = JSON.stringify(flowData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ship-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parses a backup JSON file and invokes the callback with the parsed data.
 * @param file  The backup file to parse.
 * @param onSuccess Callback invoked with parsed nodes and edges upon successful parsing.
 */
export const parseBackupFile = (
  file: File, 
  onSuccess: (data: { nodes: AppNode[], edges: AppEdge[], viewport?: Viewport }) => void
) => {
  const fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      if (!content) return;
      const flowData = JSON.parse(content);
      
      if (flowData.nodes && flowData.edges) {
        onSuccess(flowData);
      } else {
        alert("Ficheiro inválido ou corrompido.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao ler ficheiro.");
    }
  };
};