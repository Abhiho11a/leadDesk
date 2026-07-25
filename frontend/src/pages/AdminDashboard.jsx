import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, LogOut, Loader2, Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusColors = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Contacted: 'bg-amber-100 text-amber-800 border-amber-200',
  Closed: 'bg-green-100 text-green-800 border-green-200'
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
    // Optimistic UI update
    setLeads(prev => prev.map(lead => lead._id === id ? { ...lead, status: newStatus } : lead));
    
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert if failed
      setLeads(originalLeads);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-900 relative">
      {/* Navbar */}
      <nav className="glass-nav px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">LeadDesk <span className="text-brand-600">Mini</span></h1>
          <span className="bg-brand-100 text-brand-700 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:block shadow-sm">
            {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm px-4 py-2 rounded-xl hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative z-10">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 sm:text-sm transition-all shadow-sm"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex p-1 space-x-1 bg-slate-100/80 rounded-xl w-full md:w-auto overflow-x-auto border border-slate-200/50">
            {['All', 'New', 'Contacted', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex-1 md:flex-none whitespace-nowrap',
                  statusFilter === status 
                    ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-brand-500">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide uppercase">Loading leads...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Inbox className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No leads found</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              We couldn't find any leads matching your current filters. Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white rounded-3xl overflow-hidden animate-fade-in">
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Contact Info</div>
              <div className="col-span-2">Budget</div>
              <div className="col-span-4">Message</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            <ul className="divide-y divide-slate-100/80">
              {leads.map((lead) => (
                <li key={lead._id} className="p-5 lg:px-8 lg:py-6 hover:bg-brand-50/30 transition-colors group">
                  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center">
                    
                    {/* Mobile Status Header */}
                    <div className="flex justify-between items-center lg:hidden mb-2">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={cn(
                          "text-xs font-bold px-3 py-1.5 rounded-full border appearance-none outline-none focus:ring-2 focus:ring-brand-500 shadow-sm",
                          statusColors[lead.status]
                        )}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <p className="text-base font-bold text-slate-800">{lead.name}</p>
                      <a href={`mailto:${lead.email}`} className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">{lead.email}</a>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 shadow-sm border border-slate-200/60">
                        {lead.budgetRange}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed" title={lead.message}>
                        {lead.message}
                      </p>
                    </div>

                    <div className="col-span-2 hidden lg:block text-sm font-medium text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>

                    <div className="col-span-1 hidden lg:flex justify-end relative">
                      <div className="relative group-hover:scale-105 transition-transform">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={cn(
                            "text-xs font-bold px-4 py-2 rounded-full border appearance-none outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer pr-8 text-right shadow-sm transition-colors",
                            statusColors[lead.status]
                          )}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="py-6 text-center border-t border-slate-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
