window.addEventListener("DOMContentLoaded", async () => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);

  initFPSCounter();
  // initLoaderThreeSteps();

  initLenis();

  initNavPill();

  initNavTooltip();

  initGlobalParallax();

  initCSSMarquee();

  initTextAnimationMISSION();

  initCardsSliderABOUT()

  initTextAnimationTESTIMONY()

  initExperienceList();

  initSkillsTextFill();

  initMarqueeScrollDirection();

  initFooterParallax();

  initWorksCharAnimation();
});

let documentTitleStore = document.title;
const documentTitleOnBlur = "Come back! We miss you"; // Define your custom title here

// ── Works: slot-machine character reveal on project titles ──────────────────
// Each letter gets a 4-copy reel column (overflow:hidden clip).
// On ScrollTrigger entry: reel rolls from +25% → -75% (bottom→top),
// revealing the 4th copy with a staggered wave across all characters.
function initWorksCharAnimation() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".work-item__name").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", text);

    text.split(" ").forEach((word, wi) => {
      if (wi > 0) {
        // Word-space column
        const space = document.createElement("span");
        space.className = "work-item__char-wrap is-space";
        space.setAttribute("aria-hidden", "true");
        el.appendChild(space);
      }

      [...word].forEach((char) => {
        const wrap = document.createElement("span");
        wrap.className = "work-item__char-wrap";
        wrap.setAttribute("aria-hidden", "true");

        const inner = document.createElement("span");
        inner.className = "work-item__char-inner";
        // Start below the clip window so the char is invisible until animated
        gsap.set(inner, { y: "25%" });

        // 4 identical copies — the reel rolls through them creating tumbling depth
        for (let i = 0; i < 4; i++) {
          const span = document.createElement("span");
          span.textContent = char;
          inner.appendChild(span);
        }

        wrap.appendChild(inner);
        el.appendChild(wrap);
      });
    });

    const inners = el.querySelectorAll(".work-item__char-inner");
    const workItem = el.closest(".work-item");

    ScrollTrigger.create({
      trigger: workItem,
      start: "top 87%",
      onEnter: () => {
        gsap.to(inners, {
          y: "-75%",
          duration: 0.95,
          ease: "power4.out",
          stagger: { each: 0.028, from: "start" },
        });
      },
      onLeaveBack: () => {
        gsap.to(inners, {
          y: "25%",
          duration: 0.5,
          ease: "power3.in",
          stagger: { each: 0.015, from: "end" },
        });
      },
    });
  });
}

// Set original title if user is on the site
window.addEventListener("focus", () => {
  document.title = documentTitleStore;
});

// If user leaves tab, set the alternative title
window.addEventListener("blur", () => {
  document.title = documentTitleOnBlur;
});

