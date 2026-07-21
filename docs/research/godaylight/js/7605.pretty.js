"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [7605],
  {
    1907: (t, e, i) => {
      var s = i(7620),
        o =
          "function" == typeof Object.is
            ? Object.is
            : function (t, e) {
                return (
                  (t === e && (0 !== t || 1 / t == 1 / e)) || (t != t && e != e)
                );
              },
        n = s.useState,
        r = s.useEffect,
        l = s.useLayoutEffect,
        h = s.useDebugValue;
      function a(t) {
        var e = t.getSnapshot;
        t = t.value;
        try {
          var i = e();
          return !o(t, i);
        } catch (t) {
          return !0;
        }
      }
      var c =
        "undefined" == typeof window ||
        void 0 === window.document ||
        void 0 === window.document.createElement
          ? function (t, e) {
              return e();
            }
          : function (t, e) {
              var i = e(),
                s = n({ inst: { value: i, getSnapshot: e } }),
                o = s[0].inst,
                c = s[1];
              return (
                l(
                  function () {
                    ((o.value = i),
                      (o.getSnapshot = e),
                      a(o) && c({ inst: o }));
                  },
                  [t, i, e],
                ),
                r(
                  function () {
                    return (
                      a(o) && c({ inst: o }),
                      t(function () {
                        a(o) && c({ inst: o });
                      })
                    );
                  },
                  [t],
                ),
                h(i),
                i
              );
            };
      e.useSyncExternalStore =
        void 0 !== s.useSyncExternalStore ? s.useSyncExternalStore : c;
    },
    2097: (t, e, i) => {
      i.d(e, { x: () => o });
      let s = (t, e) => {
        let i = t instanceof Map ? t : new Map(t.entries()),
          s = e instanceof Map ? e : new Map(e.entries());
        if (i.size !== s.size) return !1;
        for (let [t, e] of i) if (!Object.is(e, s.get(t))) return !1;
        return !0;
      };
      function o(t, e) {
        if (Object.is(t, e)) return !0;
        if (
          "object" != typeof t ||
          null === t ||
          "object" != typeof e ||
          null === e
        )
          return !1;
        if (!(Symbol.iterator in t) || !(Symbol.iterator in e))
          return s(
            { entries: () => Object.entries(t) },
            { entries: () => Object.entries(e) },
          );
        if ("entries" in t && "entries" in e) return s(t, e);
        let i = t[Symbol.iterator](),
          o = e[Symbol.iterator](),
          n = i.next(),
          r = o.next();
        for (; !n.done && !r.done;) {
          if (!Object.is(n.value, r.value)) return !1;
          ((n = i.next()), (r = o.next()));
        }
        return !!n.done && !!r.done;
      }
    },
    3087: (t, e, i) => {
      i.d(e, { Wx: () => p, pL: () => u });
      var s = i(7620),
        o = Object.defineProperty,
        n = (t, e, i) =>
          ((t, e, i) =>
            e in t
              ? o(t, e, {
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                  value: i,
                })
              : (t[e] = i))(t, "symbol" != typeof e ? e + "" : e, i),
        r = new Map(),
        l = new WeakMap(),
        h = 0,
        a = void 0;
      function c(t, e) {
        let i =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
          s =
            arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : a;
        if (void 0 === window.IntersectionObserver && void 0 !== s) {
          let o = t.getBoundingClientRect();
          return (
            e(s, {
              isIntersecting: s,
              target: t,
              intersectionRatio:
                "number" == typeof i.threshold ? i.threshold : 0,
              time: 0,
              boundingClientRect: o,
              intersectionRect: o,
              rootBounds: o,
            }),
            () => {}
          );
        }
        let {
            id: o,
            observer: n,
            elements: c,
          } = (function (t) {
            let e = Object.keys(t)
                .sort()
                .filter((e) => void 0 !== t[e])
                .map((e) => {
                  var i;
                  return `${e}_${"root" === e ? (!(i = t.root) ? "0" : (l.has(i) || ((h += 1), l.set(i, h.toString())), l.get(i))) : t[e]}`;
                })
                .toString(),
              i = r.get(e);
            if (!i) {
              let s,
                o = new Map(),
                n = new IntersectionObserver((e) => {
                  e.forEach((e) => {
                    var i;
                    let n =
                      e.isIntersecting &&
                      s.some((t) => e.intersectionRatio >= t);
                    (t.trackVisibility &&
                      void 0 === e.isVisible &&
                      (e.isVisible = n),
                      null == (i = o.get(e.target)) ||
                        i.forEach((t) => {
                          t(n, e);
                        }));
                  });
                }, t);
              ((s =
                n.thresholds ||
                (Array.isArray(t.threshold)
                  ? t.threshold
                  : [t.threshold || 0])),
                (i = { id: e, observer: n, elements: o }),
                r.set(e, i));
            }
            return i;
          })(i),
          u = c.get(t) || [];
        return (
          c.has(t) || c.set(t, u),
          u.push(e),
          n.observe(t),
          function () {
            (u.splice(u.indexOf(e), 1),
              0 === u.length && (c.delete(t), n.unobserve(t)),
              0 === c.size && (n.disconnect(), r.delete(o)));
          }
        );
      }
      var u = class extends s.Component {
        constructor(t) {
          (super(t),
            n(this, "node", null),
            n(this, "_unobserveCb", null),
            n(this, "handleNode", (t) => {
              (this.node &&
                (this.unobserve(),
                t ||
                  this.props.triggerOnce ||
                  this.props.skip ||
                  this.setState({
                    inView: !!this.props.initialInView,
                    entry: void 0,
                  })),
                (this.node = t || null),
                this.observeNode());
            }),
            n(this, "handleChange", (t, e) => {
              (t && this.props.triggerOnce && this.unobserve(),
                "function" == typeof this.props.children &&
                  this.setState({ inView: t, entry: e }),
                this.props.onChange && this.props.onChange(t, e));
            }),
            (this.state = { inView: !!t.initialInView, entry: void 0 }));
        }
        componentDidMount() {
          (this.unobserve(), this.observeNode());
        }
        componentDidUpdate(t) {
          (t.rootMargin !== this.props.rootMargin ||
            t.root !== this.props.root ||
            t.threshold !== this.props.threshold ||
            t.skip !== this.props.skip ||
            t.trackVisibility !== this.props.trackVisibility ||
            t.delay !== this.props.delay) &&
            (this.unobserve(), this.observeNode());
        }
        componentWillUnmount() {
          this.unobserve();
        }
        observeNode() {
          if (!this.node || this.props.skip) return;
          let {
            threshold: t,
            root: e,
            rootMargin: i,
            trackVisibility: s,
            delay: o,
            fallbackInView: n,
          } = this.props;
          this._unobserveCb = c(
            this.node,
            this.handleChange,
            {
              threshold: t,
              root: e,
              rootMargin: i,
              trackVisibility: s,
              delay: o,
            },
            n,
          );
        }
        unobserve() {
          this._unobserveCb &&
            (this._unobserveCb(), (this._unobserveCb = null));
        }
        render() {
          let { children: t } = this.props;
          if ("function" == typeof t) {
            let { inView: e, entry: i } = this.state;
            return t({ inView: e, entry: i, ref: this.handleNode });
          }
          let {
            as: e,
            triggerOnce: i,
            threshold: o,
            root: n,
            rootMargin: r,
            onChange: l,
            skip: h,
            trackVisibility: a,
            delay: c,
            initialInView: u,
            fallbackInView: p,
            ...d
          } = this.props;
          return s.createElement(e || "div", { ref: this.handleNode, ...d }, t);
        }
      };
      function p() {
        var t;
        let {
            threshold: e,
            delay: i,
            trackVisibility: o,
            rootMargin: n,
            root: r,
            triggerOnce: l,
            skip: h,
            initialInView: a,
            fallbackInView: u,
            onChange: p,
          } = arguments.length > 0 && void 0 !== arguments[0]
            ? arguments[0]
            : {},
          [d, v] = s.useState(null),
          m = s.useRef(p),
          [f, g] = s.useState({ inView: !!a, entry: void 0 });
        ((m.current = p),
          s.useEffect(() => {
            let t;
            if (!h && d)
              return (
                (t = c(
                  d,
                  (e, i) => {
                    (g({ inView: e, entry: i }),
                      m.current && m.current(e, i),
                      i.isIntersecting && l && t && (t(), (t = void 0)));
                  },
                  {
                    root: r,
                    rootMargin: n,
                    threshold: e,
                    trackVisibility: o,
                    delay: i,
                  },
                  u,
                )),
                () => {
                  t && t();
                }
              );
          }, [Array.isArray(e) ? e.toString() : e, d, r, n, l, h, o, u, i]));
        let S = null == (t = f.entry) ? void 0 : t.target,
          w = s.useRef(void 0);
        d ||
          !S ||
          l ||
          h ||
          w.current === S ||
          ((w.current = S), g({ inView: !!a, entry: void 0 }));
        let y = [v, f.inView, f.entry];
        return ((y.ref = y[0]), (y.inView = y[1]), (y.entry = y[2]), y);
      }
    },
    3100: (t, e, i) => {
      t.exports = i(1907);
    },
    4509: (t, e, i) => {
      t.exports = i(9172);
    },
    9033: (t, e, i) => {
      function s(t, e, i) {
        return Math.max(t, Math.min(e, i));
      }
      i.d(e, { A: () => u });
      var o = class {
          isRunning = !1;
          value = 0;
          from = 0;
          to = 0;
          currentTime = 0;
          lerp;
          duration;
          easing;
          onUpdate;
          advance(t) {
            if (!this.isRunning) return;
            let e = !1;
            if (this.duration && this.easing) {
              this.currentTime += t;
              let i = s(0, this.currentTime / this.duration, 1),
                o = (e = i >= 1) ? 1 : this.easing(i);
              this.value = this.from + (this.to - this.from) * o;
            } else if (this.lerp) {
              var i, o, n, r;
              ((this.value =
                ((i = this.value),
                (o = this.to),
                (n = 60 * this.lerp),
                (1 - (r = 1 - Math.exp(-n * t))) * i + r * o)),
                Math.round(this.value) === this.to &&
                  ((this.value = this.to), (e = !0)));
            } else ((this.value = this.to), (e = !0));
            (e && this.stop(), this.onUpdate?.(this.value, e));
          }
          stop() {
            this.isRunning = !1;
          }
          fromTo(
            t,
            e,
            { lerp: i, duration: s, easing: o, onStart: n, onUpdate: r },
          ) {
            ((this.from = this.value = t),
              (this.to = e),
              (this.lerp = i),
              (this.duration = s),
              (this.easing = o),
              (this.currentTime = 0),
              (this.isRunning = !0),
              n?.(),
              (this.onUpdate = r));
          }
        },
        n = class {
          constructor(t, e, { autoResize: i = !0, debounce: s = 250 } = {}) {
            ((this.wrapper = t),
              (this.content = e),
              i &&
                ((this.debouncedResize = (function (t, e) {
                  let i;
                  return function (...s) {
                    let o = this;
                    (clearTimeout(i),
                      (i = setTimeout(() => {
                        ((i = void 0), t.apply(o, s));
                      }, e)));
                  };
                })(this.resize, s)),
                this.wrapper instanceof Window
                  ? window.addEventListener("resize", this.debouncedResize, !1)
                  : ((this.wrapperResizeObserver = new ResizeObserver(
                      this.debouncedResize,
                    )),
                    this.wrapperResizeObserver.observe(this.wrapper)),
                (this.contentResizeObserver = new ResizeObserver(
                  this.debouncedResize,
                )),
                this.contentResizeObserver.observe(this.content)),
              this.resize());
          }
          width = 0;
          height = 0;
          scrollHeight = 0;
          scrollWidth = 0;
          debouncedResize;
          wrapperResizeObserver;
          contentResizeObserver;
          destroy() {
            (this.wrapperResizeObserver?.disconnect(),
              this.contentResizeObserver?.disconnect(),
              this.wrapper === window &&
                this.debouncedResize &&
                window.removeEventListener("resize", this.debouncedResize, !1));
          }
          resize = () => {
            (this.onWrapperResize(), this.onContentResize());
          };
          onWrapperResize = () => {
            this.wrapper instanceof Window
              ? ((this.width = window.innerWidth),
                (this.height = window.innerHeight))
              : ((this.width = this.wrapper.clientWidth),
                (this.height = this.wrapper.clientHeight));
          };
          onContentResize = () => {
            this.wrapper instanceof Window
              ? ((this.scrollHeight = this.content.scrollHeight),
                (this.scrollWidth = this.content.scrollWidth))
              : ((this.scrollHeight = this.wrapper.scrollHeight),
                (this.scrollWidth = this.wrapper.scrollWidth));
          };
          get limit() {
            return {
              x: this.scrollWidth - this.width,
              y: this.scrollHeight - this.height,
            };
          }
        },
        r = class {
          events = {};
          emit(t, ...e) {
            let i = this.events[t] || [];
            for (let t = 0, s = i.length; t < s; t++) i[t]?.(...e);
          }
          on(t, e) {
            return (
              this.events[t]?.push(e) || (this.events[t] = [e]),
              () => {
                this.events[t] = this.events[t]?.filter((t) => e !== t);
              }
            );
          }
          off(t, e) {
            this.events[t] = this.events[t]?.filter((t) => e !== t);
          }
          destroy() {
            this.events = {};
          }
        },
        l = 100 / 6,
        h = { passive: !1 },
        a = class {
          constructor(t, e = { wheelMultiplier: 1, touchMultiplier: 1 }) {
            ((this.element = t),
              (this.options = e),
              window.addEventListener("resize", this.onWindowResize, !1),
              this.onWindowResize(),
              this.element.addEventListener("wheel", this.onWheel, h),
              this.element.addEventListener("touchstart", this.onTouchStart, h),
              this.element.addEventListener("touchmove", this.onTouchMove, h),
              this.element.addEventListener("touchend", this.onTouchEnd, h));
          }
          touchStart = { x: 0, y: 0 };
          lastDelta = { x: 0, y: 0 };
          window = { width: 0, height: 0 };
          emitter = new r();
          on(t, e) {
            return this.emitter.on(t, e);
          }
          destroy() {
            (this.emitter.destroy(),
              window.removeEventListener("resize", this.onWindowResize, !1),
              this.element.removeEventListener("wheel", this.onWheel, h),
              this.element.removeEventListener(
                "touchstart",
                this.onTouchStart,
                h,
              ),
              this.element.removeEventListener(
                "touchmove",
                this.onTouchMove,
                h,
              ),
              this.element.removeEventListener("touchend", this.onTouchEnd, h));
          }
          onTouchStart = (t) => {
            let { clientX: e, clientY: i } = t.targetTouches
              ? t.targetTouches[0]
              : t;
            ((this.touchStart.x = e),
              (this.touchStart.y = i),
              (this.lastDelta = { x: 0, y: 0 }),
              this.emitter.emit("scroll", { deltaX: 0, deltaY: 0, event: t }));
          };
          onTouchMove = (t) => {
            let { clientX: e, clientY: i } = t.targetTouches
                ? t.targetTouches[0]
                : t,
              s = -(e - this.touchStart.x) * this.options.touchMultiplier,
              o = -(i - this.touchStart.y) * this.options.touchMultiplier;
            ((this.touchStart.x = e),
              (this.touchStart.y = i),
              (this.lastDelta = { x: s, y: o }),
              this.emitter.emit("scroll", { deltaX: s, deltaY: o, event: t }));
          };
          onTouchEnd = (t) => {
            this.emitter.emit("scroll", {
              deltaX: this.lastDelta.x,
              deltaY: this.lastDelta.y,
              event: t,
            });
          };
          onWheel = (t) => {
            let { deltaX: e, deltaY: i, deltaMode: s } = t,
              o = 1 === s ? l : 2 === s ? this.window.width : 1,
              n = 1 === s ? l : 2 === s ? this.window.height : 1;
            ((e *= o),
              (i *= n),
              (e *= this.options.wheelMultiplier),
              (i *= this.options.wheelMultiplier),
              this.emitter.emit("scroll", { deltaX: e, deltaY: i, event: t }));
          };
          onWindowResize = () => {
            this.window = {
              width: window.innerWidth,
              height: window.innerHeight,
            };
          };
        },
        c = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        u = class {
          _isScrolling = !1;
          _isStopped = !1;
          _isLocked = !1;
          _preventNextNativeScrollEvent = !1;
          _resetVelocityTimeout = null;
          __rafID = null;
          isTouching;
          time = 0;
          userData = {};
          lastVelocity = 0;
          velocity = 0;
          direction = 0;
          options;
          targetScroll;
          animatedScroll;
          animate = new o();
          emitter = new r();
          dimensions;
          virtualScroll;
          constructor({
            wrapper: t = window,
            content: e = document.documentElement,
            eventsTarget: i = t,
            smoothWheel: s = !0,
            syncTouch: o = !1,
            syncTouchLerp: r = 0.075,
            touchInertiaMultiplier: l = 35,
            duration: h,
            easing: u,
            lerp: p = 0.1,
            infinite: d = !1,
            orientation: v = "vertical",
            gestureOrientation: m = "vertical",
            touchMultiplier: f = 1,
            wheelMultiplier: g = 1,
            autoResize: S = !0,
            prevent: w,
            virtualScroll: y,
            overscroll: b = !0,
            autoRaf: E = !1,
            anchors: z = !1,
            autoToggle: T = !1,
            allowNestedScroll: _ = !1,
            __experimental__naiveDimensions: N = !1,
          } = {}) {
            ((window.lenisVersion = "1.3.4"),
              (t && t !== document.documentElement) || (t = window),
              "number" == typeof h && "function" != typeof u
                ? (u = c)
                : "function" == typeof u && "number" != typeof h && (h = 1),
              (this.options = {
                wrapper: t,
                content: e,
                eventsTarget: i,
                smoothWheel: s,
                syncTouch: o,
                syncTouchLerp: r,
                touchInertiaMultiplier: l,
                duration: h,
                easing: u,
                lerp: p,
                infinite: d,
                gestureOrientation: m,
                orientation: v,
                touchMultiplier: f,
                wheelMultiplier: g,
                autoResize: S,
                prevent: w,
                virtualScroll: y,
                overscroll: b,
                autoRaf: E,
                anchors: z,
                autoToggle: T,
                allowNestedScroll: _,
                __experimental__naiveDimensions: N,
              }),
              (this.dimensions = new n(t, e, { autoResize: S })),
              this.updateClassName(),
              (this.targetScroll = this.animatedScroll = this.actualScroll),
              this.options.wrapper.addEventListener(
                "scroll",
                this.onNativeScroll,
                !1,
              ),
              this.options.wrapper.addEventListener(
                "scrollend",
                this.onScrollEnd,
                { capture: !0 },
              ),
              this.options.anchors &&
                this.options.wrapper === window &&
                this.options.wrapper.addEventListener(
                  "click",
                  this.onClick,
                  !1,
                ),
              this.options.wrapper.addEventListener(
                "pointerdown",
                this.onPointerDown,
                !1,
              ),
              (this.virtualScroll = new a(i, {
                touchMultiplier: f,
                wheelMultiplier: g,
              })),
              this.virtualScroll.on("scroll", this.onVirtualScroll),
              this.options.autoToggle &&
                this.rootElement.addEventListener(
                  "transitionend",
                  this.onTransitionEnd,
                  { passive: !0 },
                ),
              this.options.autoRaf &&
                (this.__rafID = requestAnimationFrame(this.raf)));
          }
          destroy() {
            (this.emitter.destroy(),
              this.options.wrapper.removeEventListener(
                "scroll",
                this.onNativeScroll,
                !1,
              ),
              this.options.wrapper.removeEventListener(
                "scrollend",
                this.onScrollEnd,
                { capture: !0 },
              ),
              this.options.wrapper.removeEventListener(
                "pointerdown",
                this.onPointerDown,
                !1,
              ),
              this.options.anchors &&
                this.options.wrapper === window &&
                this.options.wrapper.removeEventListener(
                  "click",
                  this.onClick,
                  !1,
                ),
              this.virtualScroll.destroy(),
              this.dimensions.destroy(),
              this.cleanUpClassName(),
              this.__rafID && cancelAnimationFrame(this.__rafID));
          }
          on(t, e) {
            return this.emitter.on(t, e);
          }
          off(t, e) {
            return this.emitter.off(t, e);
          }
          onScrollEnd = (t) => {
            t instanceof CustomEvent ||
              ("smooth" !== this.isScrolling && !1 !== this.isScrolling) ||
              t.stopPropagation();
          };
          dispatchScrollendEvent = () => {
            this.options.wrapper.dispatchEvent(
              new CustomEvent("scrollend", {
                bubbles: this.options.wrapper === window,
                detail: { lenisScrollEnd: !0 },
              }),
            );
          };
          onTransitionEnd = (t) => {
            if (t.propertyName.includes("overflow")) {
              let t = this.isHorizontal ? "overflow-x" : "overflow-y";
              ["hidden", "clip"].includes(getComputedStyle(this.rootElement)[t])
                ? this.stop()
                : this.start();
            }
          };
          setScroll(t) {
            this.isHorizontal
              ? this.options.wrapper.scrollTo({ left: t, behavior: "instant" })
              : this.options.wrapper.scrollTo({ top: t, behavior: "instant" });
          }
          onClick = (t) => {
            let e = t
              .composedPath()
              .find(
                (t) =>
                  t instanceof HTMLAnchorElement &&
                  (t.getAttribute("href")?.startsWith("#") ||
                    t.getAttribute("href")?.startsWith("/#") ||
                    t.getAttribute("href")?.startsWith("./#")),
              );
            if (e) {
              let t = e.getAttribute("href");
              if (t) {
                let e =
                    "object" == typeof this.options.anchors &&
                    this.options.anchors
                      ? this.options.anchors
                      : void 0,
                  i = `#${t.split("#")[1]}`;
                (["#", "/#", "./#", "#top", "/#top", "./#top"].includes(t) &&
                  (i = 0),
                  this.scrollTo(i, e));
              }
            }
          };
          onPointerDown = (t) => {
            1 === t.button && this.reset();
          };
          onVirtualScroll = (t) => {
            if (
              "function" == typeof this.options.virtualScroll &&
              !1 === this.options.virtualScroll(t)
            )
              return;
            let { deltaX: e, deltaY: i, event: s } = t;
            if (
              (this.emitter.emit("virtual-scroll", {
                deltaX: e,
                deltaY: i,
                event: s,
              }),
              s.ctrlKey || s.lenisStopPropagation)
            )
              return;
            let o = s.type.includes("touch"),
              n = s.type.includes("wheel");
            this.isTouching = "touchstart" === s.type || "touchmove" === s.type;
            let r = 0 === e && 0 === i;
            if (
              this.options.syncTouch &&
              o &&
              "touchstart" === s.type &&
              r &&
              !this.isStopped &&
              !this.isLocked
            )
              return void this.reset();
            let l =
              ("vertical" === this.options.gestureOrientation && 0 === i) ||
              ("horizontal" === this.options.gestureOrientation && 0 === e);
            if (r || l) return;
            let h = s.composedPath();
            h = h.slice(0, h.indexOf(this.rootElement));
            let a = this.options.prevent;
            if (
              h.find(
                (t) =>
                  t instanceof HTMLElement &&
                  (("function" == typeof a && a?.(t)) ||
                    t.hasAttribute?.("data-lenis-prevent") ||
                    (o && t.hasAttribute?.("data-lenis-prevent-touch")) ||
                    (n && t.hasAttribute?.("data-lenis-prevent-wheel")) ||
                    (this.options.allowNestedScroll &&
                      this.checkNestedScroll(t, { deltaX: e, deltaY: i }))),
              )
            )
              return;
            if (this.isStopped || this.isLocked) return void s.preventDefault();
            if (!(
              (this.options.syncTouch && o) ||
              (this.options.smoothWheel && n)
            )) {
              ((this.isScrolling = "native"),
                this.animate.stop(),
                (s.lenisStopPropagation = !0));
              return;
            }
            let c = i;
            ("both" === this.options.gestureOrientation
              ? (c = Math.abs(i) > Math.abs(e) ? i : e)
              : "horizontal" === this.options.gestureOrientation && (c = e),
              (!this.options.overscroll ||
                this.options.infinite ||
                (this.options.wrapper !== window &&
                  ((this.animatedScroll > 0 &&
                    this.animatedScroll < this.limit) ||
                    (0 === this.animatedScroll && i > 0) ||
                    (this.animatedScroll === this.limit && i < 0)))) &&
                (s.lenisStopPropagation = !0),
              s.preventDefault());
            let u = o && this.options.syncTouch,
              p = o && "touchend" === s.type && Math.abs(c) > 5;
            (p && (c = this.velocity * this.options.touchInertiaMultiplier),
              this.scrollTo(this.targetScroll + c, {
                programmatic: !1,
                ...(u
                  ? { lerp: p ? this.options.syncTouchLerp : 1 }
                  : {
                      lerp: this.options.lerp,
                      duration: this.options.duration,
                      easing: this.options.easing,
                    }),
              }));
          };
          resize() {
            (this.dimensions.resize(),
              (this.animatedScroll = this.targetScroll = this.actualScroll),
              this.emit());
          }
          emit() {
            this.emitter.emit("scroll", this);
          }
          onNativeScroll = () => {
            if (
              (null !== this._resetVelocityTimeout &&
                (clearTimeout(this._resetVelocityTimeout),
                (this._resetVelocityTimeout = null)),
              this._preventNextNativeScrollEvent)
            ) {
              this._preventNextNativeScrollEvent = !1;
              return;
            }
            if (!1 === this.isScrolling || "native" === this.isScrolling) {
              let t = this.animatedScroll;
              ((this.animatedScroll = this.targetScroll = this.actualScroll),
                (this.lastVelocity = this.velocity),
                (this.velocity = this.animatedScroll - t),
                (this.direction = Math.sign(this.animatedScroll - t)),
                this.isStopped || (this.isScrolling = "native"),
                this.emit(),
                0 !== this.velocity &&
                  (this._resetVelocityTimeout = setTimeout(() => {
                    ((this.lastVelocity = this.velocity),
                      (this.velocity = 0),
                      (this.isScrolling = !1),
                      this.emit());
                  }, 400)));
            }
          };
          reset() {
            ((this.isLocked = !1),
              (this.isScrolling = !1),
              (this.animatedScroll = this.targetScroll = this.actualScroll),
              (this.lastVelocity = this.velocity = 0),
              this.animate.stop());
          }
          start() {
            this.isStopped &&
              (this.reset(), (this.isStopped = !1), this.emit());
          }
          stop() {
            this.isStopped ||
              (this.reset(), (this.isStopped = !0), this.emit());
          }
          raf = (t) => {
            let e = t - (this.time || t);
            ((this.time = t),
              this.animate.advance(0.001 * e),
              this.options.autoRaf &&
                (this.__rafID = requestAnimationFrame(this.raf)));
          };
          scrollTo(
            t,
            {
              offset: e = 0,
              immediate: i = !1,
              lock: o = !1,
              duration: n = this.options.duration,
              easing: r = this.options.easing,
              lerp: l = this.options.lerp,
              onStart: h,
              onComplete: a,
              force: u = !1,
              programmatic: p = !0,
              userData: d,
            } = {},
          ) {
            if ((!this.isStopped && !this.isLocked) || u) {
              if ("string" == typeof t && ["top", "left", "start"].includes(t))
                t = 0;
              else if (
                "string" == typeof t &&
                ["bottom", "right", "end"].includes(t)
              )
                t = this.limit;
              else {
                let i;
                if (
                  ("string" == typeof t
                    ? (i = document.querySelector(t))
                    : t instanceof HTMLElement && t?.nodeType && (i = t),
                  i)
                ) {
                  if (this.options.wrapper !== window) {
                    let t = this.rootElement.getBoundingClientRect();
                    e -= this.isHorizontal ? t.left : t.top;
                  }
                  let s = i.getBoundingClientRect();
                  t =
                    (this.isHorizontal ? s.left : s.top) + this.animatedScroll;
                }
              }
              if ("number" == typeof t) {
                if (((t += e), (t = Math.round(t)), this.options.infinite)) {
                  if (p) {
                    this.targetScroll = this.animatedScroll = this.scroll;
                    let e = t - this.animatedScroll;
                    e > this.limit / 2
                      ? (t -= this.limit)
                      : e < -this.limit / 2 && (t += this.limit);
                  }
                } else t = s(0, t, this.limit);
                if (t === this.targetScroll) {
                  (h?.(this), a?.(this));
                  return;
                }
                if (((this.userData = d ?? {}), i)) {
                  ((this.animatedScroll = this.targetScroll = t),
                    this.setScroll(this.scroll),
                    this.reset(),
                    this.preventNextNativeScrollEvent(),
                    this.emit(),
                    a?.(this),
                    (this.userData = {}),
                    requestAnimationFrame(() => {
                      this.dispatchScrollendEvent();
                    }));
                  return;
                }
                (p || (this.targetScroll = t),
                  "number" == typeof n && "function" != typeof r
                    ? (r = c)
                    : "function" == typeof r && "number" != typeof n && (n = 1),
                  this.animate.fromTo(this.animatedScroll, t, {
                    duration: n,
                    easing: r,
                    lerp: l,
                    onStart: () => {
                      (o && (this.isLocked = !0),
                        (this.isScrolling = "smooth"),
                        h?.(this));
                    },
                    onUpdate: (t, e) => {
                      ((this.isScrolling = "smooth"),
                        (this.lastVelocity = this.velocity),
                        (this.velocity = t - this.animatedScroll),
                        (this.direction = Math.sign(this.velocity)),
                        (this.animatedScroll = t),
                        this.setScroll(this.scroll),
                        p && (this.targetScroll = t),
                        e || this.emit(),
                        e &&
                          (this.reset(),
                          this.emit(),
                          a?.(this),
                          (this.userData = {}),
                          requestAnimationFrame(() => {
                            this.dispatchScrollendEvent();
                          }),
                          this.preventNextNativeScrollEvent()));
                    },
                  }));
              }
            }
          }
          preventNextNativeScrollEvent() {
            ((this._preventNextNativeScrollEvent = !0),
              requestAnimationFrame(() => {
                this._preventNextNativeScrollEvent = !1;
              }));
          }
          checkNestedScroll(t, { deltaX: e, deltaY: i }) {
            let s,
              o,
              n,
              r,
              l,
              h,
              a,
              c,
              u,
              p,
              d,
              v,
              m,
              f,
              g = Date.now(),
              S = (t._lenis ??= {}),
              w = this.options.gestureOrientation;
            if (g - (S.time ?? 0) > 2e3) {
              S.time = Date.now();
              let e = window.getComputedStyle(t);
              S.computedStyle = e;
              let i = e.overflowX,
                u = e.overflowY;
              if (
                ((s = ["auto", "overlay", "scroll"].includes(i)),
                (o = ["auto", "overlay", "scroll"].includes(u)),
                (S.hasOverflowX = s),
                (S.hasOverflowY = o),
                (!s && !o) ||
                  ("vertical" === w && !o) ||
                  ("horizontal" === w && !s))
              )
                return !1;
              ((l = t.scrollWidth),
                (h = t.scrollHeight),
                (a = t.clientWidth),
                (c = t.clientHeight),
                (n = l > a),
                (r = h > c),
                (S.isScrollableX = n),
                (S.isScrollableY = r),
                (S.scrollWidth = l),
                (S.scrollHeight = h),
                (S.clientWidth = a),
                (S.clientHeight = c));
            } else
              ((n = S.isScrollableX),
                (r = S.isScrollableY),
                (s = S.hasOverflowX),
                (o = S.hasOverflowY),
                (l = S.scrollWidth),
                (h = S.scrollHeight),
                (a = S.clientWidth),
                (c = S.clientHeight));
            if (
              (!s && !o) ||
              (!n && !r) ||
              ("vertical" === w && (!o || !r)) ||
              ("horizontal" === w && (!s || !n)) ||
              ("horizontal" === w
                ? (u = "x")
                : "vertical" === w
                  ? (u = "y")
                  : (0 !== e && s && n && (u = "x"),
                    0 !== i && o && r && (u = "y")),
              !u)
            )
              return !1;
            if ("x" === u)
              ((p = t.scrollLeft), (d = l - a), (v = e), (m = s), (f = n));
            else {
              if ("y" !== u) return !1;
              ((p = t.scrollTop), (d = h - c), (v = i), (m = o), (f = r));
            }
            return (v > 0 ? p < d : p > 0) && m && f;
          }
          get rootElement() {
            return this.options.wrapper === window
              ? document.documentElement
              : this.options.wrapper;
          }
          get limit() {
            return this.options.__experimental__naiveDimensions
              ? this.isHorizontal
                ? this.rootElement.scrollWidth - this.rootElement.clientWidth
                : this.rootElement.scrollHeight - this.rootElement.clientHeight
              : this.dimensions.limit[this.isHorizontal ? "x" : "y"];
          }
          get isHorizontal() {
            return "horizontal" === this.options.orientation;
          }
          get actualScroll() {
            let t = this.options.wrapper;
            return this.isHorizontal
              ? (t.scrollX ?? t.scrollLeft)
              : (t.scrollY ?? t.scrollTop);
          }
          get scroll() {
            var t;
            return this.options.infinite
              ? ((this.animatedScroll % (t = this.limit)) + t) % t
              : this.animatedScroll;
          }
          get progress() {
            return 0 === this.limit ? 1 : this.scroll / this.limit;
          }
          get isScrolling() {
            return this._isScrolling;
          }
          set isScrolling(t) {
            this._isScrolling !== t &&
              ((this._isScrolling = t), this.updateClassName());
          }
          get isStopped() {
            return this._isStopped;
          }
          set isStopped(t) {
            this._isStopped !== t &&
              ((this._isStopped = t), this.updateClassName());
          }
          get isLocked() {
            return this._isLocked;
          }
          set isLocked(t) {
            this._isLocked !== t &&
              ((this._isLocked = t), this.updateClassName());
          }
          get isSmooth() {
            return "smooth" === this.isScrolling;
          }
          get className() {
            let t = "lenis";
            return (
              this.options.autoToggle && (t += " lenis-autoToggle"),
              this.isStopped && (t += " lenis-stopped"),
              this.isLocked && (t += " lenis-locked"),
              this.isScrolling && (t += " lenis-scrolling"),
              "smooth" === this.isScrolling && (t += " lenis-smooth"),
              t
            );
          }
          updateClassName() {
            (this.cleanUpClassName(),
              (this.rootElement.className =
                `${this.rootElement.className} ${this.className}`.trim()));
          }
          cleanUpClassName() {
            this.rootElement.className = this.rootElement.className
              .replace(/lenis(-\w+)?/g, "")
              .trim();
          }
        };
    },
    9172: (t, e, i) => {
      var s = i(7620),
        o = i(3100),
        n =
          "function" == typeof Object.is
            ? Object.is
            : function (t, e) {
                return (
                  (t === e && (0 !== t || 1 / t == 1 / e)) || (t != t && e != e)
                );
              },
        r = o.useSyncExternalStore,
        l = s.useRef,
        h = s.useEffect,
        a = s.useMemo,
        c = s.useDebugValue;
      e.useSyncExternalStoreWithSelector = function (t, e, i, s, o) {
        var u = l(null);
        if (null === u.current) {
          var p = { hasValue: !1, value: null };
          u.current = p;
        } else p = u.current;
        var d = r(
          t,
          (u = a(
            function () {
              function t(t) {
                if (!h) {
                  if (
                    ((h = !0), (r = t), (t = s(t)), void 0 !== o && p.hasValue)
                  ) {
                    var e = p.value;
                    if (o(e, t)) return (l = e);
                  }
                  return (l = t);
                }
                if (((e = l), n(r, t))) return e;
                var i = s(t);
                return void 0 !== o && o(e, i)
                  ? ((r = t), e)
                  : ((r = t), (l = i));
              }
              var r,
                l,
                h = !1,
                a = void 0 === i ? null : i;
              return [
                function () {
                  return t(e());
                },
                null === a
                  ? void 0
                  : function () {
                      return t(a());
                    },
              ];
            },
            [e, i, s, o],
          ))[0],
          u[1],
        );
        return (
          h(
            function () {
              ((p.hasValue = !0), (p.value = d));
            },
            [d],
          ),
          c(d),
          d
        );
      };
    },
    9363: (t, e, i) => {
      i.d(e, { h: () => h });
      var s = i(7620),
        o = i(4509);
      let n = (t) => {
          let e,
            i = new Set(),
            s = (t, s) => {
              let o = "function" == typeof t ? t(e) : t;
              if (!Object.is(o, e)) {
                let t = e;
                ((e = (null != s ? s : "object" != typeof o || null === o)
                  ? o
                  : Object.assign({}, e, o)),
                  i.forEach((i) => i(e, t)));
              }
            },
            o = () => e,
            n = {
              setState: s,
              getState: o,
              getInitialState: () => r,
              subscribe: (t) => (i.add(t), () => i.delete(t)),
            },
            r = (e = t(s, o, n));
          return n;
        },
        { useSyncExternalStoreWithSelector: r } = o,
        l = (t, e) => {
          let i = ((t) => (t ? n(t) : n))(t),
            o = (t, o = e) =>
              (function (t, e = (t) => t, i) {
                let o = r(t.subscribe, t.getState, t.getInitialState, e, i);
                return (s.useDebugValue(o), o);
              })(i, t, o);
          return (Object.assign(o, i), o);
        },
        h = (t, e) => (t ? l(t, e) : l);
    },
  },
]);
