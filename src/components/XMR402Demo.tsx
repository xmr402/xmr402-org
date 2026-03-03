import React, { useState, useEffect } from 'react';
import { Shield, Zap, Terminal, Lock, Unlock, AlertCircle, ChevronRight, RefreshCw, Layers, Cpu, Globe, Timer } from 'lucide-react';

const WORKER_URL = "https://demo-api.xmr402.org";

export const XMR402Demo: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'challenging' | 'pending' | 'verifying' | 'authorized'>('idle');
  const [challenge, setChallenge] = useState<any>(null);
  const [intel, setIntel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual form inputs
  const [manualTxid, setManualTxid] = useState('');
  const [manualProof, setManualProof] = useState('');

  // Terminal detection state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // 5-minute expiry timer
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (timeRemaining === null || stage !== 'pending') return;

    if (timeRemaining <= 0) return;

    const timerObj = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerObj);
  }, [timeRemaining, stage]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Transparent Handback via return_url parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txid = params.get('xmr402_txid');
    const proof = params.get('xmr402_proof');

    if (txid && proof) {
      // Clear URL state gracefully without triggering reload
      window.history.replaceState({}, document.title, window.location.pathname);

      // Auto-populate the terminal simulation as complete
      setManualTxid(txid);
      setManualProof(proof);
      setStage('verifying');

      // Attempt verification against API instantly
      verifyCredentials(txid, proof);
    }
  }, []);

  const verifyCredentials = async (txid: string, proof: string) => {
    try {
      const authHeader = `XMR402 txid="${txid}", proof="${proof}"`;
      const res = await fetch(`${WORKER_URL}/intel`, {
        headers: { 'Authorization': authHeader }
      });

      if (res.ok) {
        const data = await res.json();
        setIntel(data);
        setStage('authorized');
      } else {
        setError(`Proof rejected: The node has not seen this transaction yet (HTTP ${res.status}). Try manually waiting a moment and clicking Execute Protocol. `);
        setStage(challenge ? 'pending' : 'idle');
      }
    } catch (e: any) {
      setError(`Verification error: ${e.message}`);
      setStage(challenge ? 'pending' : 'idle');
    }
  };

  const startDemo = async () => {
    setStage('challenging');
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/intel`);
      if (res.status === 402) {
        const challengeHeader = res.headers.get('WWW-Authenticate');
        // Parse basic params from header
        const addressMatch = challengeHeader?.match(/address="([^"]+)"/);
        const amountMatch = challengeHeader?.match(/amount="([^"]+)"/);
        const messageMatch = challengeHeader?.match(/message="([^"]+)"/);

        setChallenge({
          address: addressMatch?.[1],
          amount: amountMatch?.[1],
          message: messageMatch?.[1]
        });
        setTimeRemaining(300); // 5 minutes
        setStage('pending');
      } else {
        const data = await res.json();
        if (data.status === 'AUTHORIZED') {
          setIntel(data);
          setStage('authorized');
        }
      }
    } catch (err: any) {
      setError("Failed to connect to Shadow Archives node.");
      setStage('idle');
    }
  };

  const authorizeWithRipley = () => {
    if (!challenge) return;

    // Inject return_url for transparent handback
    const returnUrl = encodeURIComponent(window.location.href);
    const url = `xmr402://${challenge.address}?amount=${challenge.amount}&message=${encodeURIComponent(challenge.message)}&return_url=${returnUrl}`;

    window.location.href = url;

    // Deep-link fallback detection
    // If the browser doesn't lose focus in 2.5 seconds, the app likely didn't launch
    const timeout = setTimeout(() => {
      if (document.hasFocus()) {
        setShowInstallPrompt(true);
      }
    }, 2500);

    const handleBlur = () => {
      clearTimeout(timeout);
      window.removeEventListener('blur', handleBlur);
    };
    window.addEventListener('blur', handleBlur);
  };

  const verifyManual = async () => {
    if (!manualTxid || !manualProof) {
      setError("TXID and Proof are required for manual verification.");
      return;
    }
    setStage('verifying');
    setError(null);
    try {
      const authHeader = `XMR402 txid="${manualTxid}", proof="${manualProof}"`;
      const res = await fetch(`${WORKER_URL}/intel`, {
        headers: {
          "Authorization": authHeader
        }
      });

      const data = await res.json();
      if (res.ok && data.status === 'AUTHORIZED') {
        setIntel(data);
        setStage('authorized');
      } else {
        setError(data.error || "Verification failed. Proof invalid or transaction not found.");
        setStage('pending');
      }
    } catch (err: any) {
      setError("Communication failure with Shadow Archives.");
      setStage('pending');
    }
  };

  const reset = () => {
    setStage('idle');
    setChallenge(null);
    setIntel(null);
    setError(null);
    setManualTxid('');
    setManualProof('');
    setTimeRemaining(null);
    setShowInstallPrompt(false);
  };

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg overflow-hidden font-mono relative w-full shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="bg-[rgba(0,255,65,0.05)] py-4 pl-5 pr-14 sm:pr-10 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[var(--brand-color)]" />
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-[var(--brand-color)] m-0">Shadow_Archives_Terminal</h3>
        </div>
        <div className="flex items-center gap-2 opacity-50 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-color)] animate-pulse" />
          <span className="text-[8px] sm:text-[9px] uppercase font-black">Node: Online</span>
        </div>
      </div>

      <div className="p-5 sm:p-10 min-h-[350px] sm:min-h-[400px]">
        {stage === 'idle' && (
          <div className="py-8 sm:py-12 text-center space-y-6">
            <div className="max-w-md mx-auto">
              <Shield size={40} className="mx-auto opacity-20 mb-4 text-[var(--brand-color)]" />
              <h4 className="text-base sm:text-lg font-black uppercase italic mb-2 tracking-wider">Restricted_Access_Archives</h4>
              <p className="text-[10px] sm:text-xs text-[var(--text-dim)] leading-relaxed uppercase">
                Access to the Shadow Archives is restricted to entities capable of satisfying the XMR402 Protocol challenge.
                Prepare 0.001 XMR for tactical intake.
              </p>
            </div>
            <button
              onClick={startDemo}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all inline-flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:opacity-90 active:translate-y-0"
            >
              Initialize_Uplink
            </button>
          </div>
        )}

        {stage === 'challenging' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--brand-color)] transition-all duration-300">
              Pinging_Gated_Resource...
            </div>
          </div>
        )}

        {stage === 'pending' && challenge && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Tactical Challenge Card */}
            <div className="bg-white/5 border border-[var(--border-color)] p-6 space-y-4 rounded relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-color)] opacity-50" />

              <div className="flex items-center gap-3">
                <Lock size={14} className="text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">402_Payment_Required</span>

                <div className="ml-auto flex items-center gap-4">
                  {timeRemaining !== null && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-black tracking-wider ${timeRemaining === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      <Timer size={12} className={timeRemaining > 0 && timeRemaining <= 60 ? 'animate-pulse' : ''} />
                      {timeRemaining > 0 ? formatTime(timeRemaining) : 'EXPIRED'}
                    </div>
                  )}
                  <span className="text-[9px] text-[var(--text-dim)] uppercase font-bold hidden sm:block">Protocol_Handshake: Pending_Settlement</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t border-white/5 pt-4">
                <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-widest whitespace-nowrap">Target_Address</label>
                <div className="bg-black/20 border border-dashed border-[var(--border-color)] text-[var(--brand-color)] rounded break-all font-mono py-2 px-3 flex-1 text-xs text-center sm:text-left">
                  {challenge.address}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:items-center gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 w-full lg:w-1/3">
                  <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-widest whitespace-nowrap">Amount</label>
                  <div className="text-xl font-black italic text-[var(--brand-color)]">
                    {Number(challenge.amount) >= 1000000 ? (Number(challenge.amount) / 1e12).toFixed(4) : challenge.amount}
                    <span className="text-[10px] ml-1 opacity-50 not-italic">XMR</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-2/3">
                  <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-widest whitespace-nowrap">Nonce</label>
                  <div className="text-[10px] font-mono text-[var(--text-dim)] bg-black/40 py-2 px-3 border border-white/5 truncate rounded flex-1">
                    {challenge.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Automatic Ripley Flow */}
              <div className="bg-white/5 border border-[var(--border-color)] p-6 sm:p-8 rounded group cursor-pointer hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-sm">
                    <Zap size={24} className="text-[var(--brand-color)] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[var(--brand-color)] text-black shadow-lg shadow-emerald-500/20">Recommended</span>
                </div>
                <h5 className="text-xs sm:text-sm font-black uppercase tracking-widest mb-3">Authorize_via_Ripley</h5>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-dim)] uppercase leading-relaxed mb-6 sm:mb-8 opacity-70 font-medium">
                  Instantly wake up your localized tactical terminal. Handles cryptographic signing and mempool verification in one sequence.
                </p>
                <button
                  onClick={authorizeWithRipley}
                  disabled={timeRemaining === 0}
                  className={`px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all inline-flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:opacity-90 active:translate-y-0 w-full group disabled:opacity-20 disabled:hover:translate-y-0`}
                >
                  {timeRemaining === 0 ? 'TIME_EXPIRED' : 'EXECUTE_PROTOCOL'} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {showInstallPrompt && (
                  <div className="mt-4 p-4 border border-rose-500/30 bg-rose-500/5 rounded animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] text-rose-500/90 uppercase mb-3 font-bold leading-relaxed tracking-wider">
                      Terminal_Not_Detected
                    </p>
                    <a
                      href="https://kyc.rip/wallet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase font-black text-[var(--text-primary)] hover:text-[var(--brand-color)] transition-colors flex items-center justify-between group"
                    >
                      <span className="border-b border-transparent group-hover:border-[var(--brand-color)] pb-0.5">Download Ripley Terminal</span>
                      <Globe size={12} className="opacity-50 group-hover:opacity-100 group-hover:text-[var(--brand-color)]" />
                    </a>
                  </div>
                )}
              </div>

              {/* Manual Flow */}
              <div className="bg-white/5 border border-[var(--border-color)] p-6 sm:p-8 rounded space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={16} className="text-[var(--text-dim)]" />
                  <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] m-0">Standard_Node_Verification</h5>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[var(--text-dim)] uppercase leading-relaxed opacity-60 m-0">
                  Using Feather, Cake, or Monero-GUI? Transmit the piconero settlement then provide your TXid and Proof.
                </p>
                <div className="space-y-3 pt-2">
                  <input
                    placeholder="TRANSACTION_HASH (TXID)"
                    value={manualTxid}
                    onChange={(e) => setManualTxid(e.target.value)}
                    className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono outline-none transition-colors focus:border-[var(--brand-color)] py-2 px-3 text-[10px] sm:text-xs"
                  />
                  <input
                    placeholder="TX_PROOF (SIGNATURE)"
                    value={manualProof}
                    onChange={(e) => setManualProof(e.target.value)}
                    className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono outline-none transition-colors focus:border-[var(--brand-color)] py-2 px-3 text-[10px] sm:text-xs"
                  />
                  <button
                    onClick={verifyManual}
                    disabled={!manualTxid || !manualProof || timeRemaining === 0}
                    className="w-full py-3 bg-[var(--bg-primary)] border border-white/10 text-[var(--brand-color)] font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] hover:bg-[rgba(0,255,65,0.05)] hover:border-[var(--brand-color)] transition-all disabled:opacity-20 disabled:hover:bg-[var(--bg-primary)] disabled:hover:border-white/10"
                  >
                    VERIFY_UPLINK
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase italic animate-pulse">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
        )}

        {stage === 'verifying' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-color)]">
              Cryptographic_Verification_In_Progress...
            </div>
          </div>
        )}

        {stage === 'authorized' && intel && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="p-1 bg-[var(--brand-color)] rounded-sm">
              <div className="bg-[var(--bg-panel)] p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Unlock size={48} className="text-[var(--brand-color)]" />
                  </div>
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-[0.3em] text-[var(--brand-color)]">Archive_Unlocked</h4>

                <div className="p-5 border border-[var(--border-color)] bg-[rgba(0,255,65,0.03)] text-left space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black text-[var(--text-dim)]">Transaction_Settled</label>
                    <div className="text-[10px] opacity-40 uppercase truncate text-[var(--brand-color)] font-mono">
                      TXID: {intel.txid || '0-CONF_VERIFIED'}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--brand-color)] leading-relaxed italic border-l-2 border-[var(--brand-color)] pl-4 py-2 bg-black/20">
                    "{intel.intel}"
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="px-10 py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-xs transition-all inline-flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:opacity-90 active:translate-y-0"
                >
                  TERMINATE_SESSION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/20 py-4 px-5 sm:px-7 border-t border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Layers size={10} className="text-[var(--text-dim)]" />
            <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">Layers: 0-Conf, Stateless_Nonces</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu size={10} className="text-[var(--text-dim)]" />
            <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">Logic: Ripley_Guard_TS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