function initLoaderThreeSteps() {
  var tl = gsap.timeline();
  // gsap.defaults({
  // ease: "Expo.easeInOut",
  // duration: 1.2
  // });

  const ease = "Expo.easeInOut";
  const duration = 1.2;

  /* Loading numbers */
  var randomNumbers1 = gsap.utils.random([2, 3, 4]);
  var randomNumbers2 = gsap.utils.random([5, 6]);
  var randomNumbers3 = gsap.utils.random([1, 5]);
  var randomNumbers4 = gsap.utils.random([7, 8, 9]);

  /* Loading Timeline */
  tl.set(".loading-screen", {
    display: "block",
  });

  tl.set(".loading__progress-inner", {
    scaleY: 0,
  });

  tl.set(
    ".loading__number-group.is--first .loading__number-wrap, .loading__percentage",
    {
      yPercent: 100,
    },
  );

  tl.set(
    ".loading__number-group.is--second .loading__number-wrap, .loading__number-group.is--third .loading__number-wrap",
    {
      yPercent: 10,
    },
  );

  tl.to(".loading__progress-inner", {
    scaleY: (randomNumbers1 + "" + randomNumbers3) / 100,
    ease,
    duration,
  });

  tl.to(
    ".loading__percentage",
    {
      yPercent: 0,
      ease,
      duration,
    },
    "<",
  );

  tl.to(
    ".loading__number-group.is--second .loading__number-wrap",
    {
      yPercent: (randomNumbers1 - 1) * -10,
      ease,
      duration,
    },
    "<",
  );

  tl.to(
    ".loading__number-group.is--third .loading__number-wrap",
    {
      yPercent: (randomNumbers3 - 1) * -10,
      ease,
      duration,
    },
    "<",
  );

  tl.to(".loading__progress-inner", {
    scaleY: (randomNumbers2 + "" + randomNumbers4) / 100,
    ease,
    duration,
  });

  tl.to(
    ".loading__number-group.is--second .loading__number-wrap",
    {
      yPercent: (randomNumbers2 - 1) * -10,
      ease,
      duration,
    },
    "<",
  );

  tl.to(
    ".loading__number-group.is--third .loading__number-wrap",
    {
      yPercent: (randomNumbers4 - 1) * -10,
      ease,
      duration,
    },
    "<",
  );

  tl.to(".loading__progress-inner", {
    scaleY: 1,
    ease,
    duration,
  });

  tl.to(
    ".loading__number-group.is--second .loading__number-wrap",
    {
      yPercent: -90,
      ease,
      duration,
    },
    "<",
  );

  tl.to(
    ".loading__number-group.is--third .loading__number-wrap",
    {
      yPercent: -90,
      ease,
      duration,
    },
    "<",
  );

  tl.to(
    ".loading__number-group.is--first .loading__number-wrap",
    {
      yPercent: 0,
      ease,
      duration,
    },
    "<",
  );

  // removing numbers
  // Remover os números e o símbolo de porcentagem
  // Remover os números e o símbolo de porcentagem
  tl.to(
    [
      ".loading__percentage",
      ".loading__number-group.is--third .loading__number-wrap",
      ".loading__number-group.is--second .loading__number-wrap",
      ".loading__number-group.is--first .loading__number-wrap",
    ],
    {
      yPercent: -200,
      duration: 0.5, // mais rápido!
      ease: "power3.inOut",
    },
  );

  tl.from(".rows_initial_loader", {
    xPercent: -100,
    stagger: 0.1,
    duration: 0.7,
    ease: "power4.inOut",
  });

  tl.to(".rows_initial_loader", {
    delay: 0.2,
    xPercent: 100,
    stagger: 0.1,
    duration: 0.7,
    ease: "power4.inOut",
    onStart: () => {
      document.querySelector(".loading__progress").style.display = "none";
      document.querySelector(".loading-container").style.backgroundColor =
        "transparent";
    },
    onComplete: () => {
      document.querySelector(".loading-container").style.display = "none";
    },
  });
}

function initFPSCounter() {
  const meter = document.createElement("div");
  meter.className = "fps-meter";
  meter.setAttribute("aria-hidden", "true");
  meter.innerHTML =
    '<span class="fps-meter__value">--</span><span class="fps-meter__label"> FPS</span>';
  document.body.appendChild(meter);

  const value = meter.querySelector(".fps-meter__value");
  const sampleDuration = 500;
  let frameCount = 0;
  let sampleStart = performance.now();

  function update(now) {
    frameCount += 1;
    const elapsed = now - sampleStart;

    if (elapsed >= sampleDuration) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      value.textContent = String(fps);
      meter.dataset.fpsState = fps >= 55 ? "good" : fps >= 45 ? "warn" : "bad";
      frameCount = 0;
      sampleStart = now;
    }

    requestAnimationFrame(update);
  }

  document.addEventListener("visibilitychange", () => {
    frameCount = 0;
    sampleStart = performance.now();
  });

  requestAnimationFrame(update);
}

