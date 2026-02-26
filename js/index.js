// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  // Global UI behaviors that live outside the Barba container
  initCenteredScalingNavigationBar();
  initDirectionalButtonHover();
});

const documentTitleStore = document.title;
const documentTitleOnBlur = "Come back! We miss you"; // Define your custom title here

// Set original title if user is on the site
window.addEventListener("focus", () => {
  document.title = documentTitleStore;
});

// If user leaves tab, set the alternative title
window.addEventListener("blur", () => {
  document.title = documentTitleOnBlur;
});

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", (e) => (reducedMotion = e.matches));
rmMQ.addListener?.((e) => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  // Runs once on first load
  // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  // Runs after enter animation completes
  // Re‑inicializa animações dependentes do conteúdo da página ativa
  initGlobalParallax();
  initFooterParallax();
  initCSSMarquee();
  initMaskTextScrollReveal();
  initMarqueeScrollDirection();
  initWorksBackgroundTransition();
  initWorksCardsAnimation();
  if (hasLenis) {
    lenis.resize();
  }
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();

  tl.call(
    () => {
      resetPage(next);
    },
    null,
    0,
  );

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const parent = current.parentElement || document.body;
  // Helper function to prepare transition structure
  const { wrapper } = prepareForTransition(parent, current, next);
  const tl = gsap.timeline({
    onComplete: () => {
      wrapper.remove();
      gsap.set(parent, { clearProps: "perspective,transformStyle,overflow" });
      gsap.set(next, {
        clearProps:
          "position,inset,width,height,zIndex,transformStyle,willChange,backfaceVisibility,transform",
      });
    },
  });
  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.to(
    wrapper,
    {
      z: "-100vw",
      duration: 0.9,
      clipPath: "rect(0% 100% 100% 0% round 1.5em)",
    },
    0,
  );
  tl.to(
    wrapper,
    {
      xPercent: -175,
      duration: 1,
      overwrite: "auto",
    },
    0.25,
  );
  tl.to(
    next,
    {
      xPercent: 0,
      duration: 1,
      overwrite: "auto",
    },
    "<",
  );
  tl.to(
    next,
    {
      z: 0,
      duration: 0.9,
      overwrite: "auto",
      clipPath: "rect(0% 100% 100% 0% round 0em)",
    },
    ">-=0.4",
  );

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();
  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise((resolve) => {
    tl.call(resolve, null, "pageReady");
  });
}

function prepareForTransition(parent, current, next) {
  // Wrap current so we can move it without breaking layout/styles
  const wrapper = document.createElement("div");
  wrapper.className = "page-transition__wrapper";

  // Insert wrapper where current was, then move current into it
  parent.insertBefore(wrapper, current);
  wrapper.appendChild(current);

  // Store scroll to visually "freeze" current in-place
  const scrollY = window.scrollY || 0;
  window.scrollTo(0, 0);

  // Base 3D setup
  gsap.set(parent, {
    perspective: "100vw",
    transformStyle: "preserve-3d",
    overflow: "clip",
  });

  gsap.set(wrapper, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100vh",
    overflow: "clip",
    zIndex: 2,
    transformStyle: "preserve-3d",
    willChange: "transform",
    clipPath: "rect(0% 100% 100% 0% round 0em)",
  });

  // Keep the current page visually aligned with where it was scrolled
  gsap.set(current, {
    position: "absolute",
    top: -scrollY,
    left: 0,
    width: "100%",
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
  });
  // Initial state of the next page
  gsap.set(next, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100vh",
    overflow: "clip",
    zIndex: 1,
    transformStyle: "preserve-3d",
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    xPercent: 175,
    z: "-100vw",
    autoAlpha: 1,
    clipPath: "rect(0% 100% 100% 0% round 1.5em)",
  });
  return { wrapper, scrollY };
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
});

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter((data) => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);
  // Settle
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,
      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(
          data.current.container,
          data.next.container,
        );
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
  ],
});

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light",
  },
  dark: {
    nav: "light",
    transition: "dark",
  },
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;
  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector("[data-theme-transition]");
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector("[data-theme-nav]");
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    // lerp: 0.165,
    // wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement("template");
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
  var currentNodes = document.querySelectorAll("nav [data-barba-update]");

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute("aria-current");
    if (newStatus !== null) {
      curr.setAttribute("aria-current", newStatus);
    } else {
      curr.removeAttribute("aria-current");
    }

    // Class list sync
    var newClassList = next.getAttribute("class") || "";
    curr.setAttribute("class", newClassList);
  });
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

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

