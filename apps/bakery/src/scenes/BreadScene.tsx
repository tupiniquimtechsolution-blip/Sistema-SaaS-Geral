/* ============================================================
   CENA 2/3/4 — Pão 3D + migalhas no scroll
   WebGL (three.js) com fallback estático elegante para
   reduced-motion ou dispositivos sem WebGL.
   Performance > efeito: DPR limitado, menos partículas no
   mobile, loop pausado fora da viewport.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { useApp } from "../core/store";
import { usePrefersReducedMotion } from "../core/utils";

/* ---------- ruído value-noise compacto (sem dependências) ---------- */
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return lerp(
    lerp(
      lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), u),
      lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u),
      v
    ),
    lerp(
      lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u),
      lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u),
      v
    ),
    w
  );
}
function fbm(x: number, y: number, z: number) {
  let a = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    a += amp * vnoise(x * f, y * f, z * f);
    amp *= 0.5;
    f *= 2.1;
  }
  return a;
}
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/* ---------- textura de casca (canvas → map + bumpMap) ---------- */
function makeCrustTexture(THREE: typeof import("three")) {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size * 0.72);
  grad.addColorStop(0, "#C98F55");
  grad.addColorStop(0.55, "#B27440");
  grad.addColorStop(1, "#7E4A24");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // speckles de casca
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = Math.random();
    g.fillStyle = r > 0.82 ? "rgba(62,32,14,0.22)" : r > 0.5 ? "rgba(224,166,96,0.16)" : "rgba(140,88,44,0.14)";
    g.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  // incisões (scoring) — sulcos mais escuros e alongados
  g.strokeStyle = "rgba(56,28,12,0.5)";
  g.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    g.lineWidth = 13 - i * 2;
    g.beginPath();
    const y0 = size * 0.3 + i * size * 0.17;
    g.moveTo(size * 0.22, y0 + 26);
    g.quadraticCurveTo(size * 0.5, y0 - 30, size * 0.78, y0 + 18);
    g.stroke();
    g.strokeStyle = "rgba(240,200,140,0.35)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(size * 0.22, y0 + 32);
    g.quadraticCurveTo(size * 0.5, y0 - 24, size * 0.78, y0 + 24);
    g.stroke();
    g.strokeStyle = "rgba(56,28,12,0.5)";
  }
  // farinha
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(248,240,222,${0.05 + Math.random() * 0.14})`;
    const x = Math.random() * size, y = Math.random() * size;
    g.beginPath();
    g.arc(x, y, Math.random() * 1.6, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function BreadScene() {
  const { business } = useApp();
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const landRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let THREE: typeof import("three");

      const start = async () => {
      THREE = await import("three");
      if (disposed) return;      const canvas = canvasRef.current;
      const outer = outerRef.current;
      if (!canvas || !outer) return;

      const isMobile = window.innerWidth < 820;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.7));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
      camera.position.set(0, 0.5, 7.4);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0x9c7a52, 1.35));
      const key = new THREE.DirectionalLight(0xffd9a3, 2.7);
      key.position.set(3.4, 4.6, 4.2);
      const rim = new THREE.DirectionalLight(0xff9d54, 1.5);
      rim.position.set(-4.2, 1.6, -3.6);
      const glow = new THREE.PointLight(0xffb066, 1.1, 24);
      glow.position.set(0, -2.4, 2.4);
      scene.add(key, rim, glow);

      /* ---- pão procedural ---- */
      const detail = isMobile ? 52 : 96;
      const geo = new THREE.SphereGeometry(1.12, detail, Math.round(detail * 0.72));
      const pos = geo.attributes.position;
      const tmp = { x: 0, y: 0, z: 0 };
      for (let i = 0; i < pos.count; i++) {
        tmp.x = pos.getX(i); tmp.y = pos.getY(i); tmp.z = pos.getZ(i);
        const len = Math.sqrt(tmp.x * tmp.x + tmp.y * tmp.y + tmp.z * tmp.z) || 1;
        const nx = tmp.x / len, ny = tmp.y / len, nz = tmp.z / len;
        const big = (fbm(nx * 1.7, ny * 1.7, nz * 1.7) - 0.5) * 0.34;
        const small = (fbm(nx * 6.2, ny * 6.2, nz * 6.2) - 0.5) * 0.1;
        const r = len * (1 + big + small);
        pos.setXYZ(i, nx * r * 1.22, ny * r * 0.7, nz * r);
      }
      geo.computeVertexNormals();
      const crust = makeCrustTexture(THREE);
      const breadMat = new THREE.MeshStandardMaterial({
        map: crust, bumpMap: crust, bumpScale: 1.1,
        roughness: 0.86, metalness: 0.02, color: 0xE0A662,
      });
      const bread = new THREE.Mesh(geo, breadMat);
      bread.rotation.z = 0.14;
      scene.add(bread);

      /* ---- migalhas ---- */
      const CRUMBS = isMobile ? 26 : 66;
      const crumbGeo = new THREE.DodecahedronGeometry(1, 0);
      const crumbMat = new THREE.MeshStandardMaterial({ color: 0xC89058, roughness: 1, metalness: 0 });
      const crumbs = new THREE.InstancedMesh(crumbGeo, crumbMat, CRUMBS);
      crumbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(crumbs);

      const seed = Array.from({ length: CRUMBS }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        radius: 1.5 + Math.random() * 2.2,
        y: -1.6 + Math.random() * 3.4,
        size: 0.016 + Math.random() * 0.055,
        speed: 0.12 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        tilt: Math.random() * Math.PI,
      }));
      const dummy = new THREE.Object3D();

      /* ---- scroll ---- */
      let progress = 0, smooth = 0, visible = true;
      const measure = () => {
        const r = outer.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        progress = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      };
      measure();

      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
      io.observe(outer);

      const resize = () => {
        const w = outer.clientWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("scroll", measure, { passive: true });

      const captions = [0.15, 0.5, 0.84];
      const clock = new THREE.Clock();

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible || disposed) return;
        const t = clock.getElapsedTime();
        smooth += (progress - smooth) * 0.075;
        const p = smooth;

        /* pão */
        const enter = sstep(0.02, 0.2, p);
        const land = sstep(0.82, 0.98, p);
        bread.rotation.y = t * 0.06 + p * Math.PI * 2.4;
        bread.rotation.x = Math.sin(p * Math.PI) * 0.3 - land * 0.1;
        bread.rotation.z = 0.14 + Math.sin(p * Math.PI * 1.5) * 0.08;
        bread.position.y = 2.05 - p * 2.75 + Math.sin(t * 0.9) * 0.06 * (1 - land);
        bread.position.x = Math.sin(p * Math.PI) * 0.22;
        const s = (0.28 + 0.72 * enter) * (1 - land * 0.06);
        bread.scale.setScalar(s);

        /* migalhas — desprendem, giram e caem com o scroll */
        for (let i = 0; i < CRUMBS; i++) {
          const c = seed[i];
          const burst = sstep(0.08, 0.5, p);
          const a = c.angle + t * c.speed * 0.4 + p * 2.2 * (i % 2 === 0 ? 1 : -1);
          const rad = c.radius * (0.55 + burst * 0.75) + Math.sin(t * 0.6 + c.phase) * 0.12;
          dummy.position.set(
            Math.cos(a) * rad,
            c.y - p * (2.2 + (i % 5) * 0.35) + Math.sin(t * 0.8 + c.phase) * 0.22,
            Math.sin(a) * rad * 0.72 - 0.6
          );
          dummy.rotation.set(c.tilt + t * c.speed, a, c.phase);
          const fade = burst * (1 - sstep(0.88, 1, p));
          dummy.scale.setScalar(c.size * (0.4 + fade));
          dummy.updateMatrix();
          crumbs.setMatrixAt(i, dummy.matrix);
        }
        crumbs.instanceMatrix.needsUpdate = true;

        /* câmera sutil */
        camera.position.x = Math.sin(p * Math.PI) * 0.3;
        camera.position.y = 0.5 - p * 0.5;
        camera.lookAt(0, bread.position.y * 0.35, 0);

        /* camadas de fundo (cenas: fachada → balcão → forno) */
        const layers = [
          1 - sstep(0.28, 0.5, p),
          sstep(0.28, 0.5, p) * (1 - sstep(0.58, 0.82, p)),
          sstep(0.58, 0.82, p),
        ];
        bgRefs.current.forEach((el, i) => {
          if (el) {
            el.style.opacity = String(layers[i] * 0.9);
            el.style.transform = `scale(${1.06 - p * 0.04 + i * 0.01}) translateY(${(p - 0.5) * -24}px)`;
          }
        });

        /* legendas */
        captionRefs.current.forEach((el, i) => {
          if (!el) return;
          const op = Math.max(0, 1 - Math.abs(p - captions[i]) / 0.13);
          el.style.opacity = String(op);
          el.style.transform = `translateY(${(1 - op) * 18}px)`;
        });
        if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
        if (phaseRef.current) phaseRef.current.textContent = `0${Math.min(3, Math.floor(p * 3) + 1)}`;
        if (landRef.current) {
          const op = sstep(0.92, 1, p);
          landRef.current.style.opacity = String(op);
          landRef.current.style.transform = `translate(-50%, -50%) scale(${0.86 + op * 0.1})`;
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      return () => {
        io.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", measure);
        geo.dispose();
        breadMat.dispose();
        crust.dispose();
        crumbGeo.dispose();
        crumbMat.dispose();
        renderer.dispose();
      };
    };

    let cleanup: (() => void) | void;
    start().then((c) => { cleanup = c; });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("webgl");
      if (ctx) {
        const ext = ctx.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    };
  }, []);

  const scenes = business.media.scenes;

  return (
    <section ref={outerRef} className="relative h-[290vh] md:h-[330vh]" aria-label="A jornada do pão">
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">
        {/* camadas de cenário */}
        {scenes.map((src, i) => (
          <div
            key={src + i}
            ref={(el) => { bgRefs.current[i] = el; }}
            className="absolute inset-0 transition-none"
            style={{ opacity: i === 0 ? 0.9 : 0 }}
          >
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(23,16,9,0.42)_0%,rgba(23,16,9,0.88)_78%)]" />
          </div>
        ))}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* trilho de progresso */}
        <div className="absolute right-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-paper/15 md:block">
          <div ref={railRef} className="origin-top w-full bg-accent" style={{ height: "100%", transform: "scaleY(0)" }} />
        </div>
        <div className="absolute right-9 top-1/2 hidden -translate-y-1/2 md:block">
          <span ref={phaseRef} className="font-display text-sm italic text-dim">01</span>
          <span className="text-xs text-dim/60"> / 03</span>
        </div>

        {/* legendas das cenas */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[14vh] flex justify-center px-6">
          <div ref={(el) => { captionRefs.current[0] = el; }} className="absolute max-w-xl text-center" style={{ opacity: 0 }}>
            <p className="font-display text-3xl italic leading-snug text-paper md:text-5xl">A massa descansa por 48 horas.</p>
          </div>
          <div ref={(el) => { captionRefs.current[1] = el; }} className="absolute max-w-xl text-center" style={{ opacity: 0 }}>
            <p className="font-display text-3xl italic leading-snug text-paper md:text-5xl">Assada em forno de lastro, no vapor.</p>
          </div>
          <div ref={(el) => { captionRefs.current[2] = el; }} className="absolute max-w-xl text-center" style={{ opacity: 0 }}>
            <p className="font-display text-3xl italic leading-snug text-paper md:text-5xl">Dourada por fora. Úmida por dentro.</p>
          </div>
        </div>

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.3em] text-dim/80">
          continue rolando
        </p>

        {/* pouso: o pão vira fotografia do primeiro produto */}
        <div
          ref={landRef}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[240px] md:w-[340px]"
          style={{ opacity: 0, transform: "translate(-50%, -50%) scale(0.86)" }}
        >
          <div className="overflow-hidden rounded-[var(--radius)] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)] ring-1 ring-paper/20">
            <img src={business.media.scenes[2]} alt="" className="aspect-square w-full object-cover" />
          </div>
          <p className="mt-4 text-center font-display text-2xl italic text-paper">Saiu do forno.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- fallback: composição estática elegante ---------- */
function StaticBread() {
  const { business } = useApp();
  return (
    <section className="relative overflow-hidden bg-bg py-28" aria-label="A jornada do pão">
      <img src={business.media.scenes[2]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(23,16,9,0.35)_0%,rgba(23,16,9,0.95)_80%)]" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-accent">A jornada do pão</p>
        <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl leading-tight text-paper md:text-6xl">
          48 horas de fermentação. <em className="text-accent">Um minuto</em> para o primeiro pedaço.
        </h2>
        <div className="relative mx-auto mt-14 w-64 md:w-80">
          <div className="overflow-hidden rounded-[var(--radius)] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)] ring-1 ring-paper/20">
            <img src={business.media.scenes[2]} alt="Sourdough da Fornalha saindo do forno" className="aspect-square w-full object-cover" loading="lazy" />
          </div>
          {["w-2 h-2 left-[-18px] top-10", "w-1.5 h-1.5 right-[-14px] top-24", "w-2.5 h-2.5 left-[-26px] bottom-16", "w-1.5 h-1.5 right-[-22px] bottom-8"].map((cls, i) => (
            <span key={i} className={`crumb-float absolute rounded-full bg-caramel ${cls}`} style={{ "--dur": `${5 + i}s` } as React.CSSProperties} />
          ))}
        </div>
        <p className="mt-10 font-display text-2xl italic text-dim">Saiu do forno.</p>
      </div>
    </section>
  );
}

export default function BreadExperience() {
  const reduced = usePrefersReducedMotion();
  const [canWebGL] = useState(() => supportsWebGL());
  if (reduced || !canWebGL) return <StaticBread />;
  return <BreadScene />;
}
