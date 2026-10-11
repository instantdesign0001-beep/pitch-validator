'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, TrendingUp, ShieldCheck, PieChart, CheckCircle2, 
  ArrowRight, ArrowLeft, Plus, Trash2, Award, Eye, FileText, Check, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const INDUSTRIES = [
  'Fintech', 'E-Commerce & D2C', 'B2B SaaS', 'Consumer Goods & Retail', 
  'Hardware & Manufacturing', 'HealthTech', 'AgriTech', 'Logistics'
];

const MODELS = [
  { id: 'b2b_saas', label: 'B2B Subscription / SaaS' },
  { id: 'direct_to_consumer', label: 'D2C Physical Brand' },
  { id: 'marketplace', label: 'Marketplace (Commission)' },
  { id: 'manufacturing_retail', label: 'Manufacturing & Distribution' },
  { id: 'service', label: 'Service / Agency' }
];

const STRUCTURES = [
  { id: 'equity', label: 'Equity Stake (%)' },
  { id: 'revenue_share', label: 'Revenue Share (Royalty)' },
  { id: 'silent_partner', label: 'Silent Partner (Profit Split)' },
  { id: 'convertible_note', label: 'Convertible SAFE Note' }
];

const VALIDATION_STAGES = [
  { id: 'concept_only', label: 'Stage 0: Conceptual Idea', points: 5 },
  { id: 'waitlist_survey', label: 'Stage 1: User Surveys / Waitlist', points: 15 },
  { id: 'functional_prototype', label: 'Stage 2: Working Sample / MVP', points: 25 },
  { id: 'pilot_revenue', label: 'Stage 3: Early Pilot Revenue / Signed LOIs', points: 35 }
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [previewTab, setPreviewTab] = useState<'card' | 'audit'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    founderEmail: '',
    industry: 'Consumer Goods & Retail',
    targetMarket: '',
    problem: '',
    solution: '',
    businessModel: 'manufacturing_retail',
    unitCost: '',
    sellingPrice: '',
    fundingSought: '',
    equityOffered: '',
    investmentStructure: 'equity',
    useOfFunds: { inventory: 40, marketing: 35, operations: 25 },
    validationStage: 'waitlist_survey',
    differentiation: '',
    tractionMetrics: [
      { key: 'Waitlist Signups', value: '350' },
      { key: 'Pre-order Commitments', value: '$2,400' }
    ]
  });

  const grossMargin = useMemo(() => {
    const cost = parseFloat(formData.unitCost);
    const price = parseFloat(formData.sellingPrice);
    if (!cost || !price || price <= cost) return null;
    return (((price - cost) / price) * 100).toFixed(1);
  }, [formData.unitCost, formData.sellingPrice]);

  const allocationTotal = useMemo(() => {
    return Object.values(formData.useOfFunds).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [formData.useOfFunds]);

  const validationAudit = useMemo(() => {
    const checks = [
      { label: 'Problem & Target Market Defined', passed: formData.problem.length >= 40 && !!formData.targetMarket, points: 20 },
      { label: 'Unit Economics Calculated', passed: !!grossMargin && parseFloat(grossMargin) > 0, points: 20 },
      { label: 'Use of Funds Balanced (100%)', passed: allocationTotal === 100, points: 15 },
      { label: 'Traction Evidence Documented', passed: formData.tractionMetrics.some(m => m.key && m.value), points: 20 },
      { label: 'Stage Validation Level', passed: true, points: VALIDATION_STAGES.find(s => s.id === formData.validationStage)?.points || 5 },
      { label: 'Clear Moat / Defensibility', passed: formData.differentiation.length >= 30, points: 10 }
    ];
    const totalScore = Math.min(100, checks.reduce((sum, c) => (c.passed ? sum + c.points : sum), 0));
    return { checks, totalScore };
  }, [formData, grossMargin, allocationTotal]);

  const addMetric = () => {
    setFormData(prev => ({
      ...prev,
      tractionMetrics: [...prev.tractionMetrics, { key: '', value: '' }]
    }));
  };

  const removeMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tractionMetrics: prev.tractionMetrics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: formData.title || 'Untitled Project',
        tagline: formData.tagline || 'No tagline provided',
        industry: formData.industry,
        target_market: formData.targetMarket || 'General Market',
        problem_statement: formData.problem,
        solution_statement: formData.solution,
        business_model: formData.businessModel,
        unit_cost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        target_selling_price: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
        gross_margin: grossMargin ? parseFloat(grossMargin) : null,
        funding_sought: parseFloat(formData.fundingSought) || 0,
        equity_offered: formData.equityOffered ? parseFloat(formData.equityOffered) : null,
        investment_structure: formData.investmentStructure,
        use_of_funds: formData.useOfFunds,
        validation_status: formData.validationStage,
        traction_metrics: formData.tractionMetrics.filter(m => m.key && m.value),
        competitor_differentiation: formData.differentiation,
        validation_score: validationAudit.totalScore,
        status: 'published'
      };

      const { error } = await supabase.from('pitches').insert([payload]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save pitch to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pitch Saved to Database!</h2>
          <p className="text-slate-400 mb-6">
            Your startup idea achieved a validation score of <span className="font-bold text-emerald-400">{validationAudit.totalScore}/100</span> and is stored in Supabase.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition"
          >
            Create Another Pitch
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              <ShieldCheck size={14} /> Stage-Zero Gatekeeper
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Idea Validator & Pitch Desk</h1>
            <p className="text-slate-400 text-sm mt-1">Structure your business idea to meet investor standards before pitching.</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Validation Score</span>
              <span className={`text-2xl font-black ${
                validationAudit.totalScore >= 70 ? 'text-emerald-400' : validationAudit.totalScore >= 45 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {validationAudit.totalScore}<span className="text-sm font-normal text-slate-500">/100</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-sm bg-slate-950">
              <Award className={validationAudit.totalScore >= 70 ? 'text-emerald-400' : 'text-slate-600'} size={20} />
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {/* Form Wizard + Realtime Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Wizard Form */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
            
            {/* Steps Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              {[
                { s: 1, title: 'Concept', icon: Building2 },
                { s: 2, title: 'Economics', icon: PieChart },
                { s: 3, title: 'Validation', icon: TrendingUp }
              ].map(({ s, title, icon: Icon }) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition pb-1 ${
                    step === s ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={16} /> Step {s}: {title}
                </button>
              ))}
            </div>

            {/* STEP 1: CONCEPT */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Company / Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. EcoPack Innovations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Elevator Tagline (Max 140 chars)</label>
                  <input
                    type="text"
                    maxLength={140}
                    value={formData.tagline}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Bio-degradable shipping envelopes for local e-commerce stores"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Industry Sector</label>
                    <select
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Target Market</label>
                    <input
                      type="text"
                      value={formData.targetMarket}
                      onChange={e => setFormData({ ...formData, targetMarket: e.target.value })}
                      placeholder="e.g. Independent fashion boutiques"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Problem Statement</label>
                  <textarea
                    rows={3}
                    value={formData.problem}
                    onChange={e => setFormData({ ...formData, problem: e.target.value })}
                    placeholder="What specific pain point exists today and why are current alternatives inadequate?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Proposed Solution</label>
                  <textarea
                    rows={3}
                    value={formData.solution}
                    onChange={e => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="How does your product solve this pain point efficiently?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: ECONOMICS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Business Model</label>
                    <select
                      value={formData.businessModel}
                      onChange={e => setFormData({ ...formData, businessModel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Investment Structure</label>
                    <select
                      value={formData.investmentStructure}
                      onChange={e => setFormData({ ...formData, investmentStructure: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {STRUCTURES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Est. Unit Cost ($)</label>
                    <input
                      type="number"
                      value={formData.unitCost}
                      onChange={e => setFormData({ ...formData, unitCost: e.target.value })}
                      placeholder="12.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Target Price ($)</label>
                    <input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                      placeholder="35.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Gross Margin</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 flex items-center h-[42px]">
                      {grossMargin ? `${grossMargin}%` : '--'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Capital Sought ($)</label>
                    <input
                      type="number"
                      value={formData.fundingSought}
                      onChange={e => setFormData({ ...formData, fundingSought: e.target.value })}
                      placeholder="25000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Terms Offered (% / Stake)</label>
                    <input
                      type="number"
                      value={formData.equityOffered}
                      onChange={e => setFormData({ ...formData, equityOffered: e.target.value })}
                      placeholder="10"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Use of Funds Allocation</label>
                    <span className={`text-xs font-bold ${allocationTotal === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Total: {allocationTotal}% {allocationTotal === 100 ? '✓' : '(Must equal 100%)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['inventory', 'marketing', 'operations'].map(key => (
                      <div key={key} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 capitalize block mb-1">{key} %</span>
                        <input
                          type="number"
                          value={formData.useOfFunds[key as keyof typeof formData.useOfFunds]}
                          onChange={e => setFormData({
                            ...formData,
                            useOfFunds: { ...formData.useOfFunds, [key]: Number(e.target.value) }
                          })}
                          className="w-full bg-transparent font-bold text-sm text-slate-100 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VALIDATION & TRACTION */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Current Validation Milestone</label>
                  <select
                    value={formData.validationStage}
                    onChange={e => setFormData({ ...formData, validationStage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {VALIDATION_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label} (+{s.points} pts)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Traction Metrics & Proof of Demand</label>
                    <button
                      type="button"
                      onClick={addMetric}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      <Plus size={14} /> Add Metric
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.tractionMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Waitlist count"
                          value={metric.key}
                          onChange={e => {
                            const updated = [...formData.tractionMetrics];
                            updated[idx].key = e.target.value;
                            setFormData({ ...formData, tractionMetrics: updated });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="e.g. 450 signups"
                          value={metric.value}
                          onChange={e => {
                            const updated = [...formData.tractionMetrics];
                            updated[idx].value = e.target.value;
                            setFormData({ ...formData, tractionMetrics: updated });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeMetric(idx)}
                          className="p-2 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Competitive Moat / Unfair Advantage</label>
                  <textarea
                    rows={3}
                    value={formData.differentiation}
                    onChange={e => setFormData({ ...formData, differentiation: e.target.value })}
                    placeholder="Why can't an established competitor replicate this within 60 days?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || validationAudit.totalScore < 50}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? (
                    <>Saving to Database... <Loader2 className="animate-spin" size={16} /></>
                  ) : (
                    <>Submit for Investor Review <Check size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Real-time Right Panel: Preview & Audit */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setPreviewTab('card')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
                  previewTab === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={14} /> Investor Card Preview
              </button>
              <button
                onClick={() => setPreviewTab('audit')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
                  previewTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> Validation Audit
              </button>
            </div>

            {previewTab === 'card' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">{formData.industry}</span>
                    <h3 className="text-xl font-bold mt-0.5">{formData.title || 'Untitled Pitch'}</h3>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                    {validationAudit.totalScore} Score
                  </div>
                </div>

                <p className="text-sm text-slate-300 italic">
                  "{formData.tagline || 'Elevator statement will appear here...'}"
                </p>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Capital Seeking</span>
                    <span className="font-bold text-slate-200">
                      {formData.fundingSought ? `$${Number(formData.fundingSought).toLocaleString()}` : 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Offer Structure</span>
                    <span className="font-bold text-slate-200">
                      {formData.equityOffered ? `${formData.equityOffered}% ` : ''}
                      {STRUCTURES.find(s => s.id === formData.investmentStructure)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gross Unit Margin</span>
                    <span className="font-bold text-emerald-400">{grossMargin ? `${grossMargin}%` : '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stage</span>
                    <span className="font-bold text-slate-200">
                      {VALIDATION_STAGES.find(s => s.id === formData.validationStage)?.label.split(':')[0]}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Key Validation Points:</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.tractionMetrics.filter(m => m.key && m.value).map((m, i) => (
                      <span key={i} className="text-[11px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                        <strong className="text-indigo-400">{m.key}:</strong> {m.value}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-700"
                >
                  Request Introduction & Financial Deck
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Gate Requirements Checklist</h4>
                {validationAudit.checks.map((chk, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className={chk.passed ? 'text-slate-200' : 'text-slate-500'}>{chk.label}</span>
                    <span className={`font-bold flex items-center gap-1 ${chk.passed ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {chk.passed ? `+${chk.points} pts` : '0 pts'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
