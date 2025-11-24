// ====== CONFIGURACIÓN ====== //
const WHATSAPP_NUMBER = "573044412478";

// ====== HELPERS ====== //
const q = (sel, ctx = document) => ctx.querySelector(sel);
const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const encode = (s) => encodeURIComponent(s);

function waUrl({ phone, text }) {
  return `https://wa.me/${phone}?text=${encode(text)}`;
}

function buildOrderMessage({ nombre, perfumes, ubicacion }) {
  return [
    "🧾 Nuevo pedido desde la web:",
    `• Nombre: ${nombre}`,
    `• Perfumes: ${perfumes}`,
    `• Ubicación: ${ubicacion}`,
    "",
    "Gracias, quedo pendiente ✅"
  ].join("\n");
}

// ====== FORMULARIO -> WHATSAPP ====== //
function initFormToWhatsApp() {
  const form = q("#formPedido");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    const required = ["nombre", "perfumes", "ubicacion"];
    for (const field of required) {
      if (!data[field] || !data[field].toString().trim()) {
        alert(`Por favor completa el campo: ${field}`);
        return;
      }
    }

    const text = buildOrderMessage({
      nombre: data.nombre.trim(),
      perfumes: data.perfumes.trim(),
      ubicacion: data.ubicacion.trim()
    });
    window.open(waUrl({ phone: WHATSAPP_NUMBER, text }), "_blank");
  });
}

// ====== FILTROS DE CATÁLOGO CON TRANSICIONES ====== //
function initCatalogFilters() {
  const filterBar = q(".filtros");
  const carousels = qa(".catalog-carousel");
  if (!filterBar || !carousels.length) return;

  const buttons = qa("button", filterBar);
  if (!buttons.length) return;

  function showCarousel(category) {
    carousels.forEach(carousel => {
      carousel.style.opacity = "0";
      carousel.style.transform = "translateY(20px)";
      
      setTimeout(() => {
        const carouselCategory = carousel.getAttribute("data-category");
        if (carouselCategory === category) {
          carousel.style.display = "block";
          carousel.offsetHeight;
          carousel.style.opacity = "1";
          carousel.style.transform = "translateY(0)";
        } else {
          carousel.style.display = "none";
        }
      }, 300);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.getAttribute("data-filter") || btn.textContent).toLowerCase().trim();
      
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      
      showCarousel(filter);
    });
  });

  // NO mostrar ningún carrusel por defecto, esperar que el usuario seleccione
  carousels.forEach(carousel => {
    carousel.style.display = "none";
  });
}

// ====== CARRUSELES DEL CATÁLOGO (MEJORADO PARA MÓVIL) ====== //
function initCatalogCarousels() {
  const carouselContainers = qa(".catalog-carousel");
  
  carouselContainers.forEach(container => {
    const carouselInner = container.querySelector(".carousel-container");
    if (!carouselInner) return;
    
    const track = carouselInner.querySelector(".carousel-track");
    const leftArrow = carouselInner.querySelector(".carousel-arrow-left");
    const rightArrow = carouselInner.querySelector(".carousel-arrow-right");
    
    if (!track || !leftArrow || !rightArrow) {
      console.warn("Falta algún elemento del carrusel en:", container);
      return;
    }

    let currentPosition = 0;
    
    // Detectar si es móvil
    const isMobile = window.innerWidth <= 768;
    const slideWidth = isMobile ? 270 : 300; // Ancho de cada slide + gap
    const slidesToMove = 1; // Mover de a uno para mejor control
    
    function updateCarousel() {
      track.style.transition = 'transform 0.4s ease';
      track.style.transform = `translateX(${currentPosition}px)`;
    }

    function moveLeft() {
      currentPosition += slideWidth * slidesToMove;
      if (currentPosition > 0) currentPosition = 0;
      updateCarousel();
    }

    function moveRight() {
      const trackWidth = track.scrollWidth;
      const containerWidth = track.parentElement.offsetWidth;
      const maxScroll = -(trackWidth - containerWidth);
      
      currentPosition -= slideWidth * slidesToMove;
      if (currentPosition < maxScroll) currentPosition = maxScroll;
      updateCarousel();
    }

    // Remover listeners previos si existen
    const newLeftArrow = leftArrow.cloneNode(true);
    const newRightArrow = rightArrow.cloneNode(true);
    leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
    rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);

    newLeftArrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveLeft();
    });

    newRightArrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveRight();
    });

    console.log("Carrusel del catálogo inicializado:", container.getAttribute("data-category"));
  });
}

