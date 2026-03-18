// Enso-inspired motion: reveal, parallax, and interactions
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  if (!prefersReducedMotion()) {
    setupBackgroundEffects();
  }

  document.querySelectorAll('section').forEach(section => {
    section.classList.add('reveal');
  });

  const year = new Date().getFullYear();
  document.querySelectorAll('.current-year').forEach(el => { el.textContent = year; });

  addScrollReveal();
  handleHeaderScroll();
  setupSmoothScrolling();
  if (!prefersReducedMotion()) {
    addHoverEffects();
    addParallaxEffect();
  }
});

// Background setup (bg-dots and bg-glow are in HTML; avoid duplicating)
const setupBackgroundEffects = () => {
  createStars();
  createParallaxBackgrounds();
};

// Subtle starfield (lighter than before for Enso-style clarity)
const createStars = () => {
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars';

  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = star.style.height = `${0.5 + Math.random() * 1.5}px`;
    star.style.animationDuration = `${2 + Math.random() * 2}s`;
    starsContainer.appendChild(star);
  }

  document.body.appendChild(starsContainer);
};

// Create parallax background elements (skip hero; it has its own infra visual system)
const createParallaxBackgrounds = () => {
  const sections = document.querySelectorAll('section:not(.hero)');
  
  sections.forEach(section => {
    const parallaxBg = document.createElement('div');
    parallaxBg.className = 'parallax-bg';
    
    for (let i = 1; i <= 3; i++) {
      const layer = document.createElement('div');
      layer.className = `parallax-layer layer-${i}`;
      
      for (let j = 0; j < 3; j++) {
        const circle = document.createElement('div');
        circle.className = 'parallax-circle';
        
        const size = 50 + Math.random() * 200;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        circle.style.left = `${posX}%`;
        circle.style.top = `${posY}%`;
        
        layer.appendChild(circle);
      }
      
      parallaxBg.appendChild(layer);
    }
    
    section.insertBefore(parallaxBg, section.firstChild);
  });
};

// Gentle parallax on non-hero sections (Enso-style ambient depth)
const addParallaxEffect = () => {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      document.querySelectorAll('.parallax-layer').forEach(layer => {
        const speed = layer.classList.contains('layer-1') ? 0.06 : (layer.classList.contains('layer-2') ? 0.12 : 0.18);
        layer.style.transform = `translateY(${-scrollY * speed}px) translateZ(-${speed}px) scale(${1 + speed})`;
      });
      ticking = false;
    });
  });
};

// Scroll reveal – trigger when section enters view (Enso-style staggered feel)
const addScrollReveal = () => {
  const targets = document.querySelectorAll('.reveal');
  const threshold = 120;

  const revealElements = () => {
    const windowHeight = window.innerHeight;
    targets.forEach(target => {
      const top = target.getBoundingClientRect().top;
      if (top < windowHeight - threshold) target.classList.add('active');
    });
  };

  window.addEventListener('scroll', revealElements, { passive: true });
  revealElements();
};

// Header scroll effect
const handleHeaderScroll = () => {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
};

// Smooth scrolling for anchor links
const setupSmoothScrolling = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
};

// Subtle card tilt on hover (Enso-style, not overpowering)
const addHoverEffects = () => {
  const cards = document.querySelectorAll('.service-card, .client-item, .case-study, .ninety-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * 2;
      const rotateX = -y * 2;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}; 