import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { speechManager } from '../utils/speech';

export type CubeExpression = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'error';

interface Hinata3DCubeProps {
  expression?: CubeExpression;
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  audioIntensity?: number; // 0.0 to 1.0
  size?: number; // width/height in px or 0 for responsive container
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Hinata3DCube: React.FC<Hinata3DCubeProps> = ({
  expression = 'idle',
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  audioIntensity = 0,
  interactive = true,
  className = '',
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const expressionRef = useRef<CubeExpression>(expression);
  const audioIntensityRef = useRef<number>(audioIntensity);
  const lipSyncRef = useRef<number>(0);

  // Sync state refs for requestAnimationFrame loop
  useEffect(() => {
    let effective = expression;
    if (isListening) effective = 'listening';
    else if (isThinking) effective = 'thinking';
    else if (isSpeaking) effective = 'speaking';
    expressionRef.current = effective;
  }, [expression, isListening, isThinking, isSpeaking]);

  useEffect(() => {
    audioIntensityRef.current = audioIntensity;
  }, [audioIntensity]);

  // Subscribe to speech phoneme lip-sync
  useEffect(() => {
    const unsub = speechManager.onLipSync((intensity) => {
      lipSyncRef.current = intensity;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as instructed by threejs skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setUseFallback(true);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio Environment map using RoomEnvironment (skill directive)
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    // Studio 3-point lighting with neon violet & cyan accents
    const ambientLight = new THREE.AmbientLight(0x280e46, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd946ef, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 4.0);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xa855f7, 5.0, 10);
    bottomGlow.position.set(0, -1.8, 0);
    scene.add(bottomGlow);

    // --- MAIN 3D HOLOGRAPHIC CUBE GROUP ---
    const cubeRoot = new THREE.Group();
    scene.add(cubeRoot);

    // 1. Procedural 2D Face Texture Canvas
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const faceCtx = faceCanvas.getContext('2d')!;

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Face Canvas Drawer Function
    const renderFace = (expr: CubeExpression, mouthOpen: number, blinkProgress: number, time: number) => {
      faceCtx.clearRect(0, 0, 512, 512);

      // Dark translucent obsidian face background
      const bgGrad = faceCtx.createRadialGradient(256, 256, 20, 256, 256, 250);
      bgGrad.addColorStop(0, 'rgba(38, 12, 60, 0.88)');
      bgGrad.addColorStop(0.7, 'rgba(18, 4, 30, 0.94)');
      bgGrad.addColorStop(1, 'rgba(8, 2, 16, 0.98)');
      faceCtx.fillStyle = bgGrad;
      faceCtx.fillRect(0, 0, 512, 512);

      // Inner volumetric energy sheen
      const sheenGrad = faceCtx.createLinearGradient(0, 0, 512, 512);
      sheenGrad.addColorStop(0, 'rgba(192, 132, 252, 0.12)');
      sheenGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.02)');
      sheenGrad.addColorStop(1, 'rgba(217, 70, 239, 0.15)');
      faceCtx.fillStyle = sheenGrad;
      faceCtx.fillRect(0, 0, 512, 512);

      faceCtx.save();
      faceCtx.lineCap = 'round';
      faceCtx.lineJoin = 'round';

      // Neon purple glow configuration
      faceCtx.shadowColor = '#d946ef';
      faceCtx.shadowBlur = 24;
      faceCtx.strokeStyle = '#f5d0fe';
      faceCtx.fillStyle = '#f5d0fe';
      faceCtx.lineWidth = 14;

      const eyeY = 220;
      const leftEyeX = 180;
      const rightEyeX = 332;

      // Handle natural blinking
      if (blinkProgress > 0 && expr !== 'idle' && expr !== 'happy') {
        faceCtx.beginPath();
        faceCtx.moveTo(leftEyeX - 35, eyeY);
        faceCtx.lineTo(leftEyeX + 35, eyeY);
        faceCtx.moveTo(rightEyeX - 35, eyeY);
        faceCtx.lineTo(rightEyeX + 35, eyeY);
        faceCtx.stroke();
      } else {
        switch (expr) {
          case 'idle':
          case 'happy': {
            // Cute inverted chevron smiling eyes: ^   ^
            // Left Eye
            faceCtx.beginPath();
            faceCtx.moveTo(leftEyeX - 38, eyeY + 18);
            faceCtx.lineTo(leftEyeX, eyeY - 22);
            faceCtx.lineTo(leftEyeX + 38, eyeY + 18);
            faceCtx.stroke();

            // Right Eye
            faceCtx.beginPath();
            faceCtx.moveTo(rightEyeX - 38, eyeY + 18);
            faceCtx.lineTo(rightEyeX, eyeY - 22);
            faceCtx.lineTo(rightEyeX + 38, eyeY + 18);
            faceCtx.stroke();

            // Cute rosy cheeks (soft purple blush)
            faceCtx.shadowBlur = 18;
            faceCtx.fillStyle = 'rgba(244, 114, 182, 0.4)';
            faceCtx.beginPath();
            faceCtx.ellipse(leftEyeX - 30, eyeY + 45, 18, 10, 0, 0, Math.PI * 2);
            faceCtx.fill();
            faceCtx.beginPath();
            faceCtx.ellipse(rightEyeX + 30, eyeY + 45, 18, 10, 0, 0, Math.PI * 2);
            faceCtx.fill();

            if (expr === 'happy') {
              // Sparkle stars
              faceCtx.fillStyle = '#fdf4ff';
              drawSparkle(faceCtx, leftEyeX - 45, eyeY - 45, 12);
              drawSparkle(faceCtx, rightEyeX + 45, eyeY - 45, 12);
            }
            break;
          }

          case 'listening': {
            // Wide attentive round glowing neon eyes with animated ring
            const pulse = Math.sin(time * 6) * 3;
            // Left eye
            faceCtx.beginPath();
            faceCtx.arc(leftEyeX, eyeY, 28 + pulse, 0, Math.PI * 2);
            faceCtx.fill();
            faceCtx.strokeStyle = '#c084fc';
            faceCtx.lineWidth = 6;
            faceCtx.stroke();

            // Right eye
            faceCtx.beginPath();
            faceCtx.arc(rightEyeX, eyeY, 28 + pulse, 0, Math.PI * 2);
            faceCtx.fill();
            faceCtx.strokeStyle = '#c084fc';
            faceCtx.stroke();

            // Inner pupil gleam
            faceCtx.fillStyle = '#ffffff';
            faceCtx.beginPath();
            faceCtx.arc(leftEyeX - 8, eyeY - 8, 8, 0, Math.PI * 2);
            faceCtx.arc(rightEyeX - 8, eyeY - 8, 8, 0, Math.PI * 2);
            faceCtx.fill();
            break;
          }

          case 'thinking': {
            // Rotating spiral / orbital concentric circles
            const angle = time * 5;
            faceCtx.save();
            faceCtx.translate(leftEyeX, eyeY);
            faceCtx.rotate(angle);
            faceCtx.beginPath();
            faceCtx.arc(0, 0, 24, 0, Math.PI * 1.5);
            faceCtx.stroke();
            faceCtx.restore();

            faceCtx.save();
            faceCtx.translate(rightEyeX, eyeY);
            faceCtx.rotate(-angle);
            faceCtx.beginPath();
            faceCtx.arc(0, 0, 24, 0, Math.PI * 1.5);
            faceCtx.stroke();
            faceCtx.restore();
            break;
          }

          case 'speaking': {
            // Friendly open eyes
            faceCtx.beginPath();
            faceCtx.arc(leftEyeX, eyeY - 4, 24, 0, Math.PI * 2);
            faceCtx.arc(rightEyeX, eyeY - 4, 24, 0, Math.PI * 2);
            faceCtx.fill();

            // Pupil gleams
            faceCtx.fillStyle = '#ffffff';
            faceCtx.beginPath();
            faceCtx.arc(leftEyeX - 6, eyeY - 10, 7, 0, Math.PI * 2);
            faceCtx.arc(rightEyeX - 6, eyeY - 10, 7, 0, Math.PI * 2);
            faceCtx.fill();

            // Cute animated mouth opening/closing with speech
            const mouthH = 8 + mouthOpen * 26;
            faceCtx.fillStyle = '#f5d0fe';
            faceCtx.beginPath();
            faceCtx.ellipse(256, eyeY + 68, 22, mouthH, 0, 0, Math.PI * 2);
            faceCtx.fill();
            break;
          }

          case 'error': {
            // Worried/concerned eyes: >  <
            faceCtx.beginPath();
            faceCtx.moveTo(leftEyeX - 30, eyeY - 20);
            faceCtx.lineTo(leftEyeX + 10, eyeY);
            faceCtx.lineTo(leftEyeX - 30, eyeY + 20);

            faceCtx.moveTo(rightEyeX + 30, eyeY - 20);
            faceCtx.lineTo(rightEyeX - 10, eyeY);
            faceCtx.lineTo(rightEyeX + 30, eyeY + 20);
            faceCtx.stroke();
            break;
          }
        }
      }

      faceCtx.restore();
      faceTexture.needsUpdate = true;
    };

    function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        const a2 = a + Math.PI / 4;
        ctx.lineTo(cx + Math.cos(a2) * (r * 0.35), cy + Math.sin(a2) * (r * 0.35));
      }
      ctx.closePath();
      ctx.fill();
    }

    // 2. Materials for Glass Cube:
    // Front face has animated face texture; other 5 faces have dark obsidian glass material
    const glassSideMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18052e,
      roughness: 0.12,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.85,
      opacity: 0.94,
      transparent: true,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      attenuationColor: new THREE.Color(0x9333ea),
      attenuationDistance: 2.0,
    });