// ====== SCROLL SUAVE ====== //
function initSmoothScroll() {
  const links = qa('a[href^="#"]');
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id && q(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });      
    });
  });
}

// ====== CARRUSEL DESTACADOS CON ANIMACIÓN INFINITA ====== //
function initCarouselInfinito() {
  const track = document.getElementById('carouselTrack');
  const leftArrow = document.querySelector('.destacados .carousel-arrow-left');
  const rightArrow = document.querySelector('.destacados .carousel-arrow-right');
  
  if (!track || !leftArrow || !rightArrow) {
    console.error('No se encontraron elementos del carrusel destacados');
    return;
  }

  // Duplicar slides para efecto infinito perfecto
  const slides = Array.from(track.children);
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });

  let isManualControl = false;
  let currentPosition = 0;
  const slideWidth = 300;
  const slidesToMove = 2;

  function updatePosition(withTransition = true) {
    if (withTransition) {
      track.style.transition = 'transform 0.5s ease';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${currentPosition}px)`;
  }

  function resumeAnimation() {
    // Quitar control manual y restaurar animación
    track.style.animation = 'scroll-infinite 40s linear infinite';
    isManualControl = false;
  }

  function pauseAnimation() {
    // Pausar animación y obtener posición actual
    const computedStyle = window.getComputedStyle(track);
    const matrix = new DOMMatrix(computedStyle.transform);
    currentPosition = matrix.m41;
    
    track.style.animation = 'none';
    track.style.transform = `translateX(${currentPosition}px)`;
    isManualControl = true;
  }

  function moveLeft() {
    if (!isManualControl) {
      pauseAnimation();
    }

    currentPosition += slideWidth * slidesToMove;
    
    // Control de límites para efecto infinito
    const maxRight = 0;
    if (currentPosition > maxRight) {
      currentPosition = -(slideWidth * slides.length) + (currentPosition - maxRight);
    }
    
    updatePosition();
    
    // Reanudar animación después de 3 segundos
    setTimeout(resumeAnimation, 3000);
  }

  function moveRight() {
    if (!isManualControl) {
      pauseAnimation();
    }

    currentPosition -= slideWidth * slidesToMove;
    
    // Control de límites para efecto infinito
    const maxLeft = -(slideWidth * slides.length * 2);
    if (currentPosition < maxLeft) {
      currentPosition = -(slideWidth * slides.length) + (currentPosition - maxLeft);
    }
    
    updatePosition();
    
    // Reanudar animación después de 3 segundos
    setTimeout(resumeAnimation, 3000);
  }

  // Pausar al hacer hover en cualquier slide
  const allSlides = track.querySelectorAll('.carousel-slide');
  allSlides.forEach(slide => {
    slide.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    
    slide.addEventListener('mouseleave', () => {
      if (!isManualControl) {
        track.style.animationPlayState = 'running';
      }
    });
  });

  leftArrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveLeft();
  });

  rightArrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveRight();
  });

  console.log('Carrusel destacados con animación infinita inicializado');
}

// ====== MOSTRAR PRECIOS AUTOMÁTICAMENTE ====== //
function showPrices() {
  const products = qa(".producto, .carousel-slide");
  
  products.forEach(product => {
    const price = product.getAttribute("data-precio");
    const h3 = product.querySelector("h3");
    
    if (price && h3 && !product.querySelector(".precio")) {
      const priceEl = document.createElement("p");
      priceEl.className = "precio";
      priceEl.textContent = `$${price}`;
      h3.after(priceEl);
    }
  });
}

// ====== CARRITO MEJORADO ====== //
let cart = [];

function formatPrice(price) {
  return parseFloat(price.replace(/\./g, ''));
}

function displayPrice(price) {
  return `$${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function addToCart(productName, price) {
  const exists = cart.find(item => item.name === productName);
  
  if (exists) {
    alert(`${productName} ya está en el carrito`);
    return;
  }

  const priceNum = formatPrice(price);
  
  cart.push({
    name: productName,
    price: priceNum
  });
  
  updateCartCount();
  renderCart();
  alert(`${productName} agregado al carrito 🛒`);
}

function updateCartCount() {
  const countEl = q("#cartCount");
  if (countEl) countEl.textContent = cart.length;
}

function renderCart() {
  const cartList = q("#cartItems");
  const totalEl = q("#cartTotal");
  if (!cartList || !totalEl) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<li style="text-align: center; color: #999;">Tu carrito está vacío</li>';
    totalEl.textContent = displayPrice(0);
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  cartList.innerHTML = cart.map((item, i) => `
    <li>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 3px;">${item.name}</div>
        <div style="color: #25D366; font-weight: 700;">${displayPrice(item.price)}</div>
      </div>
      <button onclick="removeFromCart(${i})" style="margin-left: 10px;">✖</button>
    </li>
  `).join("");

  totalEl.textContent = displayPrice(total);
}

function removeFromCart(index) {
  const removedItem = cart[index];
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  alert(`${removedItem.name} eliminado del carrito`);
}

window.removeFromCart = removeFromCart;

function initCartButtons() {
  // Remover listeners previos
  const buttons = qa(".btn-cart");
  
  buttons.forEach(btn => {
    // Clonar el botón para remover listeners antiguos
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    const container = newBtn.closest(".producto, .carousel-slide");
    if (!container) return;
    
    const nameEl = container.querySelector("h3");
    const price = container.getAttribute("data-precio");
    
    if (!nameEl || !price) {
      console.warn("Producto sin nombre o precio", container);
      return;
    }
    
    const perfumeName = nameEl.textContent.trim();
    
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(perfumeName, price);
    });
  });
  
  console.log(`${buttons.length} botones de carrito inicializados`);
}

