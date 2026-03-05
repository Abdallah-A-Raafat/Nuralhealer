import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, User, Activity } from 'lucide-react';

/**
 * Luxury Participant Component.
 * High-end Wellness Aesthetic with 3D depth and refined status indicators.
 */
export default function Participant({ stream, name, isLocal, isMuted, isVideoOff, speakerDeviceId, speakerMuted = false }) {
    const videoRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioCtxRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Apply speaker mute state to the media element
    useEffect(() => {
        try {
            if (videoRef.current) {
                videoRef.current.muted = isLocal || !!speakerMuted;
            }
        } catch (e) {
            // ignore
        }
    }, [speakerMuted, isLocal]);

    // Set speaker output device on remote participants
    useEffect(() => {
        if (!isLocal && speakerDeviceId && videoRef.current && typeof videoRef.current.setSinkId === 'function') {
            videoRef.current.setSinkId(speakerDeviceId).catch(() => { /* setSinkId not supported */ });
        }
    }, [speakerDeviceId, isLocal]);

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

                setIsSpeaking(average > 18);
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
        <div className={`relative bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border transition-all duration-700 shadow-2xl flex items-center justify-center min-h-[300px] md:min-h-[400px] group ${isSpeaking
            ? 'border-primary shadow-[0_0_60px_rgba(155,89,182,0.15)] ring-1 ring-primary/20 scale-[1.01]'
            : 'border-transparent dark:border-white/10 ring-1 ring-black/[0.03] dark:ring-white/[0.05]'
            }`}>

            {/* Mesh Surface for Camera Off */}
            <div className={`absolute inset-0 z-0 bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-black/40 dark:via-black/20 dark:to-primary/10 transition-opacity duration-1000 ${isVideoOff ? 'opacity-100' : 'opacity-0'}`} />

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal || speakerMuted}
                className={`w-full h-full object-cover transition-all duration-1000 scale-[1.02] ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />

            {(isVideoOff || !stream) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className={`absolute -inset-8 bg-primary/10 rounded-full blur-2xl transition-all duration-1000 ${isSpeaking ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`} />
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-2xl border border-gray-50 dark:border-white/10 relative z-20 group-hover:scale-110 transition-transform duration-700">
                            {name ? (
                                <span className="text-4xl font-black text-primary/40 dark:text-primary/60 uppercase">
                                    {name.charAt(0)}
                                </span>
                            ) : (
                                <User size={40} className="text-primary/10" />
                            )}
                        </div>
                    </div>
                    <p className="mt-8 text-[11px] font-black text-primary/30 dark:text-primary/50 uppercase tracking-[0.4em] animate-pulse">{name || 'Establishing...'}</p>
                </div>
            )}

            {/* Luxury Identity Tag */}
            <div className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 z-30 transition-all duration-700 bg-white/60 dark:bg-white/10 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white dark:border-white/10 shadow-xl flex items-center gap-4 group-hover:px-8 ${isSpeaking ? 'bg-primary/10 dark:bg-primary/30 border-primary shadow-[0_0_30px_rgba(155,89,182,0.3)] scale-105' : ''}`}>
                <div className="flex items-center gap-3">
                    {/* Active Speaker Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 ${isSpeaking
                        ? 'bg-primary text-white border-primary animate-pulse'
                        : isMuted ? 'bg-error/5 border-error/10 text-error' : 'bg-primary/5 dark:bg-primary/20 border-primary/10 dark:border-primary/30 text-primary dark:text-primary-light'
                        }`}>
                        {isSpeaking ? <Activity size={16} /> : isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h4 className="text-[11px] font-black text-textPrimary dark:text-lightText uppercase tracking-widest leading-none">
                                {name} {isLocal && <span className="text-primary/60 dark:text-primary/40 ml-1.5 underline decoration-2 underline-offset-4">(Consultant)</span>}
                            </h4>
                            {isSpeaking && <span className="text-[14px] animate-bounce">🎙️</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                            <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-success animate-pulse' : 'bg-gray-300 dark:bg-white/20'}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary dark:text-lightText/60">
                                {isSpeaking ? 'Active Speaker' : isMuted ? 'Muted' : 'Listening'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signal Indicator */}
            {!isLocal && (
                <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30 flex flex-col items-end gap-2.5">
                    <div className={`p-2.5 backdrop-blur-xl rounded-xl border shadow-sm transition-all duration-500 ${isSpeaking ? 'bg-primary/20 border-primary/40 opacity-100' : 'bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/10 opacity-40 hover:opacity-100'}`}>
                        <Activity size={14} className={isSpeaking ? 'text-primary animate-pulse' : 'text-primary'} />
                    </div>
                </div>
            )}
        </div>
    );
}
