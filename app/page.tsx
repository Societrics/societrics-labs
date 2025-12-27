import Link from 'next/link';
import { Activity, BrainCircuit, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Societrics<span className="text-blue-500">Labs</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Interactive Multi-Agent Systems & Crisis Simulations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
          {/* Venezuela Link */}
          <Link href="/venezuela" className="group block p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center mb-6">
              <Activity className="text-red-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400">
              Venezuela Crisis Model
            </h2>
            <p className="text-slate-400 mb-6">
              Simulate the SIP Trap and regime collapse scenarios.
            </p>
            <div className="flex items-center text-sm font-bold text-blue-500">
              Launch Simulation <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>

          {/* Cheating Link */}
          <Link href="/cheating" className="group block p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-6">
              <BrainCircuit className="text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400">
              The Cheating Dilemma
            </h2>
            <p className="text-slate-400 mb-6">
              Model the "System Sieve" and institutional trust decay.
            </p>
            <div className="flex items-center text-sm font-bold text-blue-500">
              Launch Simulation <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>
        </div>

        <footer className="mt-16 text-slate-600 text-sm">
          © {new Date().getFullYear()} Societrics Labs.
        </footer>
      </div>
    </main>
  );
}