const cards = document.querySelectorAll(".card");
let activeCardIndex = null;

function getCardStyle(i) {
  const positions = [
    "translateX(-60px) translateY(20px) rotate(-8deg)",
    "translateX(-20px) translateY(10px) rotate(-3deg)",
    "translateX(20px) translateY(0px) rotate(3deg)"
  ];
  return positions[i] || "translateX(0px) translateY(0px)";
}

function activateCard(index) {
  if (activeCardIndex === index) return; // already active, do nothing
  activeCardIndex = index;

  // Reset all cards
  cards.forEach((c, i) => {
    c.style.zIndex = i + 1;
    c.style.transform = getCardStyle(i);
  });

  // Bring clicked card to front
  const card = cards[index];
  card.style.zIndex = cards.length + 1;
  card.style.transform = "translateX(0px) translateY(-10px) rotate(0deg) scale(1.05)";
  
  // Update active dot
  updateDots();
}

// Create dots navigation
function createDots() {
  const dotsContainer = document.querySelector('.dots-container');
  dotsContainer.innerHTML = '';
  
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.index = index;
    dot.addEventListener('click', () => activateCard(index));
    dotsContainer.appendChild(dot);
  });
  
  updateDots();
}

// Update active dot
function updateDots() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    if (index === activeCardIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Initialize
cards.forEach((card, index) => {
  card.dataset.index = index;
  card.addEventListener("click", () => activateCard(index));
});

createDots();

// Activate first card by default
activateCard(0);