function initNavPill() {
  const pill = document.getElementById("nav-pill");
  const menu = document.getElementById("nav-pill-menu");
  const inner = document.getElementById("nav-pill-inner");
  const indicator = document.getElementById("nav-pill-indicator");
  const trigger = document.getElementById("nav-pill-trigger");
  const links = Array.from(document.querySelectorAll(".nav-pill__link"));
  const langToggle = document.getElementById("lang-toggle");
  const animItems = langToggle ? [...links, langToggle] : links;

  if (!pill || !menu || !links.length) return;

  // Kerna uses @petit-kit/scoped spring physics (not cubic-bezier):
  // open: stiffness:200, damping:20 → ζ≈0.707 → ~5% overshoot
  // close: stiffness:300, damping:29 → ζ≈0.837 → fast snap, minimal overshoot
  const EASE_OUT = CustomEase.create("kernaOut", "0.22, 1, 0.36, 1"); // links stagger in
  const EASE_IN = CustomEase.create("kernaIn", "0.64, 0, 0.78, 0"); // links stagger out
  const EASE_SPRING = CustomEase.create("kernaSpring", "0.34, 1.05, 0.64, 1"); // open width: spring overshoot

  let isOpen = false;
  let expandedWidth = 0;

  function measureWidth() {
    gsap.set(menu, { width: "auto" });
    expandedWidth = menu.offsetWidth;
    gsap.set(menu, { width: 0 });
  }
  measureWidth();
  window.addEventListener("resize", measureWidth);
  window.addEventListener("orientationchange", () =>
    setTimeout(measureWidth, 100),
  );

  gsap.set(animItems, { opacity: 0, x: 10 });
  gsap.set(indicator, {
    opacity: 0,
    scale: 0,
    transformOrigin: "center center",
  });

  let indicatorRevealed = false;

  const triggerIcon = document.getElementById("nav-pill-icon");
  gsap.set(triggerIcon, { rotation: 0, transformOrigin: "center center" });

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    trigger.setAttribute("aria-expanded", "true");

    // Icon rotates 90° with bounce
    gsap.to(triggerIcon, {
      rotation: 90,
      duration: 0.55,
      ease: "back.out(1.8)",
    });

    // Width expands — spring open: slight overshoot then settles (ζ≈0.707)
    gsap.to(menu, { width: expandedWidth, duration: 0.45, ease: EASE_SPRING });

    // Links stagger in with slight delay so they trail the pill edge
    gsap.to(animItems, {
      opacity: 1,
      x: 0,
      duration: 0.35,
      stagger: 0.035,
      ease: EASE_OUT,
      delay: 0.06,
    });
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    trigger.setAttribute("aria-expanded", "false");

    // Icon bounces back to 0°
    gsap.to(triggerIcon, {
      rotation: 0,
      duration: 0.55,
      ease: "back.out(1.8)",
    });

    // Indicator out
    indicatorRevealed = false;
    gsap.to(indicator, {
      opacity: 0,
      scale: 0,
      duration: 0.15,
      ease: EASE_IN,
    });

    // Links stagger out first (reverse order), fast
    gsap.to(animItems, {
      opacity: 0,
      x: 10,
      duration: 0.18,
      stagger: { each: 0.025, from: "end" },
      ease: EASE_IN,
    });

    // Pill collapses after links start disappearing — snappy spring close (ζ≈0.837)
    gsap.to(menu, {
      width: 0,
      duration: 0.28,
      ease: "power2.out",
      delay: 0.04,
    });
  }

  // Indicator slides to hovered link — spring overshoot on position + width
  const indicatorTargets = langToggle ? [...links, langToggle] : links;
  indicatorTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      // Snap position first so the pop happens in the right place
      if (!indicatorRevealed) {
        indicatorRevealed = true;
        gsap.set(indicator, { left: el.offsetLeft, width: el.offsetWidth });
        // First reveal: zoom pop from scale 0 → 1 with bounce
        gsap.to(indicator, {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.8)",
        });
      } else {
        // Already visible: just slide to new position with spring
        gsap.to(indicator, {
          opacity: 1,
          scale: 1,
          duration: 0.18,
          ease: EASE_OUT,
        });
        gsap.to(indicator, {
          left: el.offsetLeft,
          width: el.offsetWidth,
          duration: 0.5,
          ease: "back.out(0.8)",
        });
      }
    });
  });

  // Fade indicator out when not over any link
  inner.addEventListener("mouseleave", () => {
    indicatorRevealed = false;
    gsap.to(indicator, {
      opacity: 0,
      scale: 0,
      duration: 0.2,
      ease: "power2.in",
    });
  });

  const isMobile = () => window.innerWidth <= 768;

  // Desktop: hover opens/closes — close has a short delay to bridge the gap
  // between the trigger and menu so crossing it quickly doesn't flicker
  let closeTimer = null;

  pill.addEventListener("mouseenter", () => {
    if (isMobile()) return;
    clearTimeout(closeTimer);
    openMenu();
  });

  pill.addEventListener("mouseleave", () => {
    if (isMobile()) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeMenu(), 120);
  });

  // Also cancel close if mouse enters the menu itself (floating over logo)
  menu.addEventListener("mouseenter", () => clearTimeout(closeTimer));
  menu.addEventListener("mouseleave", () => {
    if (isMobile()) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeMenu(), 120);
  });

  // Mobile: tap trigger to toggle
  trigger.addEventListener("click", () => {
    if (isMobile()) isOpen ? closeMenu() : openMenu();
  });

  // Smooth scroll on link click
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target && typeof lenis !== "undefined") {
        lenis.scrollTo(target, { duration: 1.4 });
      } else if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      closeMenu();
    });
  });
}

