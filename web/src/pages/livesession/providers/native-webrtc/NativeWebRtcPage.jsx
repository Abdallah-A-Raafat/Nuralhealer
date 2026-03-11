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
    User,
    Heart,
    Activity,
    Maximize2,
    Smartphone
} from 'lucide-react';
import liveSessionService from '../../liveSessionService';
import userService from '../../../../services/userService';
import Button from '../../../../components/common/Button';
import NativeWebRtcSession from './NativeWebRtcSession';
import WaitingRoom from './WaitingRoom';
import useAudioAnalyzer from '../shared-webrtc/useAudioAnalyzer';

/**
 * V2 Luxury Wellness Consultation Lobby.
 * Optimized for Perfect Responsiveness and Premium Aesthetics.
 */
export default function NativeWebRtcPage() {
    const { sessionId: paramSessionId } = useParams();
    const navigate = useNavigate();

    // ── States ──────────────────────────────────────────────────────────────
    const [inCall, setInCall] = useState(false);
    const [inWaitingRoom, setInWaitingRoom] = useState(false);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lobby States
    const [name, setName] = useState('');
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
                // Try to get a stream just to trigger the permission prompt
                // but don't fail the whole page if it's denied
                const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                    .catch(() => navigator.mediaDevices.getUserMedia({ audio: true }))
                    .catch(() => null);

                if (initialStream) initialStream.getTracks().forEach(t => t.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
                setMics(audioInputs);
                if (audioInputs.length > 0 && !selectedMic) setSelectedMic(audioInputs[0].deviceId);

            } catch (err) {
                console.warn("Device enumeration failed:", err);
            }
        };
        getDevices();
    }, [selectedMic]);

    // Update Preview Stream
    useEffect(() => {
        if (inCall || inWaitingRoom) return;

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
    }, [selectedMic, inCall, inWaitingRoom]);

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

            // Fully release preview camera hardware before transitioning
            if (previewStream) {
                previewStream.getTracks().forEach(t => t.stop());
            }
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = null;
            }
            setPreviewStream(null);
            // Wait for hardware to release before the session component grabs it
            await new Promise(r => setTimeout(r, 500));

            // If joining by link:
            // - session creator should enter call directly
            // - other participants should wait for host approval
            if (paramSessionId) {
                const currentName = (name || '').trim().toLowerCase();
                const creatorName = (data?.createdBy || '').trim().toLowerCase();
                const isCreator = currentName.length > 0 && creatorName.length > 0 && currentName === creatorName;

                if (isCreator) {
                    setInCall(true);
                } else {
                    setInWaitingRoom(true);
                }
            } else {
                // Always put the session ID in the URL so the share link is valid,
                // refreshing the page works, and routing is always consistent.
                navigate(`/live-session/native/${data.sessionId}`, { replace: true });
                setInCall(true);
            }
        } catch (e) {
            setError(e.response?.data?.error || 'Connection failed. Please check your network.');
        } finally { setLoading(false); }
    };

    const handleLeave = () => {
        setInCall(false);
        navigate('/');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (inWaitingRoom && session) {
        return (
            <WaitingRoom
                session={session}
                displayName={name.trim()}
                onApproved={() => { setInWaitingRoom(false); setInCall(true); }}
                onCancel={() => { setInWaitingRoom(false); navigate('/'); }}
            />
        );
    }

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
        <div className="min-h-screen bg-background dark:bg-backgroundDark text-textPrimary dark:text-lightText font-sans selection:bg-primary selection:text-white overflow-x-hidden relative flex flex-col transition-colors duration-500">

            {/* Premium Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden scale-110 opacity-70 dark:opacity-40">
                <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-secondary/5 via-primary/5 to-transparent rounded-full blur-[100px] animate-pulse duration-[8s]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* Header Overlay */}
            <header className="relative z-50 w-full px-6 py-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-500 group active:scale-95"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform dark:text-lightText" />
                    </button>
                    <div className="hidden md:block">
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">Nuralhealer</h1>
                        <p className="text-[10px] font-bold text-textSecondary dark:text-lightText/60 uppercase tracking-widest">Wellness Platform</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-8 px-5 py-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-full shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-success uppercase tracking-widest">
                        <ShieldCheck size={14} /> <span className="hidden sm:inline">End-to-End</span> Secure
                    </div>
                    <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-widest">
                        <Activity size={14} /> HD Quality
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:py-16 relative z-10 flex flex-col lg:flex-row items-center justify-center lg:gap-20">

                {/* Left Section: Luxury Preview Area */}
                <div className="w-full lg:w-3/5 space-y-10 order-2 lg:order-1 mt-12 lg:mt-0">
                    <div className="relative group">
                        {/* Decorative Elements */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative aspect-[4/3] md:aspect-video bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-white dark:border-white/10 shadow-2xl transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(155,89,182,0.15)] ring-1 ring-black/[0.03] dark:ring-white/[0.05]">

                            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>

                            {isVideoEnabled ? (
                                <video
                                    ref={videoPreviewRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-[1.01]"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F9FF] dark:bg-black/20">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl border border-primary/5 relative">
                                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20" />
                                        <User size={60} className="text-primary/20" />
                                    </div>
                                    <p className="text-[11px] font-black text-primary/40 dark:text-primary/60 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <VideoOff size={16} /> Privacy Mode Active
                                    </p>
                                </div>
                            )}

                            {/* Meta Labels */}
                            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10 flex items-center gap-3">
                                <div className="px-4 py-2 bg-black/30 dark:bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 flex items-center gap-2.5 text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    Client Ready
                                </div>
                            </div>

                            {/* Glass Controls Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-10 space-y-6">
                                <div className="flex items-end justify-between">
                                    <div className="flex-1 max-w-[180px] md:max-w-xs space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
                                                <Activity size={12} className="text-primary" /> Audio Precision
                                            </span>
                                            <span className="text-[10px] font-mono text-white/70 drop-shadow-md">{micVolume}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden backdrop-blur-md border border-white/10 dark:border-white/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-100 shadow-[0_0_15px_rgba(155,89,182,0.6)]"
                                                style={{ width: `${isAudioEnabled ? micVolume : 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4">
                                        <button
                                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl backdrop-blur-2xl transition-all duration-500 active:scale-90 flex items-center justify-center border shadow-2xl ${isAudioEnabled
                                                ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                : 'bg-error text-white border-error/50 hover:bg-error/80'
                                                }`}
                                        >
                                            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                        </button>
                                        <button
                                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl backdrop-blur-2xl transition-all duration-500 active:scale-90 flex items-center justify-center border shadow-2xl ${isVideoEnabled
                                                ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                : 'bg-error text-white border-error/50 hover:bg-error/80'
                                                }`}
                                        >
                                            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Settings Bar - Luxury Horizontal */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 p-6 md:p-8 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2.5rem] shadow-xl ring-1 ring-black/[0.02] dark:ring-white/[0.05]">
                        <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10 pb-4 md:pb-0 md:pr-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                <Settings size={22} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Hardware</h3>
                                <p className="text-[11px] font-bold text-textSecondary dark:text-lightText/60 uppercase tracking-widest whitespace-nowrap">Source Selection</p>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <select
                                value={selectedMic}
                                onChange={(e) => setSelectedMic(e.target.value)}
                                className="w-full bg-white/60 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-textPrimary dark:text-lightText focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none appearance-none cursor-pointer transition-all pr-12 shadow-inner"
                            >
                                {mics.map(m => <option key={m.deviceId} value={m.deviceId} className="dark:bg-backgroundDark">{m.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Right Section: Hero Form & Headlines */}
                <div className="w-full lg:w-2/5 space-y-12 order-1 lg:order-2 text-center lg:text-left">

                    <div className="space-y-6 lg:space-y-8">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.3em] shadow-sm animate-bounce duration-[3s]">
                            <Heart size={14} fill="currentColor" /> Premium Wellness Path
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-textPrimary dark:text-lightText tracking-tight leading-[1.1]">
                            Your Health, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary animate-gradient-x">Perfectly Connected.</span>
                        </h2>

                        <p className="text-sm md:text-base font-bold text-textSecondary/80 dark:text-lightText/60 leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                            Join your secure consultation with state-of-the-art WebRTC technology.
                            Experience high-fidelity audio and video designed for professional medical care.
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-8 ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
                        {error && (
                            <div className="bg-error/5 border border-error/10 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <AlertCircle className="text-error shrink-0" size={20} />
                                <p className="text-error text-xs font-black leading-snug text-left">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4 text-left">
                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Identity Confirmation</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center text-primary/30 group-focus-within:text-primary transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="What is your full name?"
                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-base font-black text-textPrimary dark:text-lightText placeholder-gray-300 dark:placeholder-gray-600 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all duration-500 shadow-inner group-hover:bg-white dark:group-hover:bg-white/10"
                                />
                            </div>
                        </div>

                        {/* Silent Mode Toggle */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-textPrimary dark:text-lightText uppercase tracking-widest">Listen Only Mode</span>
                                <span className="text-[9px] font-bold text-textSecondary dark:text-lightText/40 uppercase tracking-widest leading-none mt-1">Join as a silent participant</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAudioEnabled(prev => !prev);
                                    setIsVideoEnabled(false);
                                }}
                                className={`w-14 h-8 rounded-full relative transition-all duration-500 ${!isAudioEnabled && !isVideoEnabled ? 'bg-primary shadow-[0_0_20px_rgba(155,89,182,0.4)]' : 'bg-gray-200 dark:bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500 ${!isAudioEnabled && !isVideoEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleStart}
                                disabled={loading || !name.trim()}
                                className="w-full py-7 rounded-[2rem] shadow-2xl shadow-primary/20 text-base font-black uppercase tracking-[0.2em] group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {loading ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <Loader2 className="animate-spin" size={24} />
                                        <span className="animate-pulse">Connecting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-4">
                                        <span>{paramSessionId ? 'Enter Hub' : 'Launch Session'}</span>
                                        <Maximize2 size={20} className="group-hover:scale-125 transition-transform" />
                                    </div>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-6 opacity-60">
                                <div className="flex items-center gap-2 text-[9px] font-black text-textSecondary dark:text-lightText/60 uppercase tracking-widest">
                                    <Smartphone size={12} /> Mobile Optimized
                                </div>
                                <div className="w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full" />
                                <div className="flex items-center gap-2 text-[9px] font-black text-textSecondary dark:text-lightText/60 uppercase tracking-widest">
                                    <ShieldCheck size={12} /> Private E2EE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Luxury Footer */}
            <footer className="w-full py-10 px-6 bg-white/30 dark:bg-black/20 backdrop-blur-xl border-t border-white/60 dark:border-white/10 relative z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-primary text-white font-black rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">NH</div>
                        <div>
                            <p className="text-[10px] font-black text-textPrimary dark:text-lightText uppercase tracking-[0.25em]">Nuralhealer Telehealth</p>
                            <p className="text-[9px] font-bold text-textSecondary dark:text-lightText/40 uppercase tracking-widest">Professional Consultation Hub</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                        {[
                            { icon: <ShieldCheck size={16} />, label: "Privacy Shield" },
                            { icon: <Activity size={16} />, label: "Live Diagnostics" },
                            { icon: <Maximize2 size={16} />, label: "Full Mesh P2P" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-[10px] font-black text-textSecondary dark:text-lightText/60 uppercase tracking-widest group cursor-default">
                                <span className="text-primary/40 group-hover:scale-125 transition-transform">{item.icon}</span>
                                <span className="group-hover:text-primary transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 89, 182, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 89, 182, 0.4); }
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        .animate-gradient-x { animation: gradient-x 8s ease infinite; }
      `}} />
        </div>
    );
}
