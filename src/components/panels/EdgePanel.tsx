import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { UniversalEdge, EdgeDirection } from "../../types";
import { useResizable } from "../../hooks/useResizable";
import { EditIcon, EyeIcon } from "../../utils/svgIcons";

// --- MARKDOWN STYLES (BLUE THEME) ---
const markdownComponents = {
  ul: (props: any) => <ul className="list-disc list-outside ml-6 mb-4 text-gray-300" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-outside ml-6 mb-4 text-gray-300" {...props} />,
  li: (props: any) => <li className="mb-1 pl-1" {...props} />,
  h1: (props: any) => <h1 className="text-xl font-bold text-blue-400 mb-3 mt-4 border-b border-blue-500/30 pb-2" {...props} />,
  h2: (props: any) => <h2 className="text-lg font-bold text-blue-300 mb-2 mt-3" {...props} />,
  a: (props: any) => <a className="text-blue-400 hover:text-blue-200 underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4 bg-white/5 p-2 rounded-r" {...props} />,
  code: (props: any) => <code className="bg-black/50 text-blue-300 px-1 py-0.5 rounded text-xs font-mono border border-white/10" {...props} />,
};

interface EdgePanelProps {
  edge: UniversalEdge | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<UniversalEdge["data"]>) => void;
}

export function EdgePanel({ edge, onClose, onUpdate }: EdgePanelProps) {
  const { height, startResizing, isDragging } = useResizable(300);
  const [isEditing, setIsEditing] = useState(false);

  // Reset to view mode when switching edges
  useEffect(() => {
    setIsEditing(false);
  }, [edge?.id]);

  if (!edge) return null;
  const currentDir = edge.data?.direction || "none";

  const setDirection = (dir: EdgeDirection) => { onUpdate(edge.id, { direction: dir }); };
  
  // Updated direction button styles for blue theme
  const getBtnStyle = (dir: EdgeDirection) => `
    flex-1 py-2 px-1 rounded border text-xs font-bold transition-all uppercase 
    ${currentDir === dir 
      ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
      : "bg-black/30 text-gray-500 border-gray-700 hover:bg-white/5 hover:text-gray-300"
    }
  `;

  return (
    <div 
      className={`absolute bottom-0 left-0 w-full bg-slate-900 border-t-[6px] border-blue-500 shadow-[0_-5px_30px_rgba(0,0,0,0.8)] p-6 text-white z-50 flex flex-col transition-none font-mono ${isDragging ? 'select-none' : ''}`}
      style={{ height: `${height}px` }}
    >
      
      {/* --- DRAG HANDLE --- */}
      <div 
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-full h-3 cursor-row-resize z-50 hover:bg-white/10 transition-colors flex justify-center items-start group"
      >
        <div className="w-16 h-1 bg-blue-500/30 rounded-full mt-1 group-hover:bg-blue-500 transition-colors"></div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-4 mt-2 border-b border-blue-500/30 pb-2">
        <h2 className="text-blue-400 text-sm uppercase tracking-[0.2em] font-bold">
          &lt; Edge Analysis &gt;
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Toggle View/Edit */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`
              flex items-center gap-2 px-3 py-1 rounded border transition-all text-xs tracking-widest uppercase
              ${isEditing 
                ? "bg-blue-500/20 text-blue-300 border-blue-500" 
                : "bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-white"
              }
            `}
          >
            {isEditing ? <><EyeIcon /> View</> : <><EditIcon /> Edit</>}
          </button>

          <button onClick={onClose} className="group flex items-center gap-2 px-3 py-1 border border-blue-500/50 rounded hover:bg-blue-500 hover:text-white transition-all text-xs tracking-widest uppercase text-blue-400 ml-2">
            <span className="font-bold group-hover:rotate-90 transition-transform">✕</span>
          </button>
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="flex-1 overflow-hidden relative">

        {/* === READ MODE (MARKDOWN) === */}
        {!isEditing && (
          <div className="h-full w-full overflow-y-auto custom-scrollbar pr-4 pb-10">
            <div className="text-gray-300 leading-relaxed text-sm">
               <ReactMarkdown components={markdownComponents}>
                 {edge.data?.content || "_No connection data recorded._"}
               </ReactMarkdown>
            </div>
          </div>
        )}

        {/* === EDIT MODE (CONTROLS) === */}
        {isEditing && (
          <div className="flex gap-8 h-full animate-in fade-in duration-300">
            
            {/* Column 1: Direction Controls */}
            <div className="w-1/4 flex flex-col gap-4 border-r border-gray-800 pr-6">
               <label className="text-[10px] text-blue-500/70 uppercase tracking-widest font-bold">Flow Direction</label>
               <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                    <button onClick={() => setDirection("none")} className={getBtnStyle("none")} title="No direction">Line</button>
                    <button onClick={() => setDirection("forward")} className={getBtnStyle("forward")} title="Source -> Target">&rarr;</button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setDirection("reverse")} className={getBtnStyle("reverse")} title="Target -> Source">&larr;</button>
                    <button onClick={() => setDirection("bidirectional")} className={getBtnStyle("bidirectional")} title="Bidirectional">&larr;&rarr;</button>
                 </div>
               </div>
               <div className="mt-auto p-3 bg-blue-900/10 rounded border border-blue-900/30 text-[10px] text-blue-300/60 leading-relaxed">
                  Define the causality between nodes. Arrows adjust automatically in the diagram.
               </div>
            </div>

            {/* Column 2: Markdown Editor */}
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest flex justify-between">
                 <span>Relationship Description (Markdown)</span>
              </label>
              <textarea
                className="flex-1 bg-black/50 border border-blue-900/50 p-4 text-sm resize-none focus:outline-none focus:border-blue-500 text-blue-100 rounded font-mono leading-relaxed placeholder-blue-900/50 custom-scrollbar"
                value={edge.data?.content || ""}
                onChange={(e) => onUpdate(edge.id, { content: e.target.value })}
                placeholder="Explain how these two points connect..."
                spellCheck={false}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}