const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
};

function initMaskTextScrollReveal() {
  document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
    // Find the split type, the default is 'lines'
    const type = heading.dataset.splitReveal || "lines";
    const typesToSplit =
      type === "lines"
        ? ["lines"]
        : type === "words"
          ? ["lines", "words"]
          : ["lines", "words", "chars"];
    // Split the text
    SplitText.create(heading, {
      type: typesToSplit.join(", "), // split into required elements
      mask: "lines", // wrap each line in an overflow:hidden div
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance[type]; // Register animation targets
        const config = splitConfig[type]; // Find matching duration and stagger from our splitConfig
        return gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: "expo.out",
          scrollTrigger: {
            trigger: heading,
            start: "clamp(top 80%)",
            once: true,
          },
        });
      },
    });
  });
}

function initMarqueeScrollDirection() {
  document
    .querySelectorAll("[data-marquee-scroll-direction-target]")
    .forEach((marquee) => {
      // Query marquee elements
      const marqueeContent = marquee.querySelector(
        "[data-marquee-collection-target]",
      );
      const marqueeScroll = marquee.querySelector(
        "[data-marquee-scroll-target]",
      );
      if (!marqueeContent || !marqueeScroll) return;

      // Get data attributes
      const {
        marqueeSpeed: speed,
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset;

      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed);
      const marqueeDirectionAttr = direction === "right" ? 1 : -1; // 1 for right, -1 for left
      const duplicateAmount = parseInt(duplicate || 0);
      const scrollSpeedAttr = parseFloat(scrollSpeed);
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

      let marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier;

      // Precompute styles for the scroll container
      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
      marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

      // Duplicate marquee content
      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }

      // GSAP animation for marquee content
      const marqueeItems = marquee.querySelectorAll(
        "[data-marquee-collection-target]",
      );
      const animation = gsap
        .to(marqueeItems, {
          xPercent: -100, // Move completely out of view
          repeat: -1,
          duration: marqueeSpeed,
          ease: "linear",
        })
        .totalProgress(0.5);

      // Initialize marquee in the correct direction
      gsap.set(marqueeItems, {
        xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
      });
      animation.timeScale(marqueeDirectionAttr); // Set correct direction
      animation.play(); // Start animation immediately

      // Set initial marquee status
      marquee.setAttribute("data-marquee-status", "normal");

      // ScrollTrigger logic for direction inversion
      ScrollTrigger.create({
        trigger: marquee,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const isInverted = self.direction === 1; // Scrolling down
          const currentDirection = isInverted
            ? -marqueeDirectionAttr
            : marqueeDirectionAttr;

          // Update animation direction and marquee status
          animation.timeScale(currentDirection);
          marquee.setAttribute(
            "data-marquee-status",
            isInverted ? "normal" : "inverted",
          );
        },
      });

      // Extra speed effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marquee,
          start: "0% 100%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      const scrollStart =
        marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
      const scrollEnd = -scrollStart;

      tl.fromTo(
        marqueeScroll,
        { x: `${scrollStart}vw` },
        { x: `${scrollEnd}vw`, ease: "none" },
      );
    });
}

function initWorksBackgroundTransition() {
  if (!hasScrollTrigger) return;

  const triggerSection = document.querySelector("#works");

  if (!triggerSection) return;
  const pageBackground = document.querySelector('[data-barba="container"]');
  console.log("Trigger section for background transition:", pageBackground);

  // Garante estado inicial branco
  gsap.set(pageBackground, { backgroundColor: "var(--white)" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerSection,
      // Transição rápida e suave quando a seção WORKS se aproxima do meio da viewport
      start: "top 95%", // começa a escurecer pouco antes da WORKS entrar
      end: "top 80%", // termina logo depois
      scrub: 0.4,
      markers: false, // defina como true se quiser depurar
    },
  });

  tl.to(pageBackground, {
    backgroundColor: "var(--black)",
    ease: "none",
  });
}

