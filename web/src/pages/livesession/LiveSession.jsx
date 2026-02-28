import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Copy,
  Check,
  PhoneOff,
  Users,
  Link2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Wifi,
} from 'lucide-react';
import liveSessionService from './liveSessionService';

/**
 * LiveSession  self-contained Jitsi video-call page.
 *
 * Routes:
 *   /live-session                create a new session
 *   /live-session/:sessionId     join an existing session
 */
export default function LiveSession() {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const [name, setName] = useState(searchParams.get('name') || '');
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [showShareBanner, setShowShareBanner] = useState(true);

  const shareLink = session
    ? `${window.location.origin}/live-session/${session.sessionId}`
    : '';

  //  copy link 
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  //  Jitsi bootstrap 
  const startJitsi = useCallback(
    (roomName, domain, displayName) => {
      if (jitsiApiRef.current) return;

      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName },
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'raisehand',
            'tileview',
            'hangup',
          ],
        },
      });

      // Clear loading as soon as iframe API responds
      api.addEventListener('videoConferenceJoined', () => setScriptLoading(false));
      // Safety: clear loading after 4 s regardless (iframe is already visible)
      setTimeout(() => setScriptLoading(false), 4000);

      api.addEventListener('participantJoined', () => {
        setParticipantCount((n) => n + 1);
        setShowShareBanner(false);
      });
      api.addEventListener('participantLeft', () =>
        setParticipantCount((n) => Math.max(1, n - 1)),
      );
      api.addEventListener('readyToClose', () => {
        api.dispose();
        jitsiApiRef.current = null;
        navigate(-1);
      });

      jitsiApiRef.current = api;
    },
    [navigate],
  );

  useEffect(() => {
    if (!session || !joined) return;

    setScriptLoading(true);

    const loadScript = () =>
      new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const s = document.createElement('script');
        s.src = `https://${session.jitsiDomain}/external_api.js`;
        s.async = true;
        s.onload = resolve;
        s.onerror = () =>
          reject(new Error('Could not reach Jitsi  check your internet connection.'));
        document.head.appendChild(s);
      });

    loadScript()
      .then(() => startJitsi(session.roomName, session.jitsiDomain, name))
      .catch((err) => {
        setScriptLoading(false);
        setJoined(false);
        setError(err.message);
      });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [session, joined, name, startJitsi]);

  //  create 
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await liveSessionService.create(name.trim());
      setSession(data);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  //  join 
  const handleJoin = async () => {
    if (!name.trim() || !paramSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await liveSessionService.join(paramSessionId, name.trim());
      setSession(data);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Session not found. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    paramSessionId ? handleJoin() : handleCreate();
  };

  //  end 
  const handleEnd = async () => {
    if (session) {
      try { await liveSessionService.end(session.sessionId); } catch { /* best-effort */ }
    }
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    navigate(-1);
  };

  // 
  // IN-CALL VIEW
  // 
  if (joined && session) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950">

        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">

          {/* Session ID */}
          <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 flex-shrink-0">
            <Video size={13} className="text-indigo-400" />
            <span className="text-gray-500 text-xs">Session</span>
            <span className="text-white text-xs font-mono font-semibold">{session.sessionId}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Users size={13} className="text-gray-400" />
            <span className="text-gray-300 text-xs">{participantCount}</span>
          </div>

          {/* Share link  grows */}
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
            <Link2 size={13} className="text-gray-500 flex-shrink-0" />
            <span className="text-gray-400 text-xs font-mono truncate flex-1 select-all">
              {shareLink}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-150 flex-shrink-0"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* End */}
          <button
            onClick={handleEnd}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
          >
            <PhoneOff size={13} />
            End
          </button>
        </div>

        {/* Script-loading shimmer  only shown while external_api.js loads (4 s) */}
        {scriptLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-gray-950">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                <Wifi size={28} className="text-indigo-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 items-center justify-center">
                  <Loader2 size={10} className="text-white animate-spin" />
                </span>
              </span>
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-medium">Setting up your call</p>
              <p className="text-gray-500 text-xs mt-1">Loading Jitsi Meet</p>
            </div>
          </div>
        ) : (
          <div ref={jitsiContainerRef} className="flex-1" />
        )}

        {/* Waiting-for-participant banner */}
        {showShareBanner && !scriptLoading && participantCount < 2 && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-indigo-950/80 border-t border-indigo-800/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-indigo-300 text-xs">Waiting for the other participant</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy invite link'}
              </button>
              <button
                onClick={() => setShowShareBanner(false)}
                className="text-gray-500 hover:text-gray-300 text-xs px-1 transition-colors"
                title="Dismiss"
              >
                
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 
  // LOBBY
  // 
  const isJoining = !!paramSessionId;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] px-4 overflow-hidden">

      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/60 dark:border-gray-700/60">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 px-8 pt-8 pb-10 text-center relative overflow-hidden">
            {/* shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Video size={30} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isJoining ? 'Join Session' : 'Live Session'}
              </h1>
              <p className="mt-1.5 text-indigo-200/90 text-sm leading-relaxed">
                {isJoining
                  ? 'Enter your name to join the video call'
                  : 'Start a private video call and share the link'}
              </p>
            </div>
          </div>

          {/* Negative margin pull-up effect */}
          <div className="px-7 pt-6 pb-7 space-y-4 -mt-4 relative">

            {/* Session badge (join mode) */}
            {isJoining && (
              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/60 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Link2 size={15} className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-widest">
                    Session ID
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-200 font-mono font-bold text-sm truncate mt-0.5">
                    {paramSessionId}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-2xl text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span className="flex-1 leading-snug">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 flex-shrink-0 leading-none"
                >
                  
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
                  Your name
                </label>
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

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5
                           bg-gradient-to-r from-indigo-600 to-purple-600
                           hover:from-indigo-500 hover:to-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-semibold rounded-2xl
                           transition-all duration-200 text-sm shadow-md shadow-indigo-500/25
                           active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting
                  </>
                ) : isJoining ? (
                  <>
                    <Video size={16} />
                    Join Session
                  </>
                ) : (
                  <>
                    <Video size={16} />
                    Create Session
                  </>
                )}
              </button>
            </form>

            {/* Back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs
                         text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors"
            >
              <ArrowLeft size={13} />
              Go back
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-5">
          Powered by Jitsi Meet  No account required for guests
        </p>
      </div>
    </div>
  );
}
