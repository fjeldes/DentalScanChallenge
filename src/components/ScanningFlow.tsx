"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera } from "lucide-react";
import { playSynthBeep } from "@/lib/audio";
import ScanCompleteView from "./ScanCompleteView";
import Badge from "./Badge";


export default function ScanningFlow() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [camReady, setCamReady] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [faceOffset, setFaceOffset] = useState({ x: 0.5, y: 0.5 });
  const [stability, setStability] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(false);

  const [countdown, setCountdown] = useState<number | null>(null);

  const VIEWS = [
    { label: "Front", instruction: "Look straight" },
    { label: "Left", instruction: "Turn left" },
    { label: "Right", instruction: "Turn right" },
    { label: "Up", instruction: "Tilt up & open" },
    { label: "Down", instruction: "Tilt down & open" },
  ];

  const isComplete = currentStep >= VIEWS.length;

  // Estado para pausar la simulación temporalmente entre fotos
  const [isPaused, setIsPaused] = useState(false);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // 🎥 Camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        setCamReady(true);
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    }
    startCamera();
  }, []);

  // Attach stream to video tag whenever the view changes (e.g. on Restart Scan)
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, isComplete]);

  // 🧠 Simulación inteligente (no random bruto)
  useEffect(() => {
    if (!camReady || isComplete || isPaused) return;

    const interval = setInterval(() => {
      // Usamos una simulación menos estricta para facilitar las pruebas
      // y la hacemos un poco más lenta
      setFaceOffset(prev => ({
        x: prev.x * 0.6 + (Math.random() - 0.5) * 0.4,
        y: prev.y * 0.6 + (Math.random() - 0.5) * 0.4,
      }));

      // Simulate getting stable
      setStability(prev => Math.min(1, prev * 0.5 + Math.random() * 0.5));

      // Simulate mouth opening (higher probability to quickly test)
      setMouthOpen(Math.random() > 0.4);
    }, 800);

    return () => clearInterval(interval);
  }, [camReady, isComplete, isPaused]);

  // 🎯 Heurísticas (relajadas para probar fácilmente)
  const isAligned = Math.abs(faceOffset.x) < 0.35 && Math.abs(faceOffset.y) < 0.35;
  const isStable = stability > 0.5;
  const isMouthReady = currentStep >= 3 ? mouthOpen : true;

  const isReady = !isComplete && !isPaused && isAligned && isStable && isMouthReady;

  // 🎨 Color estado
  const getColor = () => {
    if (isPaused) return "#3b82f6"; // blue when paused/transitioning
    if (isReady) return "#22c55e"; // green
    if (isAligned) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  // 🔊 Sonidos por paso
  useEffect(() => {
    if (!camReady || isComplete) return;
    const audio = new Audio("/beep.mp3");
    audio.play().catch(() => { });
  }, [currentStep, camReady, isComplete]);

  // ⏱ Auto capture con countdown
  useEffect(() => {
    if (!isReady || isComplete || isPaused) {
      setCountdown(null);
      return;
    }

    if (countdown === null) {
      setCountdown(3);
      return;
    }

    if (countdown > 0) {
      // Emitir tono de contador 3.. 2.. 1..
      playSynthBeep(440, 0.2);
        
      const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
      return () => clearTimeout(t);
    }

    handleCapture();
  }, [isReady, countdown, isComplete, isPaused]);

  // 📸 Capture
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || isComplete) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Emitir tono más agudo indicando la captura exitosa
      playSynthBeep(880, 0.4, 0.2);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImages(prev => [...prev, canvas.toDataURL("image/jpeg")]);
      setCurrentStep(prev => prev + 1);
      setCountdown(null);

      // Reset state for next capture so it doesn't immediately capture
      setFaceOffset({ x: 0.8, y: 0.8 });
      setStability(0);
      setMouthOpen(false);
      
      // Pause detection to give user time to read next instruction
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 2500);
    }
  }, [isComplete]);

  const handleRestart = () => {
    setCapturedImages([]);
    setCurrentStep(0);
    setFaceOffset({ x: 0.5, y: 0.5 });
  };

  // 📊 Progress %
  const progress = isComplete ? 100 : (capturedImages.length / VIEWS.length) * 100;

  return (
    <div className="flex flex-col items-center bg-black min-h-screen text-white">
      {/* Header */}
      <div className="w-full p-4 bg-zinc-900 flex justify-between items-center z-10 box-border">
        <span className="font-semibold text-lg">DentalScan AI</span>
        {!isComplete && (
          <span className="text-sm font-medium bg-zinc-800 px-3 py-1 rounded-full">
            Step {currentStep + 1} of {VIEWS.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-800 flex-shrink-0">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isComplete ? (
        <ScanCompleteView onRestart={handleRestart} />
      ) : (
        <>
          {/* Instruction overlay */}
          <div className="w-full max-w-md mt-6 mb-4 text-center px-4 flex flex-col items-center flex-shrink-0">
            <h2 className="text-2xl font-bold bg-zinc-800/80 backdrop-blur-sm inline-block px-6 py-3 rounded-2xl border border-zinc-700 shadow-xl">
              {VIEWS[currentStep].instruction}
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              View {currentStep + 1}: {VIEWS[currentStep].label}
            </p>
          </div>

          {/* Camera Container */}
          <div className="relative w-full max-w-md aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex-shrink-0 mx-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1] absolute inset-0"
            />

            {/* Guidance Outline */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
              <div
                className="w-full max-w-[280px] aspect-[3/4] rounded-[50px] border-4 transition-all duration-300"
                style={{
                  borderColor: getColor(),
                  boxShadow: isReady ? "0 0 30px rgba(34,197,94,0.4) inset, 0 0 30px rgba(34,197,94,0.4)" : "none",
                }}
              />
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
                <div className="text-8xl font-black text-white drop-shadow-2xl animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Feedback Text */}
            <div className="absolute bottom-8 w-full text-center px-4">
              <span className="text-sm font-medium bg-black/70 backdrop-blur-md px-4 py-2 rounded-full inline-block">
                {!isAligned
                  ? "Center your face in the oval"
                  : !isStable
                    ? "Hold still..."
                    : currentStep >= 3 && !mouthOpen
                      ? "Now open your mouth!"
                      : "Perfect! Holding..."}
              </span>
            </div>

            {/* Manual Capture Button (For testing) */}
            <button
              onClick={handleCapture}
              className="absolute bottom-4 right-4 bg-zinc-800/80 hover:bg-zinc-700 text-white p-3 rounded-full backdrop-blur-sm border border-zinc-600 transition-colors z-10"
              title="Force Capture"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge active={isAligned} label="Aligned" />
              <Badge active={mouthOpen} label="Mouth Open" />
            </div>
          </div>
        </>
      )}

      {/* Thumbnails */}
      <div className="w-full max-w-md mt-auto mb-8 px-4 flex justify-between gap-2 pt-8 flex-shrink-0">
        {VIEWS.map((view, i) => (
          <div
            key={i}
            className={`flex-1 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${i === currentStep ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transform -translate-y-1" :
                capturedImages[i] ? "border-green-500/50" : "border-zinc-800 bg-zinc-900"
              }`}
          >
            {capturedImages[i] ? (
              <img src={capturedImages[i]} className="w-full h-full object-cover" alt={view.label} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-1">
                <span className="text-[10px] uppercase font-bold text-center leading-tight">
                  {view.label}
                </span>
                {i >= 3 && (
                  <span className="text-[8px] mt-1 text-zinc-600 font-bold block">
                    (OPEN)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}