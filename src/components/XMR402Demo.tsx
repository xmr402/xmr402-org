import { Shield, Zap, Terminal, Lock, Unlock, AlertCircle, RefreshCw, Timer, Wifi, Send } from 'lucide-react';

const WORKER_URL = "https://demo-api.xmr402.org";
const WS_URL = "wss://demo-api.xmr402.org/relay";

export const XMR402Demo: React.FC = () => {
  const [protocol, setProtocol] = useState<'http' | 'ws'>('http');
  const [stage, setStage] = useState<'idle' | 'challenging' | 'pending' | 'verifying' | 'authorized'>('idle');
  const [challenge, setChallenge] = useState<any>(null);
  const [intel, setIntel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // WS specific state
  const [wsFrames, setWsFrames] = useState<{ type: 'in' | 'out', data: any }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Manual form inputs
  const [manualTxid, setManualTxid] = useState('');
  const [manualProof, setManualProof] = useState('');

  // Terminal detection state
  // const [showInstallPrompt, setShowInstallPrompt] = useState(false);

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
        setError(`Proof rejected: The node has not seen this transaction yet (HTTP ${res.status}).`);
        setStage(challenge ? 'pending' : 'idle');
      }
    } catch (e: any) {
      setError(`Verification error: ${e.message}`);
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

        setChallenge({
          address: addressMatch?.[1],
          amount: amountMatch?.[1],
          message: messageMatch?.[1]
        });
        setTimeRemaining(300);
        setStage('pending');
      }
    } catch (err: any) {
      setError("Failed to connect to Shadow Archives node.");
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
      } catch (e) {
        setError("Invalid JSON frame received.");
      }
    };

    socket.onerror = () => {
      setError("WebSocket connection failed.");
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

    if (protocol === 'ws' && wsRef.current?.readyState === WebSocket.OPEN) {
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
            <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-color)] m-0">Sandbox_v2.0</h3>
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
          <span className="text-[8px] sm:text-[9px] uppercase font-black">Node: Online</span>
        </div>
      </div>

      <div className="p-5 sm:p-10 min-h-[350px] sm:min-h-[400px]">
        {stage === 'idle' && (
          <div className="py-8 sm:py-12 text-center space-y-6">
            <div className="max-w-md mx-auto">
              <Shield size={40} className="mx-auto opacity-20 mb-4 text-[var(--brand-color)]" />
              <h4 className="text-base sm:text-lg font-black uppercase italic mb-2 tracking-wider">Access_Gate_{protocol.toUpperCase()}</h4>
              <p className="text-[10px] sm:text-xs text-[var(--text-dim)] leading-relaxed uppercase">
                {protocol === 'http'
                  ? "Standard RESTful challenge. Rejects with 402 and requests IETF-standard fields."
                  : "Persistent P2P stream. Server challenges with a PAYMENT_CHALLENGE JSON frame."}
              </p>
            </div>
            <button
              onClick={protocol === 'http' ? startHttpDemo : startWsDemo}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all inline-flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:opacity-90 active:translate-y-0"
            >
              Initialize_{protocol.toUpperCase()}_Uplink
            </button>
          </div>
        )}

        {stage === 'challenging' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--brand-color)]">
              Negotiating_{protocol === 'ws' ? 'P2P_Connection' : 'Resource_Gate'}...
            </div>
          </div>
        )}

        {stage === 'pending' && challenge && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Protocol Animation */}
            {protocol === 'ws' && (
              <div className="bg-black/40 border border-white/5 p-4 rounded text-[9px] font-mono space-y-1 max-h-32 overflow-y-auto">
                {wsFrames.map((f, i) => (
                  <div key={i} className={f.type === 'out' ? 'text-blue-400' : 'text-emerald-400'}>
                    {f.type === 'out' ? '>> SEND: ' : '<< RECV: '} {JSON.stringify(f.data)}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 border border-[var(--border-color)] p-6 space-y-4 rounded relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-color)] opacity-50" />
              <div className="flex items-center gap-3">
                <Lock size={14} className="text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  {protocol === 'ws' ? 'WS_RELAY_CHALLENGE' : '402_PAYMENT_REQUIRED'}
                </span>
                <div className="ml-auto flex items-center gap-4">
                  {timeRemaining !== null && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-black tracking-wider ${timeRemaining === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      <Timer size={12} className={timeRemaining > 0 && timeRemaining <= 60 ? 'animate-pulse' : ''} />
                      {timeRemaining > 0 ? formatTime(timeRemaining) : 'EXPIRED'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t border-white/5 pt-4">
                <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-widest">Target_Address</label>
                <div className="bg-black/20 border border-dashed border-[var(--border-color)] text-[var(--brand-color)] rounded break-all font-mono py-2 px-3 flex-1 text-xs text-center sm:text-left">
                  {challenge.address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="text-[9px] uppercase font-black text-[var(--text-dim)] block mb-1">Amount</label>
                  <div className="text-lg font-black italic text-[var(--brand-color)]">
                    {(Number(challenge.amount) / 1e12).toFixed(6)} <span className="text-[10px] not-italic opacity-50">XMR</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <label className="text-[9px] uppercase font-black text-[var(--text-dim)] block mb-1">Nonce</label>
                  <div className="text-[9px] font-mono text-[var(--text-dim)] bg-black/40 py-2 px-3 border border-white/5 truncate rounded">
                    {challenge.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-[var(--border-color)] p-6 rounded group cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={authorizeWithRipley}>
                <Zap size={20} className="text-[var(--brand-color)] mb-4" />
                <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">Automated_Ripley_Flow</h5>
                <button className="w-full py-3 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90">
                  EXECUTE_UNION
                </button>
              </div>

              <div className="bg-white/5 border border-[var(--border-color)] p-6 rounded space-y-3">
                <h5 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Manual_Insertion</h5>
                <input 
                  placeholder="TXID"
                  value={manualTxid}
                  onChange={(e) => setManualTxid(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-[var(--brand-color)] font-mono text-[10px] py-2 px-3 outline-none focus:border-[var(--brand-color)]"
                />
                <input 
                  placeholder="PROOF"
                  value={manualProof}
                  onChange={(e) => setManualProof(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-[var(--brand-color)] font-mono text-[10px] py-2 px-3 outline-none focus:border-[var(--brand-color)]"
                />
                <button
                  onClick={verifyManual}
                  disabled={!manualTxid || !manualProof}
                  className="w-full py-2 bg-[var(--bg-primary)] border border-white/10 text-[var(--brand-color)] text-[9px] font-black uppercase hover:border-[var(--brand-color)]"
                >
                  VERIFY_PROOF
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[9px] font-black uppercase italic animate-pulse">
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>
        )}

        {stage === 'verifying' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw size={32} className="mx-auto text-[var(--brand-color)] animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-color)]">
              Verifying_Proof_Statelessly...
            </div>
          </div>
        )}

        {stage === 'authorized' && intel && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="p-1 bg-[var(--brand-color)] rounded-sm">
              <div className="bg-[var(--bg-panel)] p-8 text-center space-y-6">
                <Unlock size={48} className="mx-auto text-[var(--brand-color)]" />
                <h4 className="text-xl font-black uppercase italic tracking-[0.3em] text-[var(--brand-color)]">Uplink_Authorized</h4>
                <div className="p-5 border border-[var(--border-color)] bg-[rgba(0,255,65,0.03)] text-left">
                  <div className="text-xs text-[var(--brand-color)] leading-relaxed italic border-l-2 border-[var(--brand-color)] pl-4 py-2">
                    "{intel.intel}"
                  </div>
                </div>
                <button onClick={reset} className="px-10 py-4 bg-[var(--brand-color)] text-black font-black uppercase tracking-widest text-xs">
                  RESET_SANDBOX
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/20 py-4 px-7 border-t border-[var(--border-color)] flex gap-6">
        <div className="flex items-center gap-1.5">
          <Wifi size={10} className="text-[var(--text-dim)]" />
          <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">Transport: {protocol.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Send size={10} className="text-[var(--text-dim)]" />
          <span className="text-[8px] uppercase font-black text-[var(--text-dim)]">Payload_Binding: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
