import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  PenTool, 
  Eraser, 
  Minus, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  Download,
  Undo
} from 'lucide-react';

interface WhiteboardModuleProps {
  isHostMode: boolean;
  isOpen: boolean;
  whiteboardData?: string;
  onSyncWhiteboard?: (dataUrl: string) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const COLOR_PALETTE = [
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Orange', hex: '#ea580c' }
];

export default function WhiteboardModule({
  isHostMode,
  isOpen,
  whiteboardData,
  onSyncWhiteboard,
  onToggleFullscreen,
  isFullscreen = false
}: WhiteboardModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#2563eb'); // Default Blue
  const [brushSize, setBrushSize] = useState(4);
  const [activeTool, setActiveTool] = useState<'pen' | 'line' | 'eraser'>('pen');
  const [lineStartPos, setLineStartPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize and resize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const targetWidth = isFullscreen ? window.innerWidth : (container.clientWidth || 800);
      const targetHeight = isFullscreen ? window.innerHeight : (container.clientHeight || 480);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        // Save current drawing if any
        let prevData: string | null = null;
        try {
          prevData = canvas.toDataURL();
        } catch {}

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Background
        ctx.fillStyle = '#0f172a'; // chalkboard dark slate
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Watermark header
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillStyle = '#f97316';
        ctx.fillText('Rakhi Coaching Classes - Interactive Whiteboard', 24, 34);
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Faculty: Arpit Nema | Real-time Board', 24, 54);

        if (prevData) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = prevData;
        } else if (whiteboardData) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = whiteboardData;
        }
      }
    };

    // Initial resize + slight delay for CSS transition
    resizeCanvas();
    const timeout = setTimeout(resizeCanvas, 80);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isOpen, isFullscreen, whiteboardData]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onToggleFullscreen?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  // Listen to browser native fullscreen change
  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement);
      if (!isNativeFs && isFullscreen) {
        onToggleFullscreen?.();
      }
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
  }, [isFullscreen, onToggleFullscreen]);

  // Native fullscreen toggle handler
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !isFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn("Fullscreen toggle notice:", e);
    }
    onToggleFullscreen?.();
  };

  // Sync whiteboard from Firebase for students
  useEffect(() => {
    if (!isHostMode && whiteboardData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = whiteboardData;
    }
  }, [whiteboardData, isHostMode]);

  // Mouse / Touch drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isHostMode) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    if (activeTool === 'line') {
      setLineStartPos({ x, y });
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isHostMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = activeTool === 'eraser' ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeTool === 'eraser' ? '#0f172a' : penColor;

    if (activeTool === 'line' && lineStartPos) {
      // Scale / Ruler straight line drawing
      // redraw previous state + straight line
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (activeTool === 'line' && lineStartPos && e) {
      const { x, y } = getCoordinates(e);
      if (ctx) {
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = penColor;
        ctx.beginPath();
        ctx.moveTo(lineStartPos.x, lineStartPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      setLineStartPos(null);
    }

    if (ctx) ctx.beginPath();

    // Broadcast frame to Firebase
    if (isHostMode && onSyncWhiteboard) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      onSyncWhiteboard(dataUrl);
    }
  };

  // Upload image/question page from gallery
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = Math.min((canvas.width * 0.85) / img.width, (canvas.height * 0.85) / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        if (isHostMode && onSyncWhiteboard) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          onSyncWhiteboard(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Clear Board
  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText('Rakhi Coaching Classes - Interactive Whiteboard', 24, 34);

    if (isHostMode && onSyncWhiteboard) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      onSyncWhiteboard(dataUrl);
    }
  };

  if (!isOpen) return null;

  const whiteboardContent = (
    <div 
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-slate-900 transition-all ${
        isFullscreen 
          ? 'fixed inset-0 z-[999999] w-screen h-screen rounded-none m-0 p-0 shadow-2xl bg-slate-950' 
          : 'rounded-3xl'
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        className={`w-full h-full block ${isHostMode ? 'cursor-crosshair' : 'cursor-default'}`}
      />

      {/* Prominent Exit Fullscreen Button when in Fullscreen */}
      {isFullscreen && (
        <button
          onClick={handleToggleFullscreen}
          className="fixed top-4 left-4 z-[1000000] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-2xl transition-all cursor-pointer border border-white/20 animate-pulse"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Fullscreen (ESC)</span>
        </button>
      )}

      {/* Floating Toolbar for Host / Teacher */}
      {isHostMode && (
        <div className={`absolute top-3 right-3 z-30 flex flex-wrap items-center gap-1.5 bg-black/85 backdrop-blur-md p-2 rounded-2xl border border-stone-700 shadow-2xl max-w-[95%] ${isFullscreen ? 'fixed top-4 right-4 z-[1000000]' : ''}`}>
          
          {/* Colors: Blue, Black, Red, Green, White, Orange */}
          <div className="flex items-center gap-1 pr-1 border-r border-stone-700">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setPenColor(c.hex);
                  if (activeTool === 'eraser') setActiveTool('pen');
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                  penColor === c.hex && activeTool !== 'eraser'
                    ? 'scale-125 border-white shadow-md'
                    : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Color: ${c.name}`}
              />
            ))}
          </div>

          {/* Pen Size Selector (Small, Medium, Large, Extra) */}
          <div className="flex items-center gap-1 px-1 border-r border-stone-700">
            {[
              { size: 2, label: 'S' },
              { size: 5, label: 'M' },
              { size: 10, label: 'L' },
              { size: 18, label: 'XL' }
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setBrushSize(s.size)}
                className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  brushSize === s.size
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
                title={`Brush Size: ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Scale / Ruler Straight Line Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'line' ? 'pen' : 'line')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTool === 'line' ? 'bg-orange-500 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
            title="Scale Ruler / Straight Line Tool"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'eraser' ? 'pen' : 'eraser')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTool === 'eraser' ? 'bg-orange-500 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Gallery Page Uploader */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-xs font-bold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            title="Upload Question Paper / Notes Page from Gallery"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Clear Board */}
          <button
            onClick={clearBoard}
            className="p-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
            title="Clear Whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg text-xs font-bold text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Whiteboard'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-orange-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Student View Controls & Fullscreen Toggle */}
      {!isHostMode && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-[11px] text-stone-300">
          <div className="flex items-center gap-2">
            <PenTool className="w-3.5 h-3.5 text-orange-400" />
            <span>Live Digital Whiteboard (Faculty Arpit Nema Broadcasting)</span>
          </div>
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return isFullscreen ? createPortal(whiteboardContent, document.body) : whiteboardContent;
}
