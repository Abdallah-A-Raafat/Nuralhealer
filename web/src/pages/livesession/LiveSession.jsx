import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
import NativeWebRtcSession from './providers/native-webrtc/NativeWebRtcSession';

// ═════════════════════════════════════════════════════════════════════════════
export default function LiveSession() {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNative = location.pathname.includes('/live-session/native');
  const provider = isNative ? 'native-webrtc' : 'jitsi';
  const providerPath = isNative ? 'native' : 'jitsi';

  // lobby
  const [name, setName] = useState(searchParams.get('name') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // microphone
  const [mics, setMics] = useState([]);        // [{deviceId, label}]
  const [selectedMic, setSelectedMic] = useState('');
  const [micVolume, setMicVolume] = useState(0);         // 0 to 100 for visualize bar

  // Store references for the audio analyzer to clean up on unmount or device change
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const reqFrameRef = useRef(null);

  // call
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

  // ── enumerate microphones ─────────────────────────────────────────────────
  useEffect(() => {
    const loadMics = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
        setMics(audioInputs);
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
      } catch {
        // Permission denied or no mic
      }
    };
    loadMics();
  }, []);

  // ── microphone volume analyzer ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedMic || inCall) {
      setMicVolume(0);
      return;
    }

    let isMounted = true;

    const startAnalyzing = async () => {
      try {
        // Stop old stream if any
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMic } },
          video: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

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

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

          // Map 0-255 broadly to 0-100% for the UI bar
          const volPercent = Math.min(100, Math.round((avg / 128) * 100));
          setMicVolume(volPercent);

          reqFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();

      } catch (err) {
        console.error("Failed to analyze mic audio:", err);
      }
    };

    startAnalyzing();

    return () => {
      isMounted = false;
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [selectedMic, inCall]);

  // ── fetch user on mount / auto-fill ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          if (fullName) setName(fullName);
        }
      } catch {
        // not logged in — guest flow
      } finally {
        setIsAuthLoading(false);
      }
    };
    init();
  }, []);

  // ── start the call ────────────────────────────────────────────────────────
  const startCall = useCallback(() => {
    setInCall(true);
  }, []);

  // ── backend actions ───────────────────────────────────────────────────────
  const handleCreate = useCallback(async (overrideName) => {
    const displayName = overrideName || name.trim();
    if (!displayName) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.create(displayName, provider);
      setSession(data);
      startCall();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create session. Is the backend running?');
    } finally { setLoading(false); }
  }, [name, provider, startCall]);

  const handleJoin = useCallback(async (overrideName) => {
    const displayName = overrideName || name.trim();
    if (!displayName || !paramSessionId) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.join(paramSessionId, displayName, provider);
      setSession(data);
      startCall();
    } catch (e) {
      setError(e.response?.data?.error || 'Session not found or expired.');
    } finally { setLoading(false); }
  }, [name, paramSessionId, provider, startCall]);

  // ── auto-trigger for logged-in users (runs once after auth check) ─────────
  useEffect(() => {
    if (!isAuthLoading && currentUser && name.trim() && !session && !loading && !error) {
      if (paramSessionId) handleJoin(name.trim());
      else handleCreate(name.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading]);

  const handleSubmit = (e) => { e?.preventDefault(); paramSessionId ? handleJoin() : handleCreate(); };

  // ── hang up ───────────────────────────────────────────────────────────────
  const hangUp = async () => {
    setInCall(false);
    if (session) { try { await liveSessionService.end(session.sessionId); } catch { /* ignore */ } }
    navigate(-1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CALL VIEW (Router)
  // ─────────────────────────────────────────────────────────────────────────
  if (inCall && session) {
    if (session.provider === 'native-webrtc') {
      return (
        <NativeWebRtcSession
          session={session}
          displayName={name.trim()}
          micDeviceId={selectedMic}
          onLeave={hangUp}
        />
      );
    }

    // Default fallback to Jitsi (or if explicitly 'jitsi')
    return (
      <JitsiSession
        session={session}
        displayName={name.trim()}
        micDeviceId={selectedMic}
        onLeave={hangUp}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] gap-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Checking authentication…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOBBY
  // ─────────────────────────────────────────────────────────────────────────
  const isJoining = !!paramSessionId;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/60 dark:border-gray-700/60">

          {/* header */}
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 px-8 pt-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Video size={30} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isJoining ? 'Join Session' : 'Live Session'}
              </h1>
              <p className="mt-1.5 text-indigo-200/90 text-sm">
                {isJoining ? 'Enter your name to join' : 'Start a private video call'}
              </p>
            </div>
          </div>

          {/* body */}
          <div className="px-7 pt-6 pb-7 space-y-4 -mt-4 relative">

            {isJoining && (
              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/60 rounded-2xl px-4 py-3">
                <Link2 size={15} className="text-indigo-500 dark:text-indigo-300 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-widest">Session ID</p>
                  <p className="text-indigo-800 dark:text-indigo-200 font-mono font-bold text-sm truncate">{paramSessionId}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-2xl text-sm">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span className="flex-1 leading-snug">{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 leading-none">&times;</button>
              </div>
            )}

            {!session && (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
                    Your name
                    {currentUser && <span className="ml-1 text-indigo-400 normal-case font-normal">(auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus={!currentUser}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl
                               bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white
                               placeholder-gray-400 dark:placeholder-gray-500
                               focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                               outline-none transition-all text-sm"
                  />
                </div>

                {/* Microphone selector + Volume meter */}
                {mics.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between pl-1 pr-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Mic size={11} />
                        Microphone
                      </span>
                      {/* Active Volume indicator (small text) */}
                      {micVolume > 0 && (
                        <span className="text-[10px] items-center flex gap-1 font-medium text-emerald-500 animate-pulse">
                          Receiving audio
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMic}
                        onChange={(e) => setSelectedMic(e.target.value)}
                        className="w-full appearance-none px-4 py-3 pb-4 pr-9 border border-gray-200 dark:border-gray-600 rounded-2xl
                                   bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                                   outline-none transition-all text-sm cursor-pointer relative z-10 bg-transparent"
                      >
                        {mics.map((m) => (
                          <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />

                      {/* Volume Bar overlay inside the input */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600 rounded-b-2xl overflow-hidden z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-75 ease-out"
                          style={{ width: `${micVolume}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading || !name.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5
                             bg-gradient-to-r from-indigo-600 to-purple-600
                             hover:from-indigo-500 hover:to-purple-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-semibold rounded-2xl text-sm
                             transition-all shadow-md shadow-indigo-500/25 active:scale-[0.98]">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> {isJoining ? 'Joining…' : 'Creating…'}</>
                    : isJoining
                      ? <><Video size={15} /> Join Session</>
                      : <><Video size={15} /> Create Session</>}
                </button>
              </form>
            )}

            {/* After create: show invite + join now */}
            {session && !isJoining && (
              <div className="space-y-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/60 dark:border-indigo-700/60 rounded-2xl px-4 py-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-widest">Session ready</p>
                    <p className="text-indigo-800 dark:text-indigo-200 font-mono font-bold text-sm mt-0.5">{session.sessionId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-gray-400 mb-0.5">Invite link</p>
                      <p className="text-indigo-700 dark:text-indigo-300 text-xs font-mono truncate select-all">{shareLink}</p>
                    </div>
                    <button onClick={handleCopy}
                      className="flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span className="text-[9px] font-semibold">{copied ? 'Done' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => startCall()}
                  className="w-full flex items-center justify-center gap-2 py-3.5
                             bg-gradient-to-r from-green-600 to-emerald-600
                             hover:from-green-500 hover:to-emerald-500
                             text-white font-semibold rounded-2xl text-sm
                             transition-all shadow-md shadow-green-700/30 active:scale-[0.98]">
                  <Video size={15} />
                  Join Now
                </button>
              </div>
            )}

            <button type="button" onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs
                         text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft size={13} />
              Go back
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-5 uppercase tracking-widest font-bold">
          End-to-end encrypted · {isNative ? 'Native WebRTC Engine' : 'Powered by Jitsi'}
        </p>
      </div>
    </div>
  );
}
