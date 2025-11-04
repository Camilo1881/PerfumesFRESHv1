// ====== CONFIGURACIÓN ====== //
const WHATSAPP_NUMBER = "573044412478";
const DEFAULT_HEADER_MSG = "Hola, me gustaría conocer más sobre Perfumes Fresh 💬";

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

// ====== BOTONES "PEDIR" EN PRODUCTOS ====== //
function initProductButtons() {
  const cards = qa(".producto");
  if (!cards.length) return;

  cards.forEach((card) => {
    const nameEl = q("h3", card);
    const btn = q(".btn-wapp", card);
    if (!nameEl || !btn) return;

    const perfumeName = nameEl.textContent.trim();
    const msg = `Hola 👋, quiero el perfume: ${perfumeName}. ¿Me cuentas sobre este perfume, disponibilidad y precios?`;

    btn.setAttribute("href", waUrl({ phone: WHATSAPP_NUMBER, text: msg }));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });
}

// ====== BOTÓN WHATSAPP DEL HEADER ======//
function initHeaderWhatsApp() {
  const headerBtn = qa("header .btn-wapp").find(Boolean);
  if (!headerBtn) return;

  const msg = headerBtn.getAttribute("data-text")?.trim() || DEFAULT_HEADER_MSG;
  headerBtn.setAttribute("href", waUrl({ phone: WHATSAPP_NUMBER, text: msg }));
  headerBtn.setAttribute("target", "_blank");
  headerBtn.setAttribute("rel", "noopener");
}

// ====== FILTROS DE CATÁLOGO ====== //
function initCatalogFilters() {
  const filterBar = q(".filtros");
  const products = qa(".producto");
  if (!filterBar || !products.length) return;

  const buttons = qa("button", filterBar);
  if (!buttons.length) return;

  let activeFilter = null;

  // Ocultar todos los productos al inicio
  products.forEach(card => card.style.display = "none");

  function applyFilter(filter) {
    products.forEach((card) => {
      const cat = (card.getAttribute("data-category") || "").toLowerCase().trim();
      const match = filter === "todos" || filter === cat;
      card.style.display = match ? "block" : "none";
      if (match) {
        setTimeout(() => card.classList.add("visible"), 10);        
      } else {
        card.classList.remove("visible");
      }
    });
  }

  function clearFilter () {
    products.forEach(card => card.style.display ="none");
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.getAttribute("data-filter") || btn.textContent).toLowerCase().trim();

      if (activeFilter === filter) {
        activeFilter = null;
        buttons.forEach((b) => b.classList.remove("is-active"));
        clearFilter();
      } else {
        activeFilter = filter;
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        applyFilter(filter)
      }  
    });
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
      })      
    });
  });
}

// ====== CARRUSEL INFINITO PERSONALIZADO ====== //
function initCarouselInfinito() {
  const track = document.getElementById('carouselTrack');
  const leftArrow = document.querySelector('.carousel-arrow-left');
  const rightArrow = document.querySelector('.carousel-arrow-right');
  
  if (!track || !leftArrow || !rightArrow) {
    console.error('No se encontraron elementos del carrusel');
    return;
  }

  // Duplicar slides para efecto infinito
  const slides = Array.from(track.children);
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });

  // Variables de control
  let animationPaused = false;
  const slideWidth = 300;
  const animationDuration = 30;

  // Función para mover el carrusel manualmente
  function moveCarousel(direction) {
    animationPaused = true;
    track.style.animationPlayState = 'paused';
    
    const currentTransform = getComputedStyle(track).transform;
    let currentTranslate = 0;
    
    if (currentTransform !== 'none') {
      const matrix = new DOMMatrix(currentTransform);
      currentTranslate = matrix.m41;
    }

    if (direction === 'left') {
      currentTranslate += slideWidth * 2;
    } else {
      currentTranslate -= slideWidth * 2;
    }

    track.style.transform = `translateX(${currentTranslate}px)`;
    track.style.animation = 'none';

    setTimeout(() => {
      track.style.animation = `scroll ${animationDuration}s linear infinite`;
      animationPaused = false;
    }, 1500);
  }

  leftArrow.addEventListener('click', (e) => {
    e.preventDefault();
    moveCarousel('left');
  });

  rightArrow.addEventListener('click', (e) => {
    e.preventDefault();
    moveCarousel('right');
  });

  // Configurar botones de WhatsApp en los slides
  const allSlides = track.querySelectorAll('.carousel-slide');
  allSlides.forEach(slide => {
    const nameEl = slide.querySelector('h3');
    const btn = slide.querySelector('.btn-wapp');
    if (!nameEl || !btn) return;

    const perfumeName = nameEl.textContent.trim();
    const msg = `Hola 👋, quiero el perfume: ${perfumeName}. ¿Me cuentas sobre este perfume, disponibilidad y precios?`;
    
    btn.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });

  console.log('Carrusel inicializado correctamente');
}

// ====== CARRITO MEJORADO ====== //
let cart = [];

// Función para formatear precio
function formatPrice(price) {
  // Convierte "60.000" a número 60000
  return parseFloat(price.replace(/\./g, ''));
}

// Función para mostrar precio formateado
function displayPrice(price) {
  return `$${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function addToCart(productName, price) {
  // Verificar si el producto ya existe
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

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Renderizar productos
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

// Hacer removeFromCart global para que funcione desde el HTML
window.removeFromCart = removeFromCart;

function initCartButtons() {
  const buttons = qa(".btn-cart");
  
  buttons.forEach(btn => {
    const container = btn.closest(".producto, .carousel-slide");
    if (!container) return;
    
    const nameEl = container.querySelector("h3");
    const price = container.getAttribute("data-precio");
    
    if (!nameEl || !price) {
      console.warn("Producto sin nombre o precio", container);
      return;
    }
    
    const perfumeName = nameEl.textContent.trim();
    
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(perfumeName, price);
    });
  });
}

function initCheckout() {
  const checkoutBtn = q("#checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de finalizar el pedido.");
      return;
    }

    // Calcular total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // Crear mensaje para WhatsApp
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

    // Abrir WhatsApp
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

  // Cerrar al hacer clic fuera
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
  initFormToWhatsApp();     
  initProductButtons();     
  initHeaderWhatsApp();     
  initCatalogFilters();     
  initSmoothScroll();       
  initCarouselInfinito();   
  initCartButtons();        // ← Inicializa botones del carrito
  initCheckout();           // ← Inicializa botón de finalizar pedido
  initCartToggle();         // ← Inicializa apertura/cierre del carrito
});
