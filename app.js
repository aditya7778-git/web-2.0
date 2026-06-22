const products = [
    {
        id: 1,
        name: "Celestial Drop Earrings",
        category: "Celestial",
        price: 180.00,
        image: "assets/celestial_drop.png",
        badge: "New Season",
        description: "Elegantly crafted 18k gold drop earrings featuring delicate crescent moons and sparkling stars studded with ethically sourced brilliant crystals. Designed for the dreamers, these earrings bring the magic of the night sky to any outfit.",
        material: "18k Gold Vermeil over Sterling Silver",
        stone: "Premium Cubic Zirconia",
        dimensions: "35mm length x 12mm width"
    },
    {
        id: 2,
        name: "Aura Huggie Hoops",
        category: "Minimalist",
        price: 120.00,
        image: "assets/minimalist_hoop.png",
        badge: "Best Seller",
        description: "Timeless and bold, these chunky huggie hoops are crafted with a high-polish mirror finish in solid 18k yellow gold. The perfect everyday luxury statement that transitions effortlessly from dawn to dark.",
        material: "18k Yellow Gold",
        stone: "None",
        dimensions: "15mm diameter, 4mm width"
    },
    {
        id: 3,
        name: "Baroque Pearl Studs",
        category: "Pearl",
        price: 240.00,
        image: "assets/pearl_stud.png",
        badge: "Unique",
        description: "Uniquely shaped organic freshwater baroque pearls nestled in a hand-textured raw 18k gold mounting. No two pearls are identical, making each pair singularly yours and highlighting nature's beautiful irregularities.",
        material: "18k Gold Plate & Sterling Silver",
        stone: "Natural Freshwater Baroque Pearl",
        dimensions: "Approx. 12mm - 14mm"
    },
    {
        id: 4,
        name: "Emerald Aura Threaders",
        category: "Classics",
        price: 210.00,
        image: "assets/emerald_pendant.png",
        badge: "Limited Edition",
        description: "Luxurious and fluid, these delicate gold threader earrings feature brilliant emerald-cut forest green gemstones that catch the light and dance with every movement. A stunning modern take on classic emerald jewelry.",
        material: "14k Yellow Gold",
        stone: "Premium Lab-Grown Emerald",
        dimensions: "75mm total length, 6mm x 4mm gemstone"
    }
];
// --- Cart State ---
let cart = JSON.parse(localStorage.getItem('vespera_cart')) || [];
// --- Modal State ---
let activeProductModal = null;
let modalQty = 1;
// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    renderProducts();
    initFilters();
    initSearch();
    initCartDrawer();
    initModals();
    initNewsletter();
    updateCartCounter();
});
// --- Header Scroll Effect ---
function initHeaderScroll() {
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}
// --- Render Product Cards ---
function renderProducts(filterCategory = 'all', searchQuery = '') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filtered = products.filter(p => {
        const matchesCategory = filterCategory === 'all' || p.category.toLowerCase() === filterCategory.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
                <i class="ri-search-2-line" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>
                <p>No pieces found matching your criteria.</p>
            </div>
        `;
        return;
    }
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        
        const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        
        card.innerHTML = `
            ${badgeHTML}
            <div class="product-image-box">
                <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy">
                <div class="product-action-overlay">
                    <button class="product-overlay-btn product-overlay-btn-large add-to-cart-quick" data-id="${product.id}">
                        Add To Cart
                    </button>
                    <button class="product-overlay-btn view-details-btn" data-id="${product.id}">
                        👁️
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name" data-id="${product.id}">${product.name}</h3>
                <span class="product-price">$${product.price.toFixed(2)}</span>
            </div>
        `;
        
        // Attach Event Listeners
        card.querySelector('.product-name').addEventListener('click', () => openDetailModal(product.id));
        card.querySelector('.view-details-btn').addEventListener('click', () => openDetailModal(product.id));
        card.querySelector('.add-to-cart-quick').addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id, 1);
            openCartDrawer();
        });
        grid.appendChild(card);
    });
}
// --- Initialize Category Filters ---
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const category = e.target.getAttribute('data-filter');
            const searchVal = document.getElementById('search-input')?.value || '';
            renderProducts(category, searchVal);
        });
    });
}
// --- Initialize Search Input ---
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const searchVal = e.target.value;
        const activeCategory = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderProducts(activeCategory, searchVal);
    });
}
// --- Cart System Functions ---
function saveCart() {
    localStorage.setItem('vespera_cart', JSON.stringify(cart));
    updateCartCounter();
    updateCartUI();
}
function addToCart(productId, qty) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty
        });
    }
    saveCart();
}
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}
function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}
function getCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}
function updateCartCounter() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    countElements.forEach(el => {
        el.textContent = totalCount;
        el.style.display = totalCount > 0 ? 'flex' : 'none';
    });
}
function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-icon">🛍️</div>
                <p>Your jewelry chest is empty</p>
                <a href="#collections" class="btn btn-outline" style="margin-top: 1.5rem; display: inline-block;" onclick="closeCartDrawer()">Browse Collections</a>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        return;
    }
    container.innerHTML = '';
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item-btn" data-id="${item.id}">✕</button>
        `;
        // Quantity controls
        itemEl.querySelector('.qty-minus').addEventListener('click', () => updateQuantity(item.id, -1));
        itemEl.querySelector('.qty-plus').addEventListener('click', () => updateQuantity(item.id, 1));
        itemEl.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(item.id));
        container.appendChild(itemEl);
    });
    if (subtotalEl) {
        subtotalEl.textContent = `$${getCartSubtotal().toFixed(2)}`;
    }
}
// --- Cart Drawer Interface ---
function initCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const openBtn = document.getElementById('cart-toggle-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (openBtn && overlay) {
        openBtn.addEventListener('click', openCartDrawer);
    }
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', closeCartDrawer);
    }
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCartDrawer();
        });
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            closeCartDrawer();
            openSuccessModal();
            cart = [];
            saveCart();
        });
    }
}
function openCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
        updateCartUI();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
function closeCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}
// --- Modals Setup (Detail & Checkout) ---
function initModals() {
    const detailOverlay = document.getElementById('detail-modal-overlay');
    const successOverlay = document.getElementById('success-modal-overlay');
    
    const closeDetailBtn = document.getElementById('close-detail-modal');
    const closeSuccessBtn = document.getElementById('close-success-modal');
    const successOkBtn = document.getElementById('success-ok-btn');
    if (closeDetailBtn && detailOverlay) {
        closeDetailBtn.addEventListener('click', () => closeDetailModal());
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) closeDetailModal();
        });
    }
    if (closeSuccessBtn && successOverlay) {
        closeSuccessBtn.addEventListener('click', () => closeSuccessModal());
    }
    if (successOkBtn && successOverlay) {
        successOkBtn.addEventListener('click', () => closeSuccessModal());
    }
    if (successOverlay) {
        successOverlay.addEventListener('click', (e) => {
            if (e.target === successOverlay) closeSuccessModal();
        });
    }
}
function openDetailModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    activeProductModal = product;
    modalQty = 1;
    const overlay = document.getElementById('detail-modal-overlay');
    if (!overlay) return;
    // Populating modal elements
    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-desc').textContent = product.description;
    
    document.getElementById('modal-spec-material').textContent = product.material;
    document.getElementById('modal-spec-stone').textContent = product.stone;
    document.getElementById('modal-spec-dims').textContent = product.dimensions;
    const qtyValEl = document.getElementById('modal-qty-val');
    if (qtyValEl) qtyValEl.textContent = modalQty;
    // Resetting and binding modal events
    const minusBtn = document.getElementById('modal-qty-minus');
    const plusBtn = document.getElementById('modal-qty-plus');
    const addBtn = document.getElementById('modal-add-btn');
    // Remove old event listeners by replacing nodes
    const newMinusBtn = minusBtn.cloneNode(true);
    const newPlusBtn = plusBtn.cloneNode(true);
    const newAddBtn = addBtn.cloneNode(true);
    minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
    plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    newMinusBtn.addEventListener('click', () => {
        if (modalQty > 1) {
            modalQty--;
            qtyValEl.textContent = modalQty;
        }
    });
    newPlusBtn.addEventListener('click', () => {
        modalQty++;
        qtyValEl.textContent = modalQty;
    });
    newAddBtn.addEventListener('click', () => {
        addToCart(product.id, modalQty);
        closeDetailModal();
        openCartDrawer();
    });
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeDetailModal() {
    const overlay = document.getElementById('detail-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        activeProductModal = null;
    }
}
function openSuccessModal() {
    const overlay = document.getElementById('success-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
function closeSuccessModal() {
    const overlay = document.getElementById('success-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}
// --- Newsletter Subscription ---
function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const successMsg = document.getElementById('newsletter-success');
    if (!form || !successMsg) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('.newsletter-input');
        if (emailInput.value.trim() === '') return;
        successMsg.style.display = 'block';
        emailInput.value = '';
        
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    });
}
