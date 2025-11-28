import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { isFiveFingerPinch } from '../utils/geometry';
import { GestureMode, Direction, AppState } from '../types';
import { Loader2, CameraOff, Activity, ArrowLeft, ArrowRight, MousePointer2, ScanLine } from 'lucide-react';

const PINCH_HOLD_DURATION_MS = 1500;
const TRACKING_GRACE_PERIOD_MS = 500; 

// Detection Config
const MOVEMENT_THRESHOLD = 0.015; 
const RESET_THRESHOLD = 0.003;    
const SWIPE_DURATION_MS = 500;    
const DOUBLE_PINCH_TIMING_MS = 500; 
const PINCH_DEBOUNCE_MS = 100;      

type SwipeState = 'IDLE' | 'FIRING' | 'WAITING_FOR_RESET';

interface HandGestureRecognizerProps {
  onGesture?: (direction: Direction) => void;
  className?: string;
}

export const HandGestureRecognizer: React.FC<HandGestureRecognizerProps> = ({ onGesture, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // State for logic
  const lastVideoTime = useRef<number>(-1);
  const pinchStartTime = useRef<number | null>(null);
  const previousX = useRef<number | null>(null);
  
  // Grace Period & Loop Logic
  const lastHandDetectedTimeRef = useRef<number>(0);
  const modeRef = useRef<GestureMode>(GestureMode.IDLE);
  
  // Double Pinch Logic
  const wasPinchingRef = useRef<boolean>(false);
  const lastPinchStartRef = useRef<number>(0);
  
  // New Swipe State Machine Refs
  const swipeStateRef = useRef<SwipeState>('IDLE');
  const swipeDirectionRef = useRef<Direction>(Direction.NONE);
  const swipeEndTimeRef = useRef<number>(0);

  // Event Emission limiting
  const lastEmittedGestureTime = useRef<number>(0);
  
  // App State
  const [state, setState] = useState<AppState>({
    isModelLoading: true,
    cameraPermission: false,
    mode: GestureMode.IDLE,
    pinchProgress: 0,
    direction: Direction.NONE,
    errorMessage: undefined,
  });

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        setState(prev => ({ ...prev, isModelLoading: false }));
        startCamera();
      } catch (error) {
        console.error(error);
        setState(prev => ({ ...prev, isModelLoading: false, errorMessage: "Failed to load MediaPipe model." }));
      }
    };

    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarkerRef.current) handLandmarkerRef.current.close();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 360,
          facingMode: "user"
        }
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', () => {
        setState(prev => ({ ...prev, cameraPermission: true }));
        predictWebcam();
      });
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, errorMessage: "Camera permission denied." }));
    }
  };

  const emitGesture = (direction: Direction) => {
    const now = Date.now();
    // Prevent duplicate emits for the same event instance
    if (now - lastEmittedGestureTime.current > 500) {
        lastEmittedGestureTime.current = now;
        if (onGesture) {
            onGesture(direction);
        }
    }
  };

  const predictWebcam = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (video.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = video.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(video, performance.now());

      // Prepare Canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(-1, 1); // Mirror for drawing
      ctx.translate(-canvas.width, 0);

      // Current Loop State
      const now = Date.now();
      let handsDetected = false;
      let landmarks: any = null;

      if (results.landmarks && results.landmarks.length > 0) {
        handsDetected = true;
        landmarks = results.landmarks[0];
        lastHandDetectedTimeRef.current = now;
      }

      const isWithinGracePeriod = (now - lastHandDetectedTimeRef.current) < TRACKING_GRACE_PERIOD_MS;
      
      let currentMode = modeRef.current;
      let currentProgress = 0;
      let displayDirection = Direction.NONE;

      // Handle Event Override (like Double Pinch)
      if (swipeStateRef.current === 'FIRING' && swipeDirectionRef.current === Direction.DOUBLE_PINCH) {
         if (now < swipeEndTimeRef.current) {
             displayDirection = Direction.DOUBLE_PINCH;
         } else {
             swipeStateRef.current = 'IDLE';
             swipeDirectionRef.current = Direction.NONE;
         }
      }

      if (handsDetected) {
        const isPinching = isFiveFingerPinch(landmarks);
        
        // --- DOUBLE PINCH DETECTION ---
        if (isPinching && !wasPinchingRef.current) {
             const timeSinceLastPinch = now - lastPinchStartRef.current;
             
             if (timeSinceLastPinch < DOUBLE_PINCH_TIMING_MS && timeSinceLastPinch > PINCH_DEBOUNCE_MS) {
                 swipeStateRef.current = 'FIRING';
                 swipeDirectionRef.current = Direction.DOUBLE_PINCH;
                 swipeEndTimeRef.current = now + 1000; 
                 displayDirection = Direction.DOUBLE_PINCH;
                 
                 emitGesture(Direction.DOUBLE_PINCH);
                 
                 lastPinchStartRef.current = 0; 
             } else {
                 lastPinchStartRef.current = now;
             }
        }
        wasPinchingRef.current = isPinching;

        const isEventActive = displayDirection === Direction.DOUBLE_PINCH;

        // --- STATE MACHINE: MODE SWITCHING ---
        if (currentMode !== GestureMode.ACTIVE) {
          // ACTIVATION PHASE
          if (isPinching) {
            if (pinchStartTime.current === null) {
              pinchStartTime.current = now;
            }
            
            const elapsed = now - pinchStartTime.current;
            currentProgress = Math.min((elapsed / PINCH_HOLD_DURATION_MS) * 100, 100);

            if (elapsed > PINCH_HOLD_DURATION_MS) {
              currentMode = GestureMode.ACTIVE;
              currentProgress = 100;
              previousX.current = landmarks[0].x;
              swipeStateRef.current = 'IDLE';
              swipeDirectionRef.current = Direction.NONE;
            } else {
              currentMode = GestureMode.PINCHING;
            }
          } else {
            pinchStartTime.current = null;
            currentMode = GestureMode.IDLE;
            currentProgress = 0;
          }
        } else {
          // ACTIVE PHASE
          currentProgress = 100;

          if (!isPinching) {
            const currentX = landmarks[0].x; 
            
            if (previousX.current !== null && !isEventActive) {
              const delta = currentX - previousX.current;
              const absDelta = Math.abs(delta);
              
              // --- SWIPE LOGIC STATE MACHINE ---
              switch (swipeStateRef.current) {
                case 'IDLE':
                  if (absDelta > MOVEMENT_THRESHOLD) {
                    const direction = delta > 0 ? Direction.LEFT : Direction.RIGHT;
                    
                    swipeStateRef.current = 'FIRING';
                    swipeDirectionRef.current = direction;
                    swipeEndTimeRef.current = now + SWIPE_DURATION_MS;
                    displayDirection = direction;
                    
                    emitGesture(direction);
                  }
                  break;

                case 'FIRING':
                  displayDirection = swipeDirectionRef.current;
                  if (now > swipeEndTimeRef.current) {
                    swipeStateRef.current = 'WAITING_FOR_RESET';
                  }
                  break;

                case 'WAITING_FOR_RESET':
                  displayDirection = Direction.STATIONARY;
                  if (absDelta < RESET_THRESHOLD) {
                    swipeStateRef.current = 'IDLE';
                    swipeDirectionRef.current = Direction.NONE;
                  }
                  break;
              }
            }
            previousX.current = currentX;
          } else {
            // Paused while pinching
            if (!isEventActive) {
                displayDirection = Direction.STATIONARY;
                swipeStateRef.current = 'IDLE'; 
            }
            previousX.current = landmarks[0].x;
          }
        }

        drawConnectors(ctx, landmarks, currentMode, isPinching);

      } else {
        // NO HANDS
        wasPinchingRef.current = false; 

        if (isWithinGracePeriod) {
          if (currentMode === GestureMode.PINCHING && pinchStartTime.current) {
             const elapsed = now - pinchStartTime.current;
             currentProgress = Math.min((elapsed / PINCH_HOLD_DURATION_MS) * 100, 100);
             if (elapsed > PINCH_HOLD_DURATION_MS) {
                currentMode = GestureMode.ACTIVE;
                currentProgress = 100;
             }
          } else if (currentMode === GestureMode.ACTIVE) {
             currentProgress = 100;
          }
          if (swipeStateRef.current === 'FIRING' && swipeDirectionRef.current === Direction.DOUBLE_PINCH) {
              if (now < swipeEndTimeRef.current) displayDirection = Direction.DOUBLE_PINCH;
          }
        } else {
           pinchStartTime.current = null;
           currentMode = GestureMode.IDLE;
           currentProgress = 0;
           previousX.current = null;
           swipeStateRef.current = 'IDLE';
           swipeDirectionRef.current = Direction.NONE;
        }
      }

      ctx.restore();

      modeRef.current = currentMode;
      setState(prev => ({
        ...prev,
        mode: currentMode,
        pinchProgress: currentProgress,
        direction: displayDirection,
      }));
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [onGesture]); 

  const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[], currentMode: GestureMode, isPinching: boolean) => {
    const connections = [
      [0,1], [1,2], [2,3], [3,4], 
      [0,5], [5,6], [6,7], [7,8], 
      [0,9], [9,10], [10,11], [11,12], 
      [0,13], [13,14], [14,15], [15,16], 
      [0,17], [17,18], [18,19], [19,20], 
      [5,9], [9,13], [13,17] 
    ];

    ctx.lineWidth = 3;
    let color = '#3f3f46'; // Zinc-700ish
    if (currentMode === GestureMode.ACTIVE) {
        // Blue-500 (3b82f6) for active, Yellow-500 (eab308) for pinch
        color = isPinching ? '#eab308' : '#3b82f6';
    } else if (currentMode === GestureMode.PINCHING) {
        color = '#eab308';
    }

    ctx.strokeStyle = color;
    
    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = currentMode === GestureMode.ACTIVE && !isPinching ? '#3b82f6' : '#ffffff';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  return (
    <div className={`relative bg-black overflow-hidden group ${className}`}>
      
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-80 scale-x-[-1]"
        autoPlay
        playsInline
        muted
      />

      {/* Enhanced Scanning Line Animation - Blue */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-[15%] w-full z-10 animate-scan blur-sm" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30">
        
        {/* Status Bar */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 shadow-lg group-hover:border-blue-500/30 transition-colors">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${state.isModelLoading ? 'bg-yellow-500 text-yellow-500 animate-pulse' : 'bg-blue-500 text-blue-500'}`} />
            <span className="text-[10px] font-mono text-white/90 tracking-wider">
              {state.isModelLoading ? 'SYSTEM_INIT...' : 'NEURAL_LINK: ONLINE'}
            </span>
          </div>
          
          {state.mode === GestureMode.ACTIVE && (
             <div className="bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-500/50 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)]">
               <Activity className="w-3 h-3 text-blue-400" />
               <span className="text-blue-400 font-bold text-[10px] tracking-widest">LOCKED</span>
             </div>
          )}
        </div>

        {/* Center UI */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          {state.isModelLoading && (
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
              </div>
          )}
          
          {state.errorMessage && (
             <CameraOff className="w-8 h-8 text-red-500" />
          )}

          {/* Directional & Gesture Indicators */}
          {(state.mode === GestureMode.ACTIVE || state.direction === Direction.DOUBLE_PINCH) && (
            <div className="flex items-center gap-24">
               <div className={`transition-all duration-300 transform ${state.direction === Direction.LEFT ? 'opacity-100 scale-125 translate-x-[-20px]' : 'opacity-10 scale-90 blur-sm'}`}>
                 <ArrowLeft className="w-20 h-20 text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.8)]" />
                 <div className="text-[10px] text-blue-500 text-center font-mono mt-2 tracking-widest">NAV_PREV</div>
               </div>
               
               {/* Double Pinch Indicator - Keeping Purple/White/Blue accent */}
               <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${state.direction === Direction.DOUBLE_PINCH ? 'opacity-100 scale-110' : 'opacity-0 scale-0'}`}>
                 <div className="flex flex-col items-center justify-center bg-white/10 p-6 rounded-full border border-white/50 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                    <MousePointer2 className="w-16 h-16 text-white fill-white/20 rotate-12" />
                 </div>
                 <div className="text-[10px] text-blue-200 text-center font-mono mt-4 tracking-[0.2em] bg-black/80 px-3 py-1 rounded border border-blue-500/30">EXECUTE</div>
               </div>

               <div className={`transition-all duration-300 transform ${state.direction === Direction.RIGHT ? 'opacity-100 scale-125 translate-x-[20px]' : 'opacity-10 scale-90 blur-sm'}`}>
                 <ArrowRight className="w-20 h-20 text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.8)]" />
                 <div className="text-[10px] text-blue-500 text-center font-mono mt-2 tracking-widest">NAV_NEXT</div>
               </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-2 w-full">
            {/* Progress Bar with Glitch Effect */}
            <div className="relative h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-200 ease-out shadow-[0_0_15px_currentColor] ${state.mode === GestureMode.ACTIVE ? 'bg-blue-500 text-blue-500' : 'bg-amber-400 text-amber-400'}`}
                  style={{ width: `${state.pinchProgress}%` }}
                />
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono uppercase tracking-wider bg-black/80 p-2 rounded border border-white/10 backdrop-blur-md shadow-lg">
                <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${state.mode === GestureMode.ACTIVE ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                    STATUS: <span className="text-zinc-300">{state.mode}</span>
                </span>
                <span className={`${state.mode === GestureMode.IDLE ? 'animate-pulse text-amber-400' : 'text-blue-400 font-bold'}`}>
                    {state.mode === GestureMode.IDLE && "WAITING FOR PINCH..."}
                    {state.mode === GestureMode.PINCHING && "CALIBRATING..."}
                    {state.mode === GestureMode.ACTIVE && "TRACKING INPUT"}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};