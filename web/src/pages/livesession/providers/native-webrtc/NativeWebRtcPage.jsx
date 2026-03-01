import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    Loader2,
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    Camera,
    Settings,
    ShieldCheck,
    Zap,
    User
} from 'lucide-react';
import liveSessionService from '../../liveSessionService';
import userService from '../../../../services/userService';
import NativeWebRtcSession from './NativeWebRtcSession';
import useAudioAnalyzer from '../shared-webrtc/useAudioAnalyzer';

export default function NativeWebRtcPage() {
    const { sessionId: paramSessionId } = useParams();
    const navigate = useNavigate();

    // ── States ──────────────────────────────────────────────────────────────
    const [inCall, setInCall] = useState(false);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lobby States
    const [name, setName] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [mics, setMics] = useState([]);
    const [selectedMic, setSelectedMic] = useState('');
    const [previewStream, setPreviewStream] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const videoPreviewRef = useRef(null);
    const micVolume = useAudioAnalyzer(previewStream, !inCall && isAudioEnabled);

    // ── Initialization ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await userService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    if (fullName) setName(fullName);
                }
            } catch (err) {
                console.debug("User not logged in, continuing as guest", err);
            }
        };
        fetchUser();
    }, []);

    // Enumerate Mics
    useEffect(() => {
        const getDevices = async () => {
            try {
                // Initial request to trigger permission prompt
                const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                initialStream.getTracks().forEach(t => t.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
                setMics(audioInputs);
                if (audioInputs.length > 0 && !selectedMic) setSelectedMic(audioInputs[0].deviceId);

            } catch (err) {
                console.error("Device detection failure:", err);
                setError("Camera and Microphone access are required for this session.");
            }
        };
        getDevices();
    }, [selectedMic]);

    // Update Preview Stream when Mic/Settings change
    useEffect(() => {
        if (inCall) return;

        let isMounted = true;
        const startPreview = async () => {
            try {
                if (previewStream) {
                    previewStream.getTracks().forEach(t => t.stop());
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
                    video: true
                });

                if (isMounted) {
                    // Sync with toggle states
                    stream.getVideoTracks().forEach(t => t.enabled = isVideoEnabled);
                    stream.getAudioTracks().forEach(t => t.enabled = isAudioEnabled);

                    setPreviewStream(stream);
                    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
                } else {
                    stream.getTracks().forEach(t => t.stop());
                }
            } catch (err) {
                console.error("Preview stream error:", err);
            }
        };

        startPreview();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMic, inCall]);

    // Sync Toggles
    useEffect(() => {
        if (previewStream) {
            previewStream.getVideoTracks().forEach(t => t.enabled = isVideoEnabled);
            previewStream.getAudioTracks().forEach(t => t.enabled = isAudioEnabled);
        }
    }, [isVideoEnabled, isAudioEnabled, previewStream]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleStart = async () => {
        if (!name.trim()) return;
        setLoading(true); setError(null);
        try {
            const data = paramSessionId
                ? await liveSessionService.join(paramSessionId, name.trim(), 'native-webrtc')
                : await liveSessionService.create(name.trim(), 'native-webrtc');

            setSession(data);
            if (previewStream) previewStream.getTracks().forEach(t => t.stop());
            setInCall(true);
        } catch (e) {
            setError(e.response?.data?.error || 'Connection failed. Please check your network.');
        } finally { setLoading(false); }
    };

    const handleLeave = () => {
        setInCall(false);
        navigate('/');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (inCall && session) {
        return (
            <NativeWebRtcSession
                session={session}
                displayName={name.trim()}
                micDeviceId={selectedMic}
                initialMuted={!isAudioEnabled}
                initialVideoOff={!isVideoEnabled}
                onLeave={handleLeave}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A1625] text-[#2C1A3F] dark:text-[#ECE8F5] transition-colors duration-500 overflow-x-hidden relative flex flex-col">

            {/* NeuralHealer Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9B59B6]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8E44AD]/5 rounded-full blur-[120px]" />
            </div>

            <div className="flex-1 container mx-auto px-6 py-8 max-w-6xl relative z-10 flex flex-col">

                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#9B59B6]/10">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-[#2C1A3F] hover:bg-gray-100 dark:hover:bg-[#3D2656] rounded-2xl shadow-sm border border-gray-100 dark:border-[#9B59B6]/20 transition-all active:scale-95 group">
                            <ArrowLeft size={18} className="text-[#5D4E6D] dark:text-[#BB8FCE]" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-[#2C1A3F] dark:text-white flex items-center gap-3">
                                Live <span className="bg-[#9B59B6]/10 text-[#9B59B6] dark:text-[#BB8FCE] px-3 py-1 rounded-xl text-[10px] border border-[#9B59B6]/20 font-black uppercase tracking-widest">Standalone Hub</span>
                            </h1>
                            <p className="text-[#5D4E6D] dark:text-[#BB8FCE]/60 text-xs font-bold uppercase tracking-widest mt-0.5">NeuralHealer Secure Network</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#27AE60] uppercase tracking-widest">
                            <ShieldCheck size={14} /> Encrypted Node
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#9B59B6] dark:text-[#BB8FCE] uppercase tracking-widest">
                            <Zap size={14} /> High Fidelity
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Preview Section */}
                    <div className="space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] rounded-[2.5rem] blur-2xl opacity-5 dark:opacity-20 group-hover:opacity-10 dark:group-hover:opacity-30 transition-opacity duration-700" />
                            <div className="relative aspect-video bg-white dark:bg-[#2C1A3F] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#9B59B6]/20 shadow-2xl transition-all duration-700">

                                {isVideoEnabled ? (
                                    <video
                                        ref={videoPreviewRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1A1625]">
                                        <div className="w-24 h-24 bg-[#9B59B6]/10 rounded-full flex items-center justify-center mb-4 border border-[#9B59B6]/10">
                                            <User size={48} className="text-[#9B59B6] opacity-40" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#5D4E6D] dark:text-[#BB8FCE]/40 items-center flex gap-2">
                                            <VideoOff size={14} /> Camera Disabled
                                        </p>
                                    </div>
                                )}

                                {/* Visual Overlays */}
                                <div className="absolute top-6 left-6 px-4 py-2 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-[#9B59B6]/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#2C1A3F] dark:text-white shadow-xl">
                                    <Camera size={14} className="text-[#9B59B6]" /> Tech Check
                                </div>

                                {/* Volume Bar */}
                                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-all shadow-lg ${micVolume > 5 ? 'bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20' : 'bg-black/20 text-white/40 border border-white/5'}`}>
                                                {isAudioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                                            </div>
                                            <span className="text-[9px] font-black tracking-widest text-white uppercase drop-shadow-md">Sensitivity Input</span>
                                        </div>
                                        <div className="px-2 py-0.5 rounded-lg bg-black/40 text-white/60 text-[8px] font-mono border border-white/10 uppercase">{micVolume}% Gain</div>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#27AE60] via-[#9B59B6] to-[#8E44AD] transition-all duration-75 shadow-[0_0_10px_rgba(155,89,182,0.5)]"
                                            style={{ width: `${isAudioEnabled ? micVolume : 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Settings Hover Controls */}
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <button
                                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                        className={`p-3 rounded-2xl backdrop-blur-xl transition-all active:scale-95 shadow-lg border ${isAudioEnabled
                                                ? 'bg-white/80 dark:bg-white/10 text-[#2C1A3F] dark:text-white border-white/20'
                                                : 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/20'
                                            }`}
                                    >
                                        {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                        className={`p-3 rounded-2xl backdrop-blur-xl transition-all active:scale-95 shadow-lg border ${isVideoEnabled
                                                ? 'bg-white/80 dark:bg-white/10 text-[#2C1A3F] dark:text-white border-white/20'
                                                : 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/20'
                                            }`}
                                    >
                                        {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Source Selector */}
                        <div className="p-8 bg-white dark:bg-[#2C1A3F] border border-gray-100 dark:border-[#9B59B6]/10 rounded-[2rem] shadow-xl space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5D4E6D] dark:text-[#BB8FCE]/60 flex items-center gap-3 mb-4">
                                    <Settings size={14} className="text-[#9B59B6]" /> Audio Hardware Selection
                                </h3>
                                <div className="relative">
                                    <select
                                        value={selectedMic}
                                        onChange={(e) => setSelectedMic(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#1A1625] border border-gray-100 dark:border-[#9B59B6]/20 rounded-2xl px-6 py-4 text-sm font-bold text-[#2C1A3F] dark:text-[#ECE8F5] focus:ring-2 focus:ring-[#9B59B6]/20 focus:border-[#9B59B6]/40 outline-none appearance-none cursor-pointer transition-all hover:border-[#9B59B6]/40"
                                    >
                                        {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5D4E6D] dark:text-[#BB8FCE]/40 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identity Section */}
                    <div className="space-y-12 lg:pl-10">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter text-[#2C1A3F] dark:text-white leading-[1.1]">
                                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9B59B6] to-[#8E44AD]">Secure Room</span>
                            </h2>
                            <p className="text-[#5D4E6D] dark:text-[#BB8FCE]/60 font-medium text-lg leading-relaxed max-w-sm">
                                Standalone high-quality session. Professional identity verified.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-[#E74C3C]/5 border border-[#E74C3C]/10 p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <AlertCircle className="text-[#E74C3C] flex-shrink-0 mt-1" size={18} />
                                <p className="text-[#E74C3C] text-sm font-bold leading-snug">{error}</p>
                            </div>
                        )}

                        <div className="space-y-8 max-w-sm">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9B59B6] uppercase tracking-[0.3em] flex items-center gap-2 pl-1">
                                    <User size={12} /> Your Display Identity
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Professional Name"
                                    className="w-full bg-white dark:bg-[#2C1A3F] border border-gray-100 dark:border-[#9B59B6]/20 rounded-3xl px-8 py-6 text-lg font-bold text-[#2C1A3F] dark:text-[#ECE8F5] placeholder-gray-300 dark:placeholder-white/5 focus:ring-4 focus:ring-[#9B59B6]/10 focus:border-[#9B59B6]/40 outline-none transition-all duration-500 shadow-xl shadow-gray-200/20 dark:shadow-none"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleStart}
                                    disabled={loading || !name.trim()}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 rounded-3xl py-6 transition-all duration-500 active:scale-95 shadow-2xl shadow-[#9B59B6]/30 flex items-center justify-center gap-3 border border-[#BB8FCE]/20"
                                >
                                    <span className="relative z-10 text-lg font-black uppercase tracking-[0.2em] text-white">
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : (paramSessionId ? 'Secure Handshake' : 'Initialize Session')}
                                    </span>
                                </button>
                                <div className="flex flex-col items-center mt-10 space-y-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#5D4E6D] dark:text-[#BB8FCE]/30">Nuralhealer Protocol v2.5.0</p>
                                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#9B59B6]/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <footer className="py-8 border-t border-[#9B59B6]/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">End-To-End Medical Encryption</p>
                    <div className="flex gap-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ShieldCheck size={12} /> Privacy Shield</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><Zap size={12} /> Precision Engine</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
