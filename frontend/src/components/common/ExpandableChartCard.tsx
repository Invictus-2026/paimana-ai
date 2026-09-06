import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ExpandableChartCardProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  chartHeight?: string; // Tailwind height class e.g. "h-64", "h-72", "h-56", default "h-64"
  children: React.ReactNode | ((isFullscreen: boolean) => React.ReactNode);
  footer?: React.ReactNode;
}

export const ExpandableChartCard: React.FC<ExpandableChartCardProps> = ({
  title,
  subtitle,
  headerRight,
  className = "light-card p-5",
  chartHeight = "h-64",
  children,
  footer
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const renderContent = (full: boolean) => {
    if (typeof children === 'function') {
      return children(full);
    }
    return children;
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-slate-500 mt-0.5 font-medium">
                {subtitle}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              title="Expand Chart to Full Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className={chartHeight}>
          {renderContent(false)}
        </div>

        {footer && <div className="mt-3">{footer}</div>}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[1550px] h-[92vh] flex flex-col p-6 sm:p-8 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-outfit flex items-center gap-2">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBrowserFullscreen}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Toggle Screen Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors"
                  title="Close Fullscreen View (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Chart Canvas */}
            <div className="flex-1 w-full pt-6 pb-2 min-h-0">
              {renderContent(true)}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>PAIMANA PredictIQ Enterprise Visualizer • High-Resolution View</span>
              <span>Press Esc or click Close to return</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpandableChartCard;