function initLenis() {
  lenis = new Lenis({
    lerp: 0.06,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Smooth scroll for all anchor hash links not handled by nav pill
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    if (anchor.closest("#nav-pill")) return; // nav pill handles its own
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    });
  });
}

function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)",
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document
          .querySelectorAll('[data-parallax="trigger"]')
          .forEach((trigger) => {
            // Check if this trigger has to be disabled on smaller breakpoints
            const disable = trigger.getAttribute("data-parallax-disable");
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) {
              return;
            }
            // Optional: you can target an element inside a trigger if necessary
            const target =
              trigger.querySelector('[data-parallax="target"]') || trigger;

            // Get the direction value to decide between xPercent or yPercent tween
            const direction =
              trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";
            // Get the scrub value, our default is 'true' because that feels nice with Lenis
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;
            // Get the start position in %
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;
            // Get the end position in %
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;
            // Get the start value of the ScrollTrigger
            const scrollStartRaw =
              trigger.getAttribute("data-parallax-scroll-start") ||
              "top bottom";
            const scrollStart = `clamp(${scrollStartRaw})`;
            // Get the end value of the ScrollTrigger
            const scrollEndRaw =
              trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            const scrollEnd = `clamp(${scrollEndRaw})`;

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              },
            );
          });
      });

      return () => ctx.revert();
    },
  );
}

function initCSSMarquee() {
  const pixelsPerSecond = 200; // Set the marquee speed (pixels per second)
  // Only initialize marquees that haven't been processed yet
  const marquees = document.querySelectorAll(
    "[data-css-marquee]:not([data-css-marquee-initialized])",
  );

  if (!marquees.length) return;
  // Duplicate each [data-css-marquee-list] element inside its container
  marquees.forEach((marquee) => {
    marquee.setAttribute("data-css-marquee-initialized", "true");
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      const originalItems = Array.from(list.children);
      let guard = 0;

      while (
        originalItems.length &&
        list.offsetWidth < marquee.offsetWidth * 1.5 &&
        guard < 8
      ) {
        const fragment = document.createDocumentFragment();
        originalItems.forEach((item) => {
          fragment.appendChild(item.cloneNode(true));
        });
        list.appendChild(fragment);
        guard += 1;
      }

      const duplicate = list.cloneNode(true);
      marquee.appendChild(duplicate);
    });
  });

  // Create an IntersectionObserver to check if the marquee container is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target
          .querySelectorAll("[data-css-marquee-list]")
          .forEach(
            (list) =>
              (list.style.animationPlayState = entry.isIntersecting
                ? "running"
                : "paused"),
          );
      });
    },
    { threshold: 0 },
  );
  // Calculate the width and set the animation duration accordingly
  marquees.forEach((marquee) => {
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      list.style.animationDuration = list.offsetWidth / pixelsPerSecond + "s";
      list.style.animationPlayState = "paused";
    });
    observer.observe(marquee);
  });
}

