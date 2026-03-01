import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to analyze audio volume from a MediaStream.
 * Returns the current volume as a percentage (0-100).
 */
export default function useAudioAnalyzer(stream, isActive = true) {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const reqFrameRef = useRef(null);

    useEffect(() => {
        if (!stream || !isActive) {
            setVolume(0);
            return;
        }

        let isMounted = true;

        const startAnalyzing = async () => {
            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                }

                const ctx = audioContextRef.current;

                // Resume if suspended (browsers often suspend AudioContext until user interaction)
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateVolume = () => {
                    if (!isMounted || !analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    const avg = sum / dataArray.length;

                    // Map 0-255 broadly to 0-100% for the UI bar
                    // Using 128 as a typical mid-point for "loud" in this context
                    const volPercent = Math.min(100, Math.round((avg / 128) * 100));
                    setVolume(volPercent);

                    reqFrameRef.current = requestAnimationFrame(updateVolume);
                };

                updateVolume();

            } catch (err) {
                console.error("Failed to analyze audio:", err);
            }
        };

        startAnalyzing();

        return () => {
            isMounted = false;
            if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
            // We don't close the AudioContext here to allow reuse, 
            // but we stop the animation frame.
        };
    }, [stream, isActive]);

    return volume;
}
