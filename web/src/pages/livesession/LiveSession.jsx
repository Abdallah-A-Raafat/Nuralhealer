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
} from 'lucide-react';
import liveSessionService from './liveSessionService';

/**
 * LiveSession — self-contained Jitsi video-call page.
 *
 * Routes:
 *   /live-session               → create a new session
 *   /live-session/:sessionId    → join an existing session
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
  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  const shareLink = session
    ? `${window.location.origin}/live-session/${session.sessionId}`
    : '';

  // ── copy share link ──

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── mount Jitsi ──

  const startJitsi = useCallback(
    (roomName, domain, displayName) => {
      if (jitsiApiRef.current) return;

      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
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

      api.addEventListener('videoConferenceJoined', () => setJitsiLoading(false));
      api.addEventListener('participantJoined', () =>
        setParticipantCount((n) => n + 1),
      );
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

    setJitsiLoading(true);

    const loadScript = () =>
      new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const s = document.createElement('script');
        s.src = `https://${session.jitsiDomain}/external_api.js`;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Could not load Jitsi — check your internet connection.'));
        document.head.appendChild(s);
      });

    loadScript()
      .then(() => startJitsi(session.roomName, session.jitsiDomain, name))
      .catch((err) => {
        setJitsiLoading(false);
        setError(err.message);
      });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [session, joined, name, startJitsi]);

  // ── create ──

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

  // ── join ──

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

  // ── end ──

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

  // ────────────────────────────────────────────
  // IN-CALL VIEW
  // ────────────────────────────────────────────

  if (joined && session) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950">

        {/* ── top bar ── */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/95 backdrop-blur border-b border-gray-800 flex-shrink-0">

          {/* Session badge */}
          <div className="flex items-center gap-2 text-gray-300 text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
            <Video size={14} className="text-indigo-400" />
            <span className="text-gray-400">Session</span>
            <span className="text-white font-semibold tracking-wider">{session.sessionId}</span>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
            <Users size={14} className="text-green-400" />
            <span>{participantCount}</span>
          </div>

          {/* Share link */}
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
            <Link2 size={14} className="text-gray-500 flex-shrink-0" />
            <span className="text-gray-300 text-xs truncate flex-1 select-all font-mono">
              {shareLink}
            </span>
            <button
              onClick={handleCopy}
              title="Copy invite link"
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* End session */}
          <button
            onClick={handleEnd}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            <PhoneOff size={14} />
            End
          </button>
        </div>

        {/* ── Jitsi loading overlay ── */}
        <div className="relative flex-1">
          {jitsiLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 gap-4">
              <Loader2 size={40} className="text-indigo-400 animate-spin" />
              <p className="text-gray-400 text-sm">Connecting to video call…</p>
            </div>
          )}
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>

        {/* ── share panel shown right after creation ── */}
        {session && copied === false && participantCount < 2 && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 bg-indigo-950/60 border-t border-indigo-800/40 flex-shrink-0">
            <div className="flex items-center gap-2 text-indigo-300 text-sm">
              <Users size={16} />
              <span>Waiting for the other participant — share the invite link above.</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0"
            >
              <Copy size={14} />
              Copy invite link
            </button>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────
  // LOBBY FORM
  // ────────────────────────────────────────────

  const isJoining = !!paramSessionId;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625] px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <Video size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isJoining ? 'Join Session' : 'Start a Live Session'}
            </h1>
            <p className="mt-1 text-indigo-200 text-sm">
              {isJoining
                ? 'Enter your name to join the video call'
                : 'Create a room and invite someone to join'}
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

            {/* Session ID badge (join mode) */}
            {isJoining && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg px-4 py-3">
                <Link2 size={16} className="text-indigo-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wide">Session ID</p>
                  <p className="text-indigo-800 dark:text-indigo-200 font-mono font-semibold text-sm truncate">{paramSessionId}</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your display name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
                           transition-shadow text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connecting…
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

            {/* Back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 dark:text-gray-400
                         hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={14} />
              Go back
            </button>
          </form>
        </div>

        {/* Info note */}
        {!isJoining && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            Powered by Jitsi Meet · No account required for participants
          </p>
        )}
      </div>
    </div>
  );
}

  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const [name, setName] = useState(searchParams.get('name') || '');
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // ── helpers ──

  const startJitsi = useCallback(
    (roomName, domain, displayName) => {
      if (jitsiApiRef.current) return; // already mounted

      const options = {
        roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
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
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('readyToClose', () => {
        api.dispose();
        jitsiApiRef.current = null;
        navigate(-1);
      });

      jitsiApiRef.current = api;
    },
    [navigate],
  );

  // ── create session ──

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await liveSessionService.create(name.trim());
      setSession(data);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  // ── join session ──

  const handleJoin = async () => {
    if (!name.trim() || !paramSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await liveSessionService.join(paramSessionId, name.trim());
      setSession(data);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Session not found');
    } finally {
      setLoading(false);
    }
  };

  // ── mount Jitsi once session is ready ──

  useEffect(() => {
    if (!session || !joined) return;

    // Load the Jitsi IFrame API script if not already loaded
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = `https://${session.jitsiDomain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Jitsi API'));
        document.head.appendChild(script);
      });
    };

    loadJitsiScript()
      .then(() => startJitsi(session.roomName, session.jitsiDomain, name))
      .catch((err) => setError(err.message));

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [session, joined, name, startJitsi]);

  // ── end session ──

  const handleEnd = async () => {
    if (session) {
      try {
        await liveSessionService.end(session.sessionId);
      } catch {
        /* best-effort */
      }
    }
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    navigate(-1);
  };

  // ── render ──

  // While in a call, show just the Jitsi container full-screen
  if (joined && session) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white text-sm">
          <span>
            Session: <strong>{session.sessionId}</strong> — Share link:{' '}
            <code className="bg-gray-700 px-2 py-0.5 rounded text-xs select-all">
              {window.location.origin}/live-session/{session.sessionId}
            </code>
          </span>
          <button
            onClick={handleEnd}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
          >
            End Session
          </button>
        </div>

        {/* Jitsi container */}
        <div ref={jitsiContainerRef} className="flex-1" />
      </div>
    );
  }

  // ── lobby form ──

  const isJoining = !!paramSessionId;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1A1625]">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {isJoining ? 'Join Live Session' : 'Start Live Session'}
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />

        <button
          onClick={isJoining ? handleJoin : handleCreate}
          disabled={loading || !name.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                     text-white font-semibold rounded-lg transition-colors"
        >
          {loading
            ? 'Connecting…'
            : isJoining
              ? 'Join Session'
              : 'Create Session'}
        </button>

        {!isJoining && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            After creating, share the link with the other participant.
          </p>
        )}
      </div>
    </div>
  );
}