function initMarqueeScrollDirection() {
  const marqueeTweens = new Map();
  const visibleMarquees = new Set();
  const syncMarqueePhase = (tween) => {
    const elapsed = (performance.now() - tween.marqueeStartTime) / 1000;
    tween.totalTime(tween.duration() * 0.5 + elapsed);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const tween = marqueeTweens.get(entry.target);
        if (!tween) return;

        if (entry.isIntersecting) {
          visibleMarquees.add(entry.target);
          entry.target.classList.add("is-marquee-active");
          if (!document.hidden) {
            syncMarqueePhase(tween);
            tween.play();
          }
        } else {
          visibleMarquees.delete(entry.target);
          entry.target.classList.remove("is-marquee-active");
          tween.pause();
        }
      });
    },
    { rootMargin: "25% 0px", threshold: 0 },
  );

  document
    .querySelectorAll(
      "[data-marquee-scroll-direction-target]:not([data-marquee-initialized])",
    )
    .forEach((marquee) => {
      const marqueeContent = marquee.querySelector(
        "[data-marquee-collection-target]",
      );
      const marqueeScroll = marquee.querySelector(
        "[data-marquee-scroll-target]",
      );
      if (!marqueeContent || !marqueeScroll) return;

      marquee.setAttribute("data-marquee-initialized", "true");

      const {
        marqueeSpeed: speed,
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
      } = marquee.dataset;

      const marqueeSpeedAttr = parseFloat(speed) || 15;
      const marqueeDirectionAttr = direction === "right" ? 1 : -1;
      const duplicateAmount = parseInt(duplicate || 0, 10);
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

      const marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier;

      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }

      const marqueeItems = marquee.querySelectorAll(
        "[data-marquee-collection-target]",
      );

      const tween = gsap
        .fromTo(
          marqueeItems,
          {
            xPercent: marqueeDirectionAttr === 1 ? -100 : 0,
          },
          {
            xPercent: marqueeDirectionAttr === 1 ? 0 : -100,
            repeat: -1,
            duration: marqueeSpeed,
            ease: "linear",
            paused: true,
          },
        )
        .totalProgress(0.5);

      tween.marqueeStartTime = performance.now();
      marqueeTweens.set(marquee, tween);
      observer.observe(marquee);
      marquee.setAttribute("data-marquee-status", "normal");
    });

  document.addEventListener("visibilitychange", () => {
    marqueeTweens.forEach((tween, marquee) => {
      if (document.hidden || !visibleMarquees.has(marquee)) {
        tween.pause();
      } else {
        syncMarqueePhase(tween);
        tween.play();
      }
    });
  });
}

function initExperienceList() {
  const items = document.querySelectorAll(".experience-item");
  if (!items.length) return;

  // Exact SVG path definitions from Annnimate source
  const paths = {
    fromTop: {
      start: "M 0 100 V 0 Q 50 0 100 0 V 0 H 0 z",
      end: "M 0 100 V 100 Q 50 125 100 100 V 0 H 0 z",
    },
    fromBottom: {
      start: "M 0 100 V 100 Q 75 50 100 100 V 100 z",
      end: "M 0 100 V 0 Q 50 0 100 0 V 100 z",
    },
    toTop: {
      start: "M 0 100 V 100 Q 50 50 100 100 V 0 H 0 z",
      end: "M 0 100 V 0 Q 50 0 100 0 V 0 H 0 z",
    },
    toBottom: {
      start: "M 0 100 V 0 Q 50 50 100 0 V 100 z",
      end: "M 0 100 V 100 Q 50 100 100 100 V 100 z",
    },
  };

  const getDir = (e, item) => {
    const rect = item.getBoundingClientRect();
    const edges = {
      top: Math.abs(rect.top - e.clientY),
      bottom: Math.abs(rect.bottom - e.clientY),
    };
    return Object.keys(edges).find(
      (k) => edges[k] === Math.min(...Object.values(edges)),
    );
  };

  items.forEach((item) => {
    const pathEl = item.querySelector(".experience-item__path");
    const arrow = item.querySelector(".exp-arrow");
    if (!pathEl) return;

    if (arrow) gsap.set(arrow, { opacity: 0, x: -4, y: 4 });

    item.addEventListener("mouseenter", (e) => {
      const def = getDir(e, item) === "top" ? paths.fromTop : paths.fromBottom;
      gsap.fromTo(
        pathEl,
        { attr: { d: def.start } },
        {
          attr: { d: def.end },
          duration: 0.5,
          ease: "power3.out",
          force3D: true,
        },
      );
      if (arrow)
        gsap.to(arrow, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
    });

    item.addEventListener("mouseleave", (e) => {
      const def = getDir(e, item) === "top" ? paths.toTop : paths.toBottom;
      gsap.fromTo(
        pathEl,
        { attr: { d: def.start } },
        {
          attr: { d: def.end },
          duration: 0.5,
          ease: "power3.out",
          force3D: true,
        },
      );
      if (arrow)
        gsap.to(arrow, {
          opacity: 0,
          x: -4,
          y: 4,
          duration: 0.3,
          ease: "power3.out",
        });
    });
  });
}

function initSkillsTextFill() {
  const skills = gsap.utils.toArray("#skills .container-grid .grid-12 ul li");
  if (!skills.length) return;

  skills.forEach((skill) => {
    const text = skill.textContent;
    const fill = document.createElement("span");
    fill.className = "skill-fill";
    fill.textContent = text;
    fill.setAttribute("aria-hidden", "true");
    skill.appendChild(fill);

    gsap.to(fill, {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: {
        trigger: skill,
        start: "top 85%",
        end: "top 35%",
        scrub: 1,
      },
    });
  });
}

function initFooterParallax() {
  document.querySelectorAll("[data-footer-parallax]").forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "clamp(top bottom)",
        end: "clamp(top top)",
        scrub: true,
      },
    });
    const inner = el.querySelector("[data-footer-parallax-inner]");
    const dark = el.querySelector("[data-footer-parallax-dark]");
    if (inner) {
      tl.from(inner, {
        yPercent: -25,
        ease: "linear",
      });
    }
    if (dark) {
      tl.from(
        dark,
        {
          opacity: 0.5,
          ease: "linear",
        },
        "<",
      );
    }
  });
}

