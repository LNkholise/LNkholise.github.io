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
    const SMOOTH_FACTOR = 0.25;
    const WHEEL_SENSITIVITY = 1.8;
    const MENU_COLLAPSED_WIDTH = 60;
    const MENU_EXPANDED_WIDTH = 220;

    let panelWidth = window.innerWidth;
    let maxScroll = (PANEL_COUNT - 1) * panelWidth;
    let targetX = 0;
    let currentX = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let isAnimating = false;
    let currentPanel = 0;
    let menuExpanded = false;

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

    // Touch support
    horizontalContainer.addEventListener("touchstart", (e) => {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragCurrentX = targetX;
    });

    horizontalContainer.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - dragStartX;
      targetX = clamp(dragCurrentX - deltaX, 0, maxScroll);
    });

    horizontalContainer.addEventListener("touchend", () => {
      isDragging = false;
    });

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
    window.addEventListener("resize", () => {
      panelWidth = window.innerWidth;
      maxScroll = (PANEL_COUNT - 1) * panelWidth;
      targetX = clamp(targetX, 0, maxScroll);
      currentX = clamp(currentX, 0, maxScroll);
      panelsContainer.style.transition = "none"; // prevent jump on resize
      panelsContainer.style.transform = `translateX(${-currentX}px)`;
      setTimeout(() => {
        panelsContainer.style.transition = "";
      }, 100);
    });
  });
