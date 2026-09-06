import React from 'react';
import { Logo } from '../components/Logo';
import { ArrowLeft, Code, Layers, Server, ExternalLink } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
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
        <div className="mb-4">
          <Logo size="md" showWordmark={true} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          About Zenvora
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Zenvora is an independent, privacy-first metasearch application designed to deliver clean,
          unbiased search results with zero corporate surveillance.
        </p>
      </div>

      <section className="mb-12 space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-500" />
          The Mission Behind Zenvora
        </h2>
        <p>
          The modern web search ecosystem is monopolized by advertising companies whose core business
          model depends on logging your queries, cataloging your interests, and serving targeted behavioral ads.
        </p>
        <p>
          Zenvora was engineered to prove that high-performance web search does not require sacrificing personal privacy.
          By acting as an intelligent privacy shield between your browser and search indexers, Zenvora returns aggregated results without retaining query records.
        </p>
      </section>

      <section className="mb-12 p-6 rounded-3xl bg-slate-100 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-500" />
          Powered by Open-Source SearXNG
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Zenvora is not an independent web crawler indexing billions of pages from scratch. Instead, it utilizes{' '}
          <a
            href="https://searxng.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            SearXNG <ExternalLink className="w-3.5 h-3.5" />
          </a>{' '}
          as its aggregation backend. SearXNG is a privacy-respecting metasearch engine maintained by the global open-source community.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Zenvora layers a custom, high-speed React + TypeScript user experience, dedicated backend API abstraction,
          rate-limiting protection, container orchestration, and automatic TLS reverse-proxying over this backend.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Code className="w-5 h-5 text-cyan-500" />
          Full-Stack Technical Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-cyan-600 dark:text-cyan-400">
              Frontend Layer
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons. Designed for mobile responsiveness, accessible keyboard navigation, and client-side preference persistence.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-indigo-600 dark:text-indigo-400">
              API Abstraction Layer
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Node.js 22 LTS, Express, Zod schema validation, Helmet security headers, in-memory LRU caching, and abuse rate limiting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-purple-600 dark:text-purple-400">
              Reverse Proxy & TLS
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Caddy 2 with automated Let&apos;s Encrypt certificate issuance, HTTP/3 QUIC support, strict HSTS, and Content Security Policy enforcement.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-emerald-600 dark:text-emerald-400">
              DevOps & Portability
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Multi-container Docker Compose setup with isolated internal networks. Portable across any standard Linux VPS (Ubuntu 24.04 LTS) with zero vendor lock-in.
            </p>
          </div>
        </div>
      </section>

      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zen-bg-darkSurface/40 border border-slate-200 dark:border-zen-bg-darkBorder text-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Open Source & Auditable
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Zenvora is released under the permissive MIT License. Contributions and security audits are warmly welcome.
        </p>
      </div>
    </div>
  );
};