// ── Nav Tooltip ────────────────────────────────────────────────────────────────
// Replicates Annnimate's tooltip effect: shared floating label above each link.
// First hover: scale+y+opacity in. Moving between links: GSAP Flip slide.
// Leaves: fade out after short delay.
function initNavTooltip() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const tooltip = document.getElementById("nav-tooltip");
  const tooltipBg = tooltip?.querySelector(".nav-tooltip__bg");
  const tooltipText = tooltip?.querySelector(".nav-tooltip__text");
  const triggers = Array.from(
    document.querySelectorAll("[data-tooltip-content]"),
  );

  if (!tooltip || !triggers.length) return;

  const ENTER_DURATION = 0.28;
  const ENTER_EASE = "power3.out";
  const HIDE_DURATION = 0.22;
  const HIDE_EASE = "power3.in";
  const FLIP_DURATION = 0.32;
  const FLIP_EASE = "back.out(1.4)";
  const OFFSET = 10; // px above trigger

  let currentTrigger = null;
  let hideTimer = null;
  let isVisible = false;

  function getPosition(trigger) {
    const rect = trigger.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();
    const top = rect.bottom + OFFSET;
    const left = rect.left + rect.width / 2 - ttRect.width / 2;
    // Clamp horizontally so it doesn't overflow viewport
    const clamped = Math.max(
      8,
      Math.min(left, window.innerWidth - ttRect.width - 8),
    );
    return { top, left: clamped };
  }

  function show(trigger) {
    clearTimeout(hideTimer);
    const content = trigger.dataset.tooltipContent;
    if (!content) return;

    const sameGroup =
      currentTrigger &&
      currentTrigger !== trigger &&
      currentTrigger.dataset.tooltipGroup === trigger.dataset.tooltipGroup;

    tooltipText.textContent = content;

    if (sameGroup && isVisible) {
      // Capture state BEFORE repositioning → Flip slides it
      const state = Flip.getState(tooltip);
      const { top, left } = getPosition(trigger);
      gsap.set(tooltip, { top, left });
      Flip.from(state, {
        duration: FLIP_DURATION,
        ease: FLIP_EASE,
        absolute: true,
      });
    } else {
      // First show: measure position then animate in
      gsap.set(tooltip, { opacity: 0, scale: 0.85, y: -6 });
      const { top, left } = getPosition(trigger);
      gsap.set(tooltip, { top, left });
      gsap.to(tooltip, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: ENTER_DURATION,
        ease: ENTER_EASE,
        overwrite: true,
      });
    }

    isVisible = true;
    currentTrigger = trigger;
  }

  function hide() {
    hideTimer = setTimeout(() => {
      gsap.to(tooltip, {
        opacity: 0,
        scale: 0.85,
        y: -6,
        duration: HIDE_DURATION,
        ease: HIDE_EASE,
        overwrite: true,
        onComplete: () => {
          isVisible = false;
          currentTrigger = null;
        },
      });
    }, 80);
  }

  const isMobile = () => window.matchMedia("(hover: none)").matches;

  triggers.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (!isMobile()) show(el);
    });
    el.addEventListener("mouseleave", () => {
      if (!isMobile()) hide();
    });
    el.addEventListener("focus", () => {
      if (!isMobile()) show(el);
    });
    el.addEventListener("blur", () => {
      if (!isMobile()) hide();
    });
  });
}

