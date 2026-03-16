// Add background elements to the DOM
document.addEventListener('DOMContentLoaded', () => {
  // Create background elements
  setupBackgroundEffects();
  
  // Add reveal class to sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('reveal');
  });
  
  // Set current year in footer and hero
  const year = new Date().getFullYear();
  document.querySelectorAll('.current-year').forEach(el => { el.textContent = year; });
  
  // Initialize animations and effects
  addScrollReveal();
  handleHeaderScroll();
  setupSmoothScrolling();
  addHoverEffects();
  addParallaxEffect();
});

// Background setup
const setupBackgroundEffects = () => {
  // Add the background dots and glow effects
  const bgElements = document.createElement('div');
  bgElements.innerHTML = `
    <div class="bg-dots"></div>
    <div class="bg-glow"></div>
  `;
  document.body.prepend(bgElements);
  
  // Create stars background
  createStars();
  
  // Create parallax elements
  createParallaxBackgrounds();
};

// Create twinkling stars
const createStars = () => {
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars';
  
  // Add random stars
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random size
    const size = Math.random() * 2;
    
    // Random animation duration
    const duration = 1 + Math.random() * 3;
    
    star.style.left = `${posX}%`;
    star.style.top = `${posY}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDuration = `${duration}s`;
    
    starsContainer.appendChild(star);
  }
  
  document.body.appendChild(starsContainer);
};

// Create parallax background elements
const createParallaxBackgrounds = () => {
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    // Create parallax container
    const parallaxBg = document.createElement('div');
    parallaxBg.className = 'parallax-bg';
    
    // Create layers
    for (let i = 1; i <= 3; i++) {
      const layer = document.createElement('div');
      layer.className = `parallax-layer layer-${i}`;
      
      // Add some random circles to each layer for visual effect
      for (let j = 0; j < 3; j++) {
        const circle = document.createElement('div');
        circle.className = 'parallax-circle';
        
        // Random position and size
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
    
    // Insert before the first child of the section
    section.insertBefore(parallaxBg, section.firstChild);
  });
};

// Parallax effect on scroll
const addParallaxEffect = () => {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Parallax for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.backgroundPositionY = `${scrollY * 0.5}px`;
    }
    
    // Parallax for layers
    document.querySelectorAll('.parallax-layer').forEach(layer => {
      const speed = layer.classList.contains('layer-1') ? 0.1 : 
                   (layer.classList.contains('layer-2') ? 0.2 : 0.3);
      const yPos = -(scrollY * speed);
      layer.style.transform = `translateY(${yPos}px) translateZ(-${speed}px) scale(${1 + speed})`;
    });
  });
};

// Scroll reveal animation
const addScrollReveal = () => {
  const targets = document.querySelectorAll('.reveal');
  
  const revealElements = () => {
    const windowHeight = window.innerHeight;
    
    targets.forEach(target => {
      const targetTop = target.getBoundingClientRect().top;
      if (targetTop < windowHeight - 100) {
        target.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealElements);
  revealElements(); // Check on initial load
};

// Header scroll effect
const handleHeaderScroll = () => {
  const header = document.querySelector('header');
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

// Add hover effects for interactive elements
const addHoverEffects = () => {
  const serviceCards = document.querySelectorAll('.service-card');
  const clientItems = document.querySelectorAll('.client-item');
  const caseStudies = document.querySelectorAll('.case-study');
  const ninetyCards = document.querySelectorAll('.ninety-card');
  
  // Add subtle 3D rotation effect for cards
  [...serviceCards, ...clientItems, ...caseStudies, ...ninetyCards].forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 5 degrees)
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      
      // Apply the transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      
      // Add mouse position variables for highlight effect
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    
    // Reset transform when mouse leaves
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
}; 