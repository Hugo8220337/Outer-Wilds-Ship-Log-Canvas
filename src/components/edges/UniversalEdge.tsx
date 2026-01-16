import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { type UniversalEdge } from "../../types";

export function UniversalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  data,
  selected,
}: EdgeProps<UniversalEdge>) {
  
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Calculate the Midpoint
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Calculate the Angle
  const rad = Math.atan2(targetY - sourceY, targetX - sourceX);
  const deg = rad * (180 / Math.PI);

  const direction = data?.direction || "none";
  
  // --- COLOR AND THICKNESS DEFINITION ---
  const strokeColor = selected ? "#f97316" : "#cbd5e1"; // Orange or Gray
  const arrowColor = selected ? "#f97316" : "#94a3b8";
  
  // Line thickness (3px normal, 5px selected)
  const strokeWidth = selected ? 5 : 3; 

  // --- SPACING CONFIGURATION ---
  const isBidirectional = direction === "bidirectional";
  const gapOffset = isBidirectional ? 6 : 0; // Slightly increased gap to compensate for thickness
  const bgRadius = isBidirectional ? 14 : 9; // Slightly larger background circle

  return (
    <>
      {/* Invisible interaction area (to facilitate clicking) */}
      <path d={edgePath} strokeWidth={25} stroke="transparent" fill="none" className="react-flow__edge-interaction" />

      {/* The Visible Line */}
      <BaseEdge path={edgePath} style={{ ...style, stroke: strokeColor, strokeWidth: strokeWidth }} />

      {/* Draw the Arrow at the Center */}
      {direction !== "none" && (
        <g transform={`translate(${centerX}, ${centerY}) rotate(${deg})`}>
          
        {/* Background Circle to enhance visibility */}
          <circle r={bgRadius} fill="#020617" />

          {/* Arrow Forward ( > ) */}
          {(direction === "forward" || direction === "bidirectional") && (
            <path
              transform={`translate(${gapOffset}, 0)`}
              d="M -4 -6 L 6 0 L -4 6"
              fill="none"
              stroke={arrowColor}
              strokeWidth="3" // arrow thickeness
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Arrow Reverse ( < ) */}
          {(direction === "reverse" || direction === "bidirectional") && (
            <path
              transform={`translate(-${gapOffset}, 0)`}
              d="M 4 -6 L -6 0 L 4 6"
              fill="none"
              stroke={arrowColor}
              strokeWidth="3" // arrow thickness
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      )}
    </>
  );
}