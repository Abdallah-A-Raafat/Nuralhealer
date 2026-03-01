import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic,
    Loader2,
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    Camera,
    Settings,
    ShieldCheck,
    Zap
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
    const videoPreviewRef = useRef(null);

    const micVolume = useAudioAnalyzer(previewStream, !inCall);

    // ── Initialization ────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            // 1. Fetch User
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

            // 2. Enumerate Mics & Tech Preview
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setPreviewStream(stream);
                if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices
                    .filter(d => d.kind === 'audioinput')
                    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
                setMics(audioInputs);
                if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);

            } catch (err) {
                console.error("Tech check failure:", err);
                setError("Camera and Microphone access are required to join this native high-fidelity session.");
            }
        };
        init();

        return () => {
            if (previewStream) previewStream.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                onLeave={handleLeave}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all active:scale-95 group">
                            <ArrowLeft size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                                Precision Live <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-xl text-xs border border-indigo-500/20 font-black uppercase tracking-widest">v2.0 Native</span>
                            </h1>
                            <p className="text-gray-500 text-sm font-medium">Standalone High-Fidelity WebRTC Hub</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[11px] font-black text-emerald-500/80 uppercase tracking-widest">
                            <ShieldCheck size={14} /> E2E Encrypted
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-indigo-400/80 uppercase tracking-widest">
                            <Zap size={14} /> Ultra Low Latency
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Preview Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-2xl group ring-4 ring-indigo-500/0 hover:ring-indigo-500/10 transition-all duration-700">
                            <video
                                ref={videoPreviewRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                            />

                            {/* Overlay elements */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                            <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                <Camera size={14} className="text-indigo-400" /> Live Preview
                            </div>

                            {/* Volume Visualizer */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-all ${micVolume > 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                                            <Mic size={16} />
                                        </div>
                                        <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Audio Level Analyzer</span>
                                    </div>
                                    <span className="text-[10px] font-black font-mono text-white/20">{micVolume}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 transition-all duration-75"
                                        style={{ width: `${micVolume}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 mb-2">
                                <Settings size={14} /> Technical Configuration
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block pl-1">Input Source</label>
                                    <select
                                        value={selectedMic}
                                        onChange={(e) => setSelectedMic(e.target.value)}
                                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/20 outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                                    >
                                        {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-[3.2rem] text-gray-600 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Join Form */}
                    <div className="lg:pt-12">
                        <div className="max-w-md mx-auto space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
                                    Ready to connect?
                                </h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Experience seamless real-time communication on our independent native infrastructure.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                    <p className="text-red-400 text-sm font-bold leading-snug">{error}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] pl-1">Display Identity</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your professional name"
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 text-lg font-bold placeholder-white/20 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 outline-none transition-all duration-500"
                                    />
                                    {currentUser && (
                                        <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest pl-2">Authenticated Professional Profile Detected</p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleStart}
                                        disabled={loading || !name.trim()}
                                        className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl py-6 transition-all duration-500 active:scale-95 shadow-2xl shadow-indigo-600/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="relative z-10 text-lg font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-white">
                                            {loading ? <Loader2 className="animate-spin" size={24} /> : (paramSessionId ? 'Securely Join Session' : 'Initialize New Session')}
                                        </span>
                                    </button>
                                    <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mt-8">
                                        Privacy Focused · Zero Data Retention · Secure Tunnel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
