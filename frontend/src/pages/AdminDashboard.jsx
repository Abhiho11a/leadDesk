import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, LogOut, Loader2, Inbox, ChevronDown, Check, Sparkles, Mail, DollarSign, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusConfig = {
  New: { 
    label: 'New', 
    dot: 'bg-sky-400', 
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/40 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]' 
  },
  Contacted: { 
    label: 'Contacted', 
    dot: 'bg-amber-400', 
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/40 shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]' 
  },
  Closed: { 
    label: 'Closed', 
    dot: 'bg-emerald-400', 
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]' 
  }
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom Modern Dropdown Menu to replace ugly native <select>
function StatusDropdown({ status, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentConfig = statusConfig[status] || statusConfig['New'];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer",
          currentConfig.badge
        )}
      >
        <span className={cn("w-2 h-2 rounded-full animate-pulse", currentConfig.dot)} />
        <span>{currentConfig.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 opacity-80 transition-transform duration-300 ml-0.5", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2.5 w-44 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 py-2 overflow-hidden animate-slide-up ring-1 ring-black/50">
          <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>Update Pipeline</span>
          </div>
          {Object.keys(statusConfig).map((key) => {
            const config = statusConfig[key];
            const isSelected = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition-all duration-200",
                  isSelected 
                    ? "bg-brand-500/25 text-white font-bold border-l-2 border-brand-400 pl-3.5" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                  <span>{config.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper to get initials for client avatar badge
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/leads?status=${statusFilter}`;
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      const data = await api.get(url);
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const originalLeads = [...leads];
    setLeads(prev => prev.map(lead => lead._id === id ? { ...lead, status: newStatus } : lead));
    
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      setLeads(originalLeads);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-brand-500/30 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Mesh (Cohesive with Landing Page & Login) */}
      <div className="fixed inset-0 mesh-bg z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-brand-500/15 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-fuchsia-500/15 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Glass Navbar */}
      <nav className="bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 via-fuchsia-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">LeadDesk <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-fuchsia-400">Pro</span></h1>
            <span className="text-xs text-slate-400 hidden md:inline">| Executive Portal</span>
          </div>
          <span className="bg-white/10 border border-white/15 text-brand-300 py-1 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:block shadow-sm">
            {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-200 font-semibold text-sm px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative z-10">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/10">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-2xl leading-5 bg-black/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-black/40 sm:text-sm transition-all shadow-inner"
              placeholder="Search by client name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex p-1.5 space-x-1.5 bg-black/30 rounded-2xl w-full md:w-auto overflow-x-auto border border-white/10">
            {['All', 'New', 'Contacted', 'Closed'].map((status) => {
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-5 py-2 text-xs font-bold rounded-xl transition-all flex-1 md:flex-none whitespace-nowrap duration-300 cursor-pointer',
                    isSelected 
                      ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-lg shadow-brand-500/25 scale-[1.02]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-28">
            <div className="flex flex-col items-center gap-4 text-brand-400">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-fuchsia-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-300 tracking-wider uppercase">Syncing Pipeline Data...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-28 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center px-4 animate-fade-in">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-float">
              <Inbox className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">No Leads Found</h3>
            <p className="mt-2 text-slate-400 max-w-md text-sm leading-relaxed">
              We couldn't find any inquiries matching your search query or status filter. Try clearing your filters or search terms.
            </p>
            {(searchTerm || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-2xl shadow-2xl shadow-black/50 border border-white/10 rounded-3xl overflow-hidden animate-fade-in">
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-white/10 bg-black/20 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              <div className="col-span-3 flex items-center gap-2">Client Info</div>
              <div className="col-span-2 flex items-center gap-2">Budget Tier</div>
              <div className="col-span-4 flex items-center gap-2">Inquiry Message</div>
              <div className="col-span-1 flex items-center gap-2">Date</div>
              <div className="col-span-2 text-right">Pipeline Status</div>
            </div>

            {/* Lead Rows */}
            <ul className="divide-y divide-white/5">
              {leads.map((lead) => (
                <li 
                  key={lead._id} 
                  className="p-5 lg:px-8 lg:py-6 hover:bg-white/[0.04] transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center">
                    
                    {/* Mobile Status Header */}
                    <div className="flex justify-between items-center lg:hidden mb-2 pb-3 border-b border-white/5">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <StatusDropdown 
                        status={lead.status} 
                        onChange={(newStatus) => handleStatusChange(lead._id, newStatus)} 
                      />
                    </div>

                    {/* Client Info with Avatar */}
                    <div className="col-span-3 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500/30 to-fuchsia-500/30 border border-white/15 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                          {lead.name}
                        </p>
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 truncate mt-0.5"
                        >
                          <Mail className="w-3 h-3 text-brand-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      </div>
                    </div>

                    {/* Budget Tier */}
                    <div className="col-span-2 flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-slate-200 border border-white/10 shadow-inner group-hover:border-brand-500/30 transition-colors">
                        <DollarSign className="w-3.5 h-3.5 text-fuchsia-400" />
                        {lead.budgetRange}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="col-span-4">
                      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors" title={lead.message}>
                        {lead.message}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-1 hidden lg:flex items-center text-xs font-semibold text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Custom Modern Dropdown */}
                    <div className="col-span-2 hidden lg:flex justify-end">
                      <StatusDropdown 
                        status={lead.status} 
                        onChange={(newStatus) => handleStatusChange(lead._id, newStatus)} 
                      />
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="py-6 text-center border-t border-white/10 bg-slate-900/50 backdrop-blur-md relative z-10 mt-auto">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
