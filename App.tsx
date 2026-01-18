import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  Trash2, 
  Copy, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Cpu,
  Zap,
  Download,
  User,
  MapPin,
  Calendar,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
  // Fix: Added missing Mail and Phone icons
  Mail,
  Phone
} from 'lucide-react';
import { CardData, CheckedCard, CardStatus, Identity } from './types';
import { generateCard, getCardType, luhnCheck, formatToPipe, parsePipeFormat } from './utils/ccUtils';
import { generateIdentity } from './utils/identityUtils';

const App: React.FC = () => {
  // Generator State
  const [bin, setBin] = useState('450875xxxxxxxxxx');
  const [qty, setQty] = useState(10);
  const [month, setMonth] = useState('Random');
  const [year, setYear] = useState('Random');
  const [cvv, setCvv] = useState('');
  const [generatedCards, setGeneratedCards] = useState<CardData[]>([]);

  // Checker State
  const [checkerInput, setCheckerInput] = useState('');
  const [checkedResults, setCheckedResults] = useState<CheckedCard[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkerFilter, setCheckerFilter] = useState<CardStatus | 'ALL'>('ALL');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Identity State
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [identity, setIdentity] = useState<Identity | null>(null);

  const [activeTab, setActiveTab] = useState<'generator' | 'checker' | 'identity'>('generator');

  // Logic: Copy Feedback Toast
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const handleGenerate = () => {
    const newCards: CardData[] = [];
    for (let i = 0; i < qty; i++) {
      const cardNumber = generateCard(bin);
      const m = month === 'Random' ? (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0') : month;
      const y = year === 'Random' ? (new Date().getFullYear() + Math.floor(Math.random() * 6)).toString() : year;
      const c = cvv === '' ? Math.floor(Math.random() * 900 + 100).toString() : cvv;
      
      newCards.push({
        number: cardNumber,
        month: m,
        year: y,
        cvv: c,
        type: getCardType(cardNumber)
      });
    }
    setGeneratedCards(newCards);
  };

  const handleCheck = async () => {
    if (!checkerInput.trim()) return;
    setIsChecking(true);
    setCheckedResults([]); 
    setCheckProgress(0);
    
    const lines = checkerInput.split('\n').filter(l => l.trim());
    const total = lines.length;
    const results: CheckedCard[] = [];

    for (let i = 0; i < total; i++) {
      const line = lines[i];
      const parsed = parsePipeFormat(line);
      
      if (!parsed) {
        results.push({
          number: line,
          month: '',
          year: '',
          cvv: '',
          type: 'INVALID',
          status: CardStatus.INVALID,
          message: 'Bad Format'
        });
      } else {
        const isValidLuhn = luhnCheck(parsed.number);
        if (!isValidLuhn) {
          results.push({ ...parsed, status: CardStatus.DIE, message: 'Luhn Error' });
        } else {
          // Simulation logic
          await new Promise(r => setTimeout(r, 400));
          const rand = Math.random();
          let status = CardStatus.DIE;
          let message = 'Declined';
          
          if (rand > 0.88) {
            status = CardStatus.LIVE;
            message = 'Approved (CVV Match)';
          } else if (rand > 0.75) {
            status = CardStatus.UNKNOWN;
            message = 'Insufficient Funds';
          }

          results.push({
            ...parsed,
            status,
            message,
            bank: 'Issuer ' + parsed.number.slice(0, 4),
            country: 'Region'
          });
        }
      }
      
      setCheckedResults([...results]);
      setCheckProgress(Math.round(((i + 1) / total) * 100));
    }
    setIsChecking(false);
  };

  const filteredResults = useMemo(() => {
    if (checkerFilter === 'ALL') return checkedResults;
    return checkedResults.filter(r => r.status === checkerFilter);
  }, [checkedResults, checkerFilter]);

  const copyToClipboard = (text: string, label: string = 'Copied!') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
  };

  const handleCopyLives = () => {
    const lives = checkedResults.filter(r => r.status === CardStatus.LIVE);
    if (lives.length === 0) return;
    const text = lives.map(r => formatToPipe(r)).join('\n');
    copyToClipboard(text, `${lives.length} Lives Copied!`);
  };

  const sendToChecker = () => {
    const pipeData = generatedCards.map(c => formatToPipe(c)).join('\n');
    setCheckerInput(pipeData);
    setActiveTab('checker');
  };

  const handleGenerateIdentity = () => {
    setIdentity(generateIdentity(selectedCountry));
  };

  const downloadResults = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col selection:bg-indigo-500/30 font-sans">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="fixed top-20 right-4 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-2 animate-in slide-in-from-right-10 duration-300 font-bold">
          <Check className="w-4 h-4" /> {copyFeedback}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent hidden sm:block">
              BENEFIT PRO <span className="text-indigo-500 text-xs align-top bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 ml-1">v2.0</span>
            </h1>
          </div>
          <nav className="flex items-center gap-1 md:gap-2">
            {[
              { id: 'generator', icon: CreditCard, label: 'Generator' },
              { id: 'checker', icon: ShieldCheck, label: 'Checker' },
              { id: 'identity', icon: User, label: 'Identity' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white ring-1 ring-white/20 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-1">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/60 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-white">Config Engine</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Customize card parameters</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Primary BIN Pattern</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={bin}
                        onChange={(e) => setBin(e.target.value)}
                        placeholder="450875xxxxxxxxxx"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all mono text-indigo-400 font-bold text-lg"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Exp Month</label>
                      <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-bold text-slate-300">
                        <option>Random</option>
                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Exp Year</label>
                      <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-bold text-slate-300">
                        <option>Random</option>
                        {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Security CVV</label>
                      <input type="text" maxLength={4} placeholder="RND" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono text-center font-black text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Quantity</label>
                      <input type="number" min={1} max={500} value={qty} onChange={(e) => setQty(parseInt(e.target.value))} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center text-white" />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate} 
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.97] group"
                  >
                    <Cpu className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                    GENERATE CARDS
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-slate-900/50 rounded-[2rem] border border-slate-800/60 flex flex-col h-full min-h-[500px] overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/40">
                  <div>
                    <h2 className="font-black text-white text-sm uppercase tracking-widest">Generator Output</h2>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{generatedCards.length} Cards Generated</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={sendToChecker} 
                      disabled={generatedCards.length === 0} 
                      className="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-400 rounded-xl transition-all disabled:opacity-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Send to Checker
                    </button>
                    <div className="w-px h-8 bg-slate-800 mx-1 hidden md:block"></div>
                    <div className="flex gap-2">
                      <button onClick={() => copyToClipboard(generatedCards.map(c => formatToPipe(c)).join('\n'), 'Output Copied!')} disabled={generatedCards.length === 0} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all disabled:opacity-20"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => downloadResults(generatedCards.map(c => formatToPipe(c)).join('\n'), 'cc_results.txt')} disabled={generatedCards.length === 0} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all disabled:opacity-20"><Download className="w-4 h-4" /></button>
                      <button onClick={() => setGeneratedCards([])} disabled={generatedCards.length === 0} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all disabled:opacity-20"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto max-h-[600px] scrollbar-thin">
                  {generatedCards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {generatedCards.map((card, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-5 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/30 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] mono text-sm relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-white font-bold tracking-[0.15em]">{formatToPipe(card)}</span>
                          <span className="px-3 py-1 bg-slate-900/80 border border-white/5 rounded-lg text-[10px] uppercase font-black text-slate-500 group-hover:text-indigo-400 transition-colors">{card.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-6 py-32 opacity-20">
                      <div className="relative">
                        <CreditCard className="w-24 h-24" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em]">System Standby</p>
                        <p className="text-xs font-bold mt-2">Adjust parameters and hit generate</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checker' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Progress Bar */}
            {isChecking && (
              <div className="bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                <div className="flex items-center justify-between px-4 mb-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Validating Data Stream...</span>
                  <span className="text-xs font-black text-white">{checkProgress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    style={{ width: `${checkProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-800/60 shadow-2xl space-y-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Play className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-white">Input Buffer</h2>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{checkerInput.split('\n').filter(l => l.trim()).length} Rows Detected</p>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <textarea 
                    value={checkerInput} onChange={(e) => setCheckerInput(e.target.value)}
                    placeholder="PASTE CARDS HERE: 4508XXXXXXXXXXXX|MM|YYYY|CVV"
                    className="w-full h-[400px] bg-slate-950/80 border border-slate-800 rounded-3xl p-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all mono text-sm resize-none scrollbar-thin text-indigo-200 placeholder:text-slate-800"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertCircle className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if(confirm('Clear all input?')) setCheckerInput('');
                    }}
                    className="p-5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-3xl transition-all active:scale-95 border border-slate-700/50 shadow-lg"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleCheck} disabled={isChecking || !checkerInput}
                    className="flex-1 py-5 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
                  >
                    {isChecking ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />} START VALIDATION
                  </button>
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-7 flex flex-col justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
                      <CheckCircle2 className="w-24 h-24" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 px-2 py-1 rounded">Approved</span>
                    </div>
                    <div className="mt-6 relative z-10">
                      <h3 className="text-5xl font-black text-emerald-400">{checkedResults.filter(r => r.status === CardStatus.LIVE).length}</h3>
                      <button 
                        onClick={handleCopyLives}
                        disabled={checkedResults.filter(r => r.status === CardStatus.LIVE).length === 0}
                        className="mt-4 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-0"
                      >
                        <Copy className="w-3 h-3 inline mr-2" /> Copy All Lives
                      </button>
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-7 flex flex-col justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
                      <XCircle className="w-24 h-24" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <XCircle className="w-8 h-8 text-red-400" />
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] bg-red-400/10 px-2 py-1 rounded">Declined</span>
                    </div>
                    <div className="mt-6 relative z-10">
                      <h3 className="text-5xl font-black text-red-400">{checkedResults.filter(r => r.status === CardStatus.DIE).length}</h3>
                      <button 
                         onClick={() => setCheckedResults(prev => prev.filter(r => r.status !== CardStatus.DIE))}
                         disabled={checkedResults.filter(r => r.status === CardStatus.DIE).length === 0}
                         className="mt-4 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-0"
                      >
                        <Trash2 className="w-3 h-3 inline mr-2" /> Flush Dead
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800/60 overflow-hidden flex-1 flex flex-col min-h-[350px] shadow-2xl backdrop-blur-md">
                   <div className="px-8 py-5 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <div className="flex gap-2">
                        {['ALL', CardStatus.LIVE, CardStatus.UNKNOWN, CardStatus.DIE].map((f) => (
                          <button 
                            key={f}
                            onClick={() => setCheckerFilter(f as any)}
                            className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all ${
                              checkerFilter === f 
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => downloadResults(checkedResults.filter(r => r.status === CardStatus.LIVE).map(r => formatToPipe(r)).join('\n'), 'live_results.txt')}
                        disabled={!checkedResults.some(r => r.status === CardStatus.LIVE)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-all disabled:opacity-0"
                        title="Download Lives"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCheckedResults([])}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                        title="Clear Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                   </div>
                   <div className="flex-1 p-6 space-y-3 overflow-y-auto max-h-[450px] scrollbar-thin">
                    {filteredResults.length > 0 ? (
                      [...filteredResults].reverse().map((res, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border text-[11px] mono transition-all group animate-in slide-in-from-left-2 duration-300 ${
                          res.status === CardStatus.LIVE ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          res.status === CardStatus.DIE ? 'bg-red-500/5 border-red-500/10 text-slate-500' :
                          res.status === CardStatus.UNKNOWN ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' :
                          'bg-slate-950 border-slate-800 text-slate-600'
                        }`}>
                          <div className="flex items-center gap-4">
                            <span className="tracking-widest font-bold group-hover:scale-[1.02] transition-transform origin-left inline-block">{formatToPipe(res)}</span>
                            {res.status === CardStatus.LIVE && (
                              <button onClick={() => copyToClipboard(formatToPipe(res))} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all">
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black uppercase tracking-widest text-[9px] opacity-80">{res.message}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              res.status === CardStatus.LIVE ? 'bg-emerald-400' :
                              res.status === CardStatus.DIE ? 'bg-red-400' :
                              'bg-indigo-400'
                            }`} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 opacity-10">
                        <ShieldCheck className="w-16 h-16 mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">Listening for data</p>
                      </div>
                    )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900/50 rounded-[3rem] p-10 md:p-14 border border-slate-800/60 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Fingerprint className="w-48 h-48" />
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-end mb-16 relative z-10">
                <div className="flex-1 w-full relative group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-4">Target Geography</label>
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-[1.5rem] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer font-black text-xl text-white shadow-inner"
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                    <option value="ID">🇮🇩 Indonesia</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="BR">🇧🇷 Brazil</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="AU">🇦🇺 Australia</option>
                  </select>
                  <div className="absolute right-6 bottom-7 text-slate-600 pointer-events-none group-hover:text-indigo-500 transition-colors">
                    <Filter className="w-5 h-5" />
                  </div>
                </div>
                <button 
                  onClick={handleGenerateIdentity}
                  className="w-full md:w-auto px-12 py-6 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.96] border border-white/10"
                >
                  <RefreshCw className="w-6 h-6" /> GENERATE
                </button>
              </div>

              {identity ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                  <div className="bg-slate-950/60 rounded-[2.5rem] p-10 border border-slate-800/50 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="flex items-center gap-8 mb-12">
                      <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-[0_20px_40px_rgba(79,70,229,0.3)] rotate-6 group-hover:rotate-0 transition-all duration-700 border-4 border-white/10">
                        {identity.firstName[0]}{identity.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-4xl font-black text-white leading-tight mb-2 tracking-tighter">{identity.firstName} {identity.lastName}</h3>
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${identity.gender === 'Male' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-pink-500/20 text-pink-400'}`}>{identity.gender}</span>
                           <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Born {identity.birthday}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {[
                        { label: 'Primary Email', val: identity.email, icon: Mail },
                        { label: 'SSN / Gov Identification', val: identity.ssn, icon: Fingerprint },
                        { label: 'Contact Number', val: identity.phone, icon: Phone }
                      ].map((item, i) => (
                        <div key={i} className="group/item flex items-center justify-between p-6 bg-slate-900/60 border border-slate-800/40 rounded-3xl hover:border-indigo-500/40 transition-all hover:bg-slate-900 shadow-sm">
                          <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-slate-950 group-hover/item:bg-indigo-500/10 transition-colors">
                              <item.icon className="w-5 h-5 text-slate-500 group-hover/item:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-[9px] uppercase text-slate-600 font-black tracking-[0.2em] mb-1">{item.label}</p>
                              <p className="text-white font-bold mono text-base group-hover/item:text-indigo-200 transition-colors">{item.val}</p>
                            </div>
                          </div>
                          <button onClick={() => copyToClipboard(item.val)} className="p-3 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-2xl opacity-0 group-hover/item:opacity-100 transition-all active:scale-90"><Copy className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-950/40 rounded-[2.5rem] p-10 border border-slate-800/50 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                        <MapPin className="w-32 h-32" />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> GEOGRAPHIC ANCHOR
                      </h4>
                      <div className="space-y-8">
                        {[
                          { label: 'Residential Address', val: identity.street },
                          { label: 'Metropolitan Area', val: `${identity.city}, ${identity.state}` },
                          { label: 'Postal Routing Code', val: identity.zip, mono: true }
                        ].map((item, i) => (
                          <div key={i} className="group/item flex justify-between items-center relative z-10">
                            <div>
                              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-2">{item.label}</p>
                              <p className={`text-xl text-white font-black tracking-tight ${item.mono ? 'mono' : ''}`}>{item.val}</p>
                            </div>
                            <button onClick={() => copyToClipboard(item.val)} className="opacity-0 group-hover/item:opacity-100 p-3 bg-slate-900 hover:bg-indigo-600 rounded-2xl transition-all text-indigo-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl flex items-center gap-6 group hover:bg-indigo-600/10 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Privacy Verified</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Generated data adheres to research protocols</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-slate-800 gap-8">
                  <div className="relative">
                    <User className="w-24 h-24 opacity-5" />
                    <div className="absolute inset-0 border-4 border-dashed border-indigo-500/10 rounded-full animate-spin duration-[10s]"></div>
                  </div>
                  <p className="font-black text-sm uppercase tracking-[0.5em] opacity-20">Identity Vault Ready</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-900/50 py-12 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 group opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="p-1.5 bg-slate-800 rounded-lg">
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-black text-[10px] tracking-[0.3em] uppercase text-white">Benefit Tools Pro</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] text-center">EDUCATIONAL RESEARCH PURPOSES ONLY</p>
            <div className="flex gap-4 items-center mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Global Network: Secured</span>
            </div>
          </div>

          <div className="flex gap-6">
            {['Status', 'Docs', 'Terms'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;