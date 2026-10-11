'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, TrendingUp, Filter, Search, Award, 
  ArrowUpRight, CheckCircle2, ChevronRight, PlusCircle, X, Send, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Pitch {
  id: string;
  title: string;
  tagline: string;
  industry: string;
  target_market: string;
  business_model: string;
  unit_cost: number | null;
  target_selling_price: number | null;
  gross_margin: number | null;
  funding_sought: number;
  equity_offered: number | null;
  investment_structure: string;
  validation_status: string;
  validation_score: number;
  traction_metrics: { key: string; value: string }[] | null;
  competitor_differentiation: string | null;
  created_at: string;
}

const INDUSTRIES = [
  'All', 'Fintech', 'E-Commerce & D2C', 'B2B SaaS', 
  'Consumer Goods & Retail', 'Hardware & Manufacturing', 
  'HealthTech', 'AgriTech', 'Logistics'
];

export default function BrowsePitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [minScore, setMinScore] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [activePitch, setActivePitch] = useState<Pitch | null>(null);
  const [investorName, setInvestorName] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [investorMessage, setInvestorMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPitches() {
      setLoading(true);
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .order('validation_score', { ascending: false });

      if (!error && data) {
        setPitches(data as Pitch[]);
      }
      setLoading(false);
    }
    fetchPitches();
  }, []);

  const filteredPitches = pitches.filter(p => {
    const matchesIndustry = selectedIndustry === 'All' || p.industry === selectedIndustry;
    const matchesScore = p.validation_score >= minScore;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIndustry && matchesScore && matchesSearch;
  });

  const handleOpenConnectModal = (pitch: Pitch) => {
    setActivePitch(pitch);
    setRequestSuccess(false);
    setRequestError(null);
    setInvestorMessage(`Hi, I reviewed your validated pitch for "${pitch.title}" and would like to request an introduction and review your detailed financial deck.`);
  };

  const handleSendConnectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePitch) return;

    setSubmittingRequest(true);
    setRequestError(null);

    try {
      const { error } = await supabase.from('connection_requests').insert([
        {
          pitch_id: activePitch.id,
          investor_name: investorName,
          investor_email: investorEmail,
          investor_firm: investorFirm || null,
          message: investorMessage,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setRequestSuccess(true);
      setTimeout(() => {
        setActivePitch(null);
        setInvestorName('');
        setInvestorEmail('');
        setInvestorFirm('');
        setInvestorMessage('');
        setRequestSuccess(false);
      }, 2200);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              <TrendingUp size={14} /> Backer Marketplace
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Verified Startup Pitches</h1>
            <p className="text-slate-400 text-sm mt-1">Discover pre-validated stage-zero startups with audited economics.</p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle size={16} /> Submit Your Pitch
          </Link>
        </header>

        {/* Filter Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search pitches by keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={selectedIndustry}
                onChange={e => setSelectedIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>Industry: {ind}</option>
                ))}
              </select>
            </div>

            {/* Score Slider */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Min Score: {minScore}/100</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-1/2 accent-indigo-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Pitches Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading verified pitches...</div>
        ) : filteredPitches.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400 mb-2">No pitches match your current filters.</p>
            <button
              onClick={() => { setSelectedIndustry('All'); setMinScore(0); setSearchTerm(''); }}
              className="text-indigo-400 text-sm font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPitches.map(pitch => (
              <div 
                key={pitch.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-6 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                        {pitch.industry}
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-slate-100">{pitch.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                      <Award size={14} />
                      {pitch.validation_score} Score
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-sm text-slate-300 italic">
                    "{pitch.tagline}"
                  </p>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Sought</span>
                      <span className="font-bold text-slate-200">
                        ${Number(pitch.funding_sought).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Structure</span>
                      <span className="font-bold text-slate-200 capitalize">
                        {pitch.equity_offered ? `${pitch.equity_offered}% ` : ''}
                        {pitch.investment_structure.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Margin</span>
                      <span className="font-bold text-emerald-400">
                        {pitch.gross_margin ? `${pitch.gross_margin}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Traction Badges */}
                  {pitch.traction_metrics && pitch.traction_metrics.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                        Verified Proof:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pitch.traction_metrics.map((m, idx) => (
                          <span 
                            key={idx} 
                            className="text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300"
                          >
                            <strong className="text-indigo-400">{m.key}:</strong> {m.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Action */}
                <div className="pt-6 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenConnectModal(pitch)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    Connect with Founder <ArrowUpRight size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Investor Connection Modal */}
      {activePitch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActivePitch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold">Introduction Request Dispatched!</h3>
                <p className="text-sm text-slate-400">
                  Your interest in <span className="text-indigo-400 font-semibold">{activePitch.title}</span> has been registered and forwarded to the founder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendConnectionRequest} className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Investor Introduction</span>
                  <h3 className="text-xl font-bold mt-1 text-slate-100">Connect with {activePitch.title}</h3>
                </div>

                {requestError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                    {requestError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Sterling"
                      value={investorName}
                      onChange={e => setInvestorName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@syndicate.vc"
                      value={investorEmail}
                      onChange={e => setInvestorEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Fund / Syndicate / Angel Affiliation</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Angels (or Independent)"
                    value={investorFirm}
                    onChange={e => setInvestorFirm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Direct Note to Founder *</label>
                  <textarea
                    rows={3}
                    required
                    value={investorMessage}
                    onChange={e => setInvestorMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  {submittingRequest ? (
                    <>Sending Request... <Loader2 className="animate-spin" size={16} /></>
                  ) : (
                    <>Send Introduction Request <Send size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
