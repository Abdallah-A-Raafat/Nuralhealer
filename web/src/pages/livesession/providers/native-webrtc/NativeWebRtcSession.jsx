import { useState, useEffect, useRef } from 'react';
import { Video, PhoneOff, Copy, Check, Link2, Mic, MicOff, VideoOff, Users, Activity } from 'lucide-react';
import Participant from '../shared-webrtc/Participant';

/**
 * Premium Native WebRTC Session Component.
 * Optimized for high-fidelity audio/video without screen sharing.
 */
export default function NativeWebRtcSession({ session, displayName, micDeviceId, onLeave }) {
    const [copied, setCopied] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectedPeers, setConnectedPeers] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('Initializing Engine...');

    // Maps peer ID -> MediaStream
    const [remoteStreams, setRemoteStreams] = useState({});
    // Maps peer ID -> { isMuted, isVideoOff }
    const [participantStates, setParticipantStates] = useState({});

    const localStreamRef = useRef(null);

    // WebRTC refs
    const wsRef = useRef(null);
    const peerConnectionsRef = useRef({}); // peerId -> RTCPeerConnection

    // Use the specific native route for sharing
    const shareLink = `${window.location.origin}/live-session/native/${session.sessionId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    // Broadcast own state
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

    // 1. Initialize local media
    useEffect(() => {
        const startLocalVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: micDeviceId ? { deviceId: { exact: micDeviceId } } : true
                });
                localStreamRef.current = stream;
                connectWebSocket();
            } catch (err) {
                console.error("Failed to get local media", err);
                setConnectionStatus("Access Denied");
            }
        };
        startLocalVideo();

        const currentPcs = peerConnectionsRef.current;
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            Object.values(currentPcs).forEach(pc => pc.close());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [micDeviceId]);

    // 2. Connect to Spring Boot WebSocket Signaling Server
    const connectWebSocket = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
        const wsUrl = `${protocol}//${host}/api/ws/webrtc`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnectionStatus('Syncing...');
            ws.send(JSON.stringify({
                type: 'join',
                roomId: session.sessionId,
                peerId: displayName,
                isMuted,
                isVideoOff
            }));
        };

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.roomId !== session.sessionId) return;

            switch (msg.type) {
                case 'join':
                    if (msg.peerId !== displayName) {
                        setParticipantStates(prev => ({
                            ...prev,
                            [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff }
                        }));
                        await createOffer(msg.peerId);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Secured');
                        broadcastStatus(isMuted, isVideoOff);
                    }
                    break;
                case 'status-update':
                    if (msg.peerId !== displayName) {
                        setParticipantStates(prev => ({
                            ...prev,
                            [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff }
                        }));
                    }
                    break;
                case 'offer':
                    if (msg.peerId !== displayName) {
                        await handleOffer(msg.peerId, msg.sdp);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Secured');
                    }
                    break;
                case 'answer':
                    if (msg.peerId !== displayName) {
                        await handleAnswer(msg.peerId, msg.sdp);
                    }
                    break;
                case 'ice-candidate':
                    if (msg.peerId !== displayName) {
                        await handleIceCandidate(msg.peerId, msg.candidate);
                    }
                    break;
                case 'leave':
                    handlePeerLeave(msg.peerId);
                    break;
                default:
                    break;
            }
        };

        ws.onerror = () => setConnectionStatus("Offline");
    };

    // 3. WebRTC Peer Connection Helpers
    const createPeerConnection = (peerId) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

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
            setRemoteStreams(prev => ({
                ...prev,
                [peerId]: event.streams[0]
            }));
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnectionsRef.current[peerId] = pc;
        return pc;
    };

    const createOffer = async (peerId) => {
        const pc = createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({ type: 'offer', roomId: session.sessionId, peerId: displayName, sdp: offer }));
    };

    const handleOffer = async (peerId, offerSdp) => {
        const pc = createPeerConnection(peerId);
        await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current.send(JSON.stringify({ type: 'answer', roomId: session.sessionId, peerId: displayName, sdp: answer }));
    };

    const handleAnswer = async (peerId, answerSdp) => {
        const pc = peerConnectionsRef.current[peerId];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
    };

    const handleIceCandidate = async (peerId, candidate) => {
        const pc = peerConnectionsRef.current[peerId];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handlePeerLeave = (peerId) => {
        if (peerConnectionsRef.current[peerId]) {
            peerConnectionsRef.current[peerId].close();
            delete peerConnectionsRef.current[peerId];
        }
        setRemoteStreams(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        setParticipantStates(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        setConnectedPeers(prev => Math.max(0, prev - 1));
        if (Object.keys(peerConnectionsRef.current).length === 0) setConnectionStatus("Awaiting Peers...");
    };

    // Controls
    const toggleMute = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsMuted(!track.enabled);
                broadcastStatus(!track.enabled, isVideoOff);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsVideoOff(!track.enabled);
                broadcastStatus(isMuted, !track.enabled);
            }
        }
    };

    return (
        <div className="relative flex flex-col h-screen bg-[#0A0A0C] overflow-hidden text-white font-sans selection:bg-indigo-500/30">

            {/* Ultra-Modern Header */}
            <div className="relative z-20 flex items-center justify-between gap-4 px-8 py-5 bg-black/20 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-indigo-500/10 rounded-[1.25rem] border border-indigo-500/20 shadow-inner group transition-all hover:bg-indigo-500/20">
                        <Video size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-white/90 uppercase tracking-[0.2em]">Precision Live Hub</h2>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-black tracking-widest border border-emerald-500/10">Connected</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 opacity-60">
                            <span className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                {connectionStatus}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="text-white/60 text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest">
                                <Users size={12} className="opacity-50" /> {connectedPeers + 1} ACTIVE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-2.5 transition-all hover:bg-white/10 group">
                        <Link2 size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-white/40 text-[10px] font-mono w-32 truncate select-all tracking-tighter uppercase">{session.sessionId}</span>
                        <button onClick={handleCopy}
                            className="flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-xl bg-white/5 text-white/60 font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-white/5">
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Invite'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Immersive Video Grid */}
            <div className="flex-1 w-full p-8 relative overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,_rgba(31,27,45,0.4)_0%,_transparent_70%)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr h-full max-w-7xl mx-auto">

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
                        />
                    ))}

                    {connectedPeers === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center space-y-6 opacity-20 py-20">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <Activity size={40} className="text-white animate-pulse" />
                            </div>
                            <p className="text-white text-xs font-black uppercase tracking-[0.5em] text-center max-w-xs leading-loose">
                                Securing Peer-to-Peer Tunnel...<br />Waiting for direct link connection
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Orbital Control Bar */}
            <div className="relative z-30 px-8 py-10">
                <div className="flex items-center justify-center gap-8 max-w-md mx-auto bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-5 shadow-2xl relative">
                    <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <button onClick={toggleMute}
                        className={`group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 transform active:scale-90 border-2 ${isMuted
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-lg shadow-red-500/10'
                                : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                            }`}>
                        {isMuted ? <MicOff size={24} className="animate-pulse" /> : <Mic size={24} />}
                    </button>

                    <button onClick={toggleVideo}
                        className={`group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 transform active:scale-90 border-2 ${isVideoOff
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-lg shadow-red-500/10'
                                : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                            }`}>
                        {isVideoOff ? <VideoOff size={24} className="animate-pulse" /> : <Video size={24} />}
                    </button>

                    <button onClick={onLeave}
                        className="group flex items-center justify-center gap-4 px-10 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs transition-all duration-500 shadow-2xl shadow-red-600/30 hover:shadow-red-500/40 active:scale-95 border border-red-400/20">
                        <PhoneOff size={20} className="group-hover:-translate-x-1 transition-transform" />
                        TERMINATE
                    </button>
                </div>
            </div>

        </div>
    );
}
