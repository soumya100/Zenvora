import React from 'react';
import { Shield, Lock, Check, Server, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      <div className="mb-10 pb-8 border-b border-slate-200 dark:border-zen-bg-darkBorder">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" /> Privacy Policy & Architecture
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          Your search. Your privacy.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Zenvora is designed to minimize tracking and does not maintain a personal search history.
          We believe curiosity should never require forfeiting fundamental privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
          <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
            <Check className="w-5 h-5" /> What Zenvora Never Stores
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>No Search History:</strong> Queries are processed in-memory and discarded. Never saved to disks or databases.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>No User Profiling:</strong> We build no behavioral profiles, advertisement personas, or query correlation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>No Invasive Tracking Cookies:</strong> No persistent identifiers or third-party marketing tags are ever installed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>No Data Broker Sales:</strong> We do not monetize personal data or partner with ad exchanges.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-cyan-500" /> What Is Stored & Where
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">•</span>
              <span><strong>Client-Side Preferences:</strong> Your selected theme, language, and SafeSearch choices stay strictly on your device inside <code>localStorage</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">•</span>
              <span><strong>Ephemeral Server Cache:</strong> Frequent identical queries may be cached in volatile RAM for up to 60 seconds to reduce upstream load. These hold zero user attribution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">•</span>
              <span><strong>Standard Volatile Web Logs:</strong> Minimal web server connection logs are maintained strictly for bot mitigation and discarded automatically.</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-500" />
          How Search Requests are Handled
        </h2>
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder text-sm text-slate-600 dark:text-slate-300 space-y-4">
          <p>
            When you enter a search term into Zenvora, your browser sends an encrypted HTTPS request exclusively to the Zenvora API layer.
          </p>
          <p>
            The Zenvora API strips tracking query parameters, validates the request, and queries an internal instance of <strong>SearXNG</strong>. SearXNG then queries upstream search providers (such as Google, Bing, Brave, and Wikipedia) using its own outgoing connection.
          </p>
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
            <strong className="text-cyan-700 dark:text-cyan-300 block mb-1">Upstream Search Provider Information Exposure:</strong>
            Upstream search providers only see the IP address and user-agent of the Zenvora server running SearXNG. They <strong>never</strong> see your personal IP address, browser cookies, location, or hardware fingerprint.
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Comparative Privacy Matrix
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zen-bg-darkBorder">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-zen-bg-darkCard text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3 sm:p-4">Feature</th>
                <th className="p-3 sm:p-4 text-cyan-600 dark:text-cyan-400">Zenvora</th>
                <th className="p-3 sm:p-4 text-slate-500">Commercial Search (e.g. Google)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zen-bg-darkBorder/60 bg-white/50 dark:bg-zen-bg-darkSurface/50 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="p-3 sm:p-4 font-semibold">User Accounts Required</td>
                <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">Never</td>
                <td className="p-3 sm:p-4 text-rose-500">Strongly incentivized</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-semibold">Query Logging & History</td>
                <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">None (Zero logs)</td>
                <td className="p-3 sm:p-4 text-rose-500">Logged & tied to account</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-semibold">IP Address Masking</td>
                <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">Yes (Server proxies query)</td>
                <td className="p-3 sm:p-4 text-rose-500">No (Direct connection logged)</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-semibold">Advertising & Profiling</td>
                <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">None</td>
                <td className="p-3 sm:p-4 text-rose-500">Core business model</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-semibold">Code Transparency</td>
                <td className="p-3 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">100% Open Source</td>
                <td className="p-3 sm:p-4 text-rose-500">Proprietary black-box</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
        For technical inquiries or security disclosures, inspect our open-source codebase and Docker setup on GitHub.
      </div>
    </div>
  );
};
