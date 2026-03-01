import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * Individual Participant component that handles its own video rendering 
 * and optional audio activity visualization.
 * Shared between Native WebRTC and other potential custom implementations.
 */
export default function Participant({ stream, name, isLocal, isMuted, isVideoOff }) {
    const videoRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioCtxRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Voice activity detection
    useEffect(() => {
        if (!stream || (isLocal && isMuted)) {
            setIsSpeaking(false);
            return;
        }

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;

        let isMounted = true;
        let animationFrame;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);

            const dataArray = new Uint8Array(analyzer.frequencyBinCount);

            const checkVolume = () => {
                if (!isMounted) return;
                analyzer.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;

                // Threshold for "speaking"
                setIsSpeaking(average > 15);
                animationFrame = requestAnimationFrame(checkVolume);
            };

            checkVolume();
        } catch (e) {
            console.error("Audio indicator error:", e);
        }

        return () => {
            isMounted = false;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(() => { });
            }
        };
    }, [stream, isLocal, isMuted]);

    return (
        <div className={`relative bg-gray-900 rounded-3xl overflow-hidden border-2 transition-all duration-500 shadow-2xl flex items-center justify-center min-h-[220px] ${isSpeaking ? 'border-emerald-500 ring-8 ring-emerald-500/10 scale-[1.02]' : 'border-white/5'
            }`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover transition-all duration-700 ${isVideoOff ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            />

            {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950/30 backdrop-blur-3xl">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-2xl backdrop-blur-md relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-all duration-500" />
                        <span className="text-4xl font-black text-white uppercase tracking-tighter relative z-10 drop-shadow-lg">
                            {name.charAt(0)}
                        </span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">{name}</p>
                </div>
            )}

            {/* Premium Participant Tag */}
            <div className={`absolute bottom-4 left-4 bg-gray-950/40 backdrop-blur-2xl px-4 py-2 rounded-2xl text-[11px] font-bold flex items-center gap-3 border border-white/10 shadow-2xl transition-all duration-300 ${isSpeaking ? 'translate-y--1' : ''}`}>
                <div className="flex items-center gap-2">
                    {isSpeaking ? (
                        <div className="flex gap-1 items-end h-4 w-5">
                            <div className="w-1 bg-emerald-400 animate-bounce h-1.5" style={{ animationDuration: '0.5s' }}></div>
                            <div className="w-1 bg-emerald-400 animate-bounce h-3.5" style={{ animationDuration: '0.4s' }}></div>
                            <div className="w-1 bg-emerald-400 animate-bounce h-2.5" style={{ animationDuration: '0.6s' }}></div>
                        </div>
                    ) : (
                        isMuted ? <MicOff size={14} className="text-red-500/80" /> : <Mic size={14} className="text-white/40" />
                    )}
                    <span className="text-white/90 tracking-tight">{name} {isLocal && <span className="text-indigo-400/80 ml-1 font-black opacity-60">YOU</span>}</span>
                </div>
            </div>

            {/* Status Overlays */}
            {isMuted && !isSpeaking && (
                <div className="absolute top-4 right-4 p-2 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-500/20">
                    <MicOff size={12} className="text-red-400" />
                </div>
            )}
        </div>
    );
}
