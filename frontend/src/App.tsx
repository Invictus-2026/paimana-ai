import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { CopilotPage } from './pages/CopilotPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { StateProgressPage } from './pages/StateProgressPage';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="map" element={<RiskMapPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="progress" element={<StateProgressPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="interventions" element={<InterventionsPage />} />
            <Route path="alerts" element={<Navigate to="/interventions" replace />} />
            <Route path="benchmarks" element={<BenchmarksPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
