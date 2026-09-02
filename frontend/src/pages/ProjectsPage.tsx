import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { FolderKanban, ChevronRight, Calendar, IndianRupee } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1129a8] tracking-tight font-outfit">Monitored Infrastructure Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Live project repository fetched directly from FastAPI backend</p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#f8880f] hover:bg-[#e0770b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#f8880f]/20 transition"
        >
          <span>+ Add New Project</span>
        </Link>
      </div>

      {isLoading && (
        <div className="p-12 text-center dashboard-card text-slate-500">
          Loading infrastructure projects from database...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#ea4335] text-sm font-medium">
          Failed to load projects: {(error as Error).message}
        </div>
      )}

      {projects && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="dashboard-card dashboard-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f8880f] flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1129a8] font-outfit">{project.name}</h3>
                      <p className="text-xs text-slate-400">Project ID #{project.id}</p>
                    </div>
                  </div>
                  {project.is_synthetic && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#f8880f] border border-amber-200">
                      Synthetic Demo Data
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {project.description || 'Monitored national infrastructure development corridor.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <IndianRupee className="w-4 h-4 text-[#34a853]" />
                    <span>Budget: <strong className="text-slate-900 font-bold">₹{(project.budget / 1e6).toFixed(1)} Lakh Cr</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-[#4285f4]" />
                    <span>Completion: <strong className="text-slate-900 font-bold">{project.end_date || 'Dec 2027'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  project.status === 'at_risk' ? 'bg-red-50 text-[#ea4335]' : 'bg-emerald-50 text-[#34a853]'
                }`}>
                  {project.status === 'at_risk' ? 'At Risk' : 'On Track'}
                </span>

                <Link
                  to={`/projects/${project.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#f8880f] hover:text-[#e0770b] transition"
                >
                  <span>View Details & Forecast</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
