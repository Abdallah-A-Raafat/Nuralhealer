import { useState, useEffect, useRef } from 'react';
import { Video, PhoneOff, Copy, Check, Link2, Mic, MicOff, VideoOff, Users, Activity, Settings, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import Participant from '../shared-webrtc/Participant';

/**
 * Premium Native WebRTC Session Component.
 * Aligned with NeuralHealer Professional Brand Palette.
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
    const [connectedPeers, setConnectedPeers] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('Initializing Security...');

    // Device Management
    const [availableMics, setAvailableMics] = useState([]);
    const [currentMicId, setCurrentMicId] = useState(micDeviceId);
    const [showMicSelector, setShowMicSelector] = useState(false);

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
                // Enumerate devices
                const devices = await navigator.mediaDevices.enumerateDevices();
                const m = devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + i}` }));
                setAvailableMics(m);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: currentMicId ? { deviceId: { exact: currentMicId } } : true
                });

                // Set initial states from props
                stream.getAudioTracks().forEach(t => t.enabled = !initialMuted);
                stream.getVideoTracks().forEach(t => t.enabled = !initialVideoOff);

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
            setConnectionStatus('Syncing Node...');
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
                        // Send current state to newly joined peer
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

        ws.onclose = () => setConnectionStatus("Disconnected");
        ws.onerror = () => setConnectionStatus("Network Error");
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

    const changeMicrophone = async (deviceId) => {
        try {
            if (deviceId === currentMicId) {
                setShowMicSelector(false);
                return;
            }

            // 1. Get new audio track
            const newStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } }
            });
            const newTrack = newStream.getAudioTracks()[0];

            // 2. Stop old track
            const oldTrack = localStreamRef.current.getAudioTracks()[0];
            if (oldTrack) {
                localStreamRef.current.removeTrack(oldTrack);
                oldTrack.stop();
            }

            // 3. Update local stream ref
            localStreamRef.current.addTrack(newTrack);

            // 4. Update Peer Connections (replaceTrack)
            for (const pc of Object.values(peerConnectionsRef.current)) {
                const senders = pc.getSenders();
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                if (audioSender) {
                    await audioSender.replaceTrack(newTrack);
                } else {
                    // If for fallback, we could addTrack, but usually there's already a sender
                    pc.addTrack(newTrack, localStreamRef.current);
                }
            }

            // 5. Sync states
            newTrack.enabled = !isMuted;
            setCurrentMicId(deviceId);
            setShowMicSelector(false);

        } catch (err) {
            console.error("Failed to switch microphone:", err);
            setConnectionStatus("Mic Switch Failed");
        }
    };

    return (
        <div className="relative flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#1A1625] overflow-hidden text-[#2C1A3F] dark:text-[#ECE8F5] font-sans">

            {/* Header Aligned with Dashboard Style */}
            <div className="relative z-20 flex items-center justify-between px-8 py-5 bg-white/80 dark:bg-[#2C1A3F]/80 backdrop-blur-2xl border-b border-[#9B59B6]/10 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-[#9B59B6]/10 rounded-2xl border border-[#9B59B6]/20 transition-all hover:bg-[#9B59B6]/20 shadow-sm group">
                        <Video size={18} className="text-[#9B59B6] group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-[#2C1A3F] dark:text-white uppercase tracking-[0.2em]">NeuralHealer Live</h2>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-black tracking-widest border border-emerald-200 dark:border-emerald-500/10">Active Session</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-2 text-[#9B59B6] text-[10px] font-black uppercase tracking-widest">
                                <span className="flex h-2 w-2 rounded-full bg-[#9B59B6] animate-pulse"></span>
                                {connectionStatus}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                            <span className="text-[#5D4E6D] dark:text-[#BB8FCE]/60 text-[10px] flex items-center gap-2 font-black uppercase tracking-widest">
                                <Users size={12} /> {connectedPeers + 1} Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-3 bg-gray-50 dark:bg-[#1A1625]/60 border border-gray-200 dark:border-[#9B59B6]/20 rounded-2xl px-5 py-3 shadow-inner">
                        <ShieldCheck size={14} className="text-[#9B59B6]" />
                        <span className="text-[#5D4E6D] dark:text-[#BB8FCE]/40 text-[10px] font-mono tracking-tighter uppercase">Peer-to-Peer Tunnel Secure</span>
                        <div className="w-px h-4 bg-[#9B59B6]/10 mx-2" />
                        <button onClick={handleCopy}
                            className="flex items-center gap-2 text-[10px] px-4 py-1.5 rounded-xl bg-white dark:bg-[#2C1A3F] text-[#9B59B6] font-black uppercase tracking-widest hover:bg-[#9B59B6] hover:text-white transition-all active:scale-95 shadow-sm border border-[#9B59B6]/20">
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Invite'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area with Radial Gradient */}
            <div className="flex-1 w-full p-8 relative overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,_rgba(155,89,182,0.05)_0%,_transparent_70%)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 auto-rows-fr h-full max-w-7xl mx-auto">

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
                        <div className="col-span-full flex flex-col items-center justify-center space-y-8 opacity-40 py-20 animate-in fade-in duration-1000">
                            <div className="w-24 h-24 bg-[#9B59B6]/5 rounded-full flex items-center justify-center border border-[#9B59B6]/10 shadow-inner">
                                <Activity size={40} className="text-[#9B59B6] animate-pulse" />
                            </div>
                            <p className="text-[#5D4E6D] dark:text-[#BB8FCE] text-xs font-black uppercase tracking-[0.5em] text-center max-w-xs leading-loose">
                                Establishing Neural Tunnel...<br />Waiting for room discovery
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Refined Docking Bar */}
            <div className="relative z-30 px-8 py-10">
                <div className="flex items-center justify-center gap-10 max-w-lg mx-auto bg-white/60 dark:bg-[#2C1A3F]/60 backdrop-blur-3xl border border-white dark:border-[#9B59B6]/20 rounded-[3.5rem] p-6 shadow-2xl relative">
                    <div className="absolute inset-x-24 top-0 h-px bg-gradient-to-r from-transparent via-[#9B59B6]/30 to-transparent" />

                    <div className="relative flex items-center">
                        <button onClick={toggleMute}
                            className={`group flex items-center justify-center w-16 h-16 rounded-[2.5rem] transition-all duration-500 transform active:scale-90 border-2 shadow-xl ${isMuted
                                ? 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/20 hover:bg-[#E74C3C]/20 shadow-[#E74C3C]/10'
                                : 'bg-white dark:bg-[#1A1625] text-[#9B59B6] border-white dark:border-[#9B59B6]/20 hover:bg-gray-50 dark:hover:bg-[#3D2656]'
                                }`}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        {availableMics.length > 1 && (
                            <button
                                onClick={() => setShowMicSelector(!showMicSelector)}
                                className="absolute -right-2 -top-2 p-1.5 bg-white dark:bg-[#2C1A3F] border border-[#9B59B6]/20 rounded-full shadow-lg text-[#9B59B6] hover:scale-110 transition-all z-10"
                            >
                                {showMicSelector ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                            </button>
                        )}

                        {showMicSelector && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-[#2C1A3F] backdrop-blur-3xl border border-[#9B59B6]/20 rounded-3xl shadow-2xl p-4 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#5D4E6D] dark:text-[#BB8FCE]/40 px-2 mb-2">Voice Sources</p>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                    {availableMics.map(mic => (
                                        <button
                                            key={mic.deviceId}
                                            onClick={() => changeMicrophone(mic.deviceId)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between group ${mic.deviceId === currentMicId
                                                    ? 'bg-[#9B59B6] text-white'
                                                    : 'hover:bg-[#9B59B6]/10 text-[#2C1A3F] dark:text-[#ECE8F5]'
                                                }`}
                                        >
                                            <span className="truncate pr-2">{mic.label}</span>
                                            {mic.deviceId === currentMicId && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={toggleVideo}
                        className={`group flex items-center justify-center w-16 h-16 rounded-[2.5rem] transition-all duration-500 transform active:scale-90 border-2 shadow-xl ${isVideoOff
                            ? 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/20 hover:bg-[#E74C3C]/20 shadow-[#E74C3C]/10'
                            : 'bg-white dark:bg-[#1A1625] text-[#9B59B6] border-white dark:border-[#9B59B6]/20 hover:bg-gray-50 dark:hover:bg-[#3D2656]'
                            }`}>
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>

                    <div className="w-px h-10 bg-[#9B59B6]/10" />

                    <button onClick={onLeave}
                        className="group flex items-center justify-center gap-5 px-12 h-16 rounded-[2.5rem] bg-[#E74C3C] hover:bg-[#C0392B] text-white font-black uppercase tracking-[0.25em] text-[11px] transition-all duration-500 shadow-2xl shadow-[#E74C3C]/30 active:scale-95 border border-white/20">
                        <PhoneOff size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Disconnect
                    </button>
                </div>
            </div>

        </div>
    );
}
