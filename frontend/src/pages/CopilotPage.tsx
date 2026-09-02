import React from 'react';
import { Bot } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">PredictIQ AI Copilot</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Natural language assistant for project risk insights and executive report generation</p>
      </div>

      <div className="dashboard-card p-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center shadow-xs">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-outfit">PredictIQ AI Assistant</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          Interactive conversational interface shell reserved for querying PAIMANA prediction models and generating MoSPI summary reports.
        </p>
      </div>
    </div>
  );
};
