import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderKanban,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Award,
  Bot,
  MapPin,
  Sliders,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { MOCK_PROJECTS } from '../../data/mockData';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Projects' | 'Actions';
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via CustomEvent or parent callback
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const baseItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'National Executive Dashboard',
      subtitle: 'Overview of ₹42.78 Lakh Cr portfolio across 1,981 projects',
      category: 'Navigation',
      icon: LayoutGrid,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      id: 'nav-projects',
      title: 'Project Explorer & Search Matrix',
      subtitle: 'Filter and inspect all national infrastructure projects',
      category: 'Navigation',
      icon: FolderKanban,
      action: () => { navigate('/projects'); onClose(); }
    },
    {
      id: 'nav-interventions',
      title: 'Risk & Alerts Action Panel',
      subtitle: 'Human-in-the-loop ministerial intervention workflows',
      category: 'Navigation',
      icon: AlertTriangle,
      action: () => { navigate('/interventions'); onClose(); }
    },
    {
      id: 'nav-scenarios',
      title: 'What-If Risk Scenario Simulator',
      subtitle: 'Simulate budget, delay, and resource disruptions',
      category: 'Navigation',
      icon: Sliders,
      action: () => { navigate('/scenarios'); onClose(); }
    },
    {
      id: 'nav-benchmarks',
      title: 'Benchmarking & Analytics Matrix',
      subtitle: 'Comparative cross-sector and regional analytics',
      category: 'Navigation',
      icon: Award,
      action: () => { navigate('/benchmarks'); onClose(); }
    },
    {
      id: 'nav-map',
      title: 'National Spatial Risk Map',
      subtitle: 'State-wise infrastructure risk heatmaps across India',
      category: 'Navigation',
      icon: MapPin,
      action: () => { navigate('/map'); onClose(); }
    },
    {
      id: 'nav-copilot',
      title: 'AI Intelligence Assistant (Copilot)',
      subtitle: 'Query infrastructure data using natural language',
      category: 'Navigation',
      icon: Bot,
      action: () => { navigate('/copilot'); onClose(); }
    },

    // Actions
    {
      id: 'act-high-risk',
      title: 'Filter High-Risk Projects (>80 Risk Score)',
      subtitle: 'Instantly view the 312 critical projects requiring intervention',
      category: 'Actions',
      icon: AlertTriangle,
      action: () => { navigate('/projects?status=High Risk'); onClose(); }
    },
    {
      id: 'act-cost-overrun',
      title: 'Filter Projects with >10% Cost Overrun',
      subtitle: 'View projects exceeding approved cabinet estimates',
      category: 'Actions',
      icon: TrendingUp,
      action: () => { navigate('/projects?costOverrun=high'); onClose(); }
    },
    {
      id: 'act-monsoon-query',
      title: 'Ask AI: Monsoon Risk Vulnerabilities',
      subtitle: 'Natural language analysis of projects vulnerable to rainfall slippage',
      category: 'Actions',
      icon: Sparkles,
      action: () => { navigate('/copilot?q=Which+projects+are+at+risk+of+missing+monsoon+deadlines%3F'); onClose(); }
    },

    // Projects
    ...MOCK_PROJECTS.map(p => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: `${p.code} • ${p.ministry} • Risk: ${p.overallRiskScore}/100`,
      category: 'Projects' as const,
      icon: FolderKanban,
      action: () => { navigate(`/projects/${p.id}`); onClose(); }
    }))
  ];

  const filteredItems = baseItems.filter(item => {
    if (!query) return true;
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q));
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, line ministries, sectors, or enter a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 flex-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 text-[#0d52ce]' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#0d52ce] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold truncate text-slate-900">
                          {item.title}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider ${
                          item.category === 'Projects' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          item.category === 'Actions' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 text-xs font-semibold text-slate-400">
                    <span className="text-[11px]">Jump</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              No matching commands or projects found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center space-x-3">
            <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
            <span><strong>Enter</strong> to select</span>
            <span><strong>Esc</strong> to close</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">MoSPI National Infrastructure Registry</span>
        </div>
      </div>
    </div>
  );
};
