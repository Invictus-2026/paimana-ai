import React from 'react';
import { ScenariosPage } from './pages/ScenariosPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { StateProgressPage } from './pages/StateProgressPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

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
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics/cost-overrun" element={<AnalyticsPage defaultSubTab="cost-overrun" />} />
            <Route path="analytics/time-overrun" element={<AnalyticsPage defaultSubTab="time-overrun" />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="interventions" element={<InterventionsPage />} />
            <Route path="alerts" element={<Navigate to="/interventions" replace />} />
            <Route path="benchmarks" element={<BenchmarksPage />} />
            <Route path="copilot" element={<Navigate to="/intelligence?tab=documents" replace />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="reports" element={<Navigate to="/intelligence?tab=reports" replace />} />
            <Route path="settings" element={<Navigate to="/intelligence?tab=settings" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
