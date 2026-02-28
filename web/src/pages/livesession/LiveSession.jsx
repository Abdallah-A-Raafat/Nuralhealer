import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import liveSessionService from './liveSessionService';

/**
 * LiveSession — self-contained Jitsi video-call page.
 *
 * Usage paths:
 *   /live-session               → creates a new session (enter your name first)
 *   /live-session/:sessionId    → joins an existing session
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