function wrapWordsInSpan(element) {
  const words = element.textContent.match(/\S+/g);

  element.innerHTML = words
    .map((word) => `<span class="word">${word}</span>`)
    .join(" ");
}

function initTextAnimationMISSION() {
  const paragraph = document.querySelector("#mission .paragraph");
  wrapWordsInSpan(paragraph);

  const pinHeight = document.querySelector("#mission .pin-height");
  const container = document.querySelector("#mission .container-grid");
  const words = document.querySelectorAll("#mission .word");

  gsap.set(words, {
    x: window.innerWidth,
  });

  gsap.to(words, {
    x: 0,
    stagger: 0.02,
    ease: "power4.inOut",
    scrollTrigger: {
      trigger: pinHeight,
      start: "top top",
      end: "+=1200",
      scrub: 1.5,
      pin: container,
    },
  });
}

function initCardsSliderABOUT() {
  const container = document.querySelector(".mwg_effect001 .container");
  const cardsContainer = container.querySelector(".cards");
  const cards = document.querySelectorAll(".card");
  const distance = cardsContainer.clientWidth - window.innerWidth;

  const scrollTween = gsap.to(cardsContainer, {
    x: -distance,
    ease: "none", // linear progression
    // let's pin our container while our cardsContainer is animating
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: true, // progress with the scroll
      start: "top top",
      end: "+=" + distance * 0.5,
    },
  });

  cards.forEach((card) => {
    const values = {
      // get a value between 30 and 50 or -30 and -50
      x: (Math.random() * 20 + 30) * (Math.random() < 0.5 ? 1 : -1),
      // get a value between 10 and 16 or -16 and -10
      y: (Math.random() * 6 + 10) * (Math.random() < 0.5 ? 1 : -1),
      // get a value between 10 and 20 or -10 and -20
      rotation: (Math.random() * 10 + 10) * (Math.random() < 0.5 ? 1 : -1),
    };

    gsap.fromTo(
      card,
      {
        // let's start from this 3 values
        rotation: values.rotation,
        xPercent: values.x,
        yPercent: values.y,
      },
      {
        // and finish to its 3 opposite values
        rotation: -values.rotation,
        xPercent: -values.x,
        yPercent: -values.y,
        ease: "none", // linear progression
        scrollTrigger: {
          trigger: card,
          containerAnimation: scrollTween, // our tween will listen to our scrollTween container position
          start: "left 120%",
          end: "right -20%",
          scrub: true, // the animation progress with the scroll
        },
      },
    );
  });
}

function initTextAnimationTESTIMONY() {
  const paragraph = document.querySelector("#testimony .paragraph");
  wrapWordsInSpan(paragraph);

  const pinHeight = document.querySelector("#testimony .pin-height");
  const container = document.querySelector("#testimony .container-grid");
  const words = document.querySelectorAll("#testimony .word");

  gsap.set(words, {
    x: window.innerWidth,
  });

  gsap.to(words, {
    x: 0,
    stagger: 0.02,
    ease: "power4.inOut",
    scrollTrigger: {
      trigger: pinHeight,
      start: "top top",
      end: "+=1200",
      scrub: 1.5,
      pin: container,
    },
  });
}
