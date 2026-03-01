import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  Check,
  Link2,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Monitor,
  MonitorOff,
} from 'lucide-react';
import liveSessionService from './liveSessionService';

// ─── constants ──────────────────────────────────────────────────────────────
const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

// ─── load external_api.js once ──────────────────────────────────────────────
function loadJitsiIframeAPI() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const s = document.createElement('script');
    s.src = `https://${JITSI_DOMAIN}/external_api.js`;
    s.async = true;
    s.onload = () => {
      if (window.JitsiMeetExternalAPI) resolve();
      else reject(new Error('JitsiMeetExternalAPI not available after script load'));
    };
    s.onerror = () => reject(new Error(`Failed to load Jitsi API from ${JITSI_DOMAIN}`));
    (document.head || document.body).appendChild(s);
  });
}

// ════════════════════════════════════════════════════════════════════════════
export default function LiveSession() {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams]                = useSearchParams();
  const navigate                      = useNavigate();

  // lobby
  const [name,    setName]    = useState(searchParams.get('name') || '');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  // call
  const [phase,            setPhase]            = useState('lobby'); // lobby | connecting | call
  const [connectingMsg,    setConnectingMsg]    = useState('');
  const [audioMuted,       setAudioMuted]       = useState(true);   // starts muted
  const [videoMuted,       setVideoMuted]       = useState(false);
  const [sharing,          setSharing]          = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  const containerRef = useRef(null);
  const apiRef       = useRef(null);
  const timeoutRef   = useRef(null);

  const shareLink = session
    ? `${window.location.origin}/live-session/${session.sessionId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── start call ────────────────────────────────────────────────────────────
  const startCall = useCallback(async (roomName, domain, displayName) => {
    setPhase('connecting');
    setConnectingMsg('Loading video engine…');
    setError(null);

    try {
      await loadJitsiIframeAPI();
    } catch (e) {
      setError(e.message);
      setPhase('lobby');
      return;
    }

    setConnectingMsg('Connecting to the call…');

    // 25-second hard timeout
    timeoutRef.current = setTimeout(() => {
      setError('Connection timed out — check your network and try again.');
      setPhase('lobby');
      if (apiRef.current) { try { apiRef.current.dispose(); } catch { /* ignore */ } apiRef.current = null; }
    }, 25000);

    // We'll create the IFrame API once we switch to 'call' phase and the
    // container div is rendered. So we store the params and let the effect
    // (below) create the API.
    // Actually, we need the container in the DOM first; we'll render it
    // hidden behind the connecting overlay, then instantiate.
    setPhase('call-init');
    // stash params for the effect
    apiRef.current = { pending: true, roomName, domain, displayName };
  }, []);

  // Effect: when phase becomes 'call-init' and we have a container, create the API
  useEffect(() => {
    if (phase !== 'call-init') return;
    if (!containerRef.current) return;
    const pending = apiRef.current;
    if (!pending || !pending.pending) return;

    const { roomName, domain, displayName } = pending;

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName: roomName.toLowerCase(),
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      userInfo: { displayName },
      lang: 'en',
      configOverwrite: {
        prejoinPageEnabled: false,
        prejoinConfig: { enabled: false },
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        disableProfile: true,
        hideParticipantsStats: true,
        enableClosePage: false,
        disableInviteFunctions: true,
        enableNoisyMicDetection: false,
        enableNoAudioDetection: false,
        requireDisplayName: false,
        notifications: [],
        toolbarButtons: [],
        disableThirdPartyRequests: true,
        analytics: { disabled: true },
        // lobby / auth
        enableLobbyChat: false,
        hideLobbyButton: true,
        autoKnockLobby: true,
        enableInsecureRoomNameWarning: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [],
        TOOLBAR_ALWAYS_VISIBLE: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        VIDEO_LAYOUT_FIT: 'both',
        DISABLE_FOCUS_INDICATOR: true,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
        VERTICAL_FILMSTRIP: false,
        DEFAULT_BACKGROUND: '#030712',
        INITIAL_TOOLBAR_TIMEOUT: 0,
        TOOLBAR_TIMEOUT: 0,
        filmStripOnly: false,
        DISABLE_VIDEO_BACKGROUND: true,
      },
    });

    apiRef.current = api;

    api.addEventListener('videoConferenceJoined', () => {
      clearTimeout(timeoutRef.current);
      setPhase('call');
      setConnectingMsg('');
    });

    api.addEventListener('videoConferenceLeft', () => {
      api.dispose();
      apiRef.current = null;
      setPhase('lobby');
    });

    api.addEventListener('audioMuteStatusChanged', ({ muted }) => setAudioMuted(muted));
    api.addEventListener('videoMuteStatusChanged', ({ muted }) => setVideoMuted(muted));
    api.addEventListener('screenSharingStatusChanged', ({ on }) => setSharing(on));

    api.addEventListener('participantJoined', () => setParticipantCount((n) => n + 1));
    api.addEventListener('participantLeft',   () => setParticipantCount((n) => Math.max(1, n - 1)));

    api.addEventListener('readyToClose', () => {
      api.dispose();
      apiRef.current = null;
      navigate(-1);
    });

    // Fallback: sometimes videoConferenceJoined fires late — give it 8s then show anyway
    const fallback = setTimeout(() => {
      setPhase((p) => (p === 'call-init' ? 'call' : p));
      clearTimeout(timeoutRef.current);
    }, 8000);

    return () => {
      clearTimeout(fallback);
    };
  }, [phase, navigate]);

  // cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (apiRef.current && apiRef.current.dispose) {
        try { apiRef.current.dispose(); } catch { /* ignore */ }
        apiRef.current = null;
      }
    };
  }, []);

  // ── controls via IFrame commands ──────────────────────────────────────────
  const toggleAudio  = () => apiRef.current?.executeCommand?.('toggleAudio');
  const toggleVideo  = () => apiRef.current?.executeCommand?.('toggleVideo');
  const toggleScreen = () => apiRef.current?.executeCommand?.('toggleShareScreen');
  const hangUp       = async () => {
    if (apiRef.current?.dispose) {
      apiRef.current.executeCommand('hangup');
      setTimeout(() => {
        if (apiRef.current?.dispose) { try { apiRef.current.dispose(); } catch { /* ignore */ } }
        apiRef.current = null;
      }, 500);
    }
    if (session) { try { await liveSessionService.end(session.sessionId); } catch { /* ignore */ } }
    navigate(-1);
  };

  // ── backend actions ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.create(name.trim());
      setSession(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create session. Is the backend running?');
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim() || !paramSessionId) return;
    setLoading(true); setError(null);
    try {
      const data = await liveSessionService.join(paramSessionId, name.trim());
      setSession(data);
      startCall(data.roomName, data.jitsiDomain || JITSI_DOMAIN, name.trim());
    } catch (e) {
      setError(e.response?.data?.error || 'Session not found or expired.');
    } finally { setLoading(false); }
  };

  const handleSubmit = (e) => { e?.preventDefault(); paramSessionId ? handleJoin() : handleCreate(); };

  // ─────────────────────────────────────────────────────────────────────────
  // CALL VIEW  (phase === 'call' or 'call-init')
  // ─────────────────────────────────────────────────────────────────────────
  if ((phase === 'call' || phase === 'call-init') && session) {
    return (
      <div className="relative flex flex-col h-[calc(100vh-64px)] bg-gray-950 overflow-hidden">

        {/* Jitsi IFrame container — fills the whole area behind our overlay */}
        <div
          ref={containerRef}
          className="absolute inset-0 z-0"
          style={{ background: '#030712' }}
        />

        {/* Connecting overlay — shown during call-init */}
        {phase === 'call-init' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-950/90 gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Video size={26} className="text-indigo-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600 items-center justify-center">
                  <Loader2 size={12} className="text-white animate-spin" />
                </span>
              </span>
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-semibold">Joining the call…</p>
              <p className="text-gray-500 text-xs mt-1">{connectingMsg || 'Connecting…'}</p>
            </div>
            <button
              onClick={() => { setPhase('lobby'); if (apiRef.current?.dispose) { try { apiRef.current.dispose(); } catch { /* ignore */ } apiRef.current = null; } }}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
            >Cancel</button>
          </div>
        )}

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/60 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-1.5">
            <Video size={12} className="text-indigo-400" />
            <span className="text-gray-500 text-[11px]">Session</span>
            <span className="text-white text-[11px] font-mono font-bold">{session.sessionId}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            <Users size={12} className="text-gray-400" />
            <span className="text-gray-300 text-[11px]">{participantCount}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-1.5">
            <Link2 size={12} className="text-gray-600 flex-shrink-0" />
            <span className="text-gray-500 text-[11px] font-mono truncate flex-1 select-all">{shareLink}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* ── Waiting banner (solo) ────────────────────────────────────── */}
        {participantCount < 2 && phase === 'call' && (
          <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-2 bg-indigo-950/70 backdrop-blur-sm border-b border-indigo-800/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-indigo-300 text-xs">Waiting for others — share the invite link</span>
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy invite'}
            </button>
          </div>
        )}

        {/* spacer pushes controls to bottom */}
        <div className="flex-1" />

        {/* ── Bottom controls ──────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/60 flex-shrink-0">
          <button onClick={toggleAudio}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
              audioMuted ? 'bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/30'
                         : 'bg-gray-800/80 border-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
            {audioMuted ? <MicOff size={18} /> : <Mic size={18} />}
            <span className="text-[10px] font-medium">{audioMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button onClick={toggleVideo}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
              videoMuted ? 'bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/30'
                         : 'bg-gray-800/80 border-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
            {videoMuted ? <VideoOff size={18} /> : <Video size={18} />}
            <span className="text-[10px] font-medium">{videoMuted ? 'Show cam' : 'Camera'}</span>
          </button>

          <button onClick={toggleScreen}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
              sharing ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/40'
                      : 'bg-gray-800/80 border-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
            {sharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
            <span className="text-[10px] font-medium">{sharing ? 'Stop share' : 'Share'}</span>
          </button>

          <button onClick={hangUp}
            className="flex flex-col items-center gap-1 p-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 border border-red-500 text-white transition-all">
            <PhoneOff size={18} />
            <span className="text-[10px] font-semibold">Leave</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONNECTING (standalone, before container is rendered)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-950 gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Video size={26} className="text-indigo-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600 items-center justify-center">
              <Loader2 size={12} className="text-white animate-spin" />
            </span>
          </span>
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-semibold">Joining the call…</p>
          <p className="text-gray-500 text-xs mt-1">{connectingMsg || 'Preparing…'}</p>
        </div>
        <button
          onClick={() => setPhase('lobby')}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
        >Cancel</button>
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
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Your name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl
                               bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white
                               placeholder-gray-400 dark:placeholder-gray-500
                               focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                               outline-none transition-all text-sm"
                  />
                </div>
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

            {/* after create: show invite + join now */}
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
                  onClick={() => startCall(session.roomName, session.jitsiDomain || JITSI_DOMAIN, name.trim())}
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
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-5">
          End-to-end encrypted · Powered by Jitsi
        </p>
      </div>
    </div>
  );
}