    const frontFaceMaterial = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      opacity: 0.98,
    });

    // BoxGeometry material array: [+x, -x, +y, -y, +z (front), -z (back)]
    const cubeMaterials = [
      glassSideMaterial,
      glassSideMaterial,
      glassSideMaterial,
      glassSideMaterial,
      frontFaceMaterial, // index 4: front face facing camera (+Z)
      glassSideMaterial,
    ];

    const cubeGeo = new THREE.BoxGeometry(2.3, 2.3, 2.3);
    const mainCubeMesh = new THREE.Mesh(cubeGeo, cubeMaterials);
    cubeRoot.add(mainCubeMesh);

    // 3. Neon Purple Glowing Chamfer Edges
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xe879f9,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    mainCubeMesh.add(edgesMesh);

    // 4. Inner Volumetric Glowing Core
    const innerCoreGeo = new THREE.IcosahedronGeometry(1.1, 2);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    mainCubeMesh.add(innerCoreMesh);

    // 5. Holographic Orbital Rings around the Cube (matching reference)
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.9,
    });
    const orbitalRing1 = new THREE.Mesh(ring1Geo, ringMat1);
    orbitalRing1.rotation.set(Math.PI / 3.2, 0.4, 0);
    cubeRoot.add(orbitalRing1);

    const ring2Geo = new THREE.TorusGeometry(3.1, 0.025, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.75,
    });
    const orbitalRing2 = new THREE.Mesh(ring2Geo, ringMat2);
    orbitalRing2.rotation.set(-Math.PI / 3.8, -0.3, Math.PI / 6);
    cubeRoot.add(orbitalRing2);

    // 6. Concentric Floor Platform Rings (under the cube)
    const floorPlatformGroup = new THREE.Group();
    floorPlatformGroup.position.set(0, -2.1, 0);
    floorPlatformGroup.rotation.x = -Math.PI / 2;
    cubeRoot.add(floorPlatformGroup);

    const createDiscRing = (inner: number, outer: number, color: number, opacity: number) => {
      const g = new THREE.RingGeometry(inner, outer, 64);
      const m = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
      return new THREE.Mesh(g, m);
    };

    floorPlatformGroup.add(createDiscRing(0.8, 0.92, 0xd946ef, 0.85));
    floorPlatformGroup.add(createDiscRing(1.4, 1.48, 0xa855f7, 0.7));
    floorPlatformGroup.add(createDiscRing(2.1, 2.18, 0x7c3aed, 0.5));
    floorPlatformGroup.add(createDiscRing(2.7, 2.76, 0x6366f1, 0.3));

    // 7. Small Floating Miniature Companion Cubes (drifting around main cube)
    const miniCubesGroup = new THREE.Group();
    cubeRoot.add(miniCubesGroup);

    const miniCubes: THREE.Mesh[] = [];
    const miniCubeMat = new THREE.MeshStandardMaterial({
      color: 0x1f0738,
      emissive: 0xa855f7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    });

    const miniCubePositions = [
      { x: -2.3, y: 1.2, z: 0.5, size: 0.35, speed: 0.8 },
      { x: 2.4, y: 0.8, z: -0.6, size: 0.42, speed: -0.6 },
      { x: -2.0, y: -0.9, z: 1.0, size: 0.28, speed: 1.1 },
      { x: 2.2, y: -0.7, z: 0.8, size: 0.32, speed: -0.9 },
    ];

    miniCubePositions.forEach((pos) => {
      const g = new THREE.BoxGeometry(pos.size, pos.size, pos.size);
      const m = new THREE.Mesh(g, miniCubeMat);
      m.position.set(pos.x, pos.y, pos.z);

      const edgeG = new THREE.EdgesGeometry(g);
      const edgeM = new THREE.LineBasicMaterial({ color: 0xe879f9 });
      m.add(new THREE.LineSegments(edgeG, edgeM));

      miniCubesGroup.add(m);
      miniCubes.push(m);
    });

    // 8. Floating Purple Bioluminescent Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 6;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      particleVel[i * 3 + 1] = 0.004 + Math.random() * 0.008; // upward float
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd946ef,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- INTERACTIVE MOUSE / TOUCH PARALLAX ---
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    container.addEventListener('pointermove', handlePointerMove);

    // --- ANIMATION LOOP ---
    let frameId = 0;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Blinking simulation
      blinkTimer += delta;
      if (blinkTimer > 3.8) {
        isBlinking = true;
        blinkProgress = Math.sin((blinkTimer - 3.8) * Math.PI * 4);
        if (blinkTimer > 4.15) {
          isBlinking = false;
          blinkTimer = Math.random() * 1.5;
        }
      }

      // Smooth mouth animation from live speech intensity
      const mouthOpen = Math.max(lipSyncRef.current, audioIntensityRef.current);

      // Redraw front face
      renderFace(expressionRef.current, mouthOpen, isBlinking ? 1 : 0, time);

      // Smooth floating oscillation (levitation)
      mainCubeMesh.position.y = Math.sin(time * 1.6) * 0.12;

      // Base rotation + interactive parallax damping
      mainCubeMesh.rotation.y = THREE.MathUtils.damp(
        mainCubeMesh.rotation.y,
        targetRotationY + Math.sin(time * 0.6) * 0.15,
        4,
        delta
      );
      mainCubeMesh.rotation.x = THREE.MathUtils.damp(
        mainCubeMesh.rotation.x,
        targetRotationX + Math.cos(time * 0.8) * 0.08,
        4,
        delta
      );

      // Inner core counter-rotation
      innerCoreMesh.rotation.x = -time * 0.8;
      innerCoreMesh.rotation.y = time * 1.2;

      // Rotate orbital rings
      orbitalRing1.rotation.z = time * 0.8;
      orbitalRing2.rotation.z = -time * 0.6;

      // Audio-reactive scale pulse on rings
      const pulseScale = 1.0 + mouthOpen * 0.14;
      orbitalRing1.scale.set(pulseScale, pulseScale, pulseScale);
      orbitalRing2.scale.set(pulseScale, pulseScale, pulseScale);

      // Rotate floor concentric rings
      floorPlatformGroup.rotation.z = time * 0.2;

      // Orbit mini companion cubes
      miniCubes.forEach((mc, idx) => {
        const p = miniCubePositions[idx];
        const angle = time * p.speed + idx * 1.5;
        const radius = Math.sqrt(p.x * p.x + p.z * p.z);
        mc.position.x = Math.cos(angle) * radius;
        mc.position.z = Math.sin(angle) * radius;
        mc.position.y = p.y + Math.sin(time * 2 + idx) * 0.12;
        mc.rotation.x += 0.015;
        mc.rotation.y += 0.02;
      });

      // Drift particle dust
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i * 3 + 1];
        if (positions[i * 3 + 1] > 2.8) {
          positions[i * 3 + 1] = -2.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      cubeGeo.dispose();
      edgesGeo.dispose();
      innerCoreGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      particleGeo.dispose();
      faceTexture.dispose();
    };
  }, [interactive]);

  if (useFallback) {
    // Elegant 2D Fallback for environments where WebGL is disabled
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center p-6 ${className}`}
      >
        <div className="relative w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/60 to-black border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center flex-col animate-pulse">
          <div className="text-4xl text-purple-200 font-extrabold tracking-widest drop-shadow-[0_0_15px_#d946ef]">
            ^ &nbsp; ^
          </div>
          <span className="text-[10px] text-purple-300 mt-3 font-mono">HINATA CUBE AI</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
    >
      {/* Soft Ambient Purple Glow Behind Cube (matches reference) */}
      <div className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-fuchsia-500/20 blur-2xl pointer-events-none" />

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="relative z-10 w-full h-full cursor-pointer" />
    </div>
  );
};
