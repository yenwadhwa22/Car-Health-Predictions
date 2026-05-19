import { useEffect } from 'react';
import * as THREE from 'three';

const CYAN = 0x00f5ff;
const BLUE = 0x0080ff;

function createWireBox(w, h, d, color = CYAN) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(geo);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
  geo.dispose();
  return lines;
}

function createWireTorus(radius, tube, color = CYAN) {
  const geo = new THREE.TorusGeometry(radius, tube, 8, 24);
  const edges = new THREE.EdgesGeometry(geo);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
  );
  geo.dispose();
  return lines;
}

function buildCarGroup() {
  const car = new THREE.Group();

  const body = createWireBox(4.2, 0.5, 2.0);
  body.position.set(0, 0, 0);
  car.add(body);

  const cabin = createWireBox(1.8, 0.7, 1.6, BLUE);
  cabin.position.set(-0.3, 0.55, 0);
  car.add(cabin);

  const roof = createWireBox(1.4, 0.35, 1.4);
  roof.position.set(-0.5, 1.05, 0);
  car.add(roof);

  const hood = createWireBox(1.2, 0.25, 1.8, BLUE);
  hood.position.set(1.4, 0.15, 0);
  car.add(hood);

  const trunk = createWireBox(0.9, 0.25, 1.8, BLUE);
  trunk.position.set(-1.8, 0.15, 0);
  car.add(trunk);

  const frontBumper = createWireBox(4.4, 0.15, 0.3);
  frontBumper.position.set(0, -0.15, 1.05);
  car.add(frontBumper);

  const rearBumper = createWireBox(4.4, 0.15, 0.3);
  rearBumper.position.set(0, -0.15, -1.05);
  car.add(rearBumper);

  const engine = createWireBox(0.65, 0.45, 0.85, BLUE);
  engine.position.set(1.15, 0.05, 0);
  car.add(engine);

  const engineDetail = createWireBox(0.35, 0.25, 0.5);
  engineDetail.position.set(1.35, 0.2, 0);
  car.add(engineDetail);

  const wheelPositions = [
    [-1.4, -0.28, 1.05],
    [1.4, -0.28, 1.05],
    [-1.4, -0.28, -1.05],
    [1.4, -0.28, -1.05],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = createWireTorus(0.42, 0.11);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(x, y, z);
    car.add(wheel);

    const rim = createWireTorus(0.22, 0.04, BLUE);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(x, y, z);
    car.add(rim);

    const archGeo = new THREE.TorusGeometry(0.52, 0.04, 4, 14, Math.PI);
    const archEdges = new THREE.EdgesGeometry(archGeo);
    const arch = new THREE.LineSegments(
      archEdges,
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.55 })
    );
    arch.rotation.x = Math.PI / 2;
    arch.rotation.z = z > 0 ? 0 : Math.PI;
    arch.position.set(x, 0.08, z);
    car.add(arch);
    archGeo.dispose();
  });

  return car;
}

export function useAuthCarScene(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020810);
    scene.fog = new THREE.FogExp2(0x020810, 0.08);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.2, 6.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const carGroup = buildCarGroup();
    carGroup.scale.setScalar(0.85);
    scene.add(carGroup);

    const grid = new THREE.GridHelper(14, 28, 0x0a1a2e, 0x041018);
    grid.position.y = -0.75;
    scene.add(grid);

    const scanGeo = new THREE.PlaneGeometry(0.04, 3.2);
    const scanMat = new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.y = Math.PI / 2;
    carGroup.add(scanPlane);

    const scanGlowGeo = new THREE.PlaneGeometry(0.12, 3.4);
    const scanGlow = new THREE.Mesh(
      scanGlowGeo,
      new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scanGlow.rotation.y = Math.PI / 2;
    scanPlane.add(scanGlow);

    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = Math.random() * 2.5 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: CYAN,
        size: 0.07,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const keyLight = new THREE.PointLight(CYAN, 1.4, 18);
    keyLight.position.set(4, 3, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(BLUE, 0.8, 18);
    fillLight.position.set(-4, 1, -3);
    scene.add(fillLight);

    const timeStart = performance.now() / 1000;
    let scanX = -2.4;
    let animationId = 0;

    const setSize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || canvas.clientWidth || 1;
      const height = parent?.clientHeight || canvas.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    setSize();

    const tick = () => {
      const t = performance.now() / 1000 - timeStart;

      carGroup.rotation.y = Math.sin(t * 0.35) * 0.18 + t * 0.06;
      carGroup.position.y = Math.sin(t * 0.9) * 0.07;

      scanX += 0.018;
      if (scanX > 2.4) scanX = -2.4;
      scanPlane.position.x = scanX;

      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        posAttr.array[ix] += velocities[ix];
        posAttr.array[ix + 1] += velocities[ix + 1];
        posAttr.array[ix + 2] += velocities[ix + 2];

        if (Math.abs(posAttr.array[ix]) > 3.5) velocities[ix] *= -1;
        if (posAttr.array[ix + 1] > 2.2 || posAttr.array[ix + 1] < -0.8) velocities[ix + 1] *= -1;
        if (Math.abs(posAttr.array[ix + 2]) > 2.8) velocities[ix + 2] *= -1;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(setSize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    window.addEventListener('resize', setSize);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', setSize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [canvasRef]);
}

export default useAuthCarScene;
