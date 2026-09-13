import React, { useState, useEffect } from 'react';
import { Route } from '../types/transit';
import { testDatabaseConnection, DatabaseConnectionTestResult } from '../lib/supabase/api';
import { getSupabaseConfigStatus } from '../lib/supabase/client';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Route as RouteIcon,
  ShieldAlert,
  Server,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

interface SupabaseConnectionTestProps {
  onSelectRoute?: (route: Route) => void;
  className?: string;
}

export const SupabaseConnectionTest: React.FC<SupabaseConnectionTestProps> = ({
  onSelectRoute,
  className = '',
}) => {
  const [testResult, setTestResult] = useState<DatabaseConnectionTestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const configStatus = getSupabaseConfigStatus();

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testDatabaseConnection();
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || 'Unexpected connection error',
        errorDetails: String(err),
        routes: [],
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const handleCopySql = () => {
    const sql = `ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on routes" 
ON routes FOR SELECT 
TO anon 
USING (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div
      id="supabase-connection-test"
      className={`rounded-2xl border bg-[#0A1024]/80 backdrop-blur-md p-6 sm:p-8 transition-all ${
        testResult?.status === 'error'
          ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
          : testResult?.status === 'rls_restricted'
          ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
          : 'border-[#72D7FF]/30 shadow-[0_0_30px_rgba(114,215,255,0.1)]'
      } ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl border ${
              testResult?.status === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : testResult?.status === 'rls_restricted'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-[#72D7FF]/10 border-[#72D7FF]/30 text-[#72D7FF]'
            }`}
          >
            <Database className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                Supabase Database Connection Test
              </h3>

              {/* Status Badge */}
              {loading ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Testing Connection...
                </span>
              ) : testResult?.status === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected · HTTP {testResult.statusCode || 200} OK
                </span>
              ) : testResult?.status === 'rls_restricted' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Connected · RLS Restricted (0 Rows)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-red-500/15 text-red-400 border border-red-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Connection Failed
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-[#94A3B8] font-mono">
              Target: <code className="text-white bg-white/5 px-1 py-0.5 rounded">routes</code> table · Query limit: 10 rows · Host: {configStatus.maskedUrl}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={runTest}
            disabled={loading}
            className="rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 px-4 py-2 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#72D7FF]' : 'text-white'}`} />
            <span>{loading ? 'Testing...' : 'Re-test Query'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ERROR DISPLAY: Clear message when connection fails
          ───────────────────────────────────────────────────────────── */}
      {!loading && testResult?.status === 'error' && (
        <div className="my-6 rounded-xl bg-red-500/10 border border-red-500/30 p-5 text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-red-300 font-mono tracking-wide">
                Supabase Connection Error
              </div>
              <p className="text-red-200 leading-relaxed font-mono">
                {testResult.message}
              </p>
              {testResult.errorDetails && (
                <div className="mt-2 p-3 rounded-lg bg-black/40 border border-red-500/20 font-mono text-[11px] text-red-300 whitespace-pre-wrap">
                  {testResult.errorDetails}
                </div>
              )}
              <div className="pt-2 text-[11px] text-red-300/80 leading-relaxed">
                Ensure <code className="bg-black/30 px-1 py-0.5 rounded text-white">SUPABASE_URL</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-white">SUPABASE_ANON_KEY</code> are correctly configured in AI Studio Secrets.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROW LEVEL SECURITY (RLS) ADVISORY: When connection is OK but 0 rows returned
          ───────────────────────────────────────────────────────────── */}
      {!loading && testResult?.status === 'rls_restricted' && (
        <div className="my-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-5 text-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-3 text-xs w-full">
              <div>
                <div className="font-semibold text-amber-300 font-mono tracking-wide">
                  Connected Successfully (200 OK), but 0 Routes Returned
                </div>
                <p className="mt-1 text-amber-200/90 leading-relaxed font-mono">
                  Your PostgreSQL database and <code className="text-white bg-black/30 px-1 rounded">routes</code> table are connected! However, PostgreSQL Row Level Security (RLS) is currently active without a public read policy for the <code className="text-white bg-black/30 px-1 rounded">anon</code> role.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    Supabase SQL Editor Policy:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white transition-colors cursor-pointer bg-amber-500/20 px-2 py-0.5 rounded"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-amber-200 whitespace-pre-wrap overflow-x-auto select-all">
{`ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on routes" 
ON routes FOR SELECT 
TO anon 
USING (true);`}
                </pre>
              </div>

              <p className="text-[11px] text-amber-300/80">
                Run this SQL in your Supabase project dashboard, then click <strong>"Re-test Query"</strong> above to instantly load the live routes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FIRST 10 ROUTES DISPLAY
          ───────────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-[#72D7FF]" />
            <h4 className="text-sm font-mono uppercase tracking-wider text-white">
              First 10 Routes from Database
            </h4>
          </div>

          <span className="text-xs font-mono text-[#94A3B8]">
            {loading
              ? 'Querying...'
              : `${testResult?.routes.length || 0} displayed (Limit: 10)`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-white/[0.03] border border-white/5 p-3.5 animate-pulse space-y-2"
              >
                <div className="h-4 w-12 bg-white/10 rounded" />
                <div className="h-3 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : testResult && testResult.routes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {testResult.routes.map((route, idx) => {
              const isMetro = route.route_type === 1 || route.agency_id === 'CMRL';

              return (
                <div
                  key={route.route_id || idx}
                  onClick={() => onSelectRoute && onSelectRoute(route)}
                  className="rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 p-3.5 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-sm font-bold text-white group-hover:text-[#72D7FF] transition-colors truncate">
                        {route.route_short_name || route.route_id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          isMetro
                            ? 'bg-[#72D7FF]/15 text-[#72D7FF]'
                            : 'bg-[#F5C542]/15 text-[#F5C542]'
                        }`}
                      >
                        {route.agency_id || (isMetro ? 'CMRL' : 'MTC')}
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {route.route_long_name || 'Route'}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]/60">
                    <span>ID: {route.route_id}</span>
                    <span className="text-[#72D7FF] opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-8 text-center text-xs font-mono text-[#94A3B8]">
            <p>No routes currently returned by query limit 10.</p>
            <p className="mt-1 text-[11px] text-[#94A3B8]/60">
              Ensure the routes table is populated and public read permissions are granted.
            </p>
          </div>
        )}
      </div>

      {/* Footer Diagnostic Info */}
      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#94A3B8]/60">
        <div className="flex items-center gap-2">
          <Server className="w-3 h-3 text-[#72D7FF]" />
          <span>Client: @supabase/supabase-js v2</span>
          <span>·</span>
          <span>Read-only anon client</span>
        </div>
        <div>
          Last checked: {testResult?.timestamp || 'Initializing...'}
        </div>
      </div>
    </div>
  );
};
