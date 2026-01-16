import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { UniversalNode } from "../../types";
import { useResizable } from "../../hooks/useResizable";
import { EditIcon, EyeIcon } from "../../utils/svgIcons";


const COLOR_PRESETS = [
  { color: "#15803d", label: "Probe Green" },
  { color: "#c2410c", label: "Rumor Orange" },
  { color: "#1d4ed8", label: "Nomai Blue" },
  { color: "#7e22ce", label: "Quantum Purple" },
  { color: "#b91c1c", label: "Bramble Red" },
  { color: "#374151", label: "Slate Grey" },
];

const markdownComponents = {
  ul: (props: any) => <ul className="list-disc list-outside ml-6 mb-4 text-gray-300" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-outside ml-6 mb-4 text-gray-300" {...props} />,
  li: (props: any) => <li className="mb-1 pl-1" {...props} />,
  h1: (props: any) => <h1 className="text-2xl font-bold text-orange-400 mb-4 mt-6 border-b border-orange-500/30 pb-2" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-bold text-orange-300 mb-3 mt-5" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-bold text-orange-200 mb-2 mt-4" {...props} />,
  a: (props: any) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-400 my-4 bg-white/5 p-2 rounded-r" {...props} />,
  code: (props: any) => <code className="bg-black/50 text-orange-300 px-1 py-0.5 rounded text-xs font-mono border border-white/10" {...props} />,
};

interface ShipLogPanelProps {
  node: UniversalNode | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<UniversalNode["data"]>) => void;
}

export function ShipLogPanel({ node, onClose, onUpdate }: ShipLogPanelProps) {
  const { height, startResizing, isDragging } = useResizable(400);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [node?.id]);

  if (!node) return null;
  const currentColor = node.data.color || "#15803d";

  return (
    <div 
      className={`absolute bottom-0 left-0 w-full bg-slate-900 border-t-[6px] border-orange-500 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] p-6 text-orange-50 z-50 flex flex-col transition-none font-mono ${isDragging ? 'select-none' : ''}`}
      style={{ height: `${height}px` }}
    >
      <div onMouseDown={startResizing} className="absolute top-0 left-0 w-full h-3 cursor-row-resize z-50 hover:bg-white/10 transition-colors flex justify-center items-start group">
        <div className="w-16 h-1 bg-orange-500/30 rounded-full mt-1 group-hover:bg-orange-500 transition-colors"></div>
      </div>

      {/* --- HEADER --- */}
      <div 
        className={`
          flex justify-between items-start mb-4 mt-2
          ${isEditing ? 'border-b border-orange-500/30 pb-2' : ''} 
        `}
      >
         {/* LEFT SIDE */}
         {isEditing ? (
            <div className="flex flex-col w-full mr-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="text-[10px] text-orange-400 uppercase tracking-[0.2em] mb-1 font-bold">
                  Signal Frequency
                </label>
                <input
                  type="text"
                  className="bg-transparent text-2xl font-bold text-white focus:outline-none focus:bg-white/5 border-b-2 border-transparent focus:border-orange-500 transition-all placeholder-gray-600 w-full font-sans"
                  value={node.data.label}
                  onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                  placeholder="Node name..."
                  autoFocus
                />
            </div>
         ) : (
            <div className="flex-1"></div> 
         )}

         {/* RIGHT SIDE: BUTTONS */}
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`
                flex items-center gap-2 px-3 py-1 rounded border transition-all text-xs tracking-widest uppercase
                ${isEditing 
                  ? "bg-orange-500/20 text-orange-300 border-orange-500" 
                  : "bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-white"
                }
              `}
            >
              {isEditing ? <><EyeIcon /> View</> : <><EditIcon /> Edit</>}
            </button>

            <button onClick={onClose} className="group flex items-center gap-2 px-3 py-1 border border-orange-500/50 rounded hover:bg-orange-500 hover:text-white transition-all text-xs tracking-widest uppercase text-orange-400 ml-2">
              <span className="font-bold group-hover:rotate-90 transition-transform">✕</span>
            </button>
         </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* READ MODE (NO IMAGE) */}
        {!isEditing && (
           <div className="h-full w-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4 pb-10">

              {/* IMAGE (if any) */}            
             <div className="text-gray-300 leading-relaxed text-sm">
                <ReactMarkdown components={markdownComponents}>
                  {node.data.content || "_No data recorded._"}
                </ReactMarkdown>
             </div>
           </div>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="h-full w-full flex flex-col gap-4 animate-in fade-in duration-300">
                
                <div className="flex gap-6 items-end">
                    {/* Colors */}
                    <div>
                      <label className="text-[10px] text-orange-300/60 mb-2 uppercase tracking-widest block">Color</label>
                      <div className="flex items-center gap-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.color}
                            onClick={() => onUpdate(node.id, { color: preset.color })}
                            className={`w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform ${currentColor === preset.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.label}
                          />
                        ))}
                        <div className="w-px h-5 bg-gray-700 mx-1"></div>
                        <div className="relative w-6 h-6">
                           <input type="color" value={currentColor} onChange={(e) => onUpdate(node.id, { color: e.target.value })} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                           <div className="w-6 h-6 rounded border border-gray-600 bg-gradient-to-br from-gray-700 to-black pointer-events-none flex items-center justify-center text-[8px] text-gray-400">+</div>
                        </div>
                      </div>
                    </div>

                    {/* URL */}
                    <div className="flex-1">
                      <label className="text-[10px] text-orange-300/60 mb-1 uppercase tracking-widest block">Image URL</label>
                      <input 
                        type="text" 
                        className="w-full bg-black/40 border border-gray-700 p-2 text-xs focus:outline-none focus:border-orange-500 text-orange-200/80 rounded font-mono placeholder-gray-700"
                        value={node.data.image || ""} 
                        onChange={(e) => onUpdate(node.id, { image: e.target.value })}
                        placeholder="https://..."
                        spellCheck={false}
                      />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest flex justify-between">
                    <span>Content (Markdown)</span>
                    <span className="text-gray-600">Supports **bold**, # titles, - lists</span>
                  </label>
                  <textarea
                    className="flex-1 w-full bg-black/40 border border-gray-700 p-4 text-sm resize-none focus:outline-none focus:border-orange-500 text-gray-300 rounded font-mono custom-scrollbar leading-relaxed"
                    value={node.data.content || ""}
                    onChange={(e) => onUpdate(node.id, { content: e.target.value })}
                    placeholder="Write your discoveries here..."
                    spellCheck={false}
                  />
                </div>
          </div>
        )}

      </div>
    </div>
  );
}