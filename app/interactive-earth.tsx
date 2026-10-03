'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import type { Language } from './content';
import { earthDestinations, pointInCountry, type EarthDestination, type EarthCountryGeometry } from '@/lib/earth-destinations';
import './interactive-earth.css';

type EarthProps = {
  lang: Language;
  selectedCode?: string;
  onSelect?: (code: string) => void;
  compact?: boolean;
  nightView?: boolean;
  destinations?: EarthDestination[];
};
type GlobeActions = { focus: (code: string) => void; zoom: (amount: number) => void; reset: () => void; pause: (paused: boolean) => void };
type CountryFeature = { properties: { code: string }; geometry: EarthCountryGeometry };

const copy = {
  en: { label: 'Explore your world', drag: 'Drag to explore · select a destination', loading: 'Preparing your world…', fallback: 'Explore destinations below. Interactive 3D is unavailable on this device.', universities: 'Universities in our catalogue', unavailable: 'University records are being verified', noUniversities: 'No university records published yet', fields: 'Fields in our catalogue', tuition: 'Verified tuition', explore: 'Explore destination', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset view', pause: 'Pause rotation', resume: 'Resume rotation', source: 'Imagery: NASA · boundaries: Natural Earth', geographic: 'Geographic overview; boundaries are illustrative.' },
  tr: { label: 'Dünyanı keşfet', drag: 'Keşfetmek için sürükle · bir ülke seç', loading: 'Dünyan hazırlanıyor…', fallback: 'Aşağıdaki ülkeleri keşfedin. Bu cihazda etkileşimli 3D kullanılamıyor.', universities: 'Kataloğumuzdaki üniversiteler', unavailable: 'Üniversite bilgileri doğrulanıyor', noUniversities: 'Henüz yayımlanmış üniversite yok', fields: 'Kataloğumuzdaki alanlar', tuition: 'Doğrulanmış öğrenim ücretleri', explore: 'Ülkeyi keşfet', zoomIn: 'Yakınlaştır', zoomOut: 'Uzaklaştır', reset: 'Görünümü sıfırla', pause: 'Dönüşü duraklat', resume: 'Dönüşü sürdür', source: 'Görüntüler: NASA · sınırlar: Natural Earth', geographic: 'Coğrafi genel görünüm; sınırlar gösterim amaçlıdır.' },
  fa: { label: 'دنیای خودت را کشف کن', drag: 'برای گردش بکشید · یک مقصد انتخاب کنید', loading: 'دنیای شما آماده می‌شود…', fallback: 'مقصدها را از فهرست زیر انتخاب کنید. نمایش سه‌بعدی تعاملی در این دستگاه در دسترس نیست.', universities: 'دانشگاه‌های موجود در فهرست ما', unavailable: 'اطلاعات دانشگاه‌ها در حال تأیید است', noUniversities: 'هنوز دانشگاهی منتشر نشده است', fields: 'رشته‌های موجود در فهرست ما', tuition: 'شهریهٔ تأییدشده', explore: 'کشف این مقصد', zoomIn: 'بزرگ‌نمایی', zoomOut: 'کوچک‌نمایی', reset: 'بازنشانی نما', pause: 'توقف چرخش', resume: 'ادامهٔ چرخش', source: 'تصاویر: ناسا · مرزها: Natural Earth', geographic: 'نمای جغرافیایی عمومی؛ مرزها برای نمایش هستند.' },
};

/** The globe never gates navigation: the same destinations remain keyboard-accessible. */
export default function InteractiveEarth({ lang, selectedCode, onSelect, compact = false, nightView = false, destinations = earthDestinations }: EarthProps) {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<GlobeActions | null>(null);
  const selectCallback = useRef(onSelect);
  const latestDestinations = useRef(destinations);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [localCode, setLocalCode] = useState(selectedCode ?? '');
  const [paused, setPaused] = useState(false);
  const activeCode = selectedCode ?? localCode;
  const activeRef = useRef(activeCode);
  const pausedRef = useRef(paused);
  selectCallback.current = onSelect;
  latestDestinations.current = destinations;
  activeRef.current = activeCode;
  pausedRef.current = paused;
  const c = copy[lang];
  const destinationSignature = destinations.map(d => `${d.code}:${d.lat}:${d.lng}`).join('|');
  const card = destinations.find(destination => destination.code === (hoveredCode ?? activeCode));

  function select(code: string) {
    setLocalCode(code);
    setHoveredCode(null);
    actions.current?.focus(code);
    selectCallback.current?.(code);
  }
  const chooseRef = useRef(select);
  chooseRef.current = select;

  useEffect(() => { if (selectedCode) actions.current?.focus(selectedCode); }, [selectedCode]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let release: (() => void) | undefined;
    let startObserver: IntersectionObserver | undefined;
    const abort = new AbortController();

    async function initialize() {
      if (disposed) return;
      try {
        const THREE = await import('three');
        if (disposed) return;
        const small = container!.clientWidth < 400 || navigator.hardwareConcurrency <= 4;
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reducedMotion = motionQuery.matches;
        let rotating = !pausedRef.current;
        let visible = true;
        let contextLost = false;
        let currentHover = '';
        let lastInteraction = 0;
        let lastFrame = 0;
        let slowFrames = 0;
        let pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75);
        let targetZoom = 3.55;
        let focusTarget: InstanceType<typeof THREE.Quaternion> | null = null;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !small, powerPreference: small ? 'low-power' : 'default' });
        renderer.setPixelRatio(pixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x070b14, 0);
        const canvas = renderer.domElement;
        canvas.setAttribute('aria-hidden', 'true');
        container!.appendChild(canvas);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
        camera.position.set(0, 0, targetZoom);
        const world = new THREE.Group();
        scene.add(world);
        const sphereGeometry = new THREE.SphereGeometry(1, small ? 48 : 80, small ? 32 : 56);
        sphereGeometry.rotateY(-Math.PI / 2);
        const dayUniform = { value: null as InstanceType<typeof THREE.Texture> | null };
        const nightUniform = { value: null as InstanceType<typeof THREE.Texture> | null };
        const material = new THREE.ShaderMaterial({
          uniforms: { dayMap: dayUniform, nightMap: nightUniform, lightDirection: { value: new THREE.Vector3(-0.5, 0.45, 1).normalize() }, texturesReady: { value: false }, nightView: { value: nightView } },
          vertexShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPosition;
            void main(){ vUv=uv; vNormal=normalize(mat3(modelMatrix)*normal); vec4 p=modelMatrix*vec4(position,1.0); vWorldPosition=p.xyz; gl_Position=projectionMatrix*viewMatrix*p; }`,
          fragmentShader: `uniform sampler2D dayMap; uniform sampler2D nightMap; uniform vec3 lightDirection; uniform bool texturesReady; uniform bool nightView; varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPosition;
            void main(){ vec3 n=normalize(vNormal); float light=dot(n,lightDirection); float day=smoothstep(-0.22,0.4,light); vec3 base=texturesReady?texture2D(dayMap,vUv).rgb:vec3(0.025,0.07,0.15); vec3 night=texturesReady?texture2D(nightMap,vUv).rgb:vec3(0.0); vec3 lit=base*(nightView?(0.015+day*0.025):(0.18+day*0.84)); lit+=night*(nightView?0.75:(1.0-day)*0.8); float rim=pow(1.0-max(dot(n,normalize(cameraPosition-vWorldPosition)),0.0),3.5); lit+=vec3(0.02,0.12,0.3)*rim; gl_FragColor=vec4(lit,1.0);
            #include <colorspace_fragment>
            }`,
        });
        const earth = new THREE.Mesh(sphereGeometry, material);
        world.add(earth);
        const glowMaterial = new THREE.ShaderMaterial({
          transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
          vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){ vNormal=normalize(mat3(modelMatrix)*normal); vec4 p=modelMatrix*vec4(position,1.0);vWorldPosition=p.xyz;gl_Position=projectionMatrix*viewMatrix*p; }`,
          fragmentShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){float facing=abs(dot(normalize(vNormal),normalize(cameraPosition-vWorldPosition)));float strength=pow(1.0-facing,3.0);gl_FragColor=vec4(0.14,0.34,0.78,strength*0.36);}`,
        });
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.055, small ? 40 : 64, small ? 28 : 40), glowMaterial);
        world.add(atmosphere);
        const geo = (lat: number, lng: number, radius = 1.018) => {
          const phi = lat * Math.PI / 180, theta = lng * Math.PI / 180;
          return new THREE.Vector3(Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)).multiplyScalar(radius);
        };
        const normalTo = new THREE.Vector3(0, 0, 1);
        const markers: InstanceType<typeof THREE.Mesh>[] = [];
        const rings: InstanceType<typeof THREE.Mesh>[] = [];
        const markerGeometry = new THREE.SphereGeometry(small ? 0.012 : 0.01, 12, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xc4dcff });
        const pulseGeometry = new THREE.RingGeometry(0.021, 0.024, 28);
        for (const destination of latestDestinations.current) {
          const point = geo(destination.lat, destination.lng, 1.025);
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(point);
          marker.userData.code = destination.code;
          world.add(marker);
          markers.push(marker);
          const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x6aafff, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(pulseGeometry, ringMaterial);
          ring.position.copy(point);
          ring.quaternion.setFromUnitVectors(normalTo, point.clone().normalize());
          ring.userData.code = destination.code;
          world.add(ring);
          rings.push(ring);
        }
        const routeOrigin = latestDestinations.current.find(d => d.code === 'TR') ?? latestDestinations.current[0];
        const travellers: { mesh: InstanceType<typeof THREE.Mesh>; points: InstanceType<typeof THREE.Vector3>[]; offset: number }[] = [];
        if (routeOrigin) {
          const a = geo(routeOrigin.lat, routeOrigin.lng, 1);
          const routeMaterial = new THREE.LineBasicMaterial({ color: 0x4c88db, transparent: true, opacity: 0.32, depthWrite: false });
          latestDestinations.current.filter(d => d.code !== routeOrigin.code).slice(0, small ? 3 : 6).forEach((destination, routeIndex) => {
            const b = geo(destination.lat, destination.lng, 1);
            const angle = a.angleTo(b);
            const points = Array.from({ length: 65 }, (_, i) => {
              const t = i / 64;
              const direction = angle < 0.0001 ? a.clone() : a.clone().multiplyScalar(Math.sin((1 - t) * angle) / Math.sin(angle)).add(b.clone().multiplyScalar(Math.sin(t * angle) / Math.sin(angle)));
              return direction.normalize().multiplyScalar(1.025 + Math.sin(Math.PI * t) * Math.min(0.28, angle * 0.23));
            });
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), routeMaterial);
            world.add(line);
            const traveller = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 6), new THREE.MeshBasicMaterial({ color: 0x96c4ff, transparent: true, opacity: 0.8 }));
            traveller.position.copy(points[0]);
            world.add(traveller);
            travellers.push({ mesh: traveller, points, offset: routeIndex * 0.13 });
          });
        }
        // A sparse fixed star field avoids textures, layout shifts, and costly postprocessing.
        const starPositions = new Float32Array((small ? 90 : 180) * 3);
        for (let i = 0; i < starPositions.length / 3; i++) {
          const longitude = i * 2.399963229728653;
          const y = 1 - (i + 0.5) * 2 / (starPositions.length / 3);
          const r = Math.sqrt(1 - y * y);
          starPositions[i * 3] = Math.cos(longitude) * r * 9;
          starPositions[i * 3 + 1] = y * 9;
          starPositions[i * 3 + 2] = Math.sin(longitude) * r * 9;
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x9bb9dc, size: 0.016, transparent: true, opacity: 0.42, sizeAttenuation: true })));

        let countryFeatures: CountryFeature[] = [];
        const countryOutlines = new Map<string, InstanceType<typeof THREE.Group>>();
        let highlight = activeRef.current;
        function setHighlight(code: string) {
          highlight = code;
          countryOutlines.forEach((group, groupCode) => group.traverse(object => {
            if (object instanceof THREE.Line) {
              const lineMaterial = object.material as InstanceType<typeof THREE.LineBasicMaterial>;
              lineMaterial.opacity = groupCode === code ? 0.9 : 0.12;
              lineMaterial.color.set(groupCode === code ? 0x9dccff : 0x628dba);
            }
          }));
          markers.forEach(marker => marker.scale.setScalar(marker.userData.code === code ? 1.5 : 1));
        }
        function focus(code: string) {
          const destination = latestDestinations.current.find(d => d.code === code);
          if (!destination) return;
          lastInteraction = performance.now();
          focusTarget = new THREE.Quaternion().setFromUnitVectors(geo(destination.lat, destination.lng, 1).normalize(), normalTo);
          targetZoom = compact ? 3.2 : 3.1;
          setHighlight(code);
          if (reducedMotion) { world.quaternion.copy(focusTarget); camera.position.z = targetZoom; focusTarget = null; }
          schedule();
        }
        const resize = () => {
          const width = container!.clientWidth, height = container!.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          schedule();
        };
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        function countryAt(event: PointerEvent) {
          const rect = canvas.getBoundingClientRect();
          pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObject(earth)[0];
          if (!hit) return '';
          const point = world.worldToLocal(hit.point.clone()).normalize();
          const lat = Math.asin(Math.max(-1, Math.min(1, point.y))) * 180 / Math.PI;
          const lng = Math.atan2(point.x, point.z) * 180 / Math.PI;
          const country = countryFeatures.find(feature => pointInCountry(lng, lat, feature.geometry));
          if (country && latestDestinations.current.some(d => d.code === country.properties.code)) return country.properties.code;
          // Visible destination nodes are also selectable at compact/mobile scale.
          const markerHit = raycaster.intersectObjects(markers)[0];
          if (markerHit && markerHit.distance <= hit.distance + 0.06) return String(markerHit.object.userData.code);
          let nearest = '', nearestDistance = small ? 0.075 : 0.045;
          for (const destination of latestDestinations.current) {
            const distance = point.distanceTo(geo(destination.lat, destination.lng, 1));
            if (distance < nearestDistance) { nearest = destination.code; nearestDistance = distance; }
          }
          return nearest;
        }
        let drag: { id: number; x: number; y: number; total: number } | null = null;
        const pointerDown = (event: PointerEvent) => {
          if (event.button !== 0) return;
          drag = { id: event.pointerId, x: event.clientX, y: event.clientY, total: 0 };
          canvas.setPointerCapture(event.pointerId);
          lastInteraction = performance.now();
          focusTarget = null;
          canvas.style.cursor = 'grabbing';
        };
        const pointerMove = (event: PointerEvent) => {
          if (drag && drag.id === event.pointerId) {
            const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
            drag.total += Math.abs(dx) + Math.abs(dy);
            drag.x = event.clientX; drag.y = event.clientY;
            world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.005));
            world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.005));
            lastInteraction = performance.now();
            schedule();
          } else if (event.pointerType !== 'touch') {
            const code = countryAt(event);
            if (code !== currentHover) {
              currentHover = code;
              setHoveredCode(code || null);
              setHighlight(code || activeRef.current);
              canvas.style.cursor = code ? 'pointer' : 'grab';
              schedule();
            }
          }
        };
        const pointerUp = (event: PointerEvent) => {
          if (!drag || drag.id !== event.pointerId) return;
          const click = drag.total < 8;
          drag = null;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
          canvas.style.cursor = 'grab';
          if (click) { const code = countryAt(event); if (code) chooseRef.current(code); }
        };
        const pointerCancel = () => { drag = null; canvas.style.cursor = 'grab'; };
        const pointerLeave = () => { if (!drag) { currentHover = ''; setHoveredCode(null); setHighlight(activeRef.current); schedule(); } };
        canvas.addEventListener('pointerdown', pointerDown);
        canvas.addEventListener('pointermove', pointerMove);
        canvas.addEventListener('pointerup', pointerUp);
        canvas.addEventListener('pointercancel', pointerCancel);
        canvas.addEventListener('pointerleave', pointerLeave);

        function draw(time: number) {
          if (disposed || contextLost || !visible || document.hidden) return;
          const elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
          if (lastFrame && time - lastFrame > 28) slowFrames++;
          else slowFrames = Math.max(0, slowFrames - 1);
          if (slowFrames > 90 && pixelRatio > 1) { pixelRatio = 1; renderer.setPixelRatio(1); slowFrames = 0; }
          lastFrame = time;
          if (focusTarget) {
            world.quaternion.slerp(focusTarget, Math.min(1, elapsed * 5));
            if (world.quaternion.angleTo(focusTarget) < 0.002) { world.quaternion.copy(focusTarget); focusTarget = null; }
          } else if (rotating && !reducedMotion && !drag && time - lastInteraction > 5000 && !currentHover) {
            world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), elapsed * 0.035));
          }
          camera.position.z += (targetZoom - camera.position.z) * Math.min(1, elapsed * 6);
          rings.forEach((ring, index) => {
            const pulse = reducedMotion || !rotating ? 0 : ((time / 2800 + index * 0.17) % 1);
            ring.scale.setScalar(1 + pulse * 1.15);
            (ring.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (1 - pulse) * (ring.userData.code === highlight ? 0.9 : 0.45);
          });
          travellers.forEach(({ mesh, points, offset }) => {
            const t = reducedMotion || !rotating ? offset : (time / 13000 + offset) % 1;
            const index = t * (points.length - 1), lower = Math.floor(index);
            mesh.position.copy(points[lower]).lerp(points[Math.min(lower + 1, points.length - 1)], index - lower);
          });
          renderer.render(scene, camera);
          if (reducedMotion && !focusTarget && Math.abs(targetZoom - camera.position.z) < 0.003) renderer.setAnimationLoop(null);
        }
        function schedule() {
          if (disposed || contextLost || !visible || document.hidden) { renderer.setAnimationLoop(null); lastFrame = 0; return; }
          renderer.setAnimationLoop(draw);
        }
        const visibility = () => { lastFrame = 0; schedule(); };
        document.addEventListener('visibilitychange', visibility);
        const renderObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; lastFrame = 0; schedule(); }, { rootMargin: '100px' });
        renderObserver.observe(container!);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container!);
        const changedMotion = (event: MediaQueryListEvent) => { reducedMotion = event.matches; schedule(); };
        motionQuery.addEventListener('change', changedMotion);
        const onContextLost = (event: Event) => { event.preventDefault(); contextLost = true; renderer.setAnimationLoop(null); if (!disposed) setStatus('fallback'); };
        canvas.addEventListener('webglcontextlost', onContextLost);
        actions.current = {
          focus,
          zoom(amount) { targetZoom = Math.max(2.5, Math.min(5, targetZoom + amount)); lastInteraction = performance.now(); schedule(); },
          pause(value) { rotating = !value; schedule(); },
          reset() { focusTarget = new THREE.Quaternion().setFromUnitVectors(geo(24, 26, 1), normalTo); targetZoom = 3.55; lastInteraction = performance.now(); schedule(); },
        };
        world.quaternion.setFromUnitVectors(geo(24, 26, 1), normalTo);
        if (activeRef.current) focus(activeRef.current);
        resize();
        setStatus('ready');

        release = () => {
          renderer.setAnimationLoop(null);
          actions.current = null;
          renderObserver.disconnect(); resizeObserver.disconnect();
          document.removeEventListener('visibilitychange', visibility);
          motionQuery.removeEventListener('change', changedMotion);
          canvas.removeEventListener('webglcontextlost', onContextLost);
          canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerCancel); canvas.removeEventListener('pointerleave', pointerLeave);
          const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
          const materials = new Set<InstanceType<typeof THREE.Material>>();
          scene.traverse(object => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
              geometries.add(object.geometry);
              for (const item of Array.isArray(object.material) ? object.material : [object.material]) materials.add(item);
            }
          });
          geometries.forEach(geometry => geometry.dispose()); materials.forEach(item => item.dispose());
          dayUniform.value?.dispose(); nightUniform.value?.dispose();
          renderer.dispose();
          canvas.remove();
        };
        const loader = new THREE.TextureLoader();
        void Promise.all([
          loader.loadAsync(`/images/earth/earth-day${small ? '-mobile' : ''}.webp`),
          loader.loadAsync(`/images/earth/earth-night${small ? '-mobile' : ''}.webp`),
        ]).then(([day, night]) => {
          if (disposed) { day.dispose(); night.dispose(); return; }
          day.colorSpace = THREE.SRGBColorSpace; night.colorSpace = THREE.SRGBColorSpace;
          day.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          dayUniform.value = day; nightUniform.value = night;
          material.uniforms.texturesReady.value = true;
          schedule();
        }).catch(() => { if (!disposed) { renderer.setAnimationLoop(null); setStatus('fallback'); } });
        void fetch('/images/earth/destinations.geojson', { signal: abort.signal }).then(response => {
          if (!response.ok) throw new Error('Country geometry unavailable');
          return response.json();
        }).then((unknownData) => {
            const data=unknownData as {features:CountryFeature[]};
          if (disposed) return;
          countryFeatures = data.features;
          for (const feature of countryFeatures) {
            const group = new THREE.Group();
            const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as number[][][]] : feature.geometry.coordinates as number[][][][];
            const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x628dba, transparent: true, opacity: 0.12, depthWrite: false });
            for (const polygon of polygons) for (const ring of polygon) {
              const points: InstanceType<typeof THREE.Vector3>[] = [];
              // Subdivide the coarsest edges so a line follows Earth's curved surface.
              for (let i = 0; i < ring.length; i++) {
                const start = ring[i], end = ring[(i + 1) % ring.length];
                let longitudeDelta = end[0] - start[0];
                if (longitudeDelta > 180) longitudeDelta -= 360;
                if (longitudeDelta < -180) longitudeDelta += 360;
                const count = Math.max(1, Math.ceil(Math.max(Math.abs(longitudeDelta), Math.abs(end[1] - start[1])) / 1.5));
                for (let step = 0; step < count; step++) points.push(geo(start[1] + (end[1] - start[1]) * step / count, start[0] + longitudeDelta * step / count, 1.004));
              }
              group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), outlineMaterial));
            }
            countryOutlines.set(feature.properties.code, group);
            world.add(group);
          }
          setHighlight(highlight); schedule();
        }).catch(() => { /* Destination nodes and accessible buttons remain functional. */ });
      } catch {
        release?.();
        if (!disposed) setStatus('fallback');
      }
    }
    // Heavy imports and textures are deferred until this globe approaches the viewport.
    startObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { startObserver?.disconnect(); void initialize(); }
    }, { rootMargin: '240px' });
    startObserver.observe(container);
    return () => { disposed = true; abort.abort(); startObserver?.disconnect(); release?.(); };
  }, [destinationSignature, compact, nightView]);

  return <section className={`creator-earth${compact ? ' creator-earth--compact' : ''}`} dir={lang === 'fa' ? 'rtl' : 'ltr'} aria-label={c.label}>
    <div className="creator-earth-stage">
      <div ref={host} className={`creator-earth-canvas creator-earth-canvas--${status}`} />
      <div className="creator-earth-orbit-label" aria-hidden="true"><span /> CREATOR WORLD</div>
      {status !== 'ready' && <p className="creator-earth-state" role="status">{status === 'loading' ? c.loading : c.fallback}</p>}
      <div className="creator-earth-controls" aria-label={c.label}>
        <button type="button" aria-label={c.zoomIn} title={c.zoomIn} onClick={() => actions.current?.zoom(-0.35)} disabled={status !== 'ready'}><Plus size={17} /></button>
        <button type="button" aria-label={c.zoomOut} title={c.zoomOut} onClick={() => actions.current?.zoom(0.35)} disabled={status !== 'ready'}><Minus size={17} /></button>
        <button type="button" aria-label={paused ? c.resume : c.pause} title={paused ? c.resume : c.pause} aria-pressed={paused} disabled={status !== 'ready'} onClick={() => { const value = !paused; setPaused(value); actions.current?.pause(value); }}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
        <button type="button" aria-label={c.reset} title={c.reset} onClick={() => actions.current?.reset()} disabled={status !== 'ready'}><RotateCcw size={15} /></button>
      </div>
      {card && <article className="creator-earth-card" aria-live="polite">
        <div className="creator-earth-card-title"><img src={`/flags/${card.code.toLowerCase()}.svg`} alt="" width="28" height="20" /><strong>{card.name[lang]}</strong><span>{card.code}</span></div>
        <p>{typeof card.universityCount === 'number' ? card.universityCount > 0 ? <><b>{card.universityCount.toLocaleString(lang === 'fa' ? 'fa-IR' : lang === 'tr' ? 'tr-TR' : 'en-US')}</b> {c.universities}</> : c.noUniversities : c.unavailable}</p>
        {!!card.popularFields?.length && <p className="creator-earth-card-fields">{card.popularFields.slice(0, 3).map(field => field[lang]).join(' · ')}</p>}
        {card.tuition && <p className="creator-earth-card-tuition">{c.tuition}: <b>{card.tuition.label[lang]}</b><a href={card.tuition.sourceUrl} target="_blank" rel="noopener noreferrer">{card.tuition.sourceTitle} · {card.tuition.verifiedAt}</a></p>}
        <a className="creator-earth-explore" href={`/${lang}/countries/${card.slug ?? card.code.toLowerCase()}`} onClick={() => { actions.current?.focus(card.code); selectCallback.current?.(card.code); }}>{c.explore}<ArrowUpRight size={16} /></a>
      </article>}
      <p className="creator-earth-hint">{c.drag}</p>
    </div>
    <div className="creator-earth-destinations" aria-label={c.label}>
      {destinations.map(destination => <button key={destination.code} type="button" aria-pressed={activeCode === destination.code} onClick={() => select(destination.code)} onFocus={() => { setHoveredCode(destination.code); }} onBlur={() => setHoveredCode(null)}>
        <img src={`/flags/${destination.code.toLowerCase()}.svg`} width="21" height="15" alt="" /><span>{destination.name[lang]}</span>
      </button>)}
    </div>
    <p className="creator-earth-credit"><a href="https://science.nasa.gov/earth/earth-observatory/" target="_blank" rel="noopener noreferrer">{c.source}</a><span>{c.geographic}</span></p>
  </section>;
}
