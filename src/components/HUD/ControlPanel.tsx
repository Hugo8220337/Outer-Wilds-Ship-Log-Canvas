import React, { RefObject } from "react";

interface ControlPanelProps {
  onAddNode: () => void;
  onToggleConnect: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isConnectMode: boolean;
  connectionSource: string | null;
}

export function ControlPanel({
  onAddNode,
  onToggleConnect,
  onExport,
  onImportClick,
  onImportFile,
  fileInputRef,
  isConnectMode,
  connectionSource,
}: ControlPanelProps) {
  return (
    <div className="absolute top-5 right-5 z-10 flex flex-col gap-3 items-end pointer-events-auto">
      <div className="flex gap-2">
        {/* BUTTON CONNECT */}
        <button
          onClick={onToggleConnect}
          className={`
            font-bold py-2 px-4 rounded shadow-lg transition-all uppercase text-xs border tracking-widest flex items-center gap-2
            ${isConnectMode
              ? "bg-blue-600 text-white border-blue-400 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.6)]"
              : "bg-slate-800 text-gray-300 border-gray-600 hover:bg-slate-700 hover:border-white"
            }
          `}
        >
          <span>🔗</span> {isConnectMode ? "Cancel" : "Connect"}
        </button>

        {/* BUTTON ADD */}
        <button
          onClick={onAddNode}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all uppercase text-xs border border-orange-300 tracking-widest"
        >
          + Signal
        </button>
      </div>

      {isConnectMode && (
        <div className="bg-blue-900/80 border border-blue-400/50 text-blue-100 p-3 rounded shadow-lg text-xs animate-in fade-in slide-in-from-top-2">
          {!connectionSource ? "Select the SOURCE..." : "Select the DESTINATION..."}
        </div>
      )}

      {/* EXPORT / IMPORT */}
      <div className="flex gap-2">
        <button
          onClick={onExport}
          className="bg-slate-800 hover:bg-slate-700 text-blue-300 py-1 px-3 rounded border border-blue-500/30 text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1"
        >
          <span>💾</span> Export
        </button>
        <button
          onClick={onImportClick}
          className="bg-slate-800 hover:bg-slate-700 text-blue-300 py-1 px-3 rounded border border-blue-500/30 text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1"
        >
          <span>📂</span> Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportFile}
          className="hidden"
          accept=".json"
        />
      </div>
    </div>
  );
}