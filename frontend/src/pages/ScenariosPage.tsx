import React from 'react';
import { Sliders } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">What-If Scenario Simulation</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Simulate budget & supply chain delay interventions</p>
      </div>

      <div className="dashboard-card p-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
          <Sliders className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-outfit">Scenario Simulation Engine</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          Interactive parameters and simulation engine configured to call backend route <code className="text-blue-600 font-bold">/api/v1/scenarios/simulate</code>.
        </p>
      </div>
    </div>
  );
};
