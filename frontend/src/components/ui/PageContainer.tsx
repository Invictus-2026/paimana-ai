import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  breadcrumb?: string;
  classification?: string;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  breadcrumb,
  classification = 'OFFICIAL / RESTRICTED • MoSPI INFRASTRUCTURE MONITORING COMMAND',
  className = ''
}) => {
  return (
    <div className={`space-y-6 max-w-[1600px] mx-auto pb-10 text-slate-800 ${className}`}>
      {/* Subtle Top Metadata Bar */}
      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase py-1 border-b border-slate-200/60 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
          <span>PAIMANA PREDICTIQ PLATFORM</span>
          {breadcrumb && (
            <>
              <span>/</span>
              <span className="text-slate-600">{breadcrumb}</span>
            </>
          )}
        </div>
        <div className="hidden sm:block text-slate-400 font-mono">
          {classification}
        </div>
      </div>

      {children}
    </div>
  );
};
