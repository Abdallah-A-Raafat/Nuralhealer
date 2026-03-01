import { useState, useCallback, useEffect } from 'react';
import { Video, PhoneOff, Copy, Check, Link2 } from 'lucide-react';

// Build a Jitsi URL.
// Rules:
//  - displayName MUST be JSON-encoded in hash (Jitsi parses hash values as JSON)
//  - NEVER send a jwt param to a community server — it breaks their XMPP auth
//  - deviceId for preferred microphone (optional)
function buildJitsiUrl(domain, roomName, displayName, micDeviceId) {
    const params = [
        'config.prejoinPageEnabled=false',
        'config.startWithAudioMuted=false',
        'config.startWithVideoMuted=false',
        'config.lobbyModeEnabled=false',
        'config.membersOnly=false',
        'config.disableDeepLinking=true',
        'config.hideConferenceSubject=true',
        'config.requireDisplayName=false',
        'config.disableInviteFunctions=true',
        'interfaceConfig.SHOW_JITSI_WATERMARK=false',
        // displayName must be JSON-encoded (Jitsi parses hash values as JSON tokens)
        `userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}`,
        micDeviceId
            ? `config.startAudioInputDeviceId=${encodeURIComponent(JSON.stringify(micDeviceId))}`
            : '',
    ].filter(Boolean).join('&');
    return `https://${domain}/${roomName.toLowerCase()}#${params}`;
}

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.ffmuc.net';

export default function JitsiSession({ session, displayName, micDeviceId, onLeave }) {
    const [jitsiUrl, setJitsiUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const shareLink = `${window.location.origin}/live-session/${session.sessionId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    useEffect(() => {
        const url = buildJitsiUrl(session.jitsiDomain || JITSI_DOMAIN, session.roomName, displayName, micDeviceId);
        setJitsiUrl(url);
    }, [session, displayName, micDeviceId]);

    if (!jitsiUrl) return null;

    return (
        <div className="relative flex flex-col h-[calc(100vh-64px)] bg-gray-950 overflow-hidden">
            <iframe
                src={jitsiUrl}
                allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write"
                className="absolute inset-0 w-full h-full z-0 border-0"
                title="Live Session (Jitsi)"
            />

            {/* Top bar */}
            <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/60 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-1.5">
                    <Video size={12} className="text-indigo-400" />
                    <span className="text-gray-500 text-[11px]">Session</span>
                    <span className="text-white text-[11px] font-mono font-bold">{session.sessionId}</span>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-1.5">
                    <Link2 size={12} className="text-gray-600 flex-shrink-0" />
                    <span className="text-gray-500 text-[11px] font-mono truncate flex-1 select-all">{shareLink}</span>
                    <button onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0">
                        {copied ? <Check size={10} /> : <Copy size={10} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="flex-1 pointer-events-none" />

            {/* Leave button */}
            <div className="relative z-10 flex items-center justify-center px-4 py-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/60 flex-shrink-0">
                <button onClick={onLeave}
                    className="flex flex-col items-center gap-1 p-3 px-8 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 border border-red-500 text-white transition-all">
                    <PhoneOff size={18} />
                    <span className="text-[10px] font-semibold">Leave</span>
                </button>
            </div>
        </div>
    );
}
