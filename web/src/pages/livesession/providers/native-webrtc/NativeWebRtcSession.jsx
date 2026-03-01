import { useState, useEffect, useRef } from 'react';
import { Video, PhoneOff, Copy, Check, Link2, Mic, MicOff, VideoOff, Users } from 'lucide-react';

export default function NativeWebRtcSession({ session, displayName, micDeviceId, onLeave }) {
    const [copied, setCopied] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectedPeers, setConnectedPeers] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');

    // Maps peer ID -> MediaStream
    const [remoteStreams, setRemoteStreams] = useState({});

    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const localStreamRef = useRef(null);

    // WebRTC refs
    const wsRef = useRef(null);
    const peerConnectionsRef = useRef({}); // peerId -> RTCPeerConnection

    const shareLink = `${window.location.origin}/live-session/${session.sessionId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
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
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                connectWebSocket();
            } catch (err) {
                console.error("Failed to get local media", err);
                setConnectionStatus("Camera/Mic access denied");
            }
        };
        startLocalVideo();

        const pcs = peerConnectionsRef.current;
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            Object.values(pcs).forEach(pc => pc.close());
        };
    }, [micDeviceId]);

    // 2. Connect to Spring Boot WebSocket Signaling Server
    const connectWebSocket = () => {
        // Determine WS protocol based on current origin
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Use the backend API host, assuming typical React proxy setup or direct local dev
        const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;

        // Adjust if your backend is on a different explicit port/path
        const wsUrl = `${protocol}//${host}/api/ws/webrtc`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnectionStatus('Waiting for others...');
            ws.send(JSON.stringify({
                type: 'join',
                roomId: session.sessionId,
                peerId: displayName // Using display name as a simple peer ID for this example
            }));
        };

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.roomId !== session.sessionId) return;

            switch (msg.type) {
                case 'join':
                    // Someone else joined, so we should create an offer to them
                    if (msg.peerId !== displayName) {
                        await createOffer(msg.peerId);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Connected');
                    }
                    break;
                case 'offer':
                    if (msg.peerId !== displayName) {
                        await handleOffer(msg.peerId, msg.sdp);
                        setConnectedPeers(prev => prev + 1);
                        setConnectionStatus('Connected');
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

        ws.onerror = (err) => {
            console.error("WebSocket error", err);
            setConnectionStatus("Signaling server disconnected");
        };
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

        wsRef.current.send(JSON.stringify({
            type: 'offer',
            roomId: session.sessionId,
            peerId: displayName,
            sdp: offer
        }));
    };

    const handleOffer = async (peerId, offerSdp) => {
        const pc = createPeerConnection(peerId);
        await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        wsRef.current.send(JSON.stringify({
            type: 'answer',
            roomId: session.sessionId,
            peerId: displayName,
            sdp: answer
        }));
    };

    const handleAnswer = async (peerId, answerSdp) => {
        const pc = peerConnectionsRef.current[peerId];
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        }
    };

    const handleIceCandidate = async (peerId, candidate) => {
        const pc = peerConnectionsRef.current[peerId];
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handlePeerLeave = (peerId) => {
        if (peerConnectionsRef.current[peerId]) {
            peerConnectionsRef.current[peerId].close();
            delete peerConnectionsRef.current[peerId];
        }
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        setConnectedPeers(prev => Math.max(0, prev - 1));
        if (Object.keys(peerConnectionsRef.current).length === 0) {
            setConnectionStatus("Waiting for others...");
        }
    };

    // Bind remote streams to video elements
    useEffect(() => {
        Object.entries(remoteStreams).forEach(([peerId, stream]) => {
            const videoEl = remoteVideosRef.current[peerId];
            if (videoEl && videoEl.srcObject !== stream) {
                videoEl.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    // Controls
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div className="relative flex flex-col h-[calc(100vh-64px)] bg-gray-950 overflow-hidden text-white font-sans">

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/60 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center p-2 bg-indigo-500/10 rounded-xl">
                        <Video size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-tight">Native WebRTC Session</h2>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-400 font-medium">{connectionStatus}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 flex items-center gap-1"><Users size={10} /> {connectedPeers + 1} participant{connectedPeers !== 0 && 's'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2">
                    <Link2 size={14} className="text-gray-500" />
                    <span className="text-gray-400 text-xs font-mono w-24 truncate select-all">{shareLink}</span>
                    <button onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors border border-indigo-500/20">
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 w-full p-4 relative overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr h-full">

                    {/* Local Video */}
                    <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center min-h-[200px]">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-gray-300">{displayName.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-white/10">
                            {displayName} (You)
                            {isMuted && <MicOff size={12} className="text-red-400" />}
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {Object.keys(remoteStreams).map(peerId => (
                        <div key={peerId} className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center min-h-[200px]">
                            <video
                                ref={el => remoteVideosRef.current[peerId] = el}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
                                {peerId}
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex items-center justify-center gap-4 px-4 py-4 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800/60 pb-8">
                <button onClick={toggleMute}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border ${isMuted
                        ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30'
                        : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                        }`}>
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button onClick={toggleVideo}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border ${isVideoOff
                        ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30'
                        : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                        }`}>
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>

                <button onClick={onLeave}
                    className="flex items-center justify-center gap-2 px-6 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors border border-red-500 ml-4 shadow-lg shadow-red-600/20">
                    <PhoneOff size={18} />
                    Leave Call
                </button>
            </div>

        </div>
    );
}
