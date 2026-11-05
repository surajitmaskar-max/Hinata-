import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sparkles, Cpu, Eye, Volume2 } from 'lucide-react';
import { speechManager } from '../utils/speech';

export type CharacterPose = 'idle' | 'greeting' | 'attentive' | 'thinking' | 'explaining' | 'joyful';

interface Hinata3DCharacterProps {
  pose?: CharacterPose;
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  className?: string;
  height?: number | string;
  onCharacterClick?: () => void;
  showModeToggle?: boolean;
}

export const Hinata3DCharacter: React.FC<Hinata3DCharacterProps> = ({
  pose = 'idle',
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  className = '',
  height = '100%',
  onCharacterClick,
  showModeToggle = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState<'3d' | 'lite'>('3d');
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);

  // References to animateable 3D bones & components
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const ponytailGroupRef = useRef<THREE.Group | null>(null);
  const chestCoreLightRef = useRef<THREE.PointLight | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftForearmRef = useRef<THREE.Group | null>(null);
  const rightForearmRef = useRef<THREE.Group | null>(null);
  const mouthMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const haloDiskRef = useRef<THREE.Mesh | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);

  // Real-time audio lip sync intensity
  const currentLipSyncIntensity = useRef(0);

  // Pointer tracking coordinates
  const pointerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerPos.current = { x: x * 0.35, y: y * 0.25 };
    };

    window.addEventListener('mousemove', handlePointerMove);
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  useEffect(() => {
    const unsubscribe = speechManager.onLipSync((intensity) => {
      currentLipSyncIntensity.current = intensity;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (renderMode !== '3d') return;

    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability & software rendering guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) {
          setWebGlAvailable(false);
          setRenderMode('lite');
          return true;
        }
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        setWebGlAvailable(false);
        setRenderMode('lite');
        return true;
      }
    })();

    const width = container.clientWidth || 360;
    const heightPx = container.clientHeight || 480;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - framed for full-body view of Hinata
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.35, 3.5);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Cinematic Three-Point Lighting + Cyan Core Glow
    // Electric Cyan-Blue Key Light
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(2.2, 3.2, 3.0);
    scene.add(keyLight);

    // Deep Midnight Violet Ambient / Fill
    const fillLight = new THREE.HemisphereLight(0x7c3aed, 0x020617, 1.4);
    scene.add(fillLight);

    // Violet-Magenta Edge / Rim Light
    const rimLight = new THREE.DirectionalLight(0xc084fc, 3.0);
    rimLight.position.set(-2.5, 3.0, -2.5);
    scene.add(rimLight);

    // Point Light for Cyan Core Chest Glow
    const chestCoreLight = new THREE.PointLight(0x00f0ff, 1.8, 4.0);
    chestCoreLight.position.set(0, 1.25, 0.35);
    scene.add(chestCoreLight);
    chestCoreLightRef.current = chestCoreLight;

    // 6. Build Hinata 3D Android Girl (Concept Model Faithful Rig)
    const characterGroup = new THREE.Group();
    characterGroupRef.current = characterGroup;

    // --- PBR Materials matching Concept Art ---
    // Porcelain anime skin
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfef2f2,
      roughness: 0.36,
      metalness: 0.04,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
    });

    // Glossy White Android Bodysuit
    const whiteSuitMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.15,
      metalness: 0.12,
      clearcoat: 0.75,
      clearcoatRoughness: 0.1,
    });

    // Dark Charcoal / Slate Tech Panels (Hips & Underarms)
    const charcoalAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.28,
      metalness: 0.7,
    });

    // Radiant Gold Filigree & Armor Trim
    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.92,
    });

    // Vibrant Cyan Shoulder Armor & Energy Conduits
    const cyanArmorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.6,
    });

    // Glowing Cyan Core Emissive Crystal
    const cyanCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2,
      roughness: 0.08,
      metalness: 0.4,
    });

    // Silver-White Luminous Hair
    const silverHairMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.32,
      metalness: 0.2,
    });

    // Glowing Bright Blue Iris
    const eyeIrisMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x00a8e8,
      emissiveIntensity: 0.8,
      roughness: 0.12,
      metalness: 0.3,
    });

    // --- HEAD & FACE ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.56, 0);
    headGroupRef.current = headGroup;

    // Face geometry
    const headGeom = new THREE.SphereGeometry(0.23, 32, 28);
    headGeom.scale(1.0, 1.16, 0.96);
    const headMesh = new THREE.Mesh(headGeom, skinMaterial);
    headGroup.add(headMesh);

    // Large Anime Blue Eyes
    const eyeGeom = new THREE.SphereGeometry(0.046, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeom, eyeIrisMaterial);
    leftEye.position.set(-0.078, 0.03, 0.198);
    leftEye.scale.set(1.0, 1.3, 0.45);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, eyeIrisMaterial);
    rightEye.position.set(0.078, 0.03, 0.198);
    rightEye.scale.set(1.0, 1.3, 0.45);
    headGroup.add(rightEye);

    // Bright pupil reflections
    const pupilGeom = new THREE.SphereGeometry(0.016, 12, 12);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
    leftPupil.position.set(-0.068, 0.045, 0.22);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
    rightPupil.position.set(0.088, 0.045, 0.22);
    headGroup.add(rightPupil);

    // Blinking Eyelids (with delicate dark lashes)
    const eyelidGeom = new THREE.SphereGeometry(0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const leftEyelid = new THREE.Mesh(eyelidGeom, skinMaterial);
    leftEyelid.position.set(-0.078, 0.052, 0.202);
    leftEyelid.rotation.x = Math.PI;
    leftEyelid.scale.set(1.02, 0.01, 1.02);
    headGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;

    const rightEyelid = new THREE.Mesh(eyelidGeom, skinMaterial);
    rightEyelid.position.set(0.078, 0.052, 0.202);
    rightEyelid.rotation.x = Math.PI;
    rightEyelid.scale.set(1.02, 0.01, 1.02);
    headGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;

    // Expressive Lip-Sync Mouth
    const mouthGeom = new THREE.TorusGeometry(0.026, 0.007, 8, 16, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
    const mouthMesh = new THREE.Mesh(mouthGeom, mouthMat);
    mouthMesh.position.set(0, -0.11, 0.215);
    mouthMesh.rotation.x = Math.PI;
    headGroup.add(mouthMesh);
    mouthMeshRef.current = mouthMesh;

    // Golden Android Tiara / Headpiece (with 3 peaked gold crests & cyan jewel)
    const tiaraGroup = new THREE.Group();
    tiaraGroup.position.set(0, 0.21, 0.08);

    const tiaraBandGeom = new THREE.TorusGeometry(0.24, 0.015, 8, 32, Math.PI * 0.8);
    const tiaraBand = new THREE.Mesh(tiaraBandGeom, goldTrimMaterial);
    tiaraBand.rotation.x = Math.PI * 0.6;
    tiaraGroup.add(tiaraBand);

    // Tiara three peaks
    for (let p = -1; p <= 1; p++) {
      const peakGeom = new THREE.ConeGeometry(0.025, p === 0 ? 0.09 : 0.06, 4);
      const peakMesh = new THREE.Mesh(peakGeom, goldTrimMaterial);
      peakMesh.position.set(p * 0.08, p === 0 ? 0.08 : 0.05, 0.08);
      peakMesh.rotation.z = -p * 0.2;
      tiaraGroup.add(peakMesh);
    }

    // Cyan Forehead Jewel
    const tiaraJewelGeom = new THREE.OctahedronGeometry(0.024);
    const tiaraJewel = new THREE.Mesh(tiaraJewelGeom, cyanCoreMaterial);
    tiaraJewel.position.set(0, 0.02, 0.14);
    tiaraGroup.add(tiaraJewel);

    headGroup.add(tiaraGroup);

    // --- SILVER-WHITE HAIR ---
    // Scalp cap
    const hairCapGeom = new THREE.SphereGeometry(0.25, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.65);
    hairCapGeom.scale(1.05, 1.08, 1.05);
    const hairCap = new THREE.Mesh(hairCapGeom, silverHairMaterial);
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);

    // Front Anime Bangs (arched strands framing eyes)
    const bangGeom = new THREE.ConeGeometry(0.05, 0.28, 8);
    for (let b = -2; b <= 2; b++) {
      const bang = new THREE.Mesh(bangGeom, silverHairMaterial);
      bang.position.set(b * 0.06, 0.12, 0.21);
      bang.rotation.x = 0.2;
      bang.rotation.z = -b * 0.12;
      headGroup.add(bang);
    }

    // Long Side Locks
    const sideLockGeom = new THREE.ConeGeometry(0.055, 0.72, 8);
    const leftSideLock = new THREE.Mesh(sideLockGeom, silverHairMaterial);
    leftSideLock.position.set(-0.21, -0.22, 0.08);
    leftSideLock.rotation.z = -0.15;
    headGroup.add(leftSideLock);

    const rightSideLock = new THREE.Mesh(sideLockGeom, silverHairMaterial);
    rightSideLock.position.set(0.21, -0.22, 0.08);
    rightSideLock.rotation.z = 0.15;
    headGroup.add(rightSideLock);

    // High Ponytail (Rigged with secondary sway inertia)
    const ponytailGroup = new THREE.Group();
    ponytailGroup.position.set(0, 0.18, -0.19);
    ponytailGroupRef.current = ponytailGroup;

    // Ponytail gold hair tie
    const tieGeom = new THREE.TorusGeometry(0.055, 0.02, 8, 16);
    const tieMesh = new THREE.Mesh(tieGeom, goldTrimMaterial);
    ponytailGroup.add(tieMesh);

    // Cascade of ponytail hair locks
    const ponyTailGeom = new THREE.CylinderGeometry(0.06, 0.14, 0.85, 12);
    ponyTailGeom.scale(1.0, 1.0, 0.7);
    const ponytailMesh = new THREE.Mesh(ponyTailGeom, silverHairMaterial);
    ponytailMesh.position.set(0, -0.44, -0.08);
    ponytailMesh.rotation.x = 0.22;
    ponytailGroup.add(ponytailMesh);

    headGroup.add(ponytailGroup);
    characterGroup.add(headGroup);

    // --- NECK & TORSO ---
    const neckGeom = new THREE.CylinderGeometry(0.075, 0.09, 0.18, 16);
    const neckMesh = new THREE.Mesh(neckGeom, skinMaterial);
    neckMesh.position.set(0, 1.38, 0);
    characterGroup.add(neckMesh);

    // Futuristic White Bodysuit Torso
    const torsoGeom = new THREE.CylinderGeometry(0.185, 0.145, 0.52, 20);
    torsoGeom.scale(1.12, 1.0, 0.85);
    const torsoMesh = new THREE.Mesh(torsoGeom, whiteSuitMaterial);
    torsoMesh.position.set(0, 1.07, 0);
    characterGroup.add(torsoMesh);

    // Charcoal Hip & Side Accent Panels
    const hipPanelGeom = new THREE.BoxGeometry(0.38, 0.24, 0.19);
    const hipPanels = new THREE.Mesh(hipPanelGeom, charcoalAccentMaterial);
    hipPanels.position.set(0, 0.88, 0);
    characterGroup.add(hipPanels);

    // Glowing Cyan Chest Diamond Core (with Gold Filigree Frame)
    const chestCoreGroup = new THREE.Group();
    chestCoreGroup.position.set(0, 1.18, 0.155);

    // Gold diamond border
    const coreFrameGeom = new THREE.RingGeometry(0.035, 0.055, 4);
    const coreFrame = new THREE.Mesh(coreFrameGeom, goldTrimMaterial);
    coreFrame.rotation.z = Math.PI / 4;
    chestCoreGroup.add(coreFrame);

    // Glowing cyan star crystal
    const crystalGeom = new THREE.OctahedronGeometry(0.038);
    const crystalMesh = new THREE.Mesh(crystalGeom, cyanCoreMaterial);
    crystalMesh.scale.set(1.0, 1.3, 0.4);
    chestCoreGroup.add(crystalMesh);

    characterGroup.add(chestCoreGroup);

    // Gold Filigree Seam Lines on Bodysuit
    const seamGeom = new THREE.TorusGeometry(0.19, 0.008, 8, 32);
    const chestSeam = new THREE.Mesh(seamGeom, goldTrimMaterial);
    chestSeam.position.set(0, 1.12, 0.02);
    chestSeam.rotation.x = Math.PI / 2;
    characterGroup.add(chestSeam);

    // --- SHOULDERS & ARMS ---
    // Cyan Layered Shoulder Wing Guards (as seen in concept sheet)
    const makeShoulder = (isLeft: boolean) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(isLeft ? -0.26 : 0.26, 1.28, 0);

      // Base arm joint
      const jointGeom = new THREE.SphereGeometry(0.065, 16, 16);
      const jointMesh = new THREE.Mesh(jointGeom, charcoalAccentMaterial);
      shoulderGroup.add(jointMesh);

      // Wing flounces (cyan petal frills)
      const wingGeom = new THREE.ConeGeometry(0.12, 0.18, 6);
      wingGeom.scale(1.0, 0.4, 1.4);
      const wingMesh = new THREE.Mesh(wingGeom, cyanArmorMaterial);
      wingMesh.position.set(isLeft ? -0.06 : 0.06, 0.04, 0);
      wingMesh.rotation.z = isLeft ? 0.6 : -0.6;
      shoulderGroup.add(wingMesh);

      // Arm glowing sensor node
      const sensorGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12);
      const sensorMesh = new THREE.Mesh(sensorGeom, cyanCoreMaterial);
      sensorMesh.position.set(isLeft ? -0.065 : 0.065, -0.08, 0.02);
      sensorMesh.rotation.z = Math.PI / 2;
      shoulderGroup.add(sensorMesh);

      return shoulderGroup;
    };

    characterGroup.add(makeShoulder(true));
    characterGroup.add(makeShoulder(false));

    // Arms
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.26, 1.24, 0);
    const armUpperGeom = new THREE.CylinderGeometry(0.042, 0.038, 0.28, 12);
    const leftUpperArm = new THREE.Mesh(armUpperGeom, whiteSuitMaterial);
    leftUpperArm.position.set(0, -0.14, 0);
    leftArm.add(leftUpperArm);

    // Left Forearm + Gauntlet
    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.28, 0);
    const forearmGeom = new THREE.CylinderGeometry(0.038, 0.034, 0.26, 12);
    const leftForearmMesh = new THREE.Mesh(forearmGeom, whiteSuitMaterial);
    leftForearmMesh.position.set(0, -0.13, 0);
    leftForearm.add(leftForearmMesh);

    // Gold wrist cuff & black glove
    const cuffGeom = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
    const leftCuff = new THREE.Mesh(cuffGeom, goldTrimMaterial);
    leftCuff.position.set(0, -0.24, 0);
    leftCuff.rotation.x = Math.PI / 2;
    leftForearm.add(leftCuff);

    const handGeom = new THREE.BoxGeometry(0.05, 0.08, 0.025);
    const leftHand = new THREE.Mesh(handGeom, charcoalAccentMaterial);
    leftHand.position.set(0, -0.29, 0);
    leftForearm.add(leftHand);

    leftArm.add(leftForearm);
    characterGroup.add(leftArm);
    leftArmRef.current = leftArm;
    leftForearmRef.current = leftForearm;

    // Right Arm
    const rightArm = new THREE.Group();
    rightArm.position.set(0.26, 1.24, 0);
    const rightUpperArm = new THREE.Mesh(armUpperGeom, whiteSuitMaterial);
    rightUpperArm.position.set(0, -0.14, 0);
    rightArm.add(rightUpperArm);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.28, 0);
    const rightForearmMesh = new THREE.Mesh(forearmGeom, whiteSuitMaterial);
    rightForearmMesh.position.set(0, -0.13, 0);
    rightForearm.add(rightForearmMesh);

    const rightCuff = new THREE.Mesh(cuffGeom, goldTrimMaterial);
    rightCuff.position.set(0, -0.24, 0);
    rightCuff.rotation.x = Math.PI / 2;
    rightForearm.add(rightCuff);

    const rightHand = new THREE.Mesh(handGeom, charcoalAccentMaterial);
    rightHand.position.set(0, -0.29, 0);
    rightForearm.add(rightHand);

    rightArm.add(rightForearm);
    characterGroup.add(rightArm);
    rightArmRef.current = rightArm;
    rightForearmRef.current = rightForearm;

    // --- LEGS & HIGH-HEELED BOOTS ---
    const makeLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isLeft ? -0.12 : 0.12, 0.78, 0);

      // Thigh (white bodysuit)
      const thighGeom = new THREE.CylinderGeometry(0.075, 0.06, 0.44, 16);
      const thighMesh = new THREE.Mesh(thighGeom, whiteSuitMaterial);
      thighMesh.position.set(0, -0.22, 0);
      legGroup.add(thighMesh);

      // Cyan Knee Conduits
      const kneeGeom = new THREE.BoxGeometry(0.05, 0.06, 0.03);
      const kneeMesh = new THREE.Mesh(kneeGeom, cyanCoreMaterial);
      kneeMesh.position.set(0, -0.43, 0.06);
      legGroup.add(kneeMesh);

      // Calf / Shin
      const shinGeom = new THREE.CylinderGeometry(0.058, 0.048, 0.42, 16);
      const shinMesh = new THREE.Mesh(shinGeom, whiteSuitMaterial);
      shinMesh.position.set(0, -0.64, 0);
      legGroup.add(shinMesh);

      // Futuristic Android Boot (White + Gold Heels & Trim)
      const bootGroup = new THREE.Group();
      bootGroup.position.set(0, -0.85, 0);

      // Boot shaft
      const bootShaftGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.22, 14);
      const bootShaft = new THREE.Mesh(bootShaftGeom, whiteSuitMaterial);
      bootShaft.position.set(0, 0.08, 0);
      bootGroup.add(bootShaft);

      // Gold Ankle Cuff
      const ankleCuffGeom = new THREE.TorusGeometry(0.06, 0.012, 8, 16);
      const ankleCuff = new THREE.Mesh(ankleCuffGeom, goldTrimMaterial);
      ankleCuff.position.set(0, 0.12, 0);
      ankleCuff.rotation.x = Math.PI / 2;
      bootGroup.add(ankleCuff);

      // Cyan Ankle Gem
      const ankleGemGeom = new THREE.OctahedronGeometry(0.02);
      const ankleGem = new THREE.Mesh(ankleGemGeom, cyanCoreMaterial);
      ankleGem.position.set(isLeft ? -0.065 : 0.065, 0.12, 0);
      bootGroup.add(ankleGem);

      // Boot foot & toe
      const footGeom = new THREE.BoxGeometry(0.08, 0.06, 0.16);
      const footMesh = new THREE.Mesh(footGeom, whiteSuitMaterial);
      footMesh.position.set(0, -0.02, 0.04);
      bootGroup.add(footMesh);

      // High Heel (Gold)
      const heelGeom = new THREE.CylinderGeometry(0.015, 0.012, 0.09, 8);
      const heelMesh = new THREE.Mesh(heelGeom, goldTrimMaterial);
      heelMesh.position.set(0, -0.05, -0.03);
      bootGroup.add(heelMesh);

      legGroup.add(bootGroup);
      return legGroup;
    };

    characterGroup.add(makeLeg(true));
    characterGroup.add(makeLeg(false));

    // --- HOLOGRAPHIC ENERGY HALO & SPARKLE PARTICLES ---
    const haloGeom = new THREE.TorusGeometry(0.72, 0.022, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.65,
    });
    const haloDisk = new THREE.Mesh(haloGeom, haloMat);
    haloDisk.position.set(0, 0.15, 0);
    haloDisk.rotation.x = Math.PI / 2;
    characterGroup.add(haloDisk);
    haloDiskRef.current = haloDisk;

    // Ambient floating cyan/violet particles
    const particleCount = 45;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 1.8;
      particlePositions[i + 1] = Math.random() * 2.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 1.8;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(particleGeom, particleMat);
    characterGroup.add(sparks);
    sparksRef.current = sparks;

    scene.add(characterGroup);

    // 7. Kinetic Animation Loop (Breathing, Hair Sway, Blinking, Lip-Sync, Poses)
    let frameId = 0;
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    function renderLoop() {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Breathing motion on torso & character group
      if (characterGroupRef.current) {
        const breathing = Math.sin(time * 1.8) * 0.03;
        characterGroupRef.current.position.y = breathing;
      }

      // High ponytail dynamic secondary motion
      if (ponytailGroupRef.current) {
        const swayZ = Math.sin(time * 2.2) * 0.08;
        const swayX = Math.cos(time * 1.8) * 0.05;
        ponytailGroupRef.current.rotation.z = THREE.MathUtils.damp(ponytailGroupRef.current.rotation.z, swayZ, 4, delta);
        ponytailGroupRef.current.rotation.x = THREE.MathUtils.damp(ponytailGroupRef.current.rotation.x, 0.1 + swayX, 4, delta);
      }

      // Rotating base halo
      if (haloDiskRef.current) {
        haloDiskRef.current.rotation.z += 0.015;
      }

      // Sparkle particle drift
      if (sparksRef.current) {
        const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += delta * 0.2;
          if (positions[i] > 2.4) positions[i] = 0.1;
        }
        sparksRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Chest core point light pulsation
      if (chestCoreLightRef.current) {
        const pulse = isSpeaking ? 2.5 + Math.sin(time * 14) * 0.8 : isListening ? 2.2 + Math.sin(time * 6) * 0.5 : 1.6 + Math.sin(time * 2) * 0.3;
        chestCoreLightRef.current.intensity = pulse;
      }

      // Head tracking & gaze following pointer
      if (headGroupRef.current) {
        let targetRotY = pointerPos.current.x * 0.7;
        let targetRotX = -pointerPos.current.y * 0.5;

        if (pose === 'attentive') {
          targetRotX += 0.15; // Leaning forward attentively
        } else if (pose === 'thinking') {
          targetRotY += 0.2;
          targetRotX -= 0.18; // Glancing slightly up
        } else if (pose === 'joyful') {
          targetRotY += Math.sin(time * 4) * 0.1;
          targetRotX -= 0.1;
        }

        headGroupRef.current.rotation.y = THREE.MathUtils.damp(headGroupRef.current.rotation.y, targetRotY, 6, delta);
        headGroupRef.current.rotation.x = THREE.MathUtils.damp(headGroupRef.current.rotation.x, targetRotX, 6, delta);
      }

      // Blinking cycle (natural random interval)
      blinkTimer += delta;
      if (blinkTimer > 3.2) {
        isBlinking = true;
        if (blinkTimer > 3.38) {
          isBlinking = false;
          blinkTimer = (Math.random() - 0.5) * 1.5; // randomize next blink
        }
      }

      if (leftEyelidRef.current && rightEyelidRef.current) {
        const targetEyelidScale = isBlinking ? 1.0 : 0.01;
        leftEyelidRef.current.scale.y = THREE.MathUtils.damp(leftEyelidRef.current.scale.y, targetEyelidScale, 28, delta);
        rightEyelidRef.current.scale.y = THREE.MathUtils.damp(rightEyelidRef.current.scale.y, targetEyelidScale, 28, delta);
      }

      // Real-time lip synchronization with live audio intensity
      if (mouthMeshRef.current) {
        if (isSpeaking) {
          const liveIntensity = currentLipSyncIntensity.current;
          const dynamicMod = 0.28 + liveIntensity * 0.72 + Math.sin(time * 16) * 0.12;
          mouthMeshRef.current.scale.y = Math.max(0.18, Math.min(1.15, dynamicMod));
          mouthMeshRef.current.scale.x = 1.0 + liveIntensity * 0.3;
        } else {
          const defaultSmile = pose === 'joyful' || pose === 'greeting' ? 0.35 : 0.18;
          mouthMeshRef.current.scale.y = THREE.MathUtils.damp(mouthMeshRef.current.scale.y, defaultSmile, 12, delta);
          mouthMeshRef.current.scale.x = THREE.MathUtils.damp(mouthMeshRef.current.scale.x, 1.1, 12, delta);
        }
      }

      // Arm kinematics corresponding to current pose
      if (leftArmRef.current && rightArmRef.current && leftForearmRef.current && rightForearmRef.current) {
        let leftZ = 0.08;
        let rightZ = -0.08;
        let leftX = 0;
        let rightX = 0;
        let rightElbow = 0;
        let leftElbow = 0;

        if (pose === 'greeting') {
          // Right arm raised waving warmly
          rightZ = -0.6;
          rightX = -1.1;
          rightElbow = -1.2 + Math.sin(time * 6) * 0.3; // Waving hand
        } else if (pose === 'thinking') {
          // Right hand to chin
          rightZ = -0.4;
          rightX = -0.9;
          rightElbow = -1.5;
        } else if (pose === 'explaining' || isSpeaking) {
          // Open expressive gestures
          leftZ = 0.35 + Math.sin(time * 3.5) * 0.1;
          rightZ = -0.35 - Math.sin(time * 3.5) * 0.1;
          leftElbow = -0.4;
          rightElbow = -0.4;
        } else if (pose === 'joyful') {
          // Playful cheer pose
          leftZ = 0.7;
          rightZ = -0.7;
          leftX = -0.4;
          rightX = -0.4;
          leftElbow = -0.8;
          rightElbow = -0.8;
        }

        leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, leftZ, 5, delta);
        rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, rightZ, 5, delta);
        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, leftX, 5, delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, rightX, 5, delta);

        leftForearmRef.current.rotation.x = THREE.MathUtils.damp(leftForearmRef.current.rotation.x, leftElbow, 6, delta);
        rightForearmRef.current.rotation.x = THREE.MathUtils.damp(rightForearmRef.current.rotation.x, rightElbow, 6, delta);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    }

    frameId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [renderMode, pose, isListening, isSpeaking, isThinking]);

  return (
    <div
      onClick={onCharacterClick}
      className={`relative flex items-center justify-center select-none overflow-hidden ${
        onCharacterClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ height, minHeight: '350px' }}
      aria-label="HINATA 3D Character Viewport"
    >
      {/* Mode 1: Real-time 3D WebGL Canvas */}
      {renderMode === '3d' && webGlAvailable && (
        <div ref={mountRef} className="w-full h-full relative z-10" />
      )}

      {/* Mode 2: Lightweight Fallback for Low-End Devices & Mobile battery saving */}
      {renderMode === 'lite' && (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-2 animate-in fade-in">
          <div className="relative max-h-[380px] h-full aspect-[9/16] rounded-3xl overflow-hidden border border-violet-500/30 shadow-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black flex items-center justify-center">
            {/* Direct reference to the official 3D concept asset */}
            <img
              src="/public/assets/aistudio/3d-model_513c2772.png"
              alt="HINATA 3D Android Girl"
              className="w-full h-full object-cover object-top scale-105"
            />

            {/* Holographic Reactive Overlay Rings */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-violet-950/20 pointer-events-none" />

            {/* Speaking / Listening Energy Beacon */}
            {(isSpeaking || isListening) && (
              <div className="absolute inset-0 border-2 border-cyan-400/60 rounded-3xl animate-pulse pointer-events-none" />
            )}

            {/* Real-time Status Badge */}
            <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-violet-500/30 text-center">
              <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                HINATA • {pose.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Radial Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Engine & Fallback Controls Bar */}
      {showModeToggle && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-violet-500/30 text-[10px] font-mono text-slate-300 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                renderMode === '3d' ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="font-semibold text-slate-200">
              {renderMode === '3d' ? '3D WebGL (60 FPS)' : 'Lite 2D Mode'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRenderMode((prev) => (prev === '3d' ? 'lite' : '3d'));
            }}
            className="text-violet-300 hover:text-white transition-colors cursor-pointer underline underline-offset-2"
          >
            {renderMode === '3d' ? 'Switch to Lite' : 'Switch to 3D'}
          </button>
        </div>
      )}
    </div>
  );
};
