import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

interface RouteRecord {
  route_id?: string;
  agency_id?: string;
  route_short_name?: string;
  route_long_name?: string;
  route_type?: number;
  route_color?: string;
  route_text_color?: string;
  [key: string]: any;
}

interface TestPageProps {
  onBack?: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({ onBack }) => {
  const [routes, setRoutes] = useState<RouteRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRoutes() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("routes")
          .select("*")
          .limit(10);

        if (supabaseError) {
          console.error("Supabase error fetching routes:", supabaseError);
          setError(supabaseError.message || JSON.stringify(supabaseError, null, 2));
        } else {
          setRoutes(data || []);
        }
      } catch (err: any) {
        console.error("Unexpected error querying Supabase:", err);
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to App
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Supabase Connection Test (test)
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600">
            Querying first 10 records from <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-black font-mono">routes</code> via @supabase/supabase-js
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying...
            </span>
          ) : error ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              <AlertCircle className="w-3.5 h-3.5" /> Connection Issue
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected ({routes?.length || 0} routes)
            </span>
          )}
        </div>
      </div>

      {/* Query Spec Box */}
      <div className="my-6 p-4 rounded-2xl bg-neutral-100 border border-black/5 font-mono text-xs text-neutral-800">
        <p className="font-bold text-neutral-500 mb-1 font-sans uppercase tracking-wider text-[11px]">
          Executed Query:
        </p>
        <code>
          const &#123; data, error &#125; = await supabase.from(&quot;routes&quot;).select(&quot;*&quot;).limit(10);
        </code>
      </div>

      {/* Error state */}
      {error && (
        <div className="my-6 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Supabase Error Details:</span>
          </div>
          <pre className="p-3 bg-red-100/70 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {error}
          </pre>
          <p className="text-xs text-red-700">
            Please ensure <code className="font-mono font-bold">VITE_SUPABASE_URL</code> and <code className="font-mono font-bold">VITE_SUPABASE_ANON_KEY</code> are correctly configured in AI Studio Secrets.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 py-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-neutral-200/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Routes list */}
      {!loading && !error && routes && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Displaying 1 - {routes.length} of 10 queried records</span>
            <span>Table: routes</span>
          </div>

          {routes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-black/10 text-neutral-500 text-sm">
              Query succeeded, but 0 records were returned from table &quot;routes&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">route_id</th>
                    <th className="py-3 px-4">agency_id</th>
                    <th className="py-3 px-4">short_name</th>
                    <th className="py-3 px-4">long_name</th>
                    <th className="py-3 px-4">type</th>
                    <th className="py-3 px-4">Raw Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-neutral-800">
                  {routes.map((route, idx) => (
                    <tr key={route.route_id || idx} className="hover:bg-neutral-50/70 transition-colors font-mono">
                      <td className="py-3 px-4 font-bold text-neutral-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-black">{route.route_id || '—'}</td>
                      <td className="py-3 px-4">{route.agency_id || '—'}</td>
                      <td className="py-3 px-4 font-bold text-black font-sans">{route.route_short_name || '—'}</td>
                      <td className="py-3 px-4 font-sans max-w-xs truncate" title={route.route_long_name}>
                        {route.route_long_name || '—'}
                      </td>
                      <td className="py-3 px-4">{route.route_type ?? '—'}</td>
                      <td className="py-3 px-4">
                        <details className="cursor-pointer">
                          <summary className="text-[10px] text-blue-600 hover:underline">JSON</summary>
                          <pre className="mt-1 p-2 bg-neutral-100 rounded text-[9px] max-w-xs overflow-x-auto">
                            {JSON.stringify(route, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
