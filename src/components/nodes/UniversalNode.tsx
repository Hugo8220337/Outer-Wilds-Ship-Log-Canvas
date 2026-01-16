import { Handle, Position, NodeProps } from "@xyflow/react";
import { type UniversalNode } from "../../types";
import { CuteQuestionMark } from "../../utils/svgIcons";

export function UniversalNode({ data, selected }: NodeProps<UniversalNode>) {
  const bgColor = data.color || "#15803d"; 
  const hasImage = data.image && data.image.trim() !== "";

  // Style to hide the handles in the center
  const hiddenHandleStyle = {
    opacity: 0,
    width: 1,
    height: 1,
    // Force absolute center, ignoring ReactFlow's default positioning
    position: 'absolute' as const, 
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    background: 'transparent',
    pointerEvents: 'none' as const, 
  };

  return (
    <div 
      className={`
        flex flex-col w-[120px] min-h-[150px] p-2 rounded-lg shadow-lg 
        transition-all duration-200 group border border-white/10 relative
        ${selected ? 'ring-4 ring-orange-500 scale-105 z-50' : 'hover:scale-105 hover:ring-2 hover:ring-white/30'}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {/* TECHNICAL HANDLES (Invisible in the center) */}
      {/* We use Position.Top as a placeholder, but the style forces the center */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target" 
        style={hiddenHandleStyle} 
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source" 
        style={hiddenHandleStyle} 
      />

      {/* --- VISUAL CONTENT --- */}
      <div className="mb-2 min-h-[30px] flex items-center justify-center pointer-events-none">
        <h1 className="text-xs font-bold text-center leading-tight text-white drop-shadow-md break-words">
          {data.label}
        </h1>
      </div>

      <div className="w-full h-[90px] relative rounded overflow-hidden bg-black/30 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors pointer-events-none">
        {hasImage ? (
           <img 
             src={data.image} 
             alt={data.label} 
             className="w-full h-full object-cover"
             onError={(e) => {
               (e.target as HTMLImageElement).style.display = 'none';
               (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
             }}
           />
        ) : (
           <div className="flex items-center justify-center w-full h-full">
            <CuteQuestionMark />
           </div>
        )}
        <div className="hidden absolute inset-0 flex items-center justify-center w-full h-full bg-black/30">
           <CuteQuestionMark />
        </div>
      </div>
    </div>
  );
}