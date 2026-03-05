import { useEffect, useRef, useState } from 'react';
import { Activity, Heart, ShieldCheck, XCircle } from 'lucide-react';

/**
 * WaitingRoom — shown to a guest after they click "Enter Hub".
 * Connects to the signaling server, sends a join-request, and waits
 * for the host to approve or deny the request.
 *
 * Props:
 *   session       — session data from the backend
 *   displayName   — guest's display name
 *   onApproved()  — called when host approves
 *   onDenied()    — called when host denies
 *   onCancel()    — called when guest cancels
 */
export default function WaitingRoom({ session, displayName, onApproved, onCancel }) {
    const wsRef = useRef(null);
    const [status, setStatus] = useState('connecting'); // connecting | waiting | denied
    const [dots, setDots] = useState('');

    // Animated ellipsis
    useEffect(() => {
        const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
        return () => clearInterval(t);
    }, []);

    const hasConnectedRef = useRef(false);

    // Connect WS and send join-request
    useEffect(() => {
        if (hasConnectedRef.current) return;
        hasConnectedRef.current = true;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
        const ws = new WebSocket(`${protocol}//${host}/api/ws/webrtc`);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus('waiting');
            ws.send(JSON.stringify({
                type: 'join-request',
                roomId: session.sessionId,
                peerId: displayName,
            }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.roomId !== session.sessionId) return;
            if (msg.targetPeerId !== displayName) return;

            if (msg.type === 'join-approved') {
                ws.close();
                onApproved();
            } else if (msg.type === 'join-denied') {
                setStatus('denied');
            }
        };

        ws.onerror = () => setStatus('waiting'); // keep waiting even on WS error

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (status === 'denied') {
        return (
            <div className="min-h-screen bg-background dark:bg-backgroundDark flex items-center justify-center px-6">
                <div className="text-center space-y-8 max-w-md">
                    <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center border border-error/20">
                        <XCircle size={36} className="text-error" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-textPrimary dark:text-lightText uppercase tracking-[0.2em]">Access Denied</h2>
                        <p className="text-sm font-bold text-textSecondary dark:text-lightText/60 leading-relaxed">
                            The session host has declined your request to join.
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-10 py-4 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-[2rem] text-sm font-black text-textPrimary dark:text-lightText uppercase tracking-widest hover:border-primary/40 transition-all duration-500 shadow-xl"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-backgroundDark text-textPrimary dark:text-lightText font-sans flex flex-col items-center justify-center relative overflow-hidden px-6">

            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
            </div>

            {/* Brand Mark */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 bg-primary text-white font-black rounded-xl flex items-center justify-center text-xs shadow-lg">NH</div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-textSecondary dark:text-lightText/60">Nuralhealer</span>
            </div>

            {/* Core Card */}
            <div className="relative z-10 w-full max-w-md space-y-10 text-center">

                {/* Animated Pulse Ring */}
                <div className="relative mx-auto w-36 h-36">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s', animationTimingFunction: 'ease-out' }} />
                    <div className="absolute inset-3 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s', animationTimingFunction: 'ease-out' }} />
                    <div className="absolute inset-6 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.8s', animationTimingFunction: 'ease-out' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(155,89,182,0.2)]">
                            <Heart size={32} className="text-primary" fill="currentColor" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-textPrimary dark:text-lightText tracking-tight leading-tight">
                        Awaiting Host<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Approval{dots}</span>
                    </h1>
                    <p className="text-sm font-bold text-textSecondary dark:text-lightText/60 leading-relaxed">
                        You're requesting to join as <span className="text-primary font-black">{displayName}</span>.<br />
                        The host will let you in shortly.
                    </p>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-center gap-6 px-6 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white dark:border-white/10 rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success">
                        <ShieldCheck size={14} />
                        <span>End-to-End Encrypted</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Activity size={14} className="animate-pulse" />
                        <span>{status === 'connecting' ? 'Connecting' : 'Waiting'}</span>
                    </div>
                </div>

                {/* Cancel */}
                <button
                    onClick={onCancel}
                    className="text-[11px] font-black text-textSecondary dark:text-lightText/40 uppercase tracking-widest hover:text-error transition-colors duration-300"
                >
                    Cancel Request
                </button>
            </div>
        </div>
    );
}
