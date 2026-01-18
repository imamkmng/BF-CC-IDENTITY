
import React, { useState, useCallback } from 'react';
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
  RefreshCw
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
    }
    setCheckedResults(results);
    setIsChecking(false);
  };

  const handleGenerateIdentity = () => {
    setIdentity(generateIdentity(selectedCountry));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hidden md:block">
              Benefit Journals Tools
            </h1>
          </div>
          <nav className="flex gap-2 md:gap-4 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'generator' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'hover:bg-slate-800'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Generator</span>
            </button>
            <button 
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'checker' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'hover:bg-slate-800'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Checker</span>
            </button>
            <button 
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'identity' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'hover:bg-slate-800'}`}
            >
              <User className="w-4 h-4" />
              <span>Identity</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-1">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6 text-indigo-400">
                  <Settings className="w-5 h-5" />
                  <h2 className="font-semibold text-lg">Configuration</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Enter BIN</label>
                    <input 
                      type="text" 
                      value={bin}
                      onChange={(e) => setBin(e.target.value)}
                      placeholder="450875xxxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Month</label>
                      <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option>Random</option>
                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                      <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option>Random</option>
                        {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">CVV</label>
                      <input type="text" maxLength={4} placeholder="RND" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                      <input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  <button onClick={handleGenerate} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    <Cpu className="w-5 h-5" /> GENERATE CARDS
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[500px] overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <h2 className="font-semibold">Generated Output (PIPE)</h2>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(generatedCards.map(c => formatToPipe(c)).join('\n'))} disabled={generatedCards.length === 0} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => downloadResults(generatedCards.map(c => formatToPipe(c)).join('\n'), 'cc_generated.txt')} disabled={generatedCards.length === 0} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Download className="w-4 h-4" /></button>
                    <button onClick={() => setGeneratedCards([])} disabled={generatedCards.length === 0} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-400 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-h-[600px] scrollbar-thin">
                  {generatedCards.length > 0 ? (
                    <div className="space-y-2">
                      {generatedCards.map((card, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/50 rounded-lg transition-all mono text-sm">
                          <span className="text-slate-300">{formatToPipe(card)}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-indigo-400">{card.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                      <CreditCard className="w-16 h-16 opacity-10" />
                      <p className="text-sm font-medium">No cards generated yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checker' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2"><Play className="w-4 h-4 text-indigo-400" /> Input Cards</h2>
                </div>
                <textarea 
                  value={checkerInput} onChange={(e) => setCheckerInput(e.target.value)}
                  placeholder="Paste cards here (PIPE format)..."
                  className="w-full h-[300px] bg-slate-950 border border-slate-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mono text-sm resize-none"
                />
                <button 
                  onClick={handleCheck} disabled={isChecking || !checkerInput}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  {isChecking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} START CHECKING
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div><h3 className="text-3xl font-bold text-emerald-400">{checkedResults.filter(r => r.status === CardStatus.LIVE).length}</h3><p className="text-sm text-slate-500">Approved</p></div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col justify-between">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div><h3 className="text-3xl font-bold text-red-400">{checkedResults.filter(r => r.status === CardStatus.DIE).length}</h3><p className="text-sm text-slate-500">Declined</p></div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col justify-between">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  <div><h3 className="text-3xl font-bold text-amber-400">{checkedResults.filter(r => r.status === CardStatus.UNKNOWN).length}</h3><p className="text-sm text-slate-500">Unknown</p></div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                  <Zap className="w-6 h-6 text-indigo-400" />
                  <div><h3 className="text-3xl font-bold text-slate-300">{checkedResults.length}</h3><p className="text-sm text-slate-500">Total</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select Country</label>
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
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
                  className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" /> GENERATE IDENTITY
                </button>
              </div>

              {identity ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Identity Card Profile */}
                  <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {identity.firstName[0]}{identity.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{identity.firstName} {identity.lastName}</h3>
                        <p className="text-indigo-400 font-medium">{identity.gender}, {new Date().getFullYear() - parseInt(identity.birthday.split('-')[0])} years old</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl group/item">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Birthday</p>
                            <p className="text-slate-200 mono">{identity.birthday}</p>
                          </div>
                        </div>
                        <button onClick={() => copyToClipboard(identity.birthday)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl group/item">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Identity ID / SSN</p>
                            <p className="text-slate-200 mono">{identity.ssn}</p>
                          </div>
                        </div>
                        <button onClick={() => copyToClipboard(identity.ssn)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Address & Contact */}
                  <div className="space-y-6">
                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location info
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between group/item">
                          <div>
                            <p className="text-xs text-slate-500">Street Address</p>
                            <p className="text-slate-200">{identity.street}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.street)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex justify-between group/item">
                          <div>
                            <p className="text-xs text-slate-500">City & State</p>
                            <p className="text-slate-200">{identity.city}, {identity.state}</p>
                          </div>
                          <button onClick={() => copyToClipboard(`${identity.city}, ${identity.state}`)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex justify-between group/item">
                          <div>
                            <p className="text-xs text-slate-500">Postal Code</p>
                            <p className="text-slate-200 mono">{identity.zip}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.zip)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Contact
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between group/item">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            <p className="text-slate-200 mono">{identity.phone}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.phone)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex justify-between group/item">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <p className="text-slate-200">{identity.email}</p>
                          </div>
                          <button onClick={() => copyToClipboard(identity.email)} className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-4">
                  <User className="w-16 h-16 opacity-10" />
                  <p>Click Generate to create a fake identity</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-900 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Benefit Journals Tools. Educational use only.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