function initCheckout() {
  const checkoutBtn = q("#checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de finalizar el pedido.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const productList = cart.map(item => 
      `   - ${item.name}: ${displayPrice(item.price)}`
    ).join("\n");

    const msg = [
      "🛒 *Pedido desde la pagina WEB*",
      "",
      "📦 *Productos:*",
      productList,
      "",
      `💰 *Total: ${displayPrice(total)}*`,
      "",
      "👋 Hola, quiero realizar este pedido. ¿Cuál es el siguiente paso?"
    ].join("\n");

    window.open(waUrl({ phone: WHATSAPP_NUMBER, text: msg }), "_blank");
  });
}

function initCartToggle() {
  const cartIcon = q("#cartIcon");
  const cartPanel = q("#carritoPanel");
  const closeBtn = q("#closeCart");
  if (!cartIcon || !cartPanel) return;

  cartIcon.addEventListener("click", () => {
    cartPanel.classList.add("active");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      cartPanel.classList.remove("active");
    });
  }

  document.addEventListener('click', (e) => {
    if (cartPanel.classList.contains('active') && 
        !cartPanel.contains(e.target) && 
        !cartIcon.contains(e.target)) {
      cartPanel.classList.remove("active");
    }
  });
}

// ====== INICIALIZACIÓN GENERAL ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("Iniciando aplicación...");
  
  initFormToWhatsApp();     
  initCatalogFilters();
  initSmoothScroll();       
  initCarouselInfinito();
  initCheckout();
  initCartToggle();
  showPrices();
  
  // Inicializar carruseles y botones del catálogo
  initCatalogCarousels();
  initCartButtons();
  
  console.log("Aplicación inicializada correctamente");
});
