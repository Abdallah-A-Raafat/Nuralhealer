import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, User } from 'lucide-react';

/**
 * Individual Participant component aligned with Nuralhealer Brand.
 * Professional medical aesthetic (Purple/Gray).
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
        <div className={`relative bg-gray-50 dark:bg-[#1A1625] rounded-[2.5rem] overflow-hidden border-2 transition-all duration-700 shadow-2xl flex items-center justify-center min-h-[220px] ${isSpeaking
                ? 'border-[#9B59B6] ring-8 ring-[#9B59B6]/10 scale-[1.01]'
                : 'border-white dark:border-[#2C1A3F]'
            }`}>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover transition-all duration-1000 ${isVideoOff ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            />

            {(isVideoOff || !stream) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C1A3F]">
                    <div className="w-24 h-24 bg-[#9B59B6]/10 rounded-full flex items-center justify-center mb-4 border border-[#9B59B6]/10 shadow-inner relative group">
                        <div className="absolute inset-0 bg-[#9B59B6]/5 rounded-full blur-xl group-hover:bg-[#9B59B6]/20 transition-all duration-700" />
                        {name ? (
                            <span className="text-4xl font-black text-[#9B59B6]/60 uppercase tracking-tighter relative z-10 drop-shadow-md">
                                {name.charAt(0)}
                            </span>
                        ) : (
                            <User size={40} className="text-[#9B59B6]/30" />
                        )}
                    </div>
                    <p className="text-[#5D4E6D] dark:text-[#BB8FCE]/40 text-[9px] font-black uppercase tracking-[0.4em]">{name || 'Connecting...'}</p>
                </div>
            )}

            {/* NeuralHealer Participant Tag */}
            <div className={`absolute bottom-6 left-6 bg-white/80 dark:bg-black/60 backdrop-blur-2xl px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-[#9B59B6]/10 shadow-2xl transition-all duration-500 ${isSpeaking ? 'translate-y--2' : ''}`}>
                <div className="flex items-center gap-3">
                    {isSpeaking ? (
                        <div className="flex gap-1 items-end h-3.5 w-4 mb-0.5">
                            <div className="w-1 bg-[#9B59B6] animate-bounce h-1.5" style={{ animationDuration: '0.4s' }}></div>
                            <div className="w-1 bg-[#9B59B6] animate-bounce h-3" style={{ animationDuration: '0.3s' }}></div>
                            <div className="w-1 bg-[#9B59B6] animate-bounce h-2" style={{ animationDuration: '0.5s' }}></div>
                        </div>
                    ) : (
                        isMuted ? <MicOff size={14} className="text-[#E74C3C]" /> : <Mic size={14} className="text-[#9B59B6]" />
                    )}
                    <span className="text-[#2C1A3F] dark:text-white tracking-widest uppercase">
                        {name} {isLocal && <span className="text-[#9B59B6]/60 ml-1 font-black underline decoration-2 underline-offset-4">YOU</span>}
                    </span>
                </div>
            </div>

            {/* Corner Status */}
            {isMuted && !isSpeaking && (
                <div className="absolute top-6 right-6 p-2.5 bg-[#E74C3C]/10 backdrop-blur-md rounded-xl border border-[#E74C3C]/20 shadow-lg">
                    <MicOff size={12} className="text-[#E74C3C]" />
                </div>
            )}
        </div>
    );
}
