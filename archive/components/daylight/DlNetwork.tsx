"use client";

/* ============================================================
   /daylight — DlNetwork
   Text reveals + scroll-scrubbed canvas "growing dot network"
   (deterministic recreation of the original's Rive animation).
   ============================================================ */

import { useEffect, useRef } from "react";
import { gsap, useGSAP, DlButton, splitLinesMasked } from "./shared";
import { DL_DICT } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

type NwNode = {
  x: number;
  y: number;
  r: number;
  appearOrder: number;
  orange: boolean;
};
type NwEdge = { a: number; b: number; appear: number };

export function DlNetwork() {
  const { lang } = useLang();
  const n = DL_DICT[lang].network;

  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  /* ---- text reveals + scroll-scrubbed progress ---- */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const reveal = (targets: gsap.DOMTarget, trigger: Element) => {
        gsap.fromTo(
          targets,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger, start: "top 90%", once: true },
          },
        );
      };

      const surEl = root.querySelector(".dl-nw-sur");
      if (surEl) reveal(surEl.querySelectorAll(".dl-line"), surEl);
      const titleEl = root.querySelector(".dl-nw-title");
      if (titleEl) reveal(titleEl.querySelectorAll(".dl-line"), titleEl);
      const pEl = root.querySelector(".dl-nw-text");
      if (pEl) reveal(splitLinesMasked(pEl).lines, pEl);

      // Overshoot to 1.3 so the network completes before the section bottom.
      const obj = { p: 0 };
      gsap.to(obj, {
        p: 1.3,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top center", scrub: true },
        onUpdate: () => {
          progressRef.current = Math.min(1, obj.p);
        },
      });
    },
    { scope: rootRef },
  );

  /* ---- deterministic canvas network ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drift = !reduce;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const t0 = performance.now();

    let w = 1;
    let h = 1;
    let nodes: NwNode[] = [];
    let edges: NwEdge[] = [];

    const build = (bw: number, bh: number) => {
      // Seeded LCG — same layout every render for a given size.
      let s = 7;
      const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

      const N = 90;
      const cx = bw / 2;
      const cy = bh * 0.52;
      const minDim = Math.min(bw, bh);

      const nn: NwNode[] = [];
      for (let i = 0; i < N; i++) {
        const a = i * 2.399963; // golden angle
        const r = Math.sqrt((i + 0.5) / N) * minDim * 0.46;
        const jx = (rnd() * 2 - 1) * 10;
        const jy = (rnd() * 2 - 1) * 10;
        const x = cx + Math.cos(a) * r * 1.15 + jx;
        const y = cy + Math.sin(a) * r * 0.82 + jy;
        const baseR = 2.5 + rnd() * 2.5;
        const orange = i % 7 === 0;
        nn.push({
          x,
          y,
          r: orange ? baseR + 1.5 : baseR,
          appearOrder: i / N,
          orange,
        });
      }

      const ee: NwEdge[] = [];
      for (let i = 1; i < N; i++) {
        const count = 1 + (rnd() < 0.4 ? 1 : 0);
        const cand: { j: number; d: number }[] = [];
        for (let j = 0; j < i; j++) {
          const dx = nn[i].x - nn[j].x;
          const dy = nn[i].y - nn[j].y;
          cand.push({ j, d: dx * dx + dy * dy });
        }
        cand.sort((p, q) => p.d - q.d);
        const take = Math.min(count, cand.length);
        for (let k = 0; k < take; k++) {
          const j = cand[k].j;
          ee.push({
            a: i,
            b: j,
            appear: Math.max(nn[i].appearOrder, nn[j].appearOrder) + 0.02,
          });
        }
      }
      return { nodes: nn, edges: ee };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const built = build(w, h);
      nodes = built.nodes;
      edges = built.edges;
    };

    const render = (P: number, t: number) => {
      ctx.clearRect(0, 0, w, h);

      // edges (behind nodes)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(17,17,17,0.25)";
      for (let k = 0; k < edges.length; k++) {
        const e = edges[k];
        if (e.appear >= P) continue;
        let seg = (P - e.appear) / 0.08;
        seg = seg < 0 ? 0 : seg > 1 ? 1 : seg;
        const A = nodes[e.a];
        const B = nodes[e.b];
        const aDx = drift ? Math.sin(t * 0.6 + e.a) * 2 : 0;
        const aDy = drift ? Math.cos(t * 0.5 + e.a * 1.3) * 2 : 0;
        const bDx = drift ? Math.sin(t * 0.6 + e.b) * 2 : 0;
        const bDy = drift ? Math.cos(t * 0.5 + e.b * 1.3) * 2 : 0;
        const ax = A.x + aDx;
        const ay = A.y + aDy;
        const bx = B.x + bDx;
        const by = B.y + bDy;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (bx - ax) * seg, ay + (by - ay) * seg);
        ctx.stroke();
      }

      // nodes (on top)
      for (let i = 0; i < nodes.length; i++) {
        const nd = nodes[i];
        if (nd.appearOrder >= P) continue;
        let pop = (P - nd.appearOrder) / 0.06;
        pop = pop < 0 ? 0 : pop > 1 ? 1 : pop;
        pop = 1 - (1 - pop) * (1 - pop); // outQuad
        const dx = drift ? Math.sin(t * 0.6 + i) * 2 : 0;
        const dy = drift ? Math.cos(t * 0.5 + i * 1.3) * 2 : 0;
        ctx.beginPath();
        ctx.arc(nd.x + dx, nd.y + dy, Math.max(0, nd.r * pop), 0, Math.PI * 2);
        ctx.fillStyle = nd.orange ? "#F66F00" : "#111";
        ctx.fill();
      }
    };

    resize();

    const ro = new ResizeObserver(() => {
      resize();
      render(reduce ? 1 : progressRef.current, (performance.now() - t0) / 1000);
    });
    ro.observe(canvas);

    // Reduced motion → static, full progress, no idle drift, no rAF loop.
    if (reduce) {
      progressRef.current = 1;
      render(1, 0);
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    const loop = () => {
      render(progressRef.current, (performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    // Only run the rAF loop while the canvas is in view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!running) {
            running = true;
            raf = requestAnimationFrame(loop);
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className="pt-[140px] pb-[60px] lg:pt-[150px]">
      <div className="flex flex-col items-center gap-[24px] text-center text-[var(--dl-black)] dl-container lg:mb-[40px]">
        <small className="dl-nw-sur dl-mono dl-text-12">
          <span className="dl-line-mask">
            <span className="dl-line">{n.surtitle}</span>
          </span>
        </small>

        <h2 className="dl-nw-title dl-serif dl-text-40 lg:dl-text-85">
          <span className="dl-line-mask">
            <span className="dl-line">{n.titleLines[0]}</span>
          </span>
          <span className="dl-line-mask">
            <span className="dl-line">{n.titleLines[1]}</span>
          </span>
        </h2>

        <p className="dl-nw-text dl-text-14 lg:dl-text-20 mt-[24px] lg:mt-[36px] max-w-[calc(10*var(--column)+9*var(--gutter))]">
          {n.text}
        </p>

        <div className="mt-[36px]">
          <DlButton variant="primary" href="/final#booking">
            {n.cta}
          </DlButton>
        </div>

        <canvas
          ref={canvasRef}
          className="mx-auto mt-[40px] block h-[300px] w-full lg:h-[max(37.5rem,50vw)] lg:w-[calc(14*var(--column)+13*var(--gutter))]"
        />
      </div>
    </section>
  );
}
