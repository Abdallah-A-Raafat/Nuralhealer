import { useState, useEffect, useRef } from 'react';
import {
    Video,
    PhoneOff,
    Copy,
    Check,
    Mic,
    MicOff,
    VideoOff,
    Users,
    Activity,
    ShieldCheck,
    ChevronDown,
    Settings,
    Volume2,
    UserCheck,
    UserX
} from 'lucide-react';
import Participant from '../shared-webrtc/Participant';
import logo from '../../../../assets/icon.png';

/**
 * Native WebRTC Session — Perfect Negotiation Pattern.
 * Fixes:
 *  1. hasConnectedRef guard prevents React StrictMode from double-joining
 *  2. Polite/impolite peer roles resolve simultaneous offer collisions
 *  3. Speaker output device selector with setSinkId
 */
export default function NativeWebRtcSession({
    session,
    displayName,
    micDeviceId,
    initialMuted = false,
    initialVideoOff = false,
    onLeave
}) {
    const [copied, setCopied] = useState(false);
    const [isMuted, setIsMuted] = useState(initialMuted);
    const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
    const [connectionStatus, setConnectionStatus] = useState('Securing Connection...');

    // Device Management
    const [availableMics, setAvailableMics] = useState([]);
    const [availableSpeakers, setAvailableSpeakers] = useState([]);
    const [currentMicId, setCurrentMicId] = useState(micDeviceId);
    const [currentSpeakerId, setCurrentSpeakerId] = useState('');
    const [showMicSelector, setShowMicSelector] = useState(false);
    const [showSpeakerSelector, setShowSpeakerSelector] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

    // Peer state
    const [remoteStreams, setRemoteStreams] = useState({});       // peerId -> MediaStream
    const [participantStates, setParticipantStates] = useState({}); // peerId -> {isMuted, isVideoOff}
    const [connectedPeers, setConnectedPeers] = useState(0);
    // Render-trigger: a ref mutation alone won't re-render; this forces React to re-read
    // localStreamRef.current for the local <Participant /> after async media acquisition
    const [, forceLocalRender] = useState(0);
    // Join approval
    const [pendingRequests, setPendingRequests] = useState([]); // [{peerId}]

    const localStreamRef = useRef(null);
    const wsRef = useRef(null);
    const peerConnectionsRef = useRef({});       // peerId -> RTCPeerConnection
    const makingOfferRef = useRef({});           // peerId -> boolean (for Perfect Negotiation)
    const iceCandidateQueues = useRef({});       // peerId -> RTCIceCandidate[] (buffer until remoteDescription set)
    const isMutedRef = useRef(initialMuted);     // current mute state for closures
    const isVideoOffRef = useRef(initialVideoOff); // current video state for closures
    const hasConnectedRef = useRef(false);       // StrictMode double-mount guard
    const isMountedRef = useRef(true);           // cleanup guard

    const shareLink = `${window.location.origin}/live-session/native/${session.sessionId}`;

    // ── Helpers ────────────────────────────────────────────────────────────────

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const broadcastStatus = (muted, videoOff) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'status-update',
                roomId: session.sessionId,
                peerId: displayName,
                isMuted: muted,
                isVideoOff: videoOff
            }));
        }
    };

    // Polite peer = lexicographically smaller displayName — used for Perfect Negotiation
    const isPolite = (remotePeerId) => displayName < remotePeerId;

    const getOrCreatePC = (peerId) => {
        if (peerConnectionsRef.current[peerId]) return peerConnectionsRef.current[peerId];

        const iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ];
        // Add TURN server if configured (required for symmetric NAT / corporate firewalls)
        const turnUrl = import.meta.env.VITE_TURN_URL;
        if (turnUrl) {
            iceServers.push({
                urls: turnUrl,
                username: import.meta.env.VITE_TURN_USERNAME || '',
                credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
            });
        }

        const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 4 });

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'ice-candidate',
                    roomId: session.sessionId,
                    peerId: displayName,
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (['connected', 'completed'].includes(state)) {
                setConnectionStatus('Secure Connection Established');
            } else if (state === 'disconnected') {
                setConnectionStatus('Reconnecting...');
                // Give it a moment — disconnected often self-heals via ICE restart
                setTimeout(() => {
                    if (pc.connectionState === 'disconnected') {
                        pc.restartIce();
                    }
                }, 3000);
            } else if (state === 'failed') {
                setConnectionStatus('Connection Failed — Retrying...');
                pc.restartIce();
            }
        };

        // Negotiate (Perfect Negotiation: only the side that triggers onnegotiationneeded creates the offer)
        pc.onnegotiationneeded = async () => {
            try {
                makingOfferRef.current[peerId] = true;
                await pc.setLocalDescription();
                wsRef.current?.send(JSON.stringify({
                    type: 'offer',
                    roomId: session.sessionId,
                    peerId: displayName,
                    sdp: pc.localDescription
                }));
            } catch (err) {
                console.error('onnegotiationneeded error:', err);
            } finally {
                makingOfferRef.current[peerId] = false;
            }
        };

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnectionsRef.current[peerId] = pc;
        return pc;
    };

    const handlePeerLeave = (peerId) => {
        const pc = peerConnectionsRef.current[peerId];
        if (pc) { pc.close(); delete peerConnectionsRef.current[peerId]; }
        delete makingOfferRef.current[peerId];
        delete iceCandidateQueues.current[peerId];
        setRemoteStreams(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        setParticipantStates(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        setConnectedPeers(Object.keys(peerConnectionsRef.current).length);
        if (Object.keys(peerConnectionsRef.current).length === 0) {
            setConnectionStatus('Waiting for guest...');
        }
    };

    // ── WebSocket Signaling ────────────────────────────────────────────────────

    const connectWebSocket = () => {
        if (!isMountedRef.current) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/webrtc`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Keepalive ping every 25 s — prevents proxy idle-timeout (Nginx=75s, ALB=60s)
        // Without this, proxies silently RST the TCP connection; the client sees readyState=OPEN
        // but messages go nowhere and ICE restarts are never delivered.
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping', roomId: session.sessionId }));
            }
        }, 25000);

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'join',
                roomId: session.sessionId,
                peerId: displayName,
                isMuted: isMutedRef.current,       // use current state, not mount-time props
                isVideoOff: isVideoOffRef.current  // (matters on WS reconnect after state changed)
            }));
        };

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.roomId !== session.sessionId) return;
            if (msg.peerId === displayName) return; // ignore own messages

            // Helper: drain any ICE candidates that arrived before remoteDescription was set
            const drainIceCandidates = async (peerId, pc) => {
                const queue = iceCandidateQueues.current[peerId];
                if (!queue || queue.length === 0) return;
                for (const c of queue) {
                    try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* safe to ignore during drain */ }
                }
                iceCandidateQueues.current[peerId] = [];
            };

            switch (msg.type) {

                case 'join': {
                    // A new peer joined — we (the existing peer) initiate the offer
                    setParticipantStates(prev => ({
                        ...prev,
                        [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff }
                    }));
                    const pc = getOrCreatePC(msg.peerId);
                    if (pc.signalingState === 'stable') {
                        try {
                            makingOfferRef.current[msg.peerId] = true;
                            await pc.setLocalDescription();
                            ws.send(JSON.stringify({
                                type: 'offer',
                                roomId: session.sessionId,
                                peerId: displayName,
                                sdp: pc.localDescription
                            }));
                        } catch (err) {
                            console.error('createOffer error:', err);
                        } finally {
                            makingOfferRef.current[msg.peerId] = false;
                        }
                    }
                    setConnectedPeers(Object.keys(peerConnectionsRef.current).length);
                    // Use refs for current mute/video state (not stale closure values)
                    broadcastStatus(isMutedRef.current, isVideoOffRef.current);
                    break;
                }

                case 'status-update': {
                    setParticipantStates(prev => ({
                        ...prev,
                        [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff }
                    }));
                    break;
                }

                case 'offer': {
                    const pc = getOrCreatePC(msg.peerId);
                    const polite = isPolite(msg.peerId);
                    const offerCollision = makingOfferRef.current[msg.peerId] || pc.signalingState !== 'stable';

                    if (offerCollision && !polite) {
                        return;
                    }

                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                        await drainIceCandidates(msg.peerId, pc);
                        await pc.setLocalDescription();
                        ws.send(JSON.stringify({
                            type: 'answer',
                            roomId: session.sessionId,
                            peerId: displayName,
                            sdp: pc.localDescription
                        }));
                        setConnectedPeers(Object.keys(peerConnectionsRef.current).length);
                        setConnectionStatus('Secure Connection Established');
                    } catch (err) {
                        console.error('handleOffer error:', err);
                    }
                    break;
                }

                case 'answer': {
                    const pc = peerConnectionsRef.current[msg.peerId];
                    if (!pc) return;
                    if (pc.signalingState !== 'have-local-offer') {
                        return;
                    }
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                        await drainIceCandidates(msg.peerId, pc);
                        setConnectedPeers(Object.keys(peerConnectionsRef.current).length);
                        setConnectionStatus('Secure Connection Established');
                    } catch (err) {
                        console.error('handleAnswer error:', err);
                    }
                    break;
                }

                case 'ice-candidate': {
                    const pc = peerConnectionsRef.current[msg.peerId];
                    if (!msg.candidate) return;
                    // Buffer if PC doesn't exist yet or remoteDescription not set
                    if (!pc || !pc.remoteDescription) {
                        iceCandidateQueues.current[msg.peerId] = iceCandidateQueues.current[msg.peerId] || [];
                        iceCandidateQueues.current[msg.peerId].push(msg.candidate);
                        return;
                    }
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                    } catch (err) {
                        if (!err.message?.includes('remote description')) {
                            console.warn('ICE candidate error:', err);
                        }
                    }
                    break;
                }

                case 'join-request': {
                    setPendingRequests(prev => {
                        if (prev.find(r => r.peerId === msg.peerId)) return prev;
                        return [...prev, { peerId: msg.peerId }];
                    });
                    break;
                }

                case 'leave':
                    handlePeerLeave(msg.peerId);
                    setPendingRequests(prev => prev.filter(r => r.peerId !== msg.peerId));
                    break;

                default:
                    break;
            }
        };

        ws.onclose = (event) => {
            clearInterval(pingInterval);
            if (!isMountedRef.current) return;
            console.warn('WebSocket closed, code:', event.code);
            setConnectionStatus('Reconnecting...');

            // Clean up all existing PeerConnections before reconnecting —
            // stale PCs with old ICE state cause ghost connections
            for (const [peerId, pc] of Object.entries(peerConnectionsRef.current)) {
                pc.close();
                delete peerConnectionsRef.current[peerId];
                delete makingOfferRef.current[peerId];
                delete iceCandidateQueues.current[peerId];
            }
            setRemoteStreams({});
            setParticipantStates({});
            setConnectedPeers(0);

            setTimeout(() => {
                if (isMountedRef.current) connectWebSocket();
            }, 2000);
        };
        ws.onerror = (err) => {
            console.warn('WebSocket error:', err);
            // onclose will fire after this — reconnect is handled there
        };
    };

    // ── Media Initialization ───────────────────────────────────────────────────

    useEffect(() => {
        // StrictMode double-mount guard
        if (hasConnectedRef.current) return;
        hasConnectedRef.current = true;
        isMountedRef.current = true;

        const getMediaWithRetry = async (retries = 5) => {
            const audioConstraint = currentMicId ? { deviceId: { exact: currentMicId } } : true;
            try {
                return await navigator.mediaDevices.getUserMedia({ video: true, audio: audioConstraint });
            } catch (err) {
                if (retries > 0 && (err.name === 'NotReadableError' || err.name === 'AbortError')) {
                    // Camera still locked by lobby preview — wait longer and retry
                    await new Promise(r => setTimeout(r, 800));
                    return getMediaWithRetry(retries - 1);
                }
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: audioConstraint });
                    setIsVideoOff(true);
                    return fallbackStream;
                } catch {
                    console.warn('No media available — joining as listener');
                    return null;
                }
            }
        };

        const init = async () => {
            // Wait for the lobby's camera to fully release
            await new Promise(r => setTimeout(r, 600));
            if (!isMountedRef.current) return;

            const stream = await getMediaWithRetry();
            if (!isMountedRef.current) {
                if (stream) stream.getTracks().forEach(t => t.stop());
                return;
            }

            if (stream) {
                stream.getAudioTracks().forEach(t => t.enabled = !initialMuted);
                stream.getVideoTracks().forEach(t => t.enabled = !initialVideoOff);
                localStreamRef.current = stream;
                forceLocalRender(n => n + 1); // notify React so Participant re-reads the ref

                // If peer connections were created before media was ready,
                // add tracks to them now
                for (const pc of Object.values(peerConnectionsRef.current)) {
                    const existingSenders = pc.getSenders();
                    stream.getTracks().forEach(track => {
                        const alreadyAdded = existingSenders.some(s => s.track?.id === track.id);
                        if (!alreadyAdded) {
                            pc.addTrack(track, stream);
                        }
                    });
                }
            }

            // Enumerate devices after permission grant
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                setAvailableMics(devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }))
                );
                const speakers = devices.filter(d => d.kind === 'audiooutput');
                setAvailableSpeakers(speakers.map((d, i) => ({
                    deviceId: d.deviceId,
                    label: d.label || `Speaker ${i + 1}`
                })));
                if (speakers.length > 0) setCurrentSpeakerId(speakers[0].deviceId);
            } catch { /* ignore */ }

            // Connect WebSocket after media is ready, with a small extra
            // delay so the backend can process any prior leave event
            setTimeout(() => {
                if (isMountedRef.current) connectWebSocket();
            }, 300);
        };

        init();

        const pcs = peerConnectionsRef.current;
        return () => {
            isMountedRef.current = false;
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
                localStreamRef.current = null;
            }
            if (wsRef.current) {
                // Send leave message before closing
                try {
                    if (wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'leave',
                            roomId: session.sessionId,
                            peerId: displayName
                        }));
                    }
                } catch { /* ignore */ }
                wsRef.current.close();
                wsRef.current = null;
            }
            Object.values(pcs).forEach(pc => pc.close());
            peerConnectionsRef.current = {};
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Controls ───────────────────────────────────────────────────────────────

    const toggleMute = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            const muted = !track.enabled;
            setIsMuted(muted);
            isMutedRef.current = muted;
            broadcastStatus(muted, isVideoOffRef.current);
        }
    };

    const toggleVideo = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            const videoOff = !track.enabled;
            setIsVideoOff(videoOff);
            isVideoOffRef.current = videoOff;
            broadcastStatus(isMutedRef.current, videoOff);
        }
    };

    const changeMicrophone = async (deviceId) => {
        try {
            if (deviceId === currentMicId) { setShowMicSelector(false); return; }
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
            const newTrack = newStream.getAudioTracks()[0];
            const oldTrack = localStreamRef.current?.getAudioTracks()[0];
            if (oldTrack) { localStreamRef.current.removeTrack(oldTrack); oldTrack.stop(); }
            if (localStreamRef.current) localStreamRef.current.addTrack(newTrack);

            for (const pc of Object.values(peerConnectionsRef.current)) {
                const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
                if (sender) await sender.replaceTrack(newTrack);
                else if (localStreamRef.current) pc.addTrack(newTrack, localStreamRef.current);
            }

            newTrack.enabled = !isMuted;
            setCurrentMicId(deviceId);
            setShowMicSelector(false);
        } catch (err) {
            console.error('Mic switch error:', err);
        }
    };

    const changeSpeaker = (deviceId) => {
        setCurrentSpeakerId(deviceId);
        setShowSpeakerSelector(false);
    };

    const approveRequest = (peerId) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'join-approved',
                roomId: session.sessionId,
                peerId: displayName,
                targetPeerId: peerId
            }));
        }
        setPendingRequests(prev => prev.filter(r => r.peerId !== peerId));
    };

    const denyRequest = (peerId) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'join-denied',
                roomId: session.sessionId,
                peerId: displayName,
                targetPeerId: peerId
            }));
        }
        setPendingRequests(prev => prev.filter(r => r.peerId !== peerId));
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="relative flex flex-col h-screen bg-background dark:bg-backgroundDark text-textPrimary dark:text-lightText font-sans overflow-hidden transition-colors duration-500">

            {/* Premium Header */}
            <header className="relative z-40 w-full flex flex-col md:flex-row items-center justify-between px-6 py-4 md:px-12 md:py-6 bg-white/60 dark:bg-white/5 backdrop-blur-3xl border-b border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <img src={logo} alt="NeuralHealer" className="w-full h-full object-contain p-2" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-[10px] md:text-sm font-black text-textPrimary dark:text-lightText uppercase tracking-[0.25em]">Private Consultation</h2>
                            <div className="bg-success/5 border border-success/10 px-2.5 py-1 rounded-lg text-[8px] md:text-[10px] font-black text-success uppercase tracking-widest hidden sm:block">Verified Secure</div>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                            <span className="flex items-center gap-2 text-primary text-[9px] md:text-[11px] font-black uppercase tracking-wider">
                                <Activity size={12} className="animate-pulse" />
                                {connectionStatus}
                            </span>
                            <div className="w-1 h-1 bg-gray-200 dark:bg-white/20 rounded-full" />
                            <span className="text-textSecondary dark:text-lightText/60 text-[9px] md:text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                                <Users size={12} /> {connectedPeers + 1} Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden lg:flex items-center gap-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-5 py-3 shadow-inner">
                        <ShieldCheck size={16} className="text-success" />
                        <span className="text-[10px] font-black text-textSecondary dark:text-lightText/60 uppercase tracking-widest">Consultant Session</span>
                        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-2" />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${copied ? 'text-success' : 'text-primary hover:opacity-70'}`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Link Ready' : 'Invite Client'}
                        </button>
                    </div>
                    <button className="flex lg:hidden p-3 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-primary" onClick={handleCopy}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </header>

            {/* Participant Grid */}
            <main className="flex-1 w-full bg-[#F8F9FF] dark:bg-black/10 relative overflow-hidden flex items-center justify-center p-6 md:p-10 lg:p-14" style={{ paddingBottom: '7rem' }}>
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent opacity-60 z-0" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] z-0" />

                <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                    <div className={`grid gap-6 md:gap-8 w-full transition-all duration-700 ${connectedPeers === 0
                        ? 'max-w-2xl grid-cols-1'
                        : connectedPeers === 1
                            ? 'grid-cols-1 md:grid-cols-2 max-w-5xl'
                            : 'grid-cols-2 md:grid-cols-3 max-w-7xl'
                        }`}>

                        <Participant
                            stream={localStreamRef.current}
                            name={displayName}
                            isLocal={true}
                            isMuted={isMuted}
                            isVideoOff={isVideoOff}
                        />

                        {Object.entries(remoteStreams).map(([peerId, stream]) => (
                            <Participant
                                key={peerId}
                                stream={stream}
                                name={peerId}
                                isLocal={false}
                                isMuted={participantStates[peerId]?.isMuted || false}
                                isVideoOff={participantStates[peerId]?.isVideoOff || false}
                                speakerDeviceId={currentSpeakerId}
                                speakerMuted={isSpeakerMuted}
                            />
                        ))}
                    </div>

                    {connectedPeers === 0 && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-20 space-y-6 animate-in fade-in zoom-in duration-1000">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                                <div className="w-16 h-16 bg-white/60 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white shadow-2xl relative z-10">
                                    <Activity size={24} className="text-primary animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-textPrimary dark:text-lightText text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Guest</p>
                                <p className="text-textSecondary dark:text-lightText/40 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Share the invite link to start</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Join Request Approval Stack */}
            {pendingRequests.length > 0 && (
                <div className="absolute top-24 md:top-28 right-4 md:right-8 z-50 space-y-3 w-72 md:w-80">
                    {pendingRequests.map(req => (
                        <div
                            key={req.peerId}
                            className="bg-white/95 dark:bg-backgroundDark/95 backdrop-blur-3xl border border-primary/20 rounded-[2rem] p-5 shadow-[0_20px_60px_rgba(155,89,182,0.2)] animate-in slide-in-from-right-4 fade-in duration-500"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary font-black text-base shrink-0">
                                    {req.peerId.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-primary uppercase tracking-widest truncate">{req.peerId}</p>
                                    <p className="text-[9px] font-bold text-textSecondary dark:text-lightText/50 uppercase tracking-wider mt-0.5">Requesting to join</p>
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => approveRequest(req.peerId)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-primary/80 hover:scale-[1.02] transition-all duration-300 active:scale-95"
                                >
                                    <UserCheck size={14} /> Admit
                                </button>
                                <button
                                    onClick={() => denyRequest(req.peerId)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-error/10 text-error border border-error/20 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all duration-300 active:scale-95"
                                >
                                    <UserX size={14} /> Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Control Dock */}
            <section className="absolute bottom-6 md:bottom-10 left-0 right-0 z-50 px-4 md:px-6">
                <div className="flex flex-row items-center justify-center gap-3 md:gap-6 max-w-2xl mx-auto bg-white/85 dark:bg-white/8 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[3.5rem] p-4 md:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-transform duration-500">

                    {/* Mic Button + Selector */}
                    <div className="relative">
                        <button
                            onClick={toggleMute}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shadow-xl ${isMuted
                                ? 'bg-error text-white border-error/20'
                                : 'bg-white dark:bg-white/10 text-primary border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20'
                                }`}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                        {availableMics.length > 1 && (
                            <button
                                onClick={() => { setShowMicSelector(!showMicSelector); setShowSpeakerSelector(false); }}
                                className="absolute -right-1 -top-1 w-6 h-6 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center text-primary z-20 hover:scale-110 transition-transform"
                            >
                                <ChevronDown size={12} />
                            </button>
                        )}
                        {showMicSelector && (
                            <DeviceMenu
                                title="Microphone"
                                devices={availableMics}
                                current={currentMicId}
                                onSelect={changeMicrophone}
                            />
                        )}
                    </div>

                    {/* Video Button */}
                    <button
                        onClick={toggleVideo}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shadow-xl ${isVideoOff
                            ? 'bg-error text-white border-error/20'
                            : 'bg-white dark:bg-white/10 text-primary border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20'
                            }`}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>

                    {/* Speaker Button + Selector */}
                    {availableSpeakers.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => { setIsSpeakerMuted(prev => !prev); setShowMicSelector(false); }}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shadow-xl ${isSpeakerMuted ? 'bg-error text-white border-error/20' : 'bg-white dark:bg-white/10 text-primary border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20'}`}>
                                <Volume2 size={20} />
                            </button>
                            <button
                                onClick={() => { setShowSpeakerSelector(!showSpeakerSelector); setShowMicSelector(false); }}
                                className="absolute -right-1 -top-1 w-6 h-6 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center text-primary z-20 hover:scale-110 transition-transform"
                            >
                                <ChevronDown size={12} />
                            </button>
                            {showSpeakerSelector && (
                                <DeviceMenu
                                    title="Speaker Output"
                                    devices={availableSpeakers}
                                    current={currentSpeakerId}
                                    onSelect={changeSpeaker}
                                />
                            )}
                        </div>
                    )}

                    <div className="w-px h-8 bg-gray-100 dark:bg-white/10 mx-1" />

                    {/* End Call */}
                    <button
                        onClick={onLeave}
                        className="px-6 md:px-10 h-12 md:h-14 bg-error text-white rounded-[2rem] shadow-2xl shadow-error/30 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 hover:bg-error/80 hover:scale-105 active:scale-95 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <PhoneOff size={18} className="group-hover:rotate-[135deg] transition-transform duration-500" />
                        <span className="hidden sm:inline">End Call</span>
                    </button>
                </div>
            </section>

            {/* Border Overlay */}
            <div className="absolute pointer-events-none inset-0 border-[12px] md:border-[20px] border-white/30 dark:border-white/5 z-30" />

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 89, 182, 0.2); border-radius: 20px; }
            ` }} />
        </div>
    );
}

// ── Device Menu Component ──────────────────────────────────────────────────────
function DeviceMenu({ title, devices, current, onSelect }) {
    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 bg-white/95 dark:bg-backgroundDark/95 backdrop-blur-3xl border border-gray-100 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 space-y-3 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="flex items-center gap-2 px-2">
                <Settings size={11} className="text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{title}</p>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                {devices.map(device => (
                    <button
                        key={device.deviceId}
                        onClick={() => onSelect(device.deviceId)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 flex items-center justify-between ${device.deviceId === current
                            ? 'bg-primary text-white shadow-lg scale-[1.01]'
                            : 'hover:bg-primary/5 text-textPrimary dark:text-lightText'
                            }`}
                    >
                        <span className="truncate pr-3">{device.label}</span>
                        {device.deviceId === current && <Check size={14} strokeWidth={3} />}
                    </button>
                ))}
            </div>
        </div>
    );
}
