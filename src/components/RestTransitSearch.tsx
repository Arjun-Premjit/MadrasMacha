import React, { useState, useEffect, useTransition } from 'react';
import { Search, Bus, Train, ArrowRight, ShieldCheck, Database, HelpCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { searchTransitViaRest, TransitSearchResult } from '../../lib/supabase/api';
import { Route } from '../types/transit';
import { SUPABASE_PROJECT_ID, DEFAULT_SUPABASE_URL } from '../../lib/supabase/client';

interface RestTransitSearchProps {
  onSelectRoute?: (route: Route) => void;
  className?: string;
}

export const RestTransitSearch: React.FC<RestTransitSearchProps> = ({
  onSelectRoute,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TransitSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [, startTransition] = useTransition();

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await searchTransitViaRest(searchTerm);
      startTransition(() => {
        setResult(res);
      });
    } catch (err) {
      console.error('[REST Search Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch to populate examples
    handleSearch('');
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    handleSearch(val);
  };

  const copySqlToClipboard = () => {
    const sql = `-- Run this in your Supabase SQL Editor (qrcuvjgimkycijxbrpaj.supabase.co)
-- to allow read-only (SELECT) queries through the REST API:
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Routes" ON routes FOR SELECT TO anon USING (true);

ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stops" ON stops FOR SELECT TO anon USING (true);

ALTER TABLE agency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Agency" ON agency FOR SELECT TO anon USING (true);`;
    navigator.clipboard?.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Glassmorphic Search Container */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-lg bg-white/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="glass-heading-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase REST API (Read-Only)</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                GET /rest/v1/routes
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Search Chennai Transit Network
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live retrieval from PostgreSQL database (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{SUPABASE_PROJECT_ID}.supabase.co</code>). Pure read-only queries.
            </p>
          </div>

          <button
            onClick={() => setShowDbGuide(!showDbGuide)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors self-start md:self-auto cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{showDbGuide ? 'Hide DB Connection Steps' : 'Supabase Setup Steps'}</span>
          </button>
        </div>

        {/* Supabase Connection Instructions Panel */}
        {showDbGuide && (
          <div className="mb-6 p-4 sm:p-5 rounded-xl bg-slate-900 text-slate-200 text-xs font-sans border border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">How to connect Supabase database</span>
              </div>
              <button
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy Read SQL'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed mb-3">
              Your Supabase project (<strong className="text-white">{DEFAULT_SUPABASE_URL}</strong>) is connected. In PostgreSQL, tables have Row-Level Security (RLS). To enable read-only REST search for users, run this in your Supabase SQL Editor:
            </p>
            <pre className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-emerald-500/20 leading-relaxed">
{`ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Routes" ON routes FOR SELECT TO anon USING (true);

ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stops" ON stops FOR SELECT TO anon USING (true);`}
            </pre>
          </div>
        )}

        {/* Search Bar Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={onInputChange}
            placeholder="Search by route number (e.g. 21G, 570), metro line, or destination (e.g. Broadway, Central, Tambaram)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                handleSearch('');
              }}
              className="absolute inset-y-0 right-2 px-3 text-xs text-slate-400 hover:text-slate-700 font-medium my-auto h-8 flex items-center"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium mr-1 text-slate-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Try:
          </span>
          {['21G', '570', '19B', 'Blue Line', 'Green Line', 'Guindy', 'Tambaram'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors cursor-pointer border border-slate-200/80"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="mt-6 space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {result && result.routes.length > 0 ? (
            result.routes.map((rt) => {
              const isMetro = rt.agency_id === 'CMRL' || rt.route_type === 1;
              return (
                <div
                  key={rt.route_id}
                  onClick={() => onSelectRoute?.(rt)}
                  className="group p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-xs"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        isMetro
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {isMetro ? (
                        <Train className="w-5 h-5 text-sky-700" />
                      ) : (
                        <Bus className="w-5 h-5 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono tracking-tight">
                          {rt.route_short_name || rt.route_id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            isMetro
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isMetro ? 'Chennai Metro' : 'MTC Bus'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                        {rt.route_long_name}
                      </p>
                      {rt.route_desc && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {rt.route_desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-xs font-medium text-slate-500 group-hover:text-slate-900 self-end sm:self-auto">
                    <span>View route details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              {loading ? (
                <span>Retrieving transit corridors from REST API...</span>
              ) : (
                <span>No transit routes found matching "{query}". Try "21G", "570", or "Blue Line".</span>
              )}
            </div>
          )}
        </div>

        {/* Source indicator */}
        {result && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Source: {result.source}</span>
            <span>{result.count} corridor{result.count !== 1 ? 's' : ''} matched</span>
          </div>
        )}
      </div>
    </div>
  );
};
