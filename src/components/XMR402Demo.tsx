import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, Terminal, Lock, Unlock, AlertCircle, RefreshCw, Timer, Wifi, Send, ChevronRight } from 'lucide-react';

const WORKER_URL = "https://demo-api.xmr402.org";
const WS_URL = "wss://demo-api.xmr402.org/relay";

interface Frame {
  type: 'in' | 'out';
  data: any;
}

interface Challenge {
  address: string;
  amount: string;
  message: string;
}

interface Intel {
  status: string;
  intel: string;
  txid: string;
}

export const XMR402Demo: React.FC = () => {
  const { t } = useTranslation();
  const [protocol, setProtocol] = useState<'http' | 'ws'>('http');
  const [stage, setStage] = useState<'idle' | 'challenging' | 'pending' | 'verifying' | 'authorized'>('idle');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [intel, setIntel] = useState<Intel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // WS specific state
  const [wsFrames, setWsFrames] = useState<Frame[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Handle Transparent Handback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txid = params.get('xmr402_txid');
    const proof = params.get('xmr402_proof');

    if (txid && proof) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setManualTxid(txid);
      setManualProof(proof);
      setStage('verifying');
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
        setError(t('demo.error_proof_rejected', { status: res.status }));
        setStage(challenge ? 'pending' : 'idle');
      }
    } catch (e: any) {
      setError(t('demo.error_verification', { message: e.message }));
      setStage(challenge ? 'pending' : 'idle');
    }
  };

  const startHttpDemo = async () => {
    setStage('challenging');
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/intel`);
      if (res.status === 402) {
        const challengeHeader = res.headers.get('WWW-Authenticate');
        const addressMatch = challengeHeader?.match(/address="([^"]+)"/);
        const amountMatch = challengeHeader?.match(/amount="([^"]+)"/);
        const messageMatch = challengeHeader?.match(/message="([^"]+)"/);

        if (addressMatch?.[1] && amountMatch?.[1] && messageMatch?.[1]) {
          setChallenge({
              address: addressMatch[1],
              amount: amountMatch[1],
              message: messageMatch[1]
            });
          setTimeRemaining(300);
          setStage('pending');
        } else {
          setError(t('demo.error_parse'));
          setStage('idle');
        }
      }
    } catch (_err: any) {
      setError(t('demo.error_connect'));
      setStage('idle');
    }
  };

  const startWsDemo = () => {
    setStage('challenging');
    setError(null);
    setWsFrames([]);

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      const intent = { type: 'INTENT', action: 'SUBSCRIBE_SOVEREIGN_FEED' };
      socket.send(JSON.stringify(intent));
      setWsFrames(prev => [...prev, { type: 'out', data: intent }]);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setWsFrames(prev => [...prev, { type: 'in', data }]);

        if (data.type === 'PAYMENT_CHALLENGE') {
          setChallenge({
            address: data.address,
            amount: data.amount,
            message: data.message
          });
          setTimeRemaining(300);
          setStage('pending');
        } else if (data.type === 'ACCESS_GRANTED') {
          setIntel({ status: 'AUTHORIZED', intel: "Sovereign stream unlocked: 'The agents are moving into segment zero.'", txid: "WS_HANDSHAKE_COMPLETED" });
          setStage('authorized');
          socket.close();
        } else if (data.type === 'ERROR') {
          setError(data.message);
          setStage('idle');
        }
      } catch (_e) {
        setError(t('demo.error_ws_json'));
      }
    };

    socket.onerror = () => {
      setError(t('demo.error_ws_connect'));
      setStage('idle');
    };
  };

  const authorizeWithRipley = () => {
    if (!challenge) return;
    const returnUrl = encodeURIComponent(window.location.href);
    const url = `xmr402://${challenge.address}?amount=${challenge.amount}&message=${encodeURIComponent(challenge.message)}&return_url=${returnUrl}`;
    window.location.href = url;

    const timeout = setTimeout(() => {
      if (document.hasFocus()) setShowInstallPrompt(true);
    }, 2500);

    const handleBlur = () => {
      clearTimeout(timeout);
      window.removeEventListener('blur', handleBlur);
    };
    window.addEventListener('blur', handleBlur);
  };

  const verifyManual = async () => {
    if (!manualTxid || !manualProof) return;
    setStage('verifying');
    setError(null);

    if (protocol === 'ws' && wsRef.current?.readyState === WebSocket.OPEN && challenge) {
      const proofFrame = {
        type: 'PAYMENT_PROOF',
        txid: manualTxid,
        proof: manualProof,
        message: challenge.message
      };
      wsRef.current.send(JSON.stringify(proofFrame));
      setWsFrames(prev => [...prev, { type: 'out', data: proofFrame }]);
      // Response will be handled in onmessage
    } else {
      await verifyCredentials(manualTxid, manualProof);
    }
  };

  const reset = () => {
    if (wsRef.current) wsRef.current.close();
    setStage('idle');
    setChallenge(null);
    setIntel(null);
    setError(null);
    setManualTxid('');
    setManualProof('');
    setTimeRemaining(null);
    setShowInstallPrompt(false);
    setWsFrames([]);
  };

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg overflow-hidden font-mono relative w-full shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      {/* Terminal Header */}
      <div className="bg-[rgba(0,255,65,0.05)] py-4 pl-5 pr-14 sm:pr-10 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <Terminal size={14} className="text-[var(--brand-color)]" />
            <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-color)] m-0">{t('demo.header')}</h3>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            <button
              onClick={() => { if (stage === 'idle') setProtocol('http') }}
              className={`px-4 py-1.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest transition-all ${protocol === 'http' ? 'bg-[var(--brand-color)] text-black' : 'text-[var(--text-dim)] hover:text-white'}`}
            >
              HTTP_REST
            </button>
            <button
              onClick={() => { if (stage === 'idle') setProtocol('ws') }}
              className={`px-4 py-1.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest transition-all ${protocol === 'ws' ? 'bg-[var(--brand-color)] text-black' : 'text-[var(--text-dim)] hover:text-white'}`}
            >
              WS_RELAY
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-50 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-color)] animate-pulse" />
          <span className="text-[8px] sm:text-[9px] uppercase font-black">{t('demo.node_online')}</span>
        </div>
      </div>

      <div className="p-5 sm:p-10 min-h-[350px] sm:min-h-[400px]">
        {stage === 'idle' && (
          <div className="py-8 sm:py-12 text-center space-y-6">
            <div className="max-w-md mx-auto">
              <Shield size={40} className="mx-auto opacity-20 mb-4 text-[var(--brand-color)]" />
              <h4 className="text-base sm:text-lg font-black uppercase italic mb-2 tracking-wider">{t('demo.access_gate', { protocol: protocol.toUpperCase() })}</h4>
              <p className="text-[10px] sm:text-xs text-[var(--text-dim)] leading-relaxed uppercase">
                {protocol === 'http' ? t('demo.http_desc') : t('demo.ws_desc')}
              </p>
            </div>
            <button
              onClick={protocol === 'http' ? startHttpDemo : startWsDemo}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all inline-flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:opacity-90 active:translate-y-0"
            >
              {t('demo.init_uplink', { protocol: protocol.toUpperCase() })}
            </button>
          </div>
        )}

        {stage === 'challenging' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--brand-color)]">
              {protocol === 'ws' ? t('demo.negotiating_ws') : t('demo.negotiating_http')}
            </div>
          </div>
        )}

        {stage === 'pending' && challenge && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Protocol Animation */}
            {protocol === 'ws' && (
              <div className="bg-black/40 border border-white/5 p-4 rounded text-[9px] font-mono space-y-1 max-h-32 overflow-y-auto">
                {wsFrames.map((f: Frame, i: number) => (
                  <div key={i} className={f.type === 'out' ? 'text-blue-400' : 'text-emerald-400'}>
                    {f.type === 'out' ? t('demo.frame_send') : t('demo.frame_recv')} {JSON.stringify(f.data)}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 border border-[var(--border-color)] p-6 space-y-4 rounded relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-color)] opacity-50" />
              <div className="flex items-center gap-3">
                <Lock size={14} className="text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  {protocol === 'ws' ? t('demo.challenge_ws') : t('demo.challenge_http')}
                </span>
                <div className="ml-auto flex items-center gap-4">
                  {timeRemaining !== null && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-black tracking-wider ${timeRemaining === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      <Timer size={12} className={timeRemaining > 0 && timeRemaining <= 60 ? 'animate-pulse' : ''} />
                      {timeRemaining > 0 ? formatTime(timeRemaining) : t('demo.expired')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t border-white/5 pt-4">
                <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-widest">{t('demo.target_address')}</label>
                <div className="bg-black/20 border border-dashed border-[var(--border-color)] text-[var(--brand-color)] rounded break-all font-mono py-2 px-3 flex-1 text-xs text-center sm:text-left">
                  {challenge.address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-[var(--text-dim)] block mb-1">{t('demo.amount')}</label>
                  <div className="text-lg font-black italic text-[var(--brand-color)]">
                    {(Number(challenge.amount) / 1e12).toFixed(6)} <span className="text-[10px] not-italic opacity-50">XMR</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <label className="text-[10px] uppercase font-black text-[var(--text-dim)] block mb-1">{t('demo.nonce')}</label>
                  <div className="text-[10px] font-mono text-[var(--text-dim)] bg-black/40 py-2 px-3 border border-white/5 truncate rounded">
                    {challenge.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-[var(--border-color)] p-6 rounded group cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={authorizeWithRipley}>
                <Zap size={20} className="text-[var(--brand-color)] mb-4" />
                <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">{t('demo.automated_flow')}</h5>
                <button className="w-full py-3 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 flex items-center justify-center gap-2">
                  {t('demo.execute_union')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {showInstallPrompt && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] uppercase font-black">
                    {t('demo.terminal_not_detected')}
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-[var(--border-color)] p-6 rounded space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">{t('demo.manual_insertion')}</h5>
                <input
                  placeholder={t('demo.placeholder_txid')}
                  value={manualTxid}
                  onChange={(e) => setManualTxid(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-[var(--brand-color)] font-mono text-[10px] py-2 px-3 outline-none focus:border-[var(--brand-color)]"
                />
                <input
                  placeholder={t('demo.placeholder_proof')}
                  value={manualProof}
                  onChange={(e) => setManualProof(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-[var(--brand-color)] font-mono text-[10px] py-2 px-3 outline-none focus:border-[var(--brand-color)]"
                />
                <button
                  onClick={verifyManual}
                  disabled={!manualTxid || !manualProof}
                  className="w-full py-2 bg-[var(--bg-primary)] border border-white/10 text-[var(--brand-color)] text-[10px] font-black uppercase hover:border-[var(--brand-color)] disabled:opacity-20"
                >
                  {t('demo.verify_proof')}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase italic animate-pulse">
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>
        )}

        {stage === 'verifying' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-color)]">
              {t('demo.verifying')}
            </div>
          </div>
        )}

        {stage === 'authorized' && intel && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="p-1 bg-[var(--brand-color)] rounded-sm">
              <div className="bg-[var(--bg-panel)] p-8 text-center space-y-6">
                <Unlock size={48} className="mx-auto text-[var(--brand-color)]" />
                <h4 className="text-xl font-black uppercase italic tracking-[0.3em] text-[var(--brand-color)]">{t('demo.authorized')}</h4>
                <div className="p-5 border border-[var(--border-color)] bg-[rgba(0,255,65,0.03)] text-left">
                  <div className="text-sm text-[var(--brand-color)] leading-relaxed italic border-l-2 border-[var(--brand-color)] pl-4 py-2">
                    "{intel.intel}"
                  </div>
                </div>
                <button onClick={reset} className="px-10 py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-xs">
                  {t('demo.reset')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/20 py-4 px-7 border-t border-[var(--border-color)] flex gap-6">
        <div className="flex items-center gap-1.5">
          <Wifi size={10} className="text-[var(--text-dim)]" />
          <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">{t('demo.transport', { protocol: protocol.toUpperCase() })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Send size={10} className="text-[var(--text-dim)]" />
          <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">{t('demo.payload_binding')}</span>
        </div>
      </div>
    </div>
  );
};
