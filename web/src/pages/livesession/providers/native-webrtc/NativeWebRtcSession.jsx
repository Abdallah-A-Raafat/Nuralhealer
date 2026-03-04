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
    ChevronUp,
    ChevronDown,
    Heart,
    Maximize2,
    Settings,
    MoreHorizontal
} from 'lucide-react';
import Participant from '../shared-webrtc/Participant';
import Button from '../../../../components/common/Button';

/**
 * V2 Luxury Native WebRTC Session.
 * Perfectly Responsive & Premium Luxury Wellness Aesthetic.
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
    const [connectionStatus, setConnectionStatus] = useState('Securing Connection...');

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
                const devices = await navigator.mediaDevices.enumerateDevices();
                const m = devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
                setAvailableMics(m);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: currentMicId ? { deviceId: { exact: currentMicId } } : true
                });

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

        const pcs = peerConnectionsRef.current;
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (wsRef.current) wsRef.current.close();
            Object.values(pcs).forEach(pc => pc.close());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [micDeviceId]);

    // 2. WebSocket Signaling
    const connectWebSocket = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
        const wsUrl = `${protocol}//${host}/api/ws/webrtc`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
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
                        setParticipantStates(prev => ({ ...prev, [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff } }));
                        await createOffer(msg.peerId);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Secure Connection established');
                        broadcastStatus(isMuted, isVideoOff);
                    }
                    break;
                case 'status-update':
                    if (msg.peerId !== displayName) {
                        setParticipantStates(prev => ({ ...prev, [msg.peerId]: { isMuted: msg.isMuted, isVideoOff: msg.isVideoOff } }));
                    }
                    break;
                case 'offer':
                    if (msg.peerId !== displayName) {
                        await handleOffer(msg.peerId, msg.sdp);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Secure Connection established');
                    }
                    break;
                case 'answer':
                    if (msg.peerId !== displayName) await handleAnswer(msg.peerId, msg.sdp);
                    break;
                case 'ice-candidate':
                    if (msg.peerId !== displayName) await handleIceCandidate(msg.peerId, msg.candidate);
                    break;
                case 'leave':
                    handlePeerLeave(msg.peerId);
                    break;
                default:
                    break;
            }
        };

        ws.onclose = () => setConnectionStatus("Session Ended");
        ws.onerror = () => setConnectionStatus("Network Error");
    };

    // WebRTC Helpers
    const createPeerConnection = (peerId) => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ice-candidate', roomId: session.sessionId, peerId: displayName, candidate: event.candidate }));
            }
        };
        pc.ontrack = (event) => { setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] })); };
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
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
        if (Object.keys(peerConnectionsRef.current).length === 0) setConnectionStatus("Waiting for guest...");
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
            if (deviceId === currentMicId) { setShowMicSelector(false); return; }
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
            const newTrack = newStream.getAudioTracks()[0];
            const oldTrack = localStreamRef.current.getAudioTracks()[0];
            if (oldTrack) { localStreamRef.current.removeTrack(oldTrack); oldTrack.stop(); }
            localStreamRef.current.addTrack(newTrack);
            for (const pc of Object.values(peerConnectionsRef.current)) {
                const senders = pc.getSenders();
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                if (audioSender) await audioSender.replaceTrack(newTrack);
                else pc.addTrack(newTrack, localStreamRef.current);
            }
            newTrack.enabled = !isMuted;
            setCurrentMicId(deviceId);
            setShowMicSelector(false);
        } catch (err) {
            console.error("Mic switch failure:", err);
            setConnectionStatus("Mic Switch Failed");
        }
    };

    return (
        <div className="relative flex flex-col h-screen bg-background dark:bg-backgroundDark text-textPrimary dark:text-lightText font-sans overflow-hidden transition-colors duration-500">

            {/* Luxury Overlay Header - Responsive */}
            <header className="relative z-40 w-full flex flex-col md:flex-row items-center justify-between px-6 py-4 md:px-12 md:py-6 bg-white/60 dark:bg-white/5 backdrop-blur-3xl border-b border-gray-100 dark:border-white/10 shadow-sm transition-all duration-700">
                <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-0">
                    <div className="group relative">
                        <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-white/10 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/10 flex items-center justify-center text-primary shadow-xl group-hover:scale-105 transition-transform duration-500">
                            <Heart size={20} fill="currentColor" className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-[10px] md:text-sm font-black text-textPrimary dark:text-lightText uppercase tracking-[0.25em]">Private Consultation</h2>
                            <div className="bg-success/5 border border-success/10 px-2.5 py-1 rounded-lg text-[8px] md:text-[10px] font-black text-success uppercase tracking-widest hidden sm:block">Verified Secure</div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-2 text-primary text-[9px] md:text-[11px] font-black uppercase tracking-wider">
                                <Activity size={14} className="animate-pulse" />
                                {connectionStatus}
                            </span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-textSecondary text-[9px] md:text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> {connectedPeers + 1} Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden lg:flex items-center gap-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-5 py-3 shadow-inner group/invite">
                        <ShieldCheck size={16} className="text-success group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-textSecondary dark:text-lightText/60 uppercase tracking-widest">Consultant Session</span>
                        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-2" />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${copied ? 'text-success' : 'text-primary hover:opacity-70 dark:text-primary/80'}`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Link Ready' : 'Invite Client'}
                        </button>
                    </div>

                    <button className="flex lg:hidden p-3 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-primary" onClick={handleCopy}>
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </header>

            {/* Grid Area - Perfectly Responsive Padding & Flow */}
            <main className="flex-1 w-full bg-[#F8F9FF] dark:bg-black/10 relative overflow-hidden flex items-center justify-center p-6 md:p-12 lg:p-16">

                {/* Background Textures */}
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent opacity-60 z-0" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] z-0" />

                <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                    <div className={`grid gap-6 md:gap-10 lg:gap-16 w-full h-full p-2 transition-all duration-1000 ${connectedPeers === 0 ? 'max-w-2xl' : 'grid-cols-1 md:grid-cols-2'
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
                            />
                        ))}

                        {connectedPeers === 0 && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/60 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white shadow-2xl relative z-10">
                                        <Activity size={32} className="text-primary animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <p className="text-textPrimary dark:text-lightText text-[11px] md:text-xs font-black uppercase tracking-[0.4em] drop-shadow-sm">
                                        Private Encryption Active
                                    </p>
                                    <p className="text-textSecondary dark:text-lightText/40 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                                        Awaiting guest connection
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Premium Control Center - Luxury Floating Dock */}
            <section className="absolute bottom-8 md:bottom-12 left-0 right-0 z-50 px-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 max-w-2xl mx-auto bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[3.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_40px_120px_rgba(155,89,182,0.1)] group/dock hover:-translate-y-2">

                    <div className="flex items-center gap-6 md:gap-8">
                        <div className="relative">
                            <button
                                onClick={toggleMute}
                                className={`w-14 h-14 md:w-16 md:h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shadow-2xl ${isMuted
                                    ? 'bg-error text-white border-error/20 hover:bg-error/80'
                                    : 'bg-white dark:bg-white/10 text-primary border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20 hover:border-primary/20'
                                    }`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>

                            {availableMics.length > 1 && (
                                <button
                                    onClick={() => setShowMicSelector(!showMicSelector)}
                                    className="absolute -right-2 -top-2 w-8 h-8 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center text-primary transition-all hover:scale-110 hover:shadow-xl z-20"
                                >
                                    {showMicSelector ? <ChevronDown size={14} /> : <Settings size={14} className="animate-spin-slow" />}
                                </button>
                            )}

                            {showMicSelector && (
                                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-72 bg-white/95 dark:bg-backgroundDark/95 backdrop-blur-3xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] p-5 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 z-[100]">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Voice Sources</p>
                                        <Settings size={12} className="text-primary/30" />
                                    </div>
                                    <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 px-1">
                                        {availableMics.map(mic => (
                                            <button
                                                key={mic.deviceId}
                                                onClick={() => changeMicrophone(mic.deviceId)}
                                                className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black transition-all duration-300 flex items-center justify-between group ${mic.deviceId === currentMicId
                                                    ? 'bg-primary text-white shadow-xl scale-[1.02] ring-4 ring-primary/10'
                                                    : 'hover:bg-primary/5 text-textPrimary dark:text-lightText hover:translate-x-1'
                                                    }`}
                                            >
                                                <span className="truncate pr-4">{mic.label}</span>
                                                {mic.deviceId === currentMicId && <Check size={16} strokeWidth={3} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shadow-2xl ${isVideoOff
                                ? 'bg-error text-white border-error/20 hover:bg-error/80'
                                : 'bg-white dark:bg-white/10 text-primary border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20 hover:border-primary/20'
                                }`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    </div>

                    <div className="w-px h-10 bg-gray-100 dark:bg-white/10 mx-2 hidden md:block" />
                    <div className="w-full h-px bg-gray-100 dark:bg-white/10 my-1 md:hidden" />

                    <button
                        onClick={onLeave}
                        className="w-full md:w-auto px-10 h-14 md:h-16 bg-error text-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-error/30 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 hover:bg-error/80 hover:scale-105 active:scale-95 active:rotate-2 group/leave overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/leave:translate-x-full transition-transform duration-1000" />
                        <PhoneOff size={20} className="group-hover/leave:rotate-[135deg] transition-transform duration-500" />
                        <span>End Call</span>
                    </button>
                </div>
            </section>

            {/* Interactive Aesthetics Overlay */}
            <div className="absolute pointer-events-none inset-0 border-[16px] md:border-[24px] border-white/40 z-30 transition-all duration-1000 group-hover:border-primary/5" />

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 89, 182, 0.15); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 89, 182, 0.4); }
                @keyframes spin-slow {
                   from { transform: rotate(0deg); }
                   to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}} />
        </div>
    );
}
