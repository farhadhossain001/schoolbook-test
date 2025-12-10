import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { MOCK_BOOKS, getProxiedPdfUrl, getEmbedUrl } from '../constants';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Maximize,
  Minimize,
  AlertCircle,
  FileText
} from 'lucide-react';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const PdfViewer: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  // Book Data
  const book = MOCK_BOOKS.find(b => b.id === bookId);
  const proxiedUrl = book ? getProxiedPdfUrl(book.pdfUrl) : null;
  const embedUrl = book ? getEmbedUrl(book.pdfUrl) : null;

  // View Mode
  const [viewMode, setViewMode] = useState<'custom' | 'drive'>('custom');

  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0); // 1.0 = Fit Width (relative to container)
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(window.innerWidth);
  const prevContainerWidth = useRef<number>(0);

  // Pinch Zoom State
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ dist: number; scale: number } | null>(null);

  // Calculate available width for "Fit to Screen"
  // Optimized to avoid unnecessary re-renders on mobile scroll (address bar hide/show)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const currentWidth = containerRef.current.clientWidth;
        // Only update if width actually changed (ignores vertical resizing from mobile URL bar)
        if (Math.abs(currentWidth - prevContainerWidth.current) > 10) {
            const padding = window.innerWidth < 640 ? 32 : 64;
            const newWidth = currentWidth - padding;
            setPdfWidth(newWidth);
            prevContainerWidth.current = currentWidth;
        }
      }
    };
    
    // Initial measure
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("PDF Load Error:", err);
    setIsLoading(false);
    setError("এই বইটি কাস্টম রিডারে লোড করা যাচ্ছে না। দয়া করে ড্রাইভ ভিউয়ার ব্যবহার করুন।");
  };

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // --- Smooth Pinch-to-Zoom Logic ---
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, scale };
    } else {
      // Safety: Ensure we don't track single touches as zoom starts
      touchStartRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current && contentRef.current) {
      // Prevent default to stop browser native zoom/scroll behavior
      e.preventDefault(); 
      
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const ratio = dist / touchStartRef.current.dist;
      // Visually scale instantly using CSS
      contentRef.current.style.transform = `scale(${ratio})`;
      contentRef.current.style.transformOrigin = 'center top';
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current && contentRef.current) {
      // Calculate final scale from the CSS transform
      const transform = contentRef.current.style.transform;
      const match = transform.match(/scale\((.*?)\)/);
      const ratio = match ? parseFloat(match[1]) : 1;

      // Reset CSS
      contentRef.current.style.transform = 'none';
      contentRef.current.style.transition = 'transform 0.2s ease-out';
      
      // Update actual PDF scale (Resolution)
      const newScale = touchStartRef.current.scale * ratio;
      // Clamp scale: Minimum 1.0 (Fit Width), Max 4.0
      setScale(Math.min(Math.max(1.0, newScale), 4.0));
      
      touchStartRef.current = null;
    }
  };

  // Zoom Button Handlers
  const handleZoomIn = () => setScale(s => Math.min(4, s + 0.25));
  const handleZoomOut = () => setScale(s => Math.max(1, s - 0.25));

  if (!book) return null;

  // --- Render: Drive Fallback ---
  if (viewMode === 'drive') {
    return (
      <div className={`fixed inset-0 z-[100] bg-slate-900 flex flex-col ${isFullscreen ? 'h-screen' : ''}`}>
        <div className="bg-slate-800/90 backdrop-blur-md text-white px-4 py-3 flex items-center justify-between border-b border-slate-700/50 shadow-lg z-20">
          <div className="flex items-center gap-4 max-w-[70%]">
            <button onClick={() => navigate(`/book/${bookId}`)} className="p-2.5 hover:bg-slate-700/80 rounded-full flex items-center gap-2">
              <ArrowLeft size={20} className="text-slate-300" />
            </button>
            <span className="font-bold text-sm text-slate-100 truncate">{book.title}</span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setViewMode('custom')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold">
               <FileText size={14} /> Custom Reader
             </button>
             <button onClick={toggleFullscreen} className="p-2 bg-slate-800 rounded-lg">
               {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
             </button>
          </div>
        </div>
        <div className="flex-1 bg-black relative">
           <iframe src={embedUrl || ''} className="w-full h-full border-none" allow="autoplay; fullscreen" title="Drive Viewer" />
        </div>
      </div>
    );
  }

  // --- Render: Custom Reader ---
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 shadow-md z-20">
        <div className="flex items-center gap-3 w-1/3">
          <button onClick={() => navigate(`/book/${bookId}`)} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={20} className="text-slate-300 hover:text-white" />
          </button>
          <h1 className="hidden md:block font-bold text-sm text-slate-200 truncate">{book.title}</h1>
        </div>

        <div className="flex items-center justify-center gap-2 w-1/3">
          <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ZoomOut size={18} /></button>
          <span className="text-xs font-mono min-w-[3ch] text-center text-slate-400">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ZoomIn size={18} /></button>
          <div className="w-px h-4 bg-slate-700 mx-1 hidden sm:block"></div>
          <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg hidden sm:block"><RotateCw size={18} /></button>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/3">
           <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
             {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 bg-slate-900 overflow-auto relative flex justify-center p-4 sm:p-8 no-scrollbar"
        ref={containerRef}
        // touch-action: pan-x pan-y allows browser scrolling but DISABLES browser gestures (like pinch zoom)
        // so our manual JS pinch logic works without conflict, and single finger just scrolls.
        style={{ touchAction: 'pan-x pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd} // Handle interruption
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">বইটি লোড করা হচ্ছে...</p>
          </div>
        )}

        {error && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 px-4 text-center">
              <AlertCircle size={48} className="text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">সমস্যা হয়েছে</h3>
              <p className="max-w-md mb-6">{error}</p>
              <button onClick={() => setViewMode('drive')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">
                ড্রাইভ ভিউয়ারে খুলুন
              </button>
           </div>
        )}

        {!error && proxiedUrl && (
          <div 
            ref={contentRef}
            className="shadow-2xl shadow-black/50 origin-top transition-transform duration-75 ease-out"
            // Important: This div wraps the Document to allow CSS transforms
          >
             <Document
                file={proxiedUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="flex flex-col gap-4"
             >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  rotate={rotation}
                  width={pdfWidth} // Force fit to container width
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  className="bg-white shadow-lg"
                  loading={null}
                />
             </Document>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-30">
        <button 
          disabled={pageNumber <= 1} 
          onClick={() => changePage(-1)}
          className="p-1.5 rounded-full hover:bg-slate-700 disabled:opacity-30 text-white"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2 text-sm font-mono text-white">
           <span className="font-bold">{pageNumber}</span>
           <span className="text-slate-400">/</span>
           <span>{numPages || '--'}</span>
        </div>

        <button 
          disabled={numPages === null || pageNumber >= numPages} 
          onClick={() => changePage(1)}
          className="p-1.5 rounded-full hover:bg-slate-700 disabled:opacity-30 text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;