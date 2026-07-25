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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">LeadDesk <span className="text-brand-600">Mini</span></h1>
          <span className="bg-brand-50 text-brand-700 py-1 px-3 rounded-full text-sm font-medium hidden sm:block">
            {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex p-1 space-x-1 bg-gray-100 rounded-xl w-full sm:w-auto overflow-x-auto">
            {['All', 'New', 'Contacted', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-none whitespace-nowrap',
                  statusFilter === status 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
            <div className="flex flex-col items-center gap-4 text-brand-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium text-gray-500 animate-pulse">Loading leads...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-gray-500 max-w-sm">
              We couldn't find any leads matching your current filters. Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Contact Info</div>
              <div className="col-span-2">Budget</div>
              <div className="col-span-4">Message</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            <ul className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <li key={lead._id} className="p-4 md:px-6 md:py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center">
                    
                    {/* Mobile Status Header */}
                    <div className="flex justify-between items-center md:hidden mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full border appearance-none outline-none focus:ring-2 focus:ring-brand-500",
                          statusColors[lead.status]
                        )}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                      <a href={`mailto:${lead.email}`} className="text-sm text-brand-600 hover:underline">{lead.email}</a>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {lead.budgetRange}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <p className="text-sm text-gray-600 line-clamp-2 title" title={lead.message}>
                        {lead.message}
                      </p>
                    </div>

                    <div className="col-span-2 hidden md:block text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>

                    <div className="col-span-1 hidden md:flex justify-end">
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={cn(
                            "text-xs font-medium px-3 py-1 rounded-full border appearance-none outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer pr-8 text-right",
                            statusColors[lead.status]
                          )}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
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

      <footer className="py-6 text-center border-t border-gray-200 bg-white">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
