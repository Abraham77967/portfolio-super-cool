
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MousePointer2, Cpu, Camera, Lock, Unlock, Loader2, X } from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { isFiveFingerPinch, isThumbIndexPinch } from '../utils/geometry';

export const ThreeDView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Physics / Smoothing Refs
  const targetRotation = useRef({ x: 0.5, y: -0.5 });
  const smoothedHandRef = useRef<{x: number, y: number} | null>(null);

  // Animation Refs (Thrusters)
  const leftPropRef = useRef<THREE.Group | null>(null);
  const rightPropRef = useRef<THREE.Group | null>(null);

  // Interaction Refs (Mouse)
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- GESTURE CONTROL REFS & STATE ---
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  // We need both State (for UI render) and Ref (for Animation Loop logic)
  const [gestureStatus, setGestureStatus] = useState<'IDLE' | 'SYNCING' | 'LOCKED'>('IDLE');
  const gestureStatusRef = useRef<'IDLE' | 'SYNCING' | 'LOCKED'>('IDLE');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTime = useRef<number>(-1);
  
  // Logic Refs
  const pinchStartTime = useRef<number | null>(null);
  const prevHandPos = useRef<{x: number, y: number} | null>(null);
  const isRotatingWithHand = useRef(false);

  // Helper to sync Ref and State
  const updateGestureStatus = (status: 'IDLE' | 'SYNCING' | 'LOCKED') => {
    setGestureStatus(status);
    gestureStatusRef.current = status;
  };

  // --- LIFECYCLE: CAMERA & AI ---
  useEffect(() => {
    let isActive = true;

    const startCameraAndAI = async () => {
        if (!gestureEnabled) return;

        setModelLoading(true);
        try {
            // 1. Initialize MediaPipe
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });

            if (!isActive) return;
            handLandmarkerRef.current = landmarker;

            // 2. Get Camera Stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: "user" }
            });
            
            if (!isActive) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            streamRef.current = stream;

            // 3. Attach to Video Element (Now guaranteed to exist by React render flow)
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadeddata = () => {
                    if (isActive) {
                        setModelLoading(false);
                        predictWebcam();
                    }
                };
            }
        } catch (err) {
            console.error("Failed to initialize gesture control:", err);
            if (isActive) {
                setModelLoading(false);
                setGestureEnabled(false);
            }
        }
    };

    if (gestureEnabled) {
        startCameraAndAI();
    } else {
        // Cleanup
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (handLandmarkerRef.current) {
            handLandmarkerRef.current.close();
            handLandmarkerRef.current = null;
        }
        updateGestureStatus('IDLE');
        setModelLoading(false);
        // Reset smoothed refs
        smoothedHandRef.current = null;
        prevHandPos.current = null;
    }

    return () => {
        isActive = false;
        // Safety cleanup on unmount
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gestureEnabled]);

  const predictWebcam = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current) return;
    
    // Process Frame
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());

      // --- DRAWING ON MINI CANVAS ---
      if (miniCanvasRef.current && videoRef.current) {
          const canvas = miniCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             canvas.width = videoRef.current.videoWidth;
             canvas.height = videoRef.current.videoHeight;
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             
             // Mirror draw
             ctx.save();
             ctx.scale(-1, 1);
             ctx.translate(-canvas.width, 0);

             if (results.landmarks && results.landmarks.length > 0) {
                 const landmarks = results.landmarks[0];
                 const isLocked = gestureStatusRef.current === 'LOCKED';
                 const isSyncing = gestureStatusRef.current === 'SYNCING';

                 // Draw Connectors
                 const connections = HandLandmarker.HAND_CONNECTIONS;
                 ctx.lineWidth = 4;
                 ctx.strokeStyle = isLocked ? '#3b82f6' : isSyncing ? '#eab308' : '#71717a'; // Blue / Yellow / Zinc
                 
                 for (const conn of connections) {
                     const p1 = landmarks[conn.start];
                     const p2 = landmarks[conn.end];
                     ctx.beginPath();
                     ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                     ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                     ctx.stroke();
                 }

                 // Draw Points
                 ctx.fillStyle = isLocked ? '#60a5fa' : '#ffffff';
                 for (const lm of landmarks) {
                     ctx.beginPath();
                     ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, 2 * Math.PI);
                     ctx.fill();
                 }
             }
             ctx.restore();
          }
      }

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const isFiveFinger = isFiveFingerPinch(landmarks);
        const currentStatus = gestureStatusRef.current;
        
        // --- LOGIC: SYNC LOCK (5 Fingers) ---
        if (currentStatus !== 'LOCKED') {
           if (isFiveFinger) {
             if (!pinchStartTime.current) pinchStartTime.current = Date.now();
             const elapsed = Date.now() - pinchStartTime.current;
             
             if (currentStatus !== 'SYNCING') updateGestureStatus('SYNCING');
             
             if (elapsed > 1000) { // 1 Second Hold
                updateGestureStatus('LOCKED');
                pinchStartTime.current = null;
             }
           } else {
             pinchStartTime.current = null;
             if (currentStatus !== 'IDLE') updateGestureStatus('IDLE');
           }
        } 
        
        // --- LOGIC: ROTATION (Thumb + Index) ---
        if (currentStatus === 'LOCKED') {
           const isRotationPinch = isThumbIndexPinch(landmarks);
           
           // Apply Smoothing (Exponential Moving Average) to Landmark Input
           const rawX = landmarks[0].x;
           const rawY = landmarks[0].y;
           let currentX = rawX;
           let currentY = rawY;

           if (smoothedHandRef.current) {
               const alpha = 0.3; // Smoothing factor (Lower = Smoother but more lag)
               currentX = smoothedHandRef.current.x * (1 - alpha) + rawX * alpha;
               currentY = smoothedHandRef.current.y * (1 - alpha) + rawY * alpha;
           }
           smoothedHandRef.current = { x: currentX, y: currentY };

           if (isRotationPinch) {
              isRotatingWithHand.current = true;
              
              if (prevHandPos.current) {
                 const deltaX = currentX - prevHandPos.current.x;
                 const deltaY = currentY - prevHandPos.current.y;
                 
                 // Update TARGET rotation, not model directly
                 // Multiplier adjusted for feel
                 // INVERTED Left/Right (Y axis) from += to -=
                 targetRotation.current.y -= deltaX * 5; 
                 targetRotation.current.x += deltaY * 5;
              }
              
              prevHandPos.current = { x: currentX, y: currentY };
           } else {
              isRotatingWithHand.current = false;
              prevHandPos.current = null; // Reset prev pos on release to prevent jumps
           }
        }

      } else {
        // Lost Hand
        if (gestureStatusRef.current === 'SYNCING') {
            pinchStartTime.current = null;
            updateGestureStatus('IDLE');
        }
        isRotatingWithHand.current = false;
        prevHandPos.current = null;
        smoothedHandRef.current = null;
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  }, []);

  // --- THREE.JS SCENE SETUP ---
  useEffect(() => {
    if (!containerRef.current) return;

    // --- SCENE ---
    const scene = new THREE.Scene();
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 10);
    pointLight.position.set(-5, 2, -5);
    scene.add(pointLight);

    // --- MATERIALS ---
    const materials = {
        chassis: new THREE.MeshStandardMaterial({ color: 0x8899a6, roughness: 0.7 }),
        pcbGreen: new THREE.MeshStandardMaterial({ color: 0x009944, roughness: 0.4 }),
        pcbRed: new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3 }),
        blackPlastic: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }),
        metalSilver: new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.7, roughness: 0.2 }), 
        metalGold: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 }),
        batteryYellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.4 }),
        batteryLabel: new THREE.MeshStandardMaterial({ color: 0x222222 }),
        lipoGreen: new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.4 }),
        wireRed: new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 }),
        wireBlack: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }),
        wireYellow: new THREE.MeshStandardMaterial({ color: 0xddcc00, roughness: 0.5 }),
        wireBlue: new THREE.MeshStandardMaterial({ color: 0x0044aa, roughness: 0.5 }),
        wireGreen: new THREE.MeshStandardMaterial({ color: 0x00aa00, roughness: 0.5 }),
        ribbonWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9 }),
        silkScreen: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
        connectorBeige: new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.5 }),
        motorBlue: new THREE.MeshStandardMaterial({ color: 0x0033cc, roughness: 0.2, metalness: 0.3 }),
        propWhite: new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.4, transparent: true, opacity: 0.9 })
    };

    // --- HELPER FUNCTIONS ---
    function createChamferedRect(width: number, height: number, chamfer: number, depth: number) {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        shape.moveTo(x, y + chamfer);
        shape.lineTo(x, y + height - chamfer);
        shape.lineTo(x + chamfer, y + height);
        shape.lineTo(x + width - chamfer, y + height);
        shape.lineTo(x + width, y + height - chamfer);
        shape.lineTo(x + width, y + chamfer);
        shape.lineTo(x + width - chamfer, y);
        shape.lineTo(x + chamfer, y);
        shape.lineTo(x, y + chamfer);
        const extrudeSettings = { depth: depth, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    function createScrewHead() {
        const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8);
        const mesh = new THREE.Mesh(geo, materials.metalSilver);
        mesh.rotation.x = Math.PI / 2;
        return mesh;
    }

    function createWire(points: THREE.Vector3[], material: THREE.Material, radius: number) {
        const path = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(path, 64, radius, 8, false);
        return new THREE.Mesh(geometry, material);
    }

    function createPiLogo(scale = 1) {
        const group = new THREE.Group();
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.15 * scale, 8, 8), materials.silkScreen);
        berry.scale.set(1, 0.8, 0.2);
        group.add(berry);
        const leafGeo = new THREE.SphereGeometry(0.08 * scale, 8, 4);
        const l1 = new THREE.Mesh(leafGeo, materials.silkScreen); l1.position.set(-0.08*scale, 0.15*scale, 0); l1.scale.set(1, 2, 0.2); l1.rotation.z = 0.5; group.add(l1);
        const l2 = new THREE.Mesh(leafGeo, materials.silkScreen); l2.position.set(0.08*scale, 0.15*scale, 0); l2.scale.set(1, 2, 0.2); l2.rotation.z = -0.5; group.add(l2);
        return group;
    }

    // --- COMPONENT CREATION ---

    // --- Raspberry Pi 5 ---
    function createRaspberryPi() {
        const group = new THREE.Group();
        const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 2.2), materials.pcbGreen);
        pcb.castShadow = true;
        group.add(pcb);

        const screwPos = [[1.5, 1.0], [-1.5, 1.0], [1.5, -1.0], [-1.5, -1.0]];
        screwPos.forEach(pos => {
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.09, 16), materials.metalSilver);
            ring.position.set(pos[0], 0, pos[1]);
            group.add(ring);
            const screw = createScrewHead();
            screw.position.set(pos[0], 0.06, pos[1]);
            group.add(screw);
        });

        function createUSBStack(isUSB3: boolean) {
            const stack = new THREE.Group();
            const casingMat = materials.metalSilver;
            const plasticColor = isUSB3 ? 0x0044aa : 0x111111;
            const plasticMat = new THREE.MeshStandardMaterial({color: plasticColor, roughness: 0.2});
            const shell = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), casingMat);
            stack.add(shell);
            const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.4), plasticMat); t1.position.set(0.25, 0.1, 0); stack.add(t1);
            const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.4), plasticMat); t2.position.set(0.25, -0.1, 0); stack.add(t2);
            const face1 = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.45), plasticMat); face1.rotation.y = Math.PI/2; face1.position.set(0.301, 0.1, 0); stack.add(face1);
            const face2 = face1.clone(); face2.position.set(0.301, -0.1, 0); stack.add(face2);
            return stack;
        }
        const usb3 = createUSBStack(true); usb3.position.set(1.5, 0.3, 0.0); group.add(usb3);
        const usb2 = createUSBStack(false); usb2.position.set(1.5, 0.3, 0.7); group.add(usb2);

        const ethGroup = new THREE.Group();
        const ethShell = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), materials.metalSilver);
        ethGroup.add(ethShell);
        const ethHole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.4), materials.blackPlastic); ethHole.position.set(0.26, 0, 0); ethGroup.add(ethHole);
        const ethTab = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.52), materials.metalSilver); ethTab.position.set(-0.2, 0, 0); ethGroup.add(ethTab);
        ethGroup.position.set(1.5, 0.25, -0.9);
        group.add(ethGroup);

        const cpuGroup = new THREE.Group();
        const cpuBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), materials.blackPlastic);
        cpuGroup.add(cpuBase);
        const heatSpreader = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.8), materials.metalSilver); 
        heatSpreader.position.set(0, 0.04, 0);
        cpuGroup.add(heatSpreader);
        cpuGroup.position.set(0.1, 0.06, 0.1); 
        group.add(cpuGroup);

        const rp1Group = new THREE.Group();
        const rp1Chip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.5), materials.blackPlastic);
        rp1Group.add(rp1Chip);
        const rp1Logo = createPiLogo(0.8);
        rp1Logo.rotation.x = -Math.PI/2;
        rp1Logo.position.set(0, 0.025, 0);
        rp1Group.add(rp1Logo);
        rp1Group.position.set(0.8, 0.06, 0.4);
        group.add(rp1Group);

        const pmic = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.3), materials.blackPlastic);
        pmic.position.set(-0.5, 0.06, 0.8);
        group.add(pmic);

        const hdmiGeo = new THREE.BoxGeometry(0.25, 0.12, 0.2);
        const hdmi1 = new THREE.Mesh(hdmiGeo, materials.metalSilver); hdmi1.position.set(-0.1, 0.1, 1.0); group.add(hdmi1);
        const hdmi2 = new THREE.Mesh(hdmiGeo, materials.metalSilver); hdmi2.position.set(0.25, 0.1, 1.0); group.add(hdmi2);

        const pwr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.2), materials.metalSilver); pwr.position.set(-0.5, 0.1, 1.0); group.add(pwr);

        const pcie = new THREE.Group();
        const pcieBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.4), materials.connectorBeige);
        pcie.add(pcieBody);
        const pcieLatch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.4), materials.blackPlastic); pcieLatch.position.set(0, 0.05, 0); pcie.add(pcieLatch);
        pcie.position.set(-1.5, 0.08, 0.1);
        group.add(pcie);

        function createVerticalFPC() {
            const c = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.05), materials.connectorBeige);
            c.add(body);
            const latch = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.05), materials.blackPlastic); latch.position.set(0, 0.05, 0.02); c.add(latch);
            return c;
        }
        const mipi1 = createVerticalFPC(); mipi1.position.set(-1.4, 0.1, -0.2); mipi1.rotation.y = Math.PI/2; group.add(mipi1);
        const mipi2 = createVerticalFPC(); mipi2.position.set(-1.4, 0.1, -0.5); mipi2.rotation.y = Math.PI/2; group.add(mipi2);

        const gpioGroup = new THREE.Group();
        const pinBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.25), materials.blackPlastic);
        gpioGroup.add(pinBase);
        const pinGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        for(let i=0; i<20; i++) {
            const xOff = -1.0 + (i*0.1);
            const p1 = new THREE.Mesh(pinGeo, materials.metalGold); p1.position.set(xOff, 0.15, -0.05); gpioGroup.add(p1);
            const p2 = new THREE.Mesh(pinGeo, materials.metalGold); p2.position.set(xOff, 0.15, 0.05); gpioGroup.add(p2);
        }
        gpioGroup.position.set(-0.05, 0.06, -0.85);
        group.add(gpioGroup);

        const uartGroup = new THREE.Group();
        const u1 = new THREE.Mesh(pinGeo, materials.metalGold); u1.position.set(0, 0.1, 0); uartGroup.add(u1);
        const u2 = new THREE.Mesh(pinGeo, materials.metalGold); u2.position.set(0.1, 0.1, 0); uartGroup.add(u2);
        const u3 = new THREE.Mesh(pinGeo, materials.metalGold); u3.position.set(0.2, 0.1, 0); uartGroup.add(u3);
        uartGroup.position.set(0.6, 0.04, 0.8);
        group.add(uartGroup);

        const fanCon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), materials.connectorBeige);
        fanCon.position.set(1.0, 0.08, -0.4);
        group.add(fanCon);

        const pwrBtn = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.15), materials.metalSilver);
        pwrBtn.position.set(-1.6, 0.08, 0.7);
        group.add(pwrBtn);

        const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.15), materials.silkScreen);
        textPlane.rotation.x = -Math.PI/2;
        textPlane.position.set(-0.8, 0.042, -0.4);
        group.add(textPlane);

        const pcbLogo = createPiLogo(1.0);
        pcbLogo.rotation.x = -Math.PI/2;
        pcbLogo.position.set(-1.0, 0.042, 0.4);
        group.add(pcbLogo);

        return group;
    }

    // --- Motor Driver L298N ---
    function createMotorDriver() {
        const group = new THREE.Group();
        const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.8), materials.pcbRed);
        pcb.castShadow = true;
        group.add(pcb);

        const screwPos = [[0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
        screwPos.forEach(pos => {
            const s = createScrewHead();
            s.rotation.x = 0;
            s.position.set(pos[0], 0.06, pos[1]);
            group.add(s);
        });

        const hsGroup = new THREE.Group();
        const hsBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), materials.blackPlastic);
        hsBase.position.set(0, 0.35, -0.4);
        hsGroup.add(hsBase);
        for(let i=0; i<5; i++) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.3), materials.blackPlastic);
            fin.position.set(-0.3 + (i*0.15), 0.35, -0.2);
            hsGroup.add(fin);
        }
        group.add(hsGroup);

        const chip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.1), materials.blackPlastic);
        chip.position.set(0, 0.3, -0.46);
        group.add(chip);

        const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
        const cap = new THREE.Mesh(capGeo, materials.blackPlastic);
        cap.position.set(-0.5, 0.3, 0.5);
        const capTop = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), materials.metalSilver);
        capTop.rotation.x = -Math.PI/2;
        capTop.position.set(0, 0.26, 0);
        cap.add(capTop);
        group.add(cap);

        const termGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        const termMat = new THREE.MeshStandardMaterial({color: 0x0044aa});
        const terminalPositions = [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]];
        terminalPositions.forEach(pos => {
            const t = new THREE.Mesh(termGeo, termMat);
            t.position.set(pos[0], 0.25, pos[1]);
            const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8), materials.metalSilver);
            s.position.set(0, 0.2, 0);
            t.add(s);
            group.add(t);
        });

        return group;
    }

    // --- Camera ---
    function createCameraModule() {
        const group = new THREE.Group();
        
        const bracketMat = new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.6}); 
        const servoMat = new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.4});
        const servoGearMat = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.2});
        const lensGlassMat = new THREE.MeshStandardMaterial({
            color: 0x111133, metalness: 0.9, roughness: 0.0, transparent: true, opacity: 0.7
        });
        const wireColors = [0xff0000, 0x000000, 0xffffff];

        function createMicroServo() {
            const sGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.24), servoMat);
            sGroup.add(body);
            const flange = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.24), servoMat);
            flange.position.set(0, 0.18, 0);
            sGroup.add(flange);
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16), servoMat);
            tower.position.set(0.1, 0.3, 0);
            sGroup.add(tower);
            const spline = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), servoGearMat);
            spline.position.set(0.1, 0.4, 0);
            sGroup.add(spline);
            const cableExit = new THREE.Group();
            cableExit.position.set(-0.22, -0.2, 0);
            for(let i=0; i<3; i++) {
                const w = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8), new THREE.MeshStandardMaterial({color: wireColors[i]}));
                w.rotation.z = Math.PI/2;
                w.position.set(0, 0, (i-1)*0.035);
                cableExit.add(w);
            }
            sGroup.add(cableExit);
            return sGroup;
        }

        const baseStand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), bracketMat);
        baseStand.position.set(0, 0.05, 0);
        const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8);
        const sm = materials.metalSilver;
        const s1 = new THREE.Mesh(screwGeo, sm); s1.position.set(0.3, 0.06, 0.3); baseStand.add(s1);
        const s2 = new THREE.Mesh(screwGeo, sm); s2.position.set(-0.3, 0.06, 0.3); baseStand.add(s2);
        const s3 = new THREE.Mesh(screwGeo, sm); s3.position.set(0.3, 0.06, -0.3); baseStand.add(s3);
        const s4 = new THREE.Mesh(screwGeo, sm); s4.position.set(-0.3, 0.06, -0.3); baseStand.add(s4);
        group.add(baseStand);

        const panServo = createMicroServo();
        panServo.position.set(0, 0.35, 0);
        group.add(panServo);

        const panGroup = new THREE.Group();
        panGroup.position.set(0.1, 0.78, 0);
        panGroup.rotation.y = 0.4; 

        const horn = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.1), servoGearMat);
        horn.position.set(0, -0.05, 0);
        const hScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), sm);
        hScrew.position.set(0, -0.06, 0);
        horn.add(hScrew);
        panGroup.add(horn);

        const uBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.4), bracketMat);
        panGroup.add(uBase);
        const uL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.4), bracketMat);
        uL.position.set(-0.28, 0.3, 0);
        panGroup.add(uL);
        const uR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.4), bracketMat);
        uR.position.set(0.28, 0.3, 0);
        panGroup.add(uR);
        
        group.add(panGroup);

        const tiltServo = createMicroServo();
        tiltServo.rotation.z = -Math.PI / 2; 
        tiltServo.rotation.y = -Math.PI / 2; 
        tiltServo.position.set(-0.3, 0.3, 0); 
        panGroup.add(tiltServo);

        const camGroup = new THREE.Group();
        camGroup.position.set(0, 0.35, 0);
        camGroup.rotation.x = -0.3;

        const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03), materials.pcbGreen);
        pcb.castShadow = true;
        camGroup.add(pcb);

        const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), materials.blackPlastic);
        sensor.position.set(0, 0, 0.04);
        camGroup.add(sensor);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), materials.blackPlastic);
        barrel.rotation.x = Math.PI/2;
        barrel.position.set(0, 0, 0.1);
        camGroup.add(barrel);

        const lens = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), lensGlassMat);
        lens.position.set(0, 0, 0.13);
        lens.scale.set(1, 1, 0.4);
        camGroup.add(lens);

        for(let i=0; i<6; i++) {
            const smd = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.01), materials.metalSilver);
            smd.position.set((Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4, 0.02);
            camGroup.add(smd);
        }

        const holeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8);
        const hMat = materials.metalGold;
        const pos = [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]];
        pos.forEach(p => {
            const h = new THREE.Mesh(holeGeo, hMat);
            h.rotation.x = Math.PI/2;
            h.position.set(p[0], p[1], 0);
            camGroup.add(h);
        });

        const ribCon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.06), materials.connectorBeige);
        ribCon.position.set(0, 0.18, 0.05);
        camGroup.add(ribCon);
        const latch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.07), materials.blackPlastic);
        latch.position.set(0, 0.16, 0.05);
        camGroup.add(latch);

        panGroup.add(camGroup);

        return group;
    }

    // --- Batteries ---
    function create18650Holder() {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 3.4), materials.blackPlastic);
        group.add(base);

        function createCell() {
            const cGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 2.6, 24), materials.batteryYellow);
            cGroup.add(body);
            const nipple = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), materials.metalSilver);
            nipple.position.set(0, 1.35, 0);
            cGroup.add(nipple);
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24), materials.ribbonWhite);
            ring.position.set(0, 1.3, 0);
            cGroup.add(ring);
            return cGroup;
        }

        const cell1 = createCell();
        cell1.rotation.x = Math.PI/2;
        cell1.position.set(-0.45, 0.3, 0);
        group.add(cell1);

        const cell2 = createCell();
        cell2.rotation.x = Math.PI/2;
        cell2.position.set(0.45, 0.3, 0);
        group.add(cell2);

        const springGeo = new THREE.TorusGeometry(0.2, 0.02, 8, 12);
        const s1 = new THREE.Mesh(springGeo, materials.metalSilver);
        s1.position.set(-0.45, 0.2, -1.5);
        group.add(s1);
        const s1b = s1.clone(); s1b.position.set(-0.45, 0.2, -1.55); group.add(s1b);
        const s1c = s1.clone(); s1c.position.set(-0.45, 0.2, -1.6); group.add(s1c);

        const s2 = s1.clone(); s2.position.set(0.45, 0.2, -1.5); group.add(s2);
        const s2b = s1b.clone(); s2b.position.set(0.45, 0.2, -1.55); group.add(s2b);
        const s2c = s1c.clone(); s2c.position.set(0.45, 0.2, -1.6); group.add(s2c);

        const tabGeo = new THREE.BoxGeometry(0.4, 0.3, 0.02);
        const t1 = new THREE.Mesh(tabGeo, materials.metalSilver);
        t1.position.set(-0.45, 0.2, 1.6);
        group.add(t1);
        const t2 = t1.clone();
        t2.position.set(0.45, 0.2, 1.6);
        group.add(t2);

        const wireExit = new THREE.Group();
        wireExit.position.set(0, 0.15, 1.7);
        const wRed = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), materials.wireRed);
        wRed.rotation.x = Math.PI/2;
        wRed.position.set(-0.2, 0, 0.25);
        wireExit.add(wRed);
        const wBlack = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), materials.wireBlack);
        wBlack.rotation.x = Math.PI/2;
        wBlack.position.set(0.2, 0, 0.25);
        wireExit.add(wBlack);
        group.add(wireExit);

        return group;
    }

    function createLiPo() {
        const group = new THREE.Group();
        
        const shape = new THREE.Shape();
        const w = 1.8, h = 3.0, r = 0.2;
        shape.moveTo(-w/2 + r, -h/2);
        shape.lineTo(w/2 - r, -h/2);
        shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
        shape.lineTo(w/2, h/2 - r);
        shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
        shape.lineTo(-w/2 + r, h/2);
        shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
        shape.lineTo(-w/2, -h/2 + r);
        shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);

        const extrudeSettings = { depth: 0.6, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
        const packGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const pack = new THREE.Mesh(packGeo, materials.blackPlastic);
        pack.rotation.x = Math.PI/2;
        pack.position.set(0, 0.3, 0); 
        group.add(pack);

        const label = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.4, 2.5), materials.lipoGreen);
        label.position.set(0, 0.3, 0);
        group.add(label);

        const labelDecal = new THREE.Group();
        labelDecal.position.set(0, 0.51, 0.5);
        labelDecal.rotation.x = -Math.PI/2;
        const l1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), new THREE.MeshBasicMaterial({color:0xffffff}));
        labelDecal.add(l1);
        const triShape = new THREE.Shape();
        triShape.moveTo(-0.2, -0.2);
        triShape.lineTo(0.2, -0.2);
        triShape.lineTo(0, 0.2);
        triShape.lineTo(-0.2, -0.2);
        const tri = new THREE.Mesh(new THREE.ShapeGeometry(triShape), new THREE.MeshBasicMaterial({color:0xffdd00}));
        tri.position.set(-0.5, 0, 0.01);
        labelDecal.add(tri);
        group.add(labelDecal);

        const powerLead = new THREE.Group();
        powerLead.position.set(0, 0.3, 1.6); 
        
        const wR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), materials.wireRed);
        wR.rotation.x = Math.PI/2; wR.position.set(-0.15, 0, 0.25); powerLead.add(wR);
        const wB = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), materials.wireBlack);
        wB.rotation.x = Math.PI/2; wB.position.set(0.15, 0, 0.25); powerLead.add(wB);

        const xtShape = new THREE.Shape();
        xtShape.moveTo(-0.25, -0.15);
        xtShape.lineTo(0.25, -0.15);
        xtShape.lineTo(0.25, 0.05);
        xtShape.lineTo(0.15, 0.15);
        xtShape.lineTo(-0.15, 0.15);
        xtShape.lineTo(-0.25, 0.05);
        xtShape.lineTo(-0.25, -0.15);
        const xtGeo = new THREE.ExtrudeGeometry(xtShape, {depth: 0.4, bevelEnabled: false});
        const xt60 = new THREE.Mesh(xtGeo, materials.batteryYellow);
        xt60.position.set(0, 0, 0.5); 
        powerLead.add(xt60);
        group.add(powerLead);

        const balLead = new THREE.Group();
        balLead.position.set(0.5, 0.4, 1.5);
        const wireCols = [0x000000, 0x0000ff, 0xff0000];
        for(let i=0; i<3; i++) {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), new THREE.MeshStandardMaterial({color: wireCols[i]}));
            w.rotation.x = Math.PI/2;
            w.position.set((i-1)*0.05, 0, 0.2);
            balLead.add(w);
        }
        const jst = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.15), materials.ribbonWhite);
        jst.position.set(0, 0, 0.45);
        balLead.add(jst);
        group.add(balLead);

        return group;
    }

    // --- THRUSTERS ---
    function createThruster() {
        const tGroup = new THREE.Group();
        
        // Blue Motor Body
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 24), materials.motorBlue);
        body.rotation.x = Math.PI/2;
        tGroup.add(body);

        // Silver Clamp Band
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 24), materials.metalSilver);
        band.rotation.x = Math.PI/2;
        tGroup.add(band);

        // Clamp Bracket Flange
        const flange = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), materials.metalSilver);
        flange.position.set(0, 0.5, 0); 
        tGroup.add(flange);

        // Vertical Mounting Stem
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8), materials.blackPlastic);
        stem.position.set(0, 0.9, 0); 
        tGroup.add(stem);

        // Propeller
        const propGroup = new THREE.Group();
        propGroup.position.set(0, 0, 0.7); // Back of motor
        
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 16), materials.propWhite);
        cone.rotation.x = Math.PI/2;
        propGroup.add(cone);
        
        for(let i=0; i<3; i++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.6), materials.propWhite);
            const bGroup = new THREE.Group();
            bGroup.rotation.z = (i * Math.PI * 2) / 3;
            b.position.set(0.3, 0, 0);
            b.rotation.x = 0.5; 
            b.rotation.y = 0.2; 
            bGroup.add(b);
            propGroup.add(bGroup);
        }
        tGroup.add(propGroup);
        
        // Store reference to propeller for animation
        tGroup.userData.propeller = propGroup;

        // Wires
        const wireGroup = new THREE.Group();
        wireGroup.position.set(0, 0.4, -0.4);
        const wR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), materials.wireRed);
        wR.rotation.x = 0.5; wR.position.set(-0.1, 0, 0); wireGroup.add(wR);
        const wB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), materials.wireBlack);
        wB.rotation.x = 0.5; wB.position.set(0.1, 0, 0); wireGroup.add(wB);
        tGroup.add(wireGroup);

        return tGroup;
    }

    // --- MODEL ASSEMBLY ---
    const chassisGroup = new THREE.Group();
    scene.add(chassisGroup);

    // Chassis Plate
    const centerPlateGeo = createChamferedRect(6, 10, 1.0, 0.2);
    const centerPlate = new THREE.Mesh(centerPlateGeo, materials.chassis);
    centerPlate.rotation.x = -Math.PI / 2;
    const centerWrapper = new THREE.Group();
    centerPlate.position.set(0, -0.1, 0);
    centerWrapper.add(centerPlate);
    centerPlate.geometry.center();
    chassisGroup.add(centerWrapper);

    // Left Wing
    const wingGeo = createChamferedRect(2.5, 7, 0.6, 0.2);
    const leftWing = new THREE.Mesh(wingGeo, materials.chassis);
    leftWing.rotation.x = -Math.PI / 2;
    leftWing.position.set(-5.5, 0, 0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    leftWing.geometry.center();
    chassisGroup.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(wingGeo, materials.chassis);
    rightWing.rotation.x = -Math.PI / 2;
    rightWing.position.set(5.5, 0, 0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    chassisGroup.add(rightWing);

    // Struts
    const strutGeo = new THREE.BoxGeometry(2, 0.15, 0.5);
    const sPos = [[-3.5, 0, 2], [-3.5, 0, -2], [3.5, 0, 2], [3.5, 0, -2]];
    sPos.forEach(p => {
        const s = new THREE.Mesh(strutGeo, materials.chassis);
        s.position.set(...p);
        chassisGroup.add(s);
    });

    const rpi = createRaspberryPi();
    rpi.rotation.y = Math.PI / 2;
    rpi.position.set(0, 0.2, 0);
    chassisGroup.add(rpi);

    const driver = createMotorDriver();
    driver.position.set(0, 0.2, 3);
    chassisGroup.add(driver);

    const cam = createCameraModule();
    cam.position.set(0, 0.1, -3);
    cam.rotation.y = Math.PI; 
    chassisGroup.add(cam);

    const batLeft = create18650Holder();
    batLeft.position.set(-5.5, 0.2, 0);
    chassisGroup.add(batLeft);

    const batRight = createLiPo();
    batRight.position.set(5.5, 0.4, 0);
    chassisGroup.add(batRight);

    // Wiring
    function addWiring() {
        const group = new THREE.Group();
        const lipoRed = createWire([
            new THREE.Vector3(5.5, 0.4, 1.5),
            new THREE.Vector3(3.0, 0.2, 1.8),
            new THREE.Vector3(1.0, 0.4, 2.5),
            new THREE.Vector3(0.5, 0.4, 3.5)
        ], materials.wireRed, 0.06);
        group.add(lipoRed);
        const lipoBlack = createWire([
            new THREE.Vector3(5.5, 0.4, 1.7),
            new THREE.Vector3(3.0, 0.2, 2.0),
            new THREE.Vector3(1.2, 0.4, 2.7),
            new THREE.Vector3(0.7, 0.4, 3.5)
        ], materials.wireBlack, 0.06);
        group.add(lipoBlack);
        const batRed = createWire([
            new THREE.Vector3(-5.5, 0.3, -1.2),
            new THREE.Vector3(-3.0, 0.2, -0.5),
            new THREE.Vector3(-1.5, 0.5, 1.5),
            new THREE.Vector3(-0.5, 0.4, 3.5)
        ], materials.wireRed, 0.06);
        group.add(batRed);
        const batBlack = createWire([
            new THREE.Vector3(-5.5, 0.3, 1.2),
            new THREE.Vector3(-3.0, 0.2, 1.5),
            new THREE.Vector3(-1.0, 0.4, 2.5),
            new THREE.Vector3(-0.3, 0.4, 3.5)
        ], materials.wireBlack, 0.06);
        group.add(batBlack);
        
        const jumperColors = [materials.wireBlue, materials.wireGreen, materials.wireYellow, materials.wireBlue, materials.wireRed, materials.wireBlack];
        for(let i = 0; i < 8; i++) {
            const offset = i * 0.1;
            const color = jumperColors[i % jumperColors.length];
            const r1 = (Math.random() - 0.5) * 0.5;
            const r2 = (Math.random() - 0.5) * 0.5;
            const wire = createWire([
                new THREE.Vector3(-0.6 + offset, 0.5, 3.2), 
                new THREE.Vector3(-0.6 + offset + r1, 1.5 + (Math.random() * 1.0), 2.0),
                new THREE.Vector3(-0.8 + r2, 0.3, 0.5 - offset)
            ], color, 0.025);
            group.add(wire);
        }
        return group;
    }
    const wiring = addWiring();
    chassisGroup.add(wiring); // Fixed: Added to chassisGroup instead of scene

    function addCameraRibbon() {
        const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.1, -2.9),      
            new THREE.Vector3(0, 1.5, -1.5),      
            new THREE.Vector3(-0.1, 0.8, 0.5),    
            new THREE.Vector3(-0.2, 0.3, 1.4)     
        ]);
        const geometry = new THREE.TubeGeometry(path, 32, 0.15, 4, false);
        const ribbon = new THREE.Mesh(geometry, materials.ribbonWhite);
        ribbon.scale.set(1, 0.05, 1); 
        chassisGroup.add(ribbon);
    }
    addCameraRibbon();

    // Instantiate Thrusters
    const thrusterLeft = createThruster();
    thrusterLeft.position.set(-3.5, -1.2, 2); 
    chassisGroup.add(thrusterLeft);
    // Assign to Ref for Animation
    leftPropRef.current = thrusterLeft.userData.propeller;

    const thrusterRight = createThruster();
    thrusterRight.position.set(3.5, -1.2, 2); 
    chassisGroup.add(thrusterRight);
    // Assign to Ref for Animation
    rightPropRef.current = thrusterRight.userData.propeller;

    function addMotorWiring() {
        const group = new THREE.Group();

        // Left Motor Wires -> Driver Left Output
        const mLeftRed = createWire([
            new THREE.Vector3(-3.5, -0.8, 1.6), // Motor Top
            new THREE.Vector3(-3.5, -0.1, 1.6), // Up stem
            new THREE.Vector3(-2.5, 0.0, 1.6),  // Along strut underside
            new THREE.Vector3(-1.0, 0.1, 2.0),  // Up to deck
            new THREE.Vector3(-0.7, 0.4, 2.3)   // Driver Terminal
        ], materials.wireRed, 0.04);
        group.add(mLeftRed);

        const mLeftBlack = createWire([
            new THREE.Vector3(-3.3, -0.8, 1.6), 
            new THREE.Vector3(-3.3, -0.1, 1.6),
            new THREE.Vector3(-2.3, 0.0, 1.8),
            new THREE.Vector3(-1.2, 0.1, 2.2),
            new THREE.Vector3(-0.7, 0.4, 3.7)
        ], materials.wireBlack, 0.04);
        group.add(mLeftBlack);


        // Right Motor Wires -> Driver Right Output
        const mRightRed = createWire([
            new THREE.Vector3(3.5, -0.8, 1.6), 
            new THREE.Vector3(3.5, -0.1, 1.6), 
            new THREE.Vector3(2.5, 0.0, 1.6),
            new THREE.Vector3(1.0, 0.1, 2.0),
            new THREE.Vector3(0.7, 0.4, 2.3)
        ], materials.wireRed, 0.04);
        group.add(mRightRed);

        const mRightBlack = createWire([
            new THREE.Vector3(3.3, -0.8, 1.6), 
            new THREE.Vector3(3.3, -0.1, 1.6),
            new THREE.Vector3(2.3, 0.0, 1.8),
            new THREE.Vector3(1.2, 0.1, 2.2),
            new THREE.Vector3(0.7, 0.4, 3.7)
        ], materials.wireBlack, 0.04);
        group.add(mRightBlack);

        chassisGroup.add(group);
    }
    addMotorWiring();

    // Initial Rotation
    chassisGroup.rotation.x = 0.5;
    chassisGroup.rotation.y = -0.5;
    targetRotation.current = { x: 0.5, y: -0.5 };

    modelRef.current = chassisGroup;

    // Store refs
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // 6. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current && rendererRef.current && cameraRef.current) {
           const { width, height } = entry.contentRect;
           if (width === 0 || height === 0) return;
           cameraRef.current.aspect = width / height;
           cameraRef.current.updateProjectionMatrix();
           rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 7. Animation Loop
    const loop = () => {
      if (rendererRef.current && camera) {
         if (leftPropRef.current) leftPropRef.current.rotation.z += 0.3;
         if (rightPropRef.current) rightPropRef.current.rotation.z -= 0.3;

         if (modelRef.current) {
             const smoothingSpeed = 0.1; 
             modelRef.current.rotation.x += (targetRotation.current.x - modelRef.current.rotation.x) * smoothingSpeed;
             modelRef.current.rotation.y += (targetRotation.current.y - modelRef.current.rotation.y) * smoothingSpeed;
         }

         if (!isDragging.current && !isRotatingWithHand.current) {
             targetRotation.current.y += 0.002;
         }
         
         rendererRef.current.render(scene, camera);
      }
      frameIdRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Interaction Handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    previousMousePosition.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaMove = {
        x: clientX - previousMousePosition.current.x,
        y: clientY - previousMousePosition.current.y
    };

    targetRotation.current.y -= deltaMove.x * 0.005;
    targetRotation.current.x -= deltaMove.y * 0.005; 

    previousMousePosition.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex gap-6 w-full h-[60vh] md:h-[80vh] transition-all duration-500 ease-in-out">
        
        {/* --- LEFT SIDEBAR: CAMERA FEED --- */}
        <div className={`
            relative bg-zinc-950/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${gestureEnabled ? 'w-[35%] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10 border-none'}
        `}>
            {gestureEnabled && (
                <div className="absolute inset-0 flex flex-col p-6 animate-enter">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2 text-white font-display font-bold uppercase tracking-wide">
                            <Camera className="w-5 h-5 text-blue-500" />
                            <span>Neural Input</span>
                        </div>
                        <button 
                             onClick={() => setGestureEnabled(false)}
                             className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Camera Feed Container */}
                    <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-zinc-700 shadow-inner group">
                         <video 
                             ref={videoRef} 
                             className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-0" 
                             autoPlay 
                             playsInline 
                             muted 
                         />
                         <canvas ref={miniCanvasRef} className="absolute inset-0 w-full h-full object-cover" />
                         
                         {/* Scanning Grid Overlay */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                         <div className="absolute inset-0 border-2 border-blue-500/20 rounded-xl pointer-events-none" />
                         
                         {/* Loading Spinner */}
                         {modelLoading && (
                             <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
                                 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                             </div>
                         )}
                    </div>

                    {/* Status Indicators */}
                    <div className="mt-6 space-y-4">
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Connection Status</span>
                                 {gestureStatus === 'LOCKED' ? (
                                     <span className="text-green-400 text-[10px] font-bold font-mono flex items-center gap-1">
                                         <Lock className="w-3 h-3" /> LOCKED
                                     </span>
                                 ) : gestureStatus === 'SYNCING' ? (
                                     <span className="text-yellow-400 text-[10px] font-bold font-mono flex items-center gap-1 animate-pulse">
                                         <Loader2 className="w-3 h-3 animate-spin" /> SYNCING
                                     </span>
                                 ) : (
                                     <span className="text-red-400 text-[10px] font-bold font-mono flex items-center gap-1">
                                         <Unlock className="w-3 h-3" /> IDLE
                                     </span>
                                 )}
                             </div>
                             
                             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                 <div className={`h-full transition-all duration-300 ${gestureStatus === 'LOCKED' ? 'w-full bg-green-500' : gestureStatus === 'SYNCING' ? 'w-1/2 bg-yellow-500' : 'w-[5%] bg-red-500'}`} />
                             </div>
                        </div>

                        <div className="text-xs text-zinc-400 font-mono space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                <span>Pinch 5 fingers to SYNC</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Thumb + Index to ROTATE</span>
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>

        {/* --- RIGHT MAIN: 3D MODEL --- */}
        <div className={`
            relative bg-zinc-950/80 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl backdrop-blur-sm group select-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${gestureEnabled ? 'w-[65%]' : 'w-full'}
        `}>
          
          {/* 3D Container */}
          <div 
            ref={containerRef} 
            className="absolute inset-0 cursor-grab active:cursor-grabbing z-10 touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          />

          {/* Decorative Background */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* HEADER OVERLAY */}
          <div className="absolute top-6 left-6 pointer-events-none z-20">
             <h2 className="text-2xl font-display font-bold text-white tracking-widest flex items-center gap-2 drop-shadow-lg uppercase">
                 <Cpu className="w-6 h-6 text-blue-500" />
                 Prototype_X1
             </h2>
             <div className="flex items-center gap-2 mt-2 text-zinc-400 font-mono text-xs">
                <MousePointer2 className="w-3 h-3 text-blue-400" />
                <span>INTERACTIVE CHASSIS</span>
             </div>
          </div>

           {/* ACTIVATE BUTTON (Only visible when inactive) */}
           {!gestureEnabled && (
              <div className="absolute bottom-6 left-6 z-30">
                  <button 
                    onClick={() => setGestureEnabled(true)}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all border shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-blue-500 text-white border-blue-400 hover:scale-105 hover:bg-blue-400"
                  >
                    <Camera className="w-5 h-5" />
                    Activate Neural Link
                  </button>
              </div>
           )}

           {/* INFO PANEL */}
           <div className="absolute bottom-6 right-6 pointer-events-none z-20 text-right">
             <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-500">
                 <span>BOARD: RPi 5</span>
                 <span>MOTOR: BLUE_T200</span>
                 <span>BATTERY: 4S_LIPO</span>
             </div>
          </div>
        </div>
    </div>
  );
};