function initWorksCardsAnimation() {
  if (!hasScrollTrigger) return;

  const section = document.querySelector("#works");
  if (!section) return;

  const cards = section.querySelectorAll(".work-card");
  if (!cards.length) return;

  // Todos os cards começam fora da viewport, abaixo da tela, com scale menor
  cards.forEach((card, index) => {
    gsap.set(card, {
      y: "100vh",
      scale: 0.2,
      zIndex: cards.length - index,
    });
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      // Começa quando o topo da seção WORKS encosta no topo da viewport,
      // momento em que o bloco sticky "My work" já está centralizado.
      start: "top top",
      end: "bottom bottom",
      // Usa scrub com inércia para não acelerar demais em scrolls muito rápidos
      scrub: 1.2,
    },
  });

  // Cada card atravessa a tela de baixo para cima, com scale animando
  cards.forEach((card, index) => {
    const isLast = index === cards.length - 1;

    // Fase 1: entra de baixo, escala de 0.2 até 1 no meio
    tl.to(card, {
      y: "0vh",
      scale: 1,
      duration: 2,
      ease: "power1.out",
    });

    // Fase 2: só para os primeiros cards - o último fica parado no centro
    if (!isLast) {
      tl.to(card, {
        y: "-100vh",
        scale: 0.2,
        duration: 2,
        ease: "power3.in",
      });
    }
  });
}

function initCenteredScalingNavigationBar() {
  const navigationInnerItems = document.querySelectorAll(
    "[data-navigation-item]",
  );
  // Apply CSS transition delay
  navigationInnerItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.05}s`;
  });
  // Toggle Navigation
  document
    .querySelectorAll('[data-navigation-toggle="toggle"]')
    .forEach((toggleBtn) => {
      toggleBtn.addEventListener("click", () => {
        const navStatusEl = document.querySelector("[data-navigation-status]");
        if (!navStatusEl) return;
        if (
          navStatusEl.getAttribute("data-navigation-status") === "not-active"
        ) {
          navStatusEl.setAttribute("data-navigation-status", "active");
          // If you use Lenis you can 'stop' Lenis here: Example Lenis.stop();
        } else {
          navStatusEl.setAttribute("data-navigation-status", "not-active");
          // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
        }
      });
    });

  // Close navbar when a nav link is clicked
  document.querySelectorAll(".hamburger-nav__a").forEach((link) => {
    link.addEventListener("click", () => {
      const navStatusEl = document.querySelector("[data-navigation-status]");
      if (!navStatusEl) return;
      navStatusEl.setAttribute("data-navigation-status", "not-active");
      // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
    });
  });

  // Close Navigation
  document
    .querySelectorAll('[data-navigation-toggle="close"]')
    .forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        const navStatusEl = document.querySelector("[data-navigation-status]");
        if (!navStatusEl) return;
        navStatusEl.setAttribute("data-navigation-status", "not-active");
        // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
      });
    });

  // Key ESC - Close Navigation
  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      const navStatusEl = document.querySelector("[data-navigation-status]");
      if (!navStatusEl) return;
      if (navStatusEl.getAttribute("data-navigation-status") === "active") {
        navStatusEl.setAttribute("data-navigation-status", "not-active");
        // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
      }
    }
  });
}

function initDirectionalButtonHover() {
  // Button hover animation
  document.querySelectorAll("[data-btn-hover]").forEach((button) => {
    button.addEventListener("mouseenter", handleHover);
    button.addEventListener("mouseleave", handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage (for position)
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;
    // Compute a fixed diameter large enough to cover the button
    // Use 2x the diagonal to be safe even when the circle originates from an edge
    const diagonal = Math.sqrt(
      buttonWidth * buttonWidth + buttonHeight * buttonHeight,
    );
    const circleDiameter = diagonal * 2;

    // Update position and size of .btn__circle
    const circle = button.querySelector(".btn__circle");
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${circleDiameter}px`;
    }
  }
}

// -----------------------------------------
// NAV + MARQUEE INTERACTION (SCROLL TOP)
// -----------------------------------------
