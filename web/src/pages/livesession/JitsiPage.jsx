import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  PhoneOff,
  Copy,
  Check,
  Link2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import liveSessionService from './liveSessionService';
import userService from '../../services/userService';
import JitsiSession from './providers/jitsi/JitsiSession';

/**
 * Jitsi-specific Live Session Page.
 * This is now independent of the Native WebRTC flow.
 */
export default function JitsiPage() {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const provider = 'jitsi';
  const providerPath = 'jitsi';

  // lobby
  const [name, setName] = useState(searchParams.get('name') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // microphone
  const [mics, setMics] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const reqFrameRef = useRef(null);

  const [inCall, setInCall] = useState(false);

  const shareLink = session
    ? `${window.location.origin}/live-session/${providerPath}/${session.sessionId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  useEffect(() => {
    const loadMics = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
        setMics(audioInputs);
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
      } catch (e) { console.error("Mic access denied", e); }
    };
    loadMics();
  }, []);

  useEffect(() => {
    if (!selectedMic || inCall) { setMicVolume(0); return; }
    let isMounted = true;
    const startAnalyzing = async () => {
      try {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedMic } } });
        if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioContextRef.current;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!isMounted || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0; for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          reqFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (err) { console.error("Failed to analyze mic audio:", err); }
    };
    startAnalyzing();
    return () => {
      isMounted = false;
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [selectedMic, inCall]);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          if (fullName) setName(fullName);
        }
      } catch (e) { } finally { setIsAuthLoading(false); }
    };
    init();
  }, []);

  const startCall = useCallback(() => setInCall(true), []);

  const handleCreate = useCallback(async (overrideName) => {
    const displayName = overrideName || name.trim();
    if (!displayName) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.create(displayName, provider);
      setSession(data); startCall();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create session.'); } finally { setLoading(false); }
  }, [name, provider, startCall]);

  const handleJoin = useCallback(async (overrideName) => {
    const displayName = overrideName || name.trim();
    if (!displayName || !paramSessionId) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.join(paramSessionId, displayName, provider);
      setSession(data); startCall();
    } catch (e) { setError(e.response?.data?.error || 'Session not found.'); } finally { setLoading(false); }
  }, [name, paramSessionId, provider, startCall]);

  useEffect(() => {
    if (!isAuthLoading && currentUser && name.trim() && !session && !loading && !error) {
      if (paramSessionId) handleJoin(name.trim()); else handleCreate(name.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading]);

  const handleSubmit = (e) => { e?.preventDefault(); paramSessionId ? handleJoin() : handleCreate(); };

  const hangUp = async () => {
    setInCall(false);
    if (session) { try { await liveSessionService.end(session.sessionId); } catch (e) { } }
    navigate('/');
  };

  if (inCall && session) {
    return <JitsiSession session={session} displayName={name.trim()} micDeviceId={selectedMic} onLeave={hangUp} />;
  }

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] gap-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Initializing…</p>
      </div>
    );
  }

  const isJoining = !!paramSessionId;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/40 dark:border-gray-700/40 transition-all duration-500 hover:shadow-indigo-500/10">
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 px-8 pt-10 pb-12 text-center relative">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-xl border border-white/20">
                <Video size={30} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">
                {isJoining ? 'Join Session' : 'Quick Session'}
              </h1>
              <p className="mt-2 text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.2em]">
                {isJoining ? 'Identity Verification' : 'Private Encryption Layer'}
              </p>
            </div>
          </div>

          <div className="px-8 pt-8 pb-10 space-y-6 relative -mt-6 bg-white dark:bg-gray-800 rounded-t-[2.5rem]">
            {isJoining && (
              <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl px-5 py-4">
                <Link2 size={16} className="text-indigo-500 dark:text-indigo-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-indigo-500/60 dark:text-indigo-400/60 font-black uppercase tracking-widest">Target Node</p>
                  <p className="text-indigo-900 dark:text-indigo-100 font-mono font-bold text-sm truncate">{paramSessionId}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl text-xs font-bold animate-in fade-in duration-300">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {!session && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-900/40 text-sm font-bold placeholder-gray-400 focus:border-indigo-400 outline-none transition-all"
                  />
                </div>

                {mics.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                      Audio Source
                      {micVolume > 0 && <span className="text-emerald-500 animate-pulse">Active</span>}
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedMic}
                        onChange={(e) => setSelectedMic(e.target.value)}
                        className="w-full appearance-none px-5 py-4 border-2 border-gray-100 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-900/40 text-sm font-bold focus:border-indigo-400 outline-none cursor-pointer"
                      >
                        {mics.map((m) => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700 rounded-b-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${micVolume}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading || !name.trim()}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                  {loading ? 'Processing...' : (isJoining ? 'Decrypt & Join' : 'Initialize')}
                </button>
              </form>
            )}

            {session && !isJoining && (
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 space-y-4">
                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-1">Invite Signal</p>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-indigo-50 dark:border-indigo-900/20">
                      <p className="text-indigo-600 dark:text-indigo-300 text-[10px] font-mono font-bold truncate flex-1">{shareLink}</p>
                      <button onClick={handleCopy} className="text-indigo-400 hover:text-indigo-600 p-1">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => startCall()} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-xs transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]">Launch Connection</button>
              </div>
            )}

            <button type="button" onClick={() => navigate(-1)} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-400 transition-colors pt-2">Cancel Handshake</button>
          </div>
        </div>
        <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] mt-8 opacity-60">E2E Encrypted · Powered by Jitsi Engine</p>
      </div>
    </div>
  );
}
