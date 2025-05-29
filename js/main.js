document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const pageContainer = document.querySelector(".page-container");
    const horizontalContainer = document.querySelector(".horizontal-container");
    const panelsContainer = document.querySelector(".panels-container");
    const panels = document.querySelectorAll(".panel");
    const progressFill = document.querySelector(".nav-progress-fill");
    const navText = document.querySelector(".nav-text");
    const sectionNavItems = document.querySelectorAll(".section-nav-item");
    const leftMenu = document.querySelector(".left-menu");
    const menuBtn = document.querySelector(".menu-btn");
    const copyTooltip = document.querySelector(".copy-tooltip");

    const PANEL_COUNT = panels.length;
    const SMOOTH_FACTOR = 0.15;
    const WHEEL_SENSITIVITY = 1.2;
    const MENU_COLLAPSED_WIDTH = 60;
    const MENU_EXPANDED_WIDTH = 220;
    const TOUCH_SENSITIVITY = 1.8;
    const TOUCH_INERTIA_THRESHOLD = 0.5;
    const TOUCH_MOMENTUM_DAMPING = 0.95;
    const VELOCITY_THRESHOLD = 300;

    let panelWidth = window.innerWidth;
    let maxScroll = (PANEL_COUNT - 1) * panelWidth;
    let targetX = 0;
    let currentX = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let isAnimating = false;
    let currentPanel = 0;
    let menuExpanded = false;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let velocity = 0;

    const lerp = (start, end, t) => start + (end - start) * t;
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    // Animate menu toggle
    menuBtn.addEventListener("click", () => {
      menuExpanded = !menuExpanded;
      leftMenu.classList.toggle("expanded");
      menuBtn.classList.toggle("rotated");
    });

    // Navigate via menu clicks
    sectionNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        const index = Number(item.dataset.index);
        targetX = index * panelWidth;
        updateActiveNav(index);
        velocity = 0;
      });
    });

    function updateActiveNav(index) {
      currentPanel = index;
      sectionNavItems.forEach((el) => el.classList.remove("active"));
      sectionNavItems[index].classList.add("active");
      navText.textContent = `0${index + 1} / 0${PANEL_COUNT}`;
    }

    // Wheel scroll handler
    window.addEventListener("wheel", (e) => {
      e.preventDefault();
      targetX += e.deltaY * WHEEL_SENSITIVITY;
      targetX = clamp(targetX, 0, maxScroll);
      // Cancel any momentum scrolling when using wheel
      velocity = 0;
    }, { passive: false });

    // Drag handlers
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;

    horizontalContainer.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragCurrentX = targetX;
      horizontalContainer.style.cursor = "grabbing";
      velocity = 0;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      horizontalContainer.style.cursor = "default";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      targetX = clamp(dragCurrentX - deltaX, 0, maxScroll);
    });

    // Improved Touch support with momentum
    horizontalContainer.addEventListener("touchstart", (e) => {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragCurrentX = targetX;
      touchStartTime = Date.now();
      velocity = 0;
      lastTouchX = dragStartX;
      lastTouchTime = touchStartTime;
    }, { passive: true });

    horizontalContainer.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      const now = Date.now();
      const currentX = e.touches[0].clientX;
      
      // Calculate velocity
      if (lastTouchTime && lastTouchX !== undefined) {
        const deltaTime = (now - lastTouchTime) / 1000;
        if (deltaTime > 0) {
          velocity = (lastTouchX - currentX) / deltaTime;
        }
      }
      
      const deltaX = (currentX - dragStartX) * TOUCH_SENSITIVITY;
      targetX = clamp(dragCurrentX - deltaX, 0, maxScroll);
      
      lastTouchX = currentX;
      lastTouchTime = now;
    }, { passive: true });

    horizontalContainer.addEventListener("touchend", () => {
      isDragging = false;
      
      // Apply momentum if gesture was fast enough
      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        const startTime = Date.now();
        const startX = targetX;
        const direction = velocity > 0 ? 1 : -1;
        const distance = Math.min(
          Math.abs(velocity) * TOUCH_INERTIA_THRESHOLD * 0.5, 
          maxScroll
        );
        
        const animateMomentum = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / TOUCH_INERTIA_THRESHOLD, 1);
          const damping = Math.pow(TOUCH_MOMENTUM_DAMPING, elapsed * 60);
          
          targetX = clamp(
            startX + distance * direction * damping * (1 - progress),
            0,
            maxScroll
          );
          
          if (progress < 1 && damping > 0.05) {
            requestAnimationFrame(animateMomentum);
          }
        };
        
        animateMomentum();
      }
    }, { passive: true });

    // Animation loop
    function animate() {
      currentX = lerp(currentX, targetX, SMOOTH_FACTOR);
      panelsContainer.style.transform = `translateX(${-currentX}px)`;

      // Update progress fill and nav text
      let progress = currentX / maxScroll || 0;
      if (maxScroll === 0) progress = 0;

      progressFill.style.transform = `scaleX(${progress})`;

      // Update active nav based on scroll
      const panelIndex = Math.round(progress * (PANEL_COUNT - 1));
      if (panelIndex !== currentPanel) {
        updateActiveNav(panelIndex);
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Responsive resize handler
    function handleResize() {
      panelWidth = window.innerWidth;
      maxScroll = (PANEL_COUNT - 1) * panelWidth;
      targetX = clamp(targetX, 0, maxScroll);
      currentX = clamp(currentX, 0, maxScroll);
      panelsContainer.style.transition = "none";
      panelsContainer.style.transform = `translateX(${-currentX}px)`;
      setTimeout(() => {
        panelsContainer.style.transition = "";
      }, 100);
    }

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });
});
