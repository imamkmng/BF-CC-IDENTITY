import React, { useState } from 'react';
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
  Phone,
  Mail,
  Calendar,
  Fingerprint,
  RefreshCw,
  ExternalLink
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
  
  // Identity State
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [identity, setIdentity] = useState<Identity | null>(null);

  const [activeTab, setActiveTab] = useState<'generator' | 'checker' | 'identity'>('generator');

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
    setCheckedResults([]); // Clear previous results
    
    const lines = checkerInput.split('\n').filter(l => l.trim());
    const results: CheckedCard[] = [];

    for (const line of lines) {
      const parsed = parsePipeFormat(line);
      if (!parsed) {
        results.push({
          number: line,
          month: '',
          year: '',
          cvv: '',
          type: 'INVALID',
          status: CardStatus.INVALID,
          message: 'Invalid Format (Use PIPE)'
        });
        continue;
      }

      const isValidLuhn = luhnCheck(parsed.number);
      if (!isValidLuhn) {
        results.push({
          ...parsed,
          status: CardStatus.DIE,
          message: 'Luhn Check Failed'
        });
      } else {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 400));
        const rand = Math.random();
        let status = CardStatus.DIE;
        let message = 'Declined';
        
        if (rand > 0.8) {
          status = CardStatus.LIVE;
          message = 'Approved - CVV Matched';
        } else if (rand > 0.6) {
          status = CardStatus.UNKNOWN;
          message = 'Insufficient Funds';
        }

        results.push({
          ...parsed,
          status,
          message,
          bank: 'Global Bank ' + parsed.number.slice(0, 4),
          country: 'USA'
        });
      }
      // Update results progressively
      setCheckedResults([...results]);
    }
    setIsChecking(false);
  };

  const sendToChecker = () => {
    const pipeData = generatedCards.map(c => formatToPipe(c)).join('\n');
    setCheckerInput(pipeData);
    setActiveTab('checker');
  };

  const handleGenerateIdentity = () => {
    setIdentity(generateIdentity(selectedCountry));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              BENEFIT TOOLS PRO
            </h1>
          </div>
          <nav className="flex gap-1 md:gap-4">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl transition-all whitespace-nowrap font-semibold text-sm ${activeTab === 'generator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Generator</span>
            </button>
            <button 
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl transition-all whitespace-nowrap font-semibold text-sm ${activeTab === 'checker' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Checker</span>
            </button>
            <button 
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl transition-all whitespace-nowrap font-semibold text-sm ${activeTab === 'identity' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <User className="w-4 h-4" />
              <span>Identity</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-1">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-lg">Card Configuration</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">BIN Pattern</label>
                    <input 
                      type="text" 
                      value={bin}
                      onChange={(e) => setBin(e.target.value)}
                      placeholder="450875xxxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono text-indigo-400 placeholder:text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Month</label>
                      <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                        <option>Random</option>
                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Year</label>
                      <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                        <option>Random</option>
                        {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CVV</label>
                      <input type="text" maxLength={4} placeholder="RND" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono text-center" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                      <input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-center" />
                    </div>
                  </div>
                  <button onClick={handleGenerate} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]">
                    <Cpu className="w-5 h-5" /> GENERATE CARDS
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-full min-h-[500px] overflow-hidden shadow-2xl">
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <h2 className="font-bold">Generated Output (PIPE)</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={sendToChecker} 
                      disabled={generatedCards.length === 0} 
                      className="px-3 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all disabled:opacity-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                      <ExternalLink className="w-3 h-3" /> Push to Checker
                    </button>
                    <div className="w-px h-8 bg-slate-800 mx-1"></div>
                    <button onClick={() => copyToClipboard(generatedCards.map(c => formatToPipe(c)).join('\n'))} disabled={generatedCards.length === 0} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => downloadResults(generatedCards.map(c => formatToPipe(c)).join('\n'), 'cc_generated.txt')} disabled={generatedCards.length === 0} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Download className="w-4 h-4" /></button>
                    <button onClick={() => setGeneratedCards([])} disabled={generatedCards.length === 0} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-h-[600px] scrollbar-thin">
                  {generatedCards.length > 0 ? (
                    <div className="space-y-2">
                      {generatedCards.map((card, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-4 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/50 rounded-2xl transition-all mono text-sm">
                          <span className="text-slate-300 font-medium tracking-wider">{formatToPipe(card)}</span>
                          <span className="px-2 py-1 bg-slate-900 rounded text-[10px] uppercase font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">{card.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 py-20">
                      <CreditCard className="w-20 h-20 opacity-5" />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Standby</p>
                        <p className="text-xs mt-1">Configure and generate to see results</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Play className="w-4 h-4 text-indigo-400" /> Card Input</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{checkerInput.split('\n').filter(l => l.trim()).length} cards detected</span>
                </div>
                <textarea 
                  value={checkerInput} onChange={(e) => setCheckerInput(e.target.value)}
                  placeholder="Paste cards here (Format: NUMBER|MM|YYYY|CVV)"
                  className="w-full h-[350px] bg-slate-950 border border-slate-800 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono text-sm resize-none scrollbar-thin"
                />
                <div className="flex gap-4">
                   <button 
                    onClick={() => setCheckerInput('')}
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleCheck} disabled={isChecking || !checkerInput}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                  >
                    {isChecking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} START VALIDATION
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest">Live</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-4xl font-black text-emerald-400">{checkedResults.filter(r => r.status === CardStatus.LIVE).length}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Approved</p>
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-[10px] font-bold text-red-400/50 uppercase tracking-widest">Die</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-4xl font-black text-red-400">{checkedResults.filter(r => r.status === CardStatus.DIE).length}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Declined</p>
                    </div>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest">Unknown</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-4xl font-black text-amber-400">{checkedResults.filter(r => r.status === CardStatus.UNKNOWN).length}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Incomplete</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <Zap className="w-6 h-6 text-indigo-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processed</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-4xl font-black text-slate-300">{checkedResults.length}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Checked</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[200px] shadow-2xl">
                   <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest">Live Logs</h4>
                    <button 
                      onClick={() => downloadResults(checkedResults.filter(r => r.status === CardStatus.LIVE).map(r => formatToPipe(r)).join('\n'), 'live_cards.txt')}
                      disabled={!checkedResults.some(r => r.status === CardStatus.LIVE)}
                      className="text-emerald-400 text-[10px] font-bold uppercase hover:underline disabled:opacity-0"
                    >
                      Export Lives
                    </button>
                   </div>
                   <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[250px] scrollbar-thin">
                    {checkedResults.length > 0 ? (
                      [...checkedResults].reverse().map((res, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-xs mono ${
                          res.status === CardStatus.LIVE ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          res.status === CardStatus.DIE ? 'bg-red-500/5 border-red-500/10 text-slate-500' :
                          'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <span>{formatToPipe(res)}</span>
                          <span className="font-bold opacity-80">{res.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-10">
                        <p className="text-xs font-bold uppercase">Awaiting Process</p>
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
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Fingerprint className="w-32 h-32" />
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-end mb-12">
                <div className="flex-1 w-full relative">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Select Country</label>
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-bold text-lg"
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
                </div>
                <button 
                  onClick={handleGenerateIdentity}
                  className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
                >
                  <RefreshCw className="w-5 h-5" /> RE-GENERATE
                </button>
              </div>

              {identity ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Identity Card Profile */}
                  <div className="bg-slate-950/80 rounded-3xl p-8 border border-slate-800/50 relative overflow-hidden group shadow-inner">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        {identity.firstName[0]}{identity.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-black text-white leading-none mb-1">{identity.firstName} {identity.lastName}</h3>
                        <p className="text-indigo-400 font-bold uppercase tracking-wider text-xs">{identity.gender} • {new Date().getFullYear() - parseInt(identity.birthday.split('-')[0])} YRS OLD</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Birthday', val: identity.birthday, icon: Calendar },
                        { label: 'Gov ID / SSN', val: identity.ssn, icon: Fingerprint }
                      ].map((item, i) => (
                        <div key={i} className="group/item flex items-center justify-between p-5 bg-slate-900/40 border border-slate-800/30 rounded-2xl hover:border-indigo-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <item.icon className="w-5 h-5 text-slate-600" />
                            <div>
                              <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">{item.label}</p>
                              <p className="text-slate-200 font-bold mono text-lg">{item.val}</p>
                            </div>
                          </div>
                          <button onClick={() => copyToClipboard(item.val)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all active:scale-90"><Copy className="w-4 h-4 text-indigo-400" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Contact */}
                  <div className="space-y-6">
                    <div className="bg-slate-950/50 rounded-3xl p-8 border border-slate-800/50 shadow-lg">
                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <MapPin className="w-4 h-4" /> LOCATION DETAILS
                      </h4>
                      <div className="space-y-6">
                        {[
                          { label: 'Address', val: identity.street },
                          { label: 'City & State', val: `${identity.city}, ${identity.state}` },
                          { label: 'Zip Code', val: identity.zip, mono: true }
                        ].map((item, i) => (
                          <div key={i} className="group/item flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{item.label}</p>
                              <p className={`text-slate-200 font-semibold ${item.mono ? 'mono' : ''}`}>{item.val}</p>
                            </div>
                            <button onClick={() => copyToClipboard(item.val)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3 text-indigo-400" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-600/5 rounded-3xl p-8 border border-indigo-500/10 shadow-lg">
                      <h4 className="text-xs font-black text-indigo-500/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Phone className="w-4 h-4" /> SECURE CONTACT
                      </h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center group/item">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Phone className="w-4 h-4 text-indigo-400" /></div>
                            <p className="text-slate-200 font-bold mono">{identity.phone}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.phone)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3 text-indigo-400" /></button>
                        </div>
                        <div className="flex justify-between items-center group/item">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Mail className="w-4 h-4 text-indigo-400" /></div>
                            <p className="text-slate-200 font-bold">{identity.email}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.email)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3 text-indigo-400" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-700 gap-6">
                  <div className="w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center border border-slate-800 shadow-2xl">
                    <User className="w-12 h-12 opacity-10" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl uppercase tracking-widest opacity-20">Identity Vault</p>
                    <p className="text-sm mt-2 opacity-40">Select a country and generate a profile</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-900 py-10 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-40">
            <Zap className="w-4 h-4" />
            <span className="font-black text-xs tracking-tighter uppercase">Benefit Tools Pro</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} EDUCATIONAL RESEARCH PURPOSES ONLY</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;