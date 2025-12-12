
import React from 'react';
import { GlassPane } from '../ui/GlassPane';
import { Database, CheckCircle2, Plus, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const integrations = [
    { name: 'Stripe', category: 'Finance', status: 'connected', lastSync: '2 mins ago', icon: '💳' },
    { name: 'HubSpot', category: 'CRM', status: 'connected', lastSync: '1 hour ago', icon: '🎯' },
    { name: 'Google Analytics', category: 'Marketing', status: 'error', lastSync: 'Failed', icon: '📊' },
    { name: 'Slack', category: 'Communication', status: 'disconnected', lastSync: '-', icon: '💬' },
    { name: 'Shopify', category: 'E-commerce', status: 'disconnected', lastSync: '-', icon: '🛍️' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-ink-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-tech-purple" />
            Data Integrations
          </h2>
          <p className="text-ink-500 mt-2 font-medium max-w-2xl">
            Connect your external tools to feed the Neural Operating System with real-time data.
          </p>
        </div>
        <button className="px-6 py-3 bg-tech-purple hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all">
           <Plus className="w-5 h-5" /> Add Connection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app, idx) => (
          <GlassPane key={idx} className="p-6 flex flex-col hover:border-tech-purple/30 transition-colors shadow-sm" hoverEffect>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                      {app.icon}
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-ink-900">{app.name}</h3>
                      <div className="text-xs text-ink-400 font-mono uppercase tracking-wider font-bold">{app.category}</div>
                   </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${
                   app.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 
                   app.status === 'error' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                }`} />
             </div>

             <div className="mt-auto">
                <div className="flex items-center justify-between text-xs mb-4">
                   <span className="text-ink-400 font-medium">Status</span>
                   <span className={`font-bold uppercase ${
                      app.status === 'connected' ? 'text-emerald-600' : 
                      app.status === 'error' ? 'text-rose-600' : 'text-slate-400'
                   }`}>
                      {app.status}
                   </span>
                </div>
                
                {app.status === 'connected' ? (
                   <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-800 font-medium">Synced: {app.lastSync}</span>
                   </div>
                ) : app.status === 'error' ? (
                   <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs text-rose-800 font-medium">Auth Token Expired</span>
                      <button className="ml-auto text-xs font-bold underline hover:text-rose-950">Fix</button>
                   </div>
                ) : (
                   <button className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-ink-600 transition-colors">
                      Connect {app.name}
                   </button>
                )}
             </div>
          </GlassPane>
        ))}
      </div>
      
      <div className="mt-12 p-8 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-full border border-slate-100 shadow-sm">
               <Layers className="w-8 h-8 text-tech-cyan" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-ink-900">Custom API Pipeline</h3>
               <p className="text-sm text-ink-500 max-w-lg mt-1">
                  Need to ingest proprietary data? Use our Neural API to push unstructured documents or raw JSON directly into the OS.
               </p>
            </div>
         </div>
         <button className="px-6 py-3 bg-white border border-slate-200 hover:border-tech-cyan text-ink-900 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
            View API Docs
         </button>
      </div>
    </div>
  );
};
