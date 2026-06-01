/* ==========================================================================
   PHONEZONE MAIN JAVASCRIPT APPLICATION LOGIC (AJAX & SPRING BOOT MYSQL VERSION)
   ========================================================================== */

const API_BASE_URL = window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8080/api/products" : "https://phonezone-enterprise.onrender.com/api/products";

// --- Application State ---
let products = [];
let sales = [];
let reviews = [];
let activeReviewFilters = {
    search: "",
    rating: "all"
};
let cart = JSON.parse(localStorage.getItem("phonezone-cart")) || [];
let activeFilters = {
    search: "",
    brands: [],
    seals: [],
    conditions: [],
    maxPrice: 150000
};
let selectedProductForPurchase = null;
let unseenSalesCount = 0;
let currentActiveSale = null;
let currentChartType = 'brand';

// Carousel Gallery State
let carouselImages = [];
let currentSlideIndex = 0;

// --- Shopping Cart & Tracking functions ---
function saveCart() {
    localStorage.setItem("phonezone-cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountEl = document.getElementById("cart-item-count");
    if (cartCountEl) {
        cartCountEl.innerText = cart.length;
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock === "Out of Stock") {
        toast("This device is sold out and cannot be added to cart.", "warning");
        return;
    }

    if (cart.some(item => item.id === productId)) {
        toast("This unique device is already in your cart.", "info");
        return;
    }

    cart.push(product);
    saveCart();
    renderCart();
    openCartDrawer();
    toast(`Added ${product.brand} ${product.model} to cart!`, "success");
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    toast("Item removed from cart.", "info");
}

window.removeFromCart = removeFromCart; // Expose to HTML onclick

function renderCart() {
    const cartList = document.getElementById("cart-items-list");
    const cartEmpty = document.getElementById("cart-empty-state");
    const cartFooter = document.getElementById("cart-drawer-footer");
    const cartTotal = document.getElementById("cart-grand-total");

    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = "";
        cartEmpty.style.display = "flex";
        cartFooter.style.display = "none";
    } else {
        cartEmpty.style.display = "none";
        cartFooter.style.display = "block";
        
        let subtotal = 0;
        cartList.innerHTML = cart.map(item => {
            subtotal += item.price;
            const displayAge = formatDeviceAge(item.ageValue, item.ageUnit);
            return `
                <div class="cart-item">
                    <img src="${item.image ? item.image.split(',')[0] : 'assets/images/iphone.png'}" alt="${item.model}" class="cart-item-thumb" onerror="this.src='assets/images/iphone.png'">
                    <div class="cart-item-info">
                        <div class="cart-item-title" style="font-weight:600;">${item.brand} ${item.model}</div>
                        <div class="cart-item-meta">
                            <span>${item.condition}</span>
                            <span>•</span>
                            <span>${displayAge}</span>
                        </div>
                        <div class="cart-item-price">${formatINR(item.price)}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove Item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        }).join("");

        cartTotal.innerText = formatINR(subtotal);
    }
}

function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.style.display = "block";
}

function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.style.display = "none";
}



// --- Live Activity Simulator (Visitors & Dispatch Time) ---
function startLiveActivity() {
    const visitorEl = document.getElementById("live-visitor-count");
    const dispatchEl = document.getElementById("dispatch-timer");
    
    // Fluctuate visitor count dynamically
    let currentVisitors = Math.floor(10 + Math.random() * 10);
    if (visitorEl) visitorEl.innerText = currentVisitors;
    
    setInterval(() => {
        const change = Math.random() > 0.5 ? 1 : -1;
        currentVisitors = Math.max(6, Math.min(24, currentVisitors + change));
        if (visitorEl) visitorEl.innerText = currentVisitors;
    }, 4500);
    
    // Count down to daily 9:00 PM dispatch
    function updateCountdown() {
        const now = new Date();
        const dispatchTime = new Date();
        dispatchTime.setHours(21, 0, 0, 0); // 9:00 PM
        
        if (now.getTime() >= dispatchTime.getTime()) {
            dispatchTime.setDate(dispatchTime.setDate() + 1);
        }
        
        const diffMs = dispatchTime.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        const pad = (n) => n.toString().padStart(2, '0');
        if (dispatchEl) {
            dispatchEl.innerText = `${pad(diffHrs)}h ${pad(diffMins)}m ${pad(diffSecs)}s`;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// --- Confetti Particle Celebration System ---
function launchConfetti() {
    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "confetti-canvas";
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#fbbf24", "#f43f5e", "#3b82f6"];
    const particles = [];
    const particleCount = 150;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height - 20;
            this.width = Math.random() * 6 + 4;
            this.height = Math.random() * 12 + 10;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 + 1.5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
            this.wobble = Math.random() * Math.PI;
            this.wobbleSpeed = Math.random() * 0.1 + 0.05;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.wobble += this.wobbleSpeed;
            this.rotation += this.rotationSpeed;
            this.vx += Math.sin(this.wobble) * 0.1; // sway wind effect
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            const scaleX = Math.cos(this.wobble);
            ctx.scale(scaleX, 1);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    let animationFrameId;
    const startTime = Date.now();
    const duration = 6000; // run celebration for 6 seconds
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let allOut = true;
        particles.forEach(p => {
            p.update();
            p.draw();
            if (p.y < canvas.height) {
                allOut = false;
            }
        });
        
        const elapsed = Date.now() - startTime;
        if (elapsed < duration && !allOut) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.remove();
        }
    }
    
    animate();
    
    window.addEventListener("resize", () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

// --- Initialize Database & State ---
function initApp() {
    // Load saved theme mode (light/dark)
    const savedMode = localStorage.getItem("phonezone-mode") || "dark";
    if (savedMode === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }


    
    // Launch simulated live activities
    startLiveActivity();

    // Show visual loading indicator in products grid
    const grid = document.getElementById("products-grid");
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-secondary);">
        <div class="payment-spinner" style="position:static; margin:0 auto 15px auto; width:40px; height:40px;"></div>
        <p>Connecting to backend API services...</p>
    </div>`;

    // Fetch Products, Sales logs, and Customer Reviews concurrently from Spring Boot MySQL Server
    const reviewsUrl = API_BASE_URL.replace("/products", "/reviews");
    Promise.all([
        fetch(API_BASE_URL).then(res => {
            if (!res.ok) throw new Error("Could not fetch inventory");
            return res.json();
        }),
        fetch(`${API_BASE_URL}/sales`).then(res => {
            if (!res.ok) throw new Error("Could not fetch sales log");
            return res.json();
        }),
        fetch(reviewsUrl).then(res => {
            if (!res.ok) throw new Error("Could not fetch customer reviews");
            return res.json();
        })
    ])
    .then(([fetchedProducts, fetchedSales, fetchedReviews]) => {
        // Map backend phoneCondition to condition for UI compatibility
        products = fetchedProducts.map(p => {
            p.condition = p.phoneCondition || p.condition;
            return p;
        });
        
        sales = fetchedSales;
        reviews = fetchedReviews;

        // Populate Dynamic Filter Lists
        populateFilterOptions();
        
        // Initial Render
        renderStorefront();
        renderDashboard();
        renderReviewsWall();
        
        // Initialize Cart UI
        updateCartCount();
        renderCart();
        
        // Bind Event Handlers
        bindEvents();
    })
    .catch(err => {
        console.error("Database connection failed: ", err);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; border: 1px dashed var(--color-danger); border-radius:12px; background:rgba(239,68,68,0.05);">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="1.5" style="margin-bottom:15px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h3 style="color:white; margin-bottom:8px;">Backend Connection Offline</h3>
            <p style="color:var(--text-secondary); max-width:400px; margin:0 auto 20px auto; font-size:13.5px; line-height:1.5;">
                Unable to contact the PhoneZone API at <strong>localhost:8080</strong>. Please make sure the Spring Boot server is started and running.
            </p>
            <button class="btn btn-primary" onclick="initApp()">Retry Connection</button>
        </div>`;
        toast("Backend connection failed. Read walkthrough to start Spring Boot.", "danger");
    });
}

// --- Dynamic Filter Option Populator ---
function populateFilterOptions() {
    const brandContainer = document.getElementById("filter-brands");
    const sealContainer = document.getElementById("filter-seals");
    const conditionContainer = document.getElementById("filter-conditions");
    
    // Hardcoded options matching typical store profile
    const brands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"];
    const seals = ["Sealed", "Open-Box", "Unsealed"];
    const conditions = ["Like New", "Excellent", "Good", "Fair"];
    
    brandContainer.innerHTML = brands.map(brand => `
        <label class="checkbox-item">
            <input type="checkbox" name="brand" value="${brand}" onchange="handleFilterChange(this, 'brands')">
            <span class="checkbox-custom"></span>
            <span>${brand}</span>
        </label>
    `).join("");
    
    sealContainer.innerHTML = seals.map(seal => `
        <label class="checkbox-item">
            <input type="checkbox" name="seal" value="${seal}" onchange="handleFilterChange(this, 'seals')">
            <span class="checkbox-custom"></span>
            <span>${seal}</span>
        </label>
    `).join("");

    conditionContainer.innerHTML = conditions.map(cond => `
        <label class="checkbox-item">
            <input type="checkbox" name="condition" value="${cond}" onchange="handleFilterChange(this, 'conditions')">
            <span class="checkbox-custom"></span>
            <span>${cond}</span>
        </label>
    `).join("");
}

// --- Storefront Rendering ---
function renderStorefront() {
    const grid = document.getElementById("products-grid");
    const emptyState = document.getElementById("store-empty-state");
    
    // Apply filters
    let filtered = products.filter(product => {
        // Search Filter
        const term = activeFilters.search.toLowerCase();
        const matchesSearch = term === "" || 
            product.brand.toLowerCase().includes(term) ||
            product.model.toLowerCase().includes(term) ||
            product.imei.includes(term);
            
        // Brand Checkboxes
        const matchesBrand = activeFilters.brands.length === 0 || 
            activeFilters.brands.includes(product.brand);
            
        // Seal Status Checkboxes
        const matchesSeal = activeFilters.seals.length === 0 || 
            activeFilters.seals.includes(product.seal);
            
        // Condition Checkboxes
        const matchesCondition = activeFilters.conditions.length === 0 || 
            activeFilters.conditions.includes(product.condition);
            
        // Price range
        const matchesPrice = product.price <= activeFilters.maxPrice;
        
        return matchesSearch && matchesBrand && matchesSeal && matchesCondition && matchesPrice;
    });

    // Apply Sorting
    const sortBy = document.getElementById("sort-select").value;
    if (sortBy === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "age-asc") {
        filtered.sort((a, b) => getAgeInDays(a) - getAgeInDays(b));
    } else if (sortBy === "warranty-desc") {
        filtered.sort((a, b) => getWarrantyInDays(b) - getWarrantyInDays(a));
    } // Default "featured" keeps original array order

    // Update Counts
    document.getElementById("displayed-products-count").innerText = filtered.length;
    document.getElementById("total-products-count").innerText = products.length;

    // Toggle Empty State & Customize message
    if (filtered.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
        
        const emptyStateTitle = emptyState.querySelector("h3");
        const emptyStateText = emptyState.querySelector("p");
        const emptyStateBtn = document.getElementById("btn-reset-store-filters");
        
        if (products.length === 0) {
            if (emptyStateTitle) emptyStateTitle.innerText = "Stock Replenishing...";
            if (emptyStateText) emptyStateText.innerText = "Our technicians are currently diagnostics-checking a fresh batch of flagship devices. Please check back shortly!";
            if (emptyStateBtn) emptyStateBtn.style.display = "none";
        } else {
            if (emptyStateTitle) emptyStateTitle.innerText = "No Devices Found";
            if (emptyStateText) emptyStateText.innerText = "We couldn't find any products matching your specific combination of filters. Try clearing filters or refining search parameters.";
            if (emptyStateBtn) emptyStateBtn.style.display = "inline-flex";
        }
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";
        
        grid.innerHTML = filtered.map(product => {
            const isOutOfStock = product.stock === "Out of Stock";
            const originalPriceHTML = product.originalPrice ? `<span class="card-original-price">${formatINR(product.originalPrice)}</span>` : "";
            const discountHTML = product.originalPrice ? `<span class="discount-percentage">${calculateDiscount(product.price, product.originalPrice)}% OFF</span>` : "";
            
            // Build badge classes
            const sealClass = `badge-${product.seal.toLowerCase().replace("-", "")}`;
            const condClass = `badge-${product.condition.toLowerCase().replace(" ", "")}`;
            const newBadgeHTML = isJustArrived(product.ageValue, product.ageUnit) ? '<span class="badge badge-new">Just Arrived</span>' : '';
            const displayAge = formatDeviceAge(product.ageValue, product.ageUnit);
            
            const images = product.image ? product.image.split(",") : ["assets/images/iphone.png"];
            const mainImg = images[0] || "assets/images/iphone.png";
            const hoverImg = images.length > 1 ? images[1] : null;
            const hasHoverClass = hoverImg ? "has-hover-image" : "";
            
            return `
                <div class="phone-card ${isOutOfStock ? 'out-of-stock' : ''} ${hasHoverClass}" data-id="${product.id}">
                    <div class="card-badges">
                        ${isOutOfStock ? '<span class="badge badge-outstock">Sold Out</span>' : ''}
                        ${newBadgeHTML}
                        <span class="badge ${sealClass}">${product.seal}</span>
                        <span class="badge ${condClass}">${product.condition}</span>
                    </div>
                    <div class="phone-card-image-box">
                        <div class="card-decor-glow"></div>
                        <img src="${mainImg}" alt="${product.brand} ${product.model}" class="phone-card-img main-img" onerror="this.src='assets/images/iphone.png'">
                        ${hoverImg ? `<img src="${hoverImg}" alt="${product.brand} ${product.model} Alternative Angle" class="phone-card-img hover-img" onerror="this.style.display='none'">` : ""}
                    </div>
                    <div class="phone-card-details">
                        <div class="phone-meta-row">
                            <span class="phone-brand">${product.brand}</span>
                            <span class="phone-age">${displayAge}</span>
                        </div>
                        <h3 class="phone-title">${product.model}</h3>
                        
                        <div class="phone-specs-mini">
                            <div class="spec-line">
                                <span>Config</span>
                                <span style="font-weight:600;">${product.ram}GB / ${product.rom >= 1024 ? `${(product.rom/1024).toFixed(0)}TB` : `${product.rom}GB`}</span>
                            </div>
                            <div class="spec-line">
                                <span>Battery Health</span>
                                <span>🔋 ${product.batteryHealth}%</span>
                            </div>
                            <div class="spec-line">
                                <span>IMEI Checked</span>
                                <span class="font-mono">...${product.imei.slice(-5)}</span>
                            </div>
                            <div class="spec-line">
                                <span>Warranty left</span>
                                <span>${product.warrantyValue > 0 ? `${product.warrantyValue} ${product.warrantyUnit}` : 'Expired'}</span>
                            </div>
                        </div>

                        <div class="price-box">
                            <span class="card-price">${formatINR(product.price)}</span>
                            ${originalPriceHTML}
                            ${discountHTML}
                        </div>
                        
                        <button class="card-actions-btn" onclick="openDetailsModal('${product.id}')">
                            ${isOutOfStock ? 'View Specifications' : 'View Details & Buy'}
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }
}

// --- Dashboard Logic ---
function renderDashboard() {
    // Calculators
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.pricePaid, 0);
    const totalSold = sales.length;
    const activeProducts = products.filter(p => p.stock === "In Stock").length;
    const outOfStockProducts = products.filter(p => p.stock === "Out of Stock").length;
    const totalListed = products.length;
    const avgPrice = totalListed > 0 ? products.reduce((acc, p) => acc + p.price, 0) / totalListed : 0;

    // Update Cards
    document.getElementById("stat-revenue").innerText = formatINR(totalRevenue);
    document.getElementById("stat-sold").innerText = totalSold;
    document.getElementById("stat-active").innerText = activeProducts;
    document.getElementById("stat-in-stock").innerText = `${activeProducts} active, ${outOfStockProducts} sold out`;
    document.getElementById("stat-avg-price").innerText = formatINR(avgPrice);

    // Render Inventory Table
    const invTableBody = document.getElementById("inventory-table-body");
    const invSearchVal = document.getElementById("inventory-search").value.toLowerCase();
    const invStockFilter = document.getElementById("inventory-filter-stock").value;

    let filteredInv = products.filter(p => {
        const matchesSearch = p.brand.toLowerCase().includes(invSearchVal) || 
                             p.model.toLowerCase().includes(invSearchVal) ||
                             p.id.toLowerCase().includes(invSearchVal) ||
                             p.imei.includes(invSearchVal);
                             
        const matchesStock = invStockFilter === "all" || p.stock === invStockFilter;
        return matchesSearch && matchesStock;
    });

    invTableBody.innerHTML = filteredInv.map(p => {
        const isOutOfStock = p.stock === "Out of Stock";
        const stockBadgeClass = isOutOfStock ? "stock-badge-sold" : "stock-badge-active";
        const dotClass = isOutOfStock ? "dot-danger" : "dot-success";
        
        return `
            <tr id="row-${p.id}">
                <td class="font-mono text-cyan" style="font-weight:600;">${p.id}</td>
                <td>
                    <div class="table-device-cell">
                        <img src="${p.image ? p.image.split(',')[0] : 'assets/images/iphone.png'}" alt="${p.model}" class="table-device-thumb" onerror="this.src='assets/images/iphone.png'">
                        <div>
                            <div class="device-name-bold">${p.model}</div>
                            <div class="device-sub-brand">${p.brand} • ${p.ram}GB/${p.rom >= 1024 ? `${(p.rom/1024).toFixed(0)}TB` : `${p.rom}GB`} • 🔋${p.batteryHealth}%</div>
                        </div>
                    </div>
                </td>
                <td class="font-mono">${p.imei}</td>
                <td><span class="badge badge-${p.condition.toLowerCase().replace(" ", "")}">${p.condition}</span></td>
                <td><span class="badge badge-${p.seal.toLowerCase().replace("-", "")}">${p.seal}</span></td>
                <td>
                    <div style="font-size:12px;">Age: ${p.ageValue} ${p.ageUnit}</div>
                    <div style="font-size:11px; color:var(--text-muted);">Warranty: ${p.warrantyValue > 0 ? `${p.warrantyValue} ${p.warrantyUnit}` : 'None'}</div>
                </td>
                <td style="font-weight: 700;">${formatINR(p.price)}</td>
                <td>
                    <button class="${stockBadgeClass}" onclick="toggleStockStatus('${p.id}')">
                        <span class="status-dot ${dotClass}"></span>
                        <span>${p.stock}</span>
                    </button>
                </td>
                <td>
                    <div class="table-action-btns">
                        <button class="btn-icon btn-icon-edit" onclick="triggerEditForm('${p.id}')" title="Edit Device">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button class="btn-icon btn-icon-delete" onclick="deleteListing('${p.id}')" title="Delete Listing">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    // Render Sales Table
    const salesTableBody = document.getElementById("sales-table-body");
    const salesEmpty = document.getElementById("sales-empty-state");

    if (sales.length === 0) {
        salesTableBody.innerHTML = "";
        salesEmpty.style.display = "block";
    } else {
        salesEmpty.style.display = "none";
        
        // Render sorted by newest sale first
        const sortedSales = [...sales].reverse();
        salesTableBody.innerHTML = sortedSales.map(sale => {
            const originalMSRP = sale.originalPrice ? formatINR(sale.originalPrice) : '<span class="text-muted">N/A</span>';
            
            const statusOptions = ["Pending", "Dispatched", "In Transit", "Delivered"];
            const selectOptionsHTML = statusOptions.map(opt => `
                <option value="${opt}" ${sale.status === opt ? 'selected' : ''}>${opt}</option>
            `).join("");

            // Color coding styling for the status select dropdown
            let badgeStyle = "background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.2); color: #a78bfa;"; // Default violet
            let statusDot = "dot-success";
            if (sale.status === "Pending") {
                badgeStyle = "background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.2); color: #fbbf24;"; // Amber
                statusDot = "dot-danger"; // Red-orange
            } else if (sale.status === "Dispatched") {
                badgeStyle = "background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.2); color: #22d3ee;"; // Cyan
            } else if (sale.status === "Delivered") {
                badgeStyle = "background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399;"; // Emerald
            }

            return `
                <tr>
                    <td class="font-mono text-cyan" style="font-weight:600;">${sale.orderId}</td>
                    <td>${new Date(sale.timestamp).toLocaleString()}</td>
                    <td>
                        <div style="font-weight:600; color:white;">${sale.customerName}</div>
                        <div style="font-size:11px; color:var(--text-secondary);">${sale.customerEmail}</div>
                        <div style="font-size:11px; color:var(--text-muted);">${sale.customerAddress}, ${sale.customerCity}</div>
                    </td>
                    <td>
                        <div class="device-name-bold">${sale.model}</div>
                        <div class="device-sub-brand">${sale.brand}</div>
                    </td>
                    <td class="font-mono" style="font-size: 12.5px;">${sale.imei}</td>
                    <td>${originalMSRP}</td>
                    <td class="text-success" style="font-weight: 800;">${formatINR(sale.pricePaid)}</td>
                    <td>
                        <span class="stock-badge-active">
                            <span class="status-dot dot-success"></span>
                            <span>Success</span>
                        </span>
                    </td>
                    <td>
                        <select onchange="updateSaleStatus('${sale.orderId}', this.value)" class="form-select" style="${badgeStyle} padding: 4px 8px; font-size: 11px; border-radius: 6px; cursor: pointer; outline: none; border: 1px solid transparent;">
                            ${selectOptionsHTML}
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Render Dashboard Charts
    renderDashboardCharts(currentChartType);
}

function renderDashboardCharts(type) {
    currentChartType = type;
    const container = document.getElementById("dashboard-svg-chart-container");
    const legend = document.getElementById("dashboard-chart-legend");
    if (!container || !legend) return;

    // Update active button state
    const btnBrand = document.getElementById("btn-chart-brand");
    const btnCondition = document.getElementById("btn-chart-condition");
    if (btnBrand && btnCondition) {
        if (type === 'brand') {
            btnBrand.classList.add("active");
            btnCondition.classList.remove("active");
        } else {
            btnBrand.classList.remove("active");
            btnCondition.classList.add("active");
        }
    }

    // Process data
    let dataMap = {};
    let colors = [];
    
    // Theme-compatible colors
    const brandColors = {
        "Apple": "#8b5cf6", // Violet
        "Samsung": "#06b6d4", // Cyan
        "Google": "#10b981", // Emerald
        "OnePlus": "#f59e0b", // Amber
        "Xiaomi": "#ef4444"   // Red
    };

    const conditionColors = {
        "Like New": "#06b6d4",
        "Excellent": "#8b5cf6",
        "Good": "#10b981",
        "Fair": "#ef4444"
    };

    const isLightMode = document.body.classList.contains("light-mode");
    const defaultColor = isLightMode ? "#475569" : "#94a3b8";

    if (type === 'brand') {
        products.forEach(p => {
            dataMap[p.brand] = (dataMap[p.brand] || 0) + 1;
        });
        colors = brandColors;
    } else {
        products.forEach(p => {
            const cond = p.condition || p.phoneCondition;
            if (cond) {
                dataMap[cond] = (dataMap[cond] || 0) + 1;
            }
        });
        colors = conditionColors;
    }

    const data = Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key],
        color: colors[key] || defaultColor
    })).sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        container.innerHTML = `<span style="color:var(--text-muted); font-size:13px;">No inventory data to graph.</span>`;
        legend.innerHTML = "";
        return;
    }

    // Draw Donut Chart SVG
    const radius = 70;
    const strokeWidth = 16;
    const cx = 100;
    const cy = 100;
    const circumference = 2 * Math.PI * radius; // ~439.82

    let accumulatedPercentage = 0;
    let svgCircles = "";

    data.forEach((item, index) => {
        const percentage = (item.value / total) * 100;
        const strokeDashArray = `${(percentage / 100) * circumference} ${circumference}`;
        const strokeDashOffset = -((accumulatedPercentage / 100) * circumference);
        accumulatedPercentage += percentage;

        svgCircles += `
            <circle cx="${cx}" cy="${cy}" r="${radius}"
                fill="transparent"
                stroke="${item.color}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDashArray}"
                stroke-dashoffset="${strokeDashOffset}"
                transform="rotate(-90 ${cx} ${cy})"
                style="transition: stroke-dashoffset 0.6s ease-in-out, stroke-width 0.3s ease; cursor: pointer;"
                onmouseover="this.setAttribute('stroke-width', '20')"
                onmouseout="this.setAttribute('stroke-width', '${strokeWidth}')">
                <title>${item.name}: ${item.value} (${percentage.toFixed(1)}%)</title>
            </circle>
        `;
    });

    const textColor = isLightMode ? "#0f172a" : "#ffffff";
    const subTextColor = isLightMode ? "#64748b" : "#94a3b8";

    container.innerHTML = `
        <svg width="200" height="200" viewBox="0 0 200 200" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));">
            ${svgCircles}
            <!-- Donut hole text -->
            <text x="${cx}" y="${cy - 5}" text-anchor="middle" dominant-baseline="middle" fill="${subTextColor}" font-size="11" font-weight="600" font-family="var(--font-body)">TOTAL</text>
            <text x="${cx}" y="${cy + 15}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="22" font-weight="800" font-family="var(--font-heading)">${total}</text>
        </svg>
    `;

    // Render Legend
    legend.innerHTML = data.map(item => {
        const pct = ((item.value / total) * 100).toFixed(1);
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: ${isLightMode ? '#f8fafc' : 'rgba(255, 255, 255, 0.015)'}; border: 1px solid ${isLightMode ? 'rgba(15, 23, 42, 0.05)' : 'var(--border-glass)'}; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; display: inline-block; box-shadow: 0 0 6px ${item.color};"></span>
                    <span style="font-size: 13px; font-weight: 600; color: ${isLightMode ? '#0f172a' : '#ffffff'};">${item.name}</span>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: var(--color-cyan);">${item.value} <span style="font-size: 11px; font-weight: 500; color: var(--text-muted); margin-left: 4px;">(${pct}%)</span></span>
            </div>
        `;
    }).join("");
}

window.renderDashboardCharts = renderDashboardCharts;

// --- Customer Reviews (Transparency Wall) Rendering ---
function getStarsHTML(rating) {
    let html = "";
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            html += "★";
        } else {
            html += '<span style="color:var(--text-muted);">★</span>';
        }
    }
    return html;
}

function renderReviewsWall() {
    const avgRatingEl = document.getElementById("reviews-avg-rating");
    const summaryStarsEl = document.getElementById("reviews-summary-stars");
    const totalCountEl = document.getElementById("reviews-total-count");
    const barsContainer = document.getElementById("reviews-rating-bars");
    const grid = document.getElementById("reviews-cards-grid");
    const emptyState = document.getElementById("reviews-empty-state");

    if (!grid) return;

    // 1. Calculate Aggregates
    const total = reviews.length;
    let sum = 0;
    const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};

    reviews.forEach(r => {
        sum += r.rating;
        if (distribution[r.rating] !== undefined) {
            distribution[r.rating]++;
        }
    });

    const avg = total === 0 ? 0.0 : (sum / total).toFixed(1);
    
    if (avgRatingEl) avgRatingEl.innerText = avg;
    if (summaryStarsEl) summaryStarsEl.innerHTML = getStarsHTML(parseFloat(avg));
    if (totalCountEl) totalCountEl.innerText = total;

    // 2. Render progress bars
    if (barsContainer) {
        let barsHTML = "";
        for (let stars = 5; stars >= 1; stars--) {
            const count = distribution[stars];
            const pct = total > 0 ? (count / total) * 100 : 0;
            barsHTML += `
                <div class="rating-bar-row">
                    <span class="rating-bar-label">${stars} ★</span>
                    <div class="rating-bar-bg">
                        <div class="rating-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="rating-bar-count">${count}</span>
                </div>
            `;
        }
        barsContainer.innerHTML = barsHTML;
    }

    // 3. Filter reviews
    const filtered = reviews.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(activeReviewFilters.search.toLowerCase()) ||
                             r.comment.toLowerCase().includes(activeReviewFilters.search.toLowerCase()) ||
                             r.modelName.toLowerCase().includes(activeReviewFilters.search.toLowerCase()) ||
                             r.brandName.toLowerCase().includes(activeReviewFilters.search.toLowerCase());
        const matchesRating = activeReviewFilters.rating === "all" || r.rating === parseInt(activeReviewFilters.rating);
        return matchesSearch && matchesRating;
    });

    // 4. Render cards
    if (filtered.length === 0) {
        grid.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        if (emptyState) emptyState.style.display = "none";

        grid.innerHTML = filtered.map(r => {
            // Mask customer name (e.g. "Aarav Mehta" -> "Aarav M.")
            const nameParts = r.customerName.split(" ");
            const maskedName = nameParts.map((part, idx) => {
                if (idx > 0 && part.length > 0) {
                    return part[0] + ".";
                }
                return part;
            }).join(" ");

            const dateStr = new Date(r.timestamp).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="review-customer-details">
                            <span class="review-customer-name">${maskedName}</span>
                            <span class="review-badge-verified" title="Order Verified via orderId: ${r.orderId}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>Verified Buyer</span>
                            </span>
                        </div>
                        <span class="review-date">${dateStr}</span>
                    </div>
                    <div class="review-card-meta">
                        <div class="rating-stars">${getStarsHTML(r.rating)}</div>
                        <span class="review-device-purchased">Purchased: <strong>${r.brandName} ${r.modelName}</strong></span>
                    </div>
                    <h4 class="review-card-title">${r.title || 'Verified Purchase'}</h4>
                    <p class="review-card-comment">${r.comment || 'This buyer verified their order but did not provide detailed feedback.'}</p>
                </div>
            `;
        }).join("");
    }
}

window.renderReviewsWall = renderReviewsWall;

// --- Customer View Event Handlers ---
window.handleFilterChange = function(element, filterCategory) {
    const value = element.value;
    if (element.checked) {
        activeFilters[filterCategory].push(value);
    } else {
        activeFilters[filterCategory] = activeFilters[filterCategory].filter(item => item !== value);
    }
    renderStorefront();
};

window.setQuickFilter = function(filterCategory, value) {
    // Reset other filters
    resetFiltersState();
    
    // Find matching checkbox
    const checkboxes = document.querySelectorAll(`input[name="${filterCategory}"]`);
    checkboxes.forEach(chk => {
        if (chk.value === value) {
            chk.checked = true;
            activeFilters[filterCategory + 's'].push(value); // brand -> brands, seal -> seals
        }
    });
    
    renderStorefront();
};

function resetFiltersState() {
    activeFilters = {
        search: "",
        brands: [],
        seals: [],
        conditions: [],
        maxPrice: 150000
    };
    
    document.getElementById("search-input").value = "";
    document.getElementById("price-slider").value = 150000;
    document.getElementById("price-slider-value").innerText = "₹1,50,000";
    
    const checkboxes = document.querySelectorAll('.checkbox-item input');
    checkboxes.forEach(chk => chk.checked = false);
}

// --- Modal Functions ---
window.openDetailsModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    selectedProductForPurchase = product;

    // Populate carousel track and dots
    carouselImages = product.image ? product.image.split(",") : ["assets/images/iphone.png"];
    currentSlideIndex = 0;

    const track = document.getElementById("detail-carousel-track");
    if (track) {
        track.innerHTML = carouselImages.map(imgSrc => `
            <div class="carousel-slide-item">
                <img src="${imgSrc}" alt="${product.brand} ${product.model}" onerror="this.src='assets/images/iphone.png'">
            </div>
        `).join("");
    }

    const dotsContainer = document.getElementById("detail-carousel-dots");
    if (dotsContainer) {
        if (carouselImages.length > 1) {
            dotsContainer.innerHTML = carouselImages.map((_, idx) => `
                <span class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="setCarouselSlide(${idx})"></span>
            `).join("");
            document.getElementById("detail-carousel-prev").style.display = "flex";
            document.getElementById("detail-carousel-next").style.display = "flex";
        } else {
            dotsContainer.innerHTML = "";
            document.getElementById("detail-carousel-prev").style.display = "none";
            document.getElementById("detail-carousel-next").style.display = "none";
        }
    }
    updateCarouselView();
    
    const badgeSeal = document.getElementById("detail-badge-seal");
    badgeSeal.innerText = product.seal;
    badgeSeal.className = `badge badge-${product.seal.toLowerCase().replace("-", "")}`;
    
    const badgeCond = document.getElementById("detail-badge-condition");
    badgeCond.innerText = product.condition;
    badgeCond.className = `badge badge-${product.condition.toLowerCase().replace(" ", "")}`;

    document.getElementById("detail-title-text").innerText = product.model;
    document.getElementById("detail-brand-text").innerText = `Brand: ${product.brand}`;
    document.getElementById("detail-price-text").innerText = formatINR(product.price);
    
    const origPriceEl = document.getElementById("detail-original-price-text");
    const savingsEl = document.getElementById("detail-savings-text");
    
    if (product.originalPrice) {
        origPriceEl.style.display = "inline";
        origPriceEl.innerText = formatINR(product.originalPrice);
        savingsEl.style.display = "inline-flex";
        
        const savingsAmt = product.originalPrice - product.price;
        const savingsPct = calculateDiscount(product.price, product.originalPrice);
        savingsEl.innerText = `Save ${formatINR(savingsAmt)} (${savingsPct}% off)`;
    } else {
        origPriceEl.style.display = "none";
        savingsEl.style.display = "none";
    }

    const isNew = isJustArrived(product.ageValue, product.ageUnit);
    document.getElementById("detail-age-text").innerText = formatDeviceAge(product.ageValue, product.ageUnit) + (isNew ? " (Just Arrived)" : "");
    document.getElementById("detail-warranty-text").innerText = product.warrantyValue > 0 ? `${product.warrantyValue} ${product.warrantyUnit} remaining` : "Expired / No Warranty";
    document.getElementById("detail-ram-rom-text").innerText = `${product.ram}GB / ${product.rom >= 1024 ? `${(product.rom/1024).toFixed(0)}TB` : `${product.rom}GB`}`;
    document.getElementById("detail-battery-health-text").innerText = `🔋 ${product.batteryHealth}%`;
    document.getElementById("detail-imei-text").innerText = maskIMEI(product.imei);
    document.getElementById("detail-desc-text").innerText = product.description;

    // Stock control
    const checkoutBtn = document.getElementById("btn-details-checkout");
    const stockStatus = document.getElementById("detail-stock-status");
    const stockDot = stockStatus.querySelector(".stock-dot");
    const stockText = stockStatus.querySelector(".stock-text");

    if (product.stock === "Out of Stock") {
        checkoutBtn.disabled = true;
        checkoutBtn.querySelector("span").innerText = "Sold Out";
        stockDot.className = "stock-dot dot-danger";
        stockText.innerText = "Sold Out / Out of Stock";
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.querySelector("span").innerText = "Buy Directly Now";
        stockDot.className = "stock-dot dot-success";
        stockText.innerText = "In Stock (Ready to Ship)";
    }

    // Open Modal
    document.getElementById("details-modal").style.display = "flex";
};

// --- Checkout Flow Logic ---
function openCheckoutModal() {
    if (cart.length === 0) {
        toast("Your cart is empty.", "warning");
        return;
    }

    // Reset Forms
    document.getElementById("checkout-shipping-form").reset();
    document.getElementById("checkout-payment-form").reset();

    // Populate checkout item summary with list of items in cart
    const summaryItemsEl = document.getElementById("chk-summary-phone");
    summaryItemsEl.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;">
            <span style="font-weight:500; color:white;">${item.brand} ${item.model}</span>
            <span style="color:var(--color-cyan); font-weight:600;">${formatINR(item.price)}</span>
        </div>
    `).join("");

    let grandTotal = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById("chk-summary-total").innerText = formatINR(grandTotal);

    // Show Step 1, Hide others
    showCheckoutStep(1);

    // Open Modal
    document.getElementById("checkout-modal").style.display = "flex";
}

function showCheckoutStep(stepNumber) {
    for (let i = 1; i <= 4; i++) {
        const stepDiv = document.getElementById(`checkout-step-${i}`);
        if (stepDiv) {
            if (i === stepNumber) {
                stepDiv.classList.add("active");
            } else {
                stepDiv.classList.remove("active");
            }
        }
    }
}

// --- Dashboard Inventory Actions ---
window.toggleStockStatus = function(productId) {
    fetch(`${API_BASE_URL}/toggle-stock/${productId}`, {
        method: "PUT",
        headers: {
            "X-API-KEY": sessionStorage.getItem("phonezone-admin-passcode") || ""
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to toggle stock status");
        return res.json();
    })
    .then(updatedProduct => {
        updatedProduct.condition = updatedProduct.phoneCondition || updatedProduct.condition;
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = updatedProduct;
        }
        renderStorefront();
        renderDashboard();
        toast(`Stock status for ${updatedProduct.model} updated to ${updatedProduct.stock}.`, "info");
    })
    .catch(err => {
        console.error(err);
        toast("Failed to update stock status in database.", "danger");
    });
};

window.deleteListing = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Are you sure you want to permanently delete the listing for "${product.brand} ${product.model}"?`)) {
        fetch(`${API_BASE_URL}/${productId}`, {
            method: "DELETE",
            headers: {
                "X-API-KEY": sessionStorage.getItem("phonezone-admin-passcode") || ""
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete product listing");
            products = products.filter(p => p.id !== productId);
            renderStorefront();
            renderDashboard();
            toast("Product listing removed successfully.", "danger");
        })
        .catch(err => {
            console.error(err);
            toast("Failed to delete product from database.", "danger");
        });
    }
};

window.triggerEditForm = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Open form
    const container = document.getElementById("product-form-container");
    container.style.display = "block";
    document.getElementById("btn-toggle-add-form").style.display = "none";
    document.getElementById("form-title").innerText = "Edit Phone Listing Details";

    // Pre-fill form values
    document.getElementById("form-product-id").value = product.id;
    document.getElementById("form-brand").value = product.brand;
    document.getElementById("form-model").value = product.model;
    document.getElementById("form-price").value = product.price;
    document.getElementById("form-original-price").value = product.originalPrice || "";
    document.getElementById("form-imei").value = product.imei;
    document.getElementById("form-age-value").value = product.ageValue;
    document.getElementById("form-age-unit").value = product.ageUnit;
    document.getElementById("form-warranty-value").value = product.warrantyValue;
    document.getElementById("form-warranty-unit").value = product.warrantyUnit;
    document.getElementById("form-ram").value = product.ram || "";
    document.getElementById("form-rom").value = product.rom || "";
    document.getElementById("form-battery-health").value = product.batteryHealth || "";
    
    const isPreset = product.image && product.image.startsWith("assets/");
    if (isPreset) {
        document.querySelector('input[name="image-mode"][value="preset"]').checked = true;
        toggleImageUploadMode('preset');
        document.getElementById("form-image-preset").value = product.image;
    } else {
        document.querySelector('input[name="image-mode"][value="upload"]').checked = true;
        toggleImageUploadMode('upload');
        document.getElementById("form-image-upload").value = "";
    }
    
    document.getElementById("form-condition").value = product.condition;
    document.getElementById("form-seal").value = product.seal;
    document.getElementById("form-stock").value = product.stock;
    document.getElementById("form-description").value = product.description;

    // Scroll to form
    container.scrollIntoView({ behavior: 'smooth' });
};

// --- Toast Messaging ---
function toast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconHTML = "";
    if (type === "success") {
        iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon success"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "danger") {
        iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon danger"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === "warning") {
        iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        ${iconHTML}
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    
    // Auto remove after 3.5s
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// --- Helper Functions ---
function formatINR(num) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

// Discount calculator
function calculateDiscount(price, original) {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
}

function getAgeInMonths(ageValue, ageUnit) {
    let ageInMonths = 0;
    const val = parseFloat(ageValue) || 0;
    if (ageUnit === "days") {
        ageInMonths = val / 30.4;
    } else if (ageUnit === "months") {
        ageInMonths = val;
    } else if (ageUnit === "years") {
        ageInMonths = val * 12;
    }
    return ageInMonths;
}

function formatDeviceAge(ageValue, ageUnit) {
    const ageInMonths = getAgeInMonths(ageValue, ageUnit);
    if (ageInMonths >= 12) {
        const currentYear = new Date().getFullYear();
        const ageInYears = ageInMonths / 12;
        const modelYear = Math.round(currentYear - ageInYears);
        return `Model Year: ${modelYear}`;
    } else {
        return `${ageValue} ${ageUnit} old`;
    }
}

function isJustArrived(ageValue, ageUnit) {
    const ageInMonths = getAgeInMonths(ageValue, ageUnit);
    return ageInMonths < 3;
}

function maskIMEI(imei) {
    if (!imei || imei.length < 9) return "•••••••••••••••";
    return imei.slice(0, 7) + "******" + imei.slice(-2);
}

function downloadDiagnosticsPDF(product) {
    const today = new Date().toLocaleDateString('en-IN');
    const pdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595.28 841.89] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 750 >>
stream
BT
/F1 22 Tf
70 750 Td
(PHONEZONE CERTIFICATE OF DIAGNOSTICS & QUALITY) Tj
/F2 12 Tf
0 -40 Td
(This document verifies that the device listed below has undergone our rigorous) Tj
0 -15 Td
(45-point hardware and software diagnostics check and is certified for sale.) Tj
0 -40 Td
/F1 14 Tf
(DEVICE PROFILE:) Tj
/F2 12 Tf
0 -25 Td
(Brand: ${product.brand}) Tj
0 -20 Td
(Model: ${product.model}) Tj
0 -20 Td
(Serial/IMEI: ${product.imei}) Tj
0 -20 Td
(Device Condition: ${product.condition}) Tj
0 -20 Td
(Seal Status: ${product.seal}) Tj
0 -40 Td
/F1 14 Tf
(DIAGNOSTICS CHECKLIST RESULT: PASS) Tj
/F2 12 Tf
0 -25 Td
(- IMEI status check: CLEAN / NOT BLACKLISTED) Tj
0 -20 Td
(- MDM / Find My Phone Lock check: REMOVED / DEACTIVATED) Tj
0 -20 Td
(- Screen, Touch Digitizer & OLED: 100% FUNCTIONAL) Tj
0 -20 Td
(- Battery Health: PASSED) Tj
0 -20 Td
(- Camera autofocus, Flash & Sensors: OK) Tj
0 -20 Td
(- Wireless connection (Wi-Fi, Bluetooth, 5G/LTE): OK) Tj
0 -20 Td
(- Audio output (Speakers, Mic, Receiver): OK) Tj
0 -40 Td
(Certified by PhoneZone Enterprise Security Gateway on ${today}.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000062 00000 n 
0000000117 00000 n 
0000000229 00000 n 
0000000346 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1148
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Diagnostics_Report_${product.brand}_${product.model.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadInvoicePDF(saleOrSales) {
    if (!saleOrSales) return;
    
    // Check if it is array or single object
    const isArray = Array.isArray(saleOrSales);
    const salesList = isArray ? saleOrSales : [saleOrSales];
    
    if (salesList.length === 0) return;
    
    const primeSale = salesList[0];
    const dateStr = new Date(primeSale.timestamp).toLocaleDateString('en-IN');
    
    // Calculate total price
    const totalPaid = salesList.reduce((sum, s) => sum + s.pricePaid, 0);
    
    // Create items details string
    let itemsDetailsPDF = "";
    salesList.forEach((s, idx) => {
        itemsDetailsPDF += `0 -20 Td (${idx+1}. ${s.brand} ${s.model} - IMEI: ${s.imei}) Tj\n`;
        itemsDetailsPDF += `0 -15 Td (   Price: INR ${s.pricePaid.toLocaleString('en-IN')} | Warranty: ${s.warrantyLeft || 'Expired'}) Tj\n`;
    });
    
    const pdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595.28 841.89] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 1200 >>
stream
BT
/F1 20 Tf
70 760 Td
(PHONEZONE RETAIL CO. - TAX INVOICE) Tj
/F2 11 Tf
0 -35 Td
(Order ID: ${primeSale.orderId}) Tj
0 -18 Td
(Transaction ID: ${primeSale.txId}) Tj
0 -18 Td
(Date: ${dateStr}) Tj
0 -30 Td
/F1 13 Tf
(BILL TO:) Tj
/F2 11 Tf
0 -20 Td
(Customer Name: ${primeSale.customerName}) Tj
0 -18 Td
(Email Address: ${primeSale.customerEmail}) Tj
0 -18 Td
(Shipping Address: ${primeSale.customerAddress}, ${primeSale.customerCity}) Tj
0 -35 Td
/F1 13 Tf
(PRODUCT DETAILS:) Tj
/F2 11 Tf
${itemsDetailsPDF}
/F1 13 Tf
0 -30 Td
(AMOUNT BILLED:) Tj
/F2 11 Tf
0 -20 Td
(Subtotal: INR ${totalPaid.toLocaleString('en-IN')}) Tj
0 -18 Td
(Shipping & Insurance: FREE) Tj
/F1 13 Tf
0 -22 Td
(Total Paid: INR ${totalPaid.toLocaleString('en-IN')}) Tj
/F2 10 Tf
0 -40 Td
(Thank you for shopping at PhoneZone! For support, email help@phonezone.com) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000062 00000 n 
0000000117 00000 n 
0000000229 00000 n 
0000000346 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1250
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${primeSale.orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getAgeInDays(prod) {
    let days = parseFloat(prod.ageValue) || 0;
    if (prod.ageUnit === "months") {
        days = days * 30.4;
    } else if (prod.ageUnit === "years") {
        days = days * 365;
    }
    return days;
}

function getWarrantyInDays(prod) {
    let days = parseFloat(prod.warrantyValue) || 0;
    if (prod.warrantyUnit === "months") {
        days = days * 30.4;
    } else if (prod.warrantyUnit === "years") {
        days = days * 365;
    }
    return days;
}

// --- Carousel & Image Upload Helpers ---
window.toggleImageUploadMode = function(mode) {
    const fieldPreset = document.getElementById("field-image-preset");
    const fieldUpload = document.getElementById("field-image-upload");
    if (mode === 'upload') {
        fieldPreset.style.display = "none";
        fieldUpload.style.display = "block";
    } else {
        fieldPreset.style.display = "block";
        fieldUpload.style.display = "none";
    }
};

function compressImage(file, maxWidth = 900, maxHeight = 900, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                // Maintain aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
            img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

function readImagesAsBase64(files) {
    const promises = Array.from(files).map(file => {
        if (file.type.startsWith("image/")) {
            return compressImage(file, 900, 900, 0.7);
        } else {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(file);
            });
        }
    });
    return Promise.all(promises);
}

window.moveCarousel = function(direction) {
    if (carouselImages.length <= 1) return;
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) {
        currentSlideIndex = carouselImages.length - 1;
    } else if (currentSlideIndex >= carouselImages.length) {
        currentSlideIndex = 0;
    }
    updateCarouselView();
};

window.setCarouselSlide = function(index) {
    currentSlideIndex = index;
    updateCarouselView();
};

function updateCarouselView() {
    const track = document.getElementById("detail-carousel-track");
    const dotsContainer = document.getElementById("detail-carousel-dots");
    if (!track) return;
    const offset = -currentSlideIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((dot, idx) => {
            if (idx === currentSlideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }
}

// --- Event Binding ---
function bindEvents() {


    // Light/Dark Mode toggle handler
    const btnThemeToggle = document.getElementById("btn-theme-toggle");
    if (btnThemeToggle) {
        btnThemeToggle.addEventListener("click", () => {
            const isLight = document.body.classList.toggle("light-mode");
            localStorage.setItem("phonezone-mode", isLight ? "light" : "dark");
            toast(`Switched to ${isLight ? 'Light' : 'Dark'} Mode!`, "info");
        });
    }

    // Nav view switcher buttons
    const btnStore = document.getElementById("btn-store-view");
    const btnAdmin = document.getElementById("btn-admin-view");
    const logo = document.getElementById("nav-logo");
    
    const customerView = document.getElementById("customer-view");
    const adminView = document.getElementById("admin-view");
    const adminLoginModal = document.getElementById("admin-login-modal");
    const adminPasscode = document.getElementById("admin-passcode");

    function syncPinDots() {
        const val = adminPasscode.value;
        const dots = document.querySelectorAll("#admin-pin-dots .pin-dot");
        dots.forEach((dot, idx) => {
            if (idx < val.length) {
                dot.classList.add("filled");
            } else {
                dot.classList.remove("filled");
            }
        });
    }

    function switchView(viewName, skipScroll = false) {
        if (viewName === "store") {
            btnStore.classList.add("active");
            btnAdmin.classList.remove("active");
            customerView.classList.add("active");
            adminView.classList.remove("active");
        } else {
            if (sessionStorage.getItem("phonezone-admin-auth") !== "true") {
                adminLoginModal.style.display = "flex";
                const lockIcon = document.getElementById("admin-lock-icon-container");
                if (lockIcon) {
                    lockIcon.classList.remove("unlocked");
                }
                adminPasscode.value = "";
                syncPinDots();
                setTimeout(() => adminPasscode.focus(), 100);
                return;
            }

            btnStore.classList.remove("active");
            btnAdmin.classList.add("active");
            customerView.classList.remove("active");
            adminView.classList.add("active");
            
            // Clear owner alerts badge when visiting dashboard
            unseenSalesCount = 0;
            const badge = document.getElementById("admin-badge-count");
            badge.style.display = "none";
            badge.innerText = "0";
            
            // Re-render dashboard components
            renderDashboard();
        }
        if (!skipScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    btnStore.addEventListener("click", () => switchView("store"));
    btnAdmin.addEventListener("click", () => switchView("admin"));
    logo.addEventListener("click", () => switchView("store"));

    // Scroll to specific section Helper with header offset compensation
    function scrollToSection(sectionId) {
        // If owner dashboard is active, switch to store view first
        if (adminView && adminView.classList.contains("active")) {
            switchView("store", true);
        }
        const target = document.getElementById(sectionId);
        if (target) {
            // Get fixed header height dynamically
            const headerHeight = document.querySelector(".app-header")?.offsetHeight || 75;
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerHeight - 20; // 20px padding buffer

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }

    const btnNavReviews = document.getElementById("btn-nav-reviews");
    const btnNavTracking = document.getElementById("btn-nav-tracking");
    if (btnNavReviews) {
        btnNavReviews.addEventListener("click", () => scrollToSection("transparency-wall"));
    }
    if (btnNavTracking) {
        btnNavTracking.addEventListener("click", () => scrollToSection("order-tracking-section"));
    }
    
    // Cart Button Click - Open the Cart Drawer
    document.getElementById("btn-cart-view").addEventListener("click", () => {
        openCartDrawer();
    });

    // Cart Drawer bindings
    document.getElementById("btn-close-cart").addEventListener("click", () => {
        closeCartDrawer();
    });
    document.getElementById("cart-drawer-overlay").addEventListener("click", () => {
        closeCartDrawer();
    });
    document.getElementById("btn-cart-continue").addEventListener("click", () => {
        closeCartDrawer();
    });
    document.getElementById("btn-cart-checkout").addEventListener("click", () => {
        closeCartDrawer();
        openCheckoutModal();
    });

    // Tracking Order bindings
    document.getElementById("btn-track-order").addEventListener("click", () => {
        trackOrder();
    });
    document.getElementById("track-order-id-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            trackOrder();
        }
    });
    document.getElementById("btn-track-download-invoice").addEventListener("click", () => {
        if (window.trackActiveOrderItems) {
            downloadInvoicePDF(window.trackActiveOrderItems);
        }
    });

    // Reset Filters Buttons
    document.getElementById("btn-clear-filters").addEventListener("click", () => {
        resetFiltersState();
        renderStorefront();
        toast("Filters reset successfully.", "info");
    });
    
    document.getElementById("btn-reset-store-filters").addEventListener("click", () => {
        resetFiltersState();
        renderStorefront();
        toast("Filters reset successfully.", "info");
    });

    // Chart toggle buttons
    const btnChartBrand = document.getElementById("btn-chart-brand");
    const btnChartCondition = document.getElementById("btn-chart-condition");
    if (btnChartBrand) {
        btnChartBrand.addEventListener("click", () => renderDashboardCharts("brand"));
    }
    if (btnChartCondition) {
        btnChartCondition.addEventListener("click", () => renderDashboardCharts("condition"));
    }

    // Search input
    document.getElementById("search-input").addEventListener("input", (e) => {
        activeFilters.search = e.target.value;
        renderStorefront();
    });

    // Price range slider
    const priceSlider = document.getElementById("price-slider");
    const priceSliderValue = document.getElementById("price-slider-value");
    
    priceSlider.addEventListener("input", (e) => {
        activeFilters.maxPrice = parseFloat(e.target.value);
        priceSliderValue.innerText = formatINR(activeFilters.maxPrice);
        renderStorefront();
    });

    // Sort select
    document.getElementById("sort-select").addEventListener("change", () => {
        renderStorefront();
    });

    // Modals closing events
    document.getElementById("btn-close-details").addEventListener("click", () => {
        document.getElementById("details-modal").style.display = "none";
    });
    
    document.getElementById("btn-close-checkout").addEventListener("click", () => {
        document.getElementById("checkout-modal").style.display = "none";
    });

    const closeAdminLogin = () => {
        adminLoginModal.style.display = "none";
        adminPasscode.value = "";
        syncPinDots();
    };

    document.getElementById("btn-close-admin-login").addEventListener("click", closeAdminLogin);

    const keypadCancel = document.getElementById("btn-keypad-cancel");
    if (keypadCancel) {
        keypadCancel.addEventListener("click", closeAdminLogin);
    }

    const keypadBackspace = document.getElementById("btn-keypad-backspace");
    if (keypadBackspace) {
        keypadBackspace.addEventListener("click", (e) => {
            e.stopPropagation();
            const pinDotsContainer = document.getElementById("admin-pin-dots");
            const lockIcon = document.getElementById("admin-lock-icon-container");
            if (pinDotsContainer.classList.contains("shake-dots") || lockIcon.classList.contains("unlocked")) {
                return;
            }
            adminPasscode.value = adminPasscode.value.slice(0, -1);
            syncPinDots();
            adminPasscode.focus();
        });
    }

    // Focus physical input field when clicking anywhere in pin wrapper
    const pinWrapper = document.querySelector(".pin-wrapper");
    if (pinWrapper) {
        pinWrapper.addEventListener("click", () => {
            adminPasscode.focus();
        });
    }

    function validatePasscode() {
        const passcode = adminPasscode.value;
        const lockIcon = document.getElementById("admin-lock-icon-container");
        const pinDotsContainer = document.getElementById("admin-pin-dots");
        
        if (passcode === "8080") {
            sessionStorage.setItem("phonezone-admin-auth", "true");
            sessionStorage.setItem("phonezone-admin-passcode", passcode);
            
            // Animate lock opening!
            if (lockIcon) {
                lockIcon.classList.add("unlocked");
            }
            
            toast("Authentication successful! Welcome to Dashboard.", "success");
            
            // Wait for open-lock animations
            setTimeout(() => {
                closeAdminLogin();
                switchView("admin");
            }, 600);
        } else {
            // Error shake feedback
            if (pinDotsContainer) {
                pinDotsContainer.classList.add("shake-dots");
                setTimeout(() => {
                    pinDotsContainer.classList.remove("shake-dots");
                    adminPasscode.value = "";
                    syncPinDots();
                    adminPasscode.focus();
                }, 500);
            }
            toast("Incorrect passcode. Access Denied.", "danger");
        }
    }

    // Handle physical keyboard typing
    adminPasscode.addEventListener("input", () => {
        const pinDotsContainer = document.getElementById("admin-pin-dots");
        const lockIcon = document.getElementById("admin-lock-icon-container");
        if (pinDotsContainer.classList.contains("shake-dots") || lockIcon.classList.contains("unlocked")) {
            adminPasscode.value = "";
            syncPinDots();
            return;
        }

        adminPasscode.value = adminPasscode.value.replace(/[^0-9]/g, '').slice(0, 4);
        syncPinDots();

        if (adminPasscode.value.length === 4) {
            validatePasscode();
        }
    });

    // Handle virtual keypad numeric button clicks
    const keypadBtns = document.querySelectorAll(".keypad-btn");
    keypadBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent refocusing event triggering twice
            const val = btn.getAttribute("data-val");
            const pinDotsContainer = document.getElementById("admin-pin-dots");
            const lockIcon = document.getElementById("admin-lock-icon-container");
            
            // Block input if currently shaking or unlocked
            if (pinDotsContainer.classList.contains("shake-dots") || lockIcon.classList.contains("unlocked")) {
                return;
            }

            if (adminPasscode.value.length < 4) {
                adminPasscode.value += val;
            }
            syncPinDots();

            if (adminPasscode.value.length === 4) {
                validatePasscode();
            } else {
                adminPasscode.focus();
            }
        });
    });

    // Admin logout button click
    const btnAdminLogout = document.getElementById("btn-admin-logout");
    if (btnAdminLogout) {
        btnAdminLogout.addEventListener("click", () => {
            sessionStorage.removeItem("phonezone-admin-auth");
            toast("Admin logged out successfully.", "info");
            switchView("store");
        });
    }

    // Close modals when clicking overlay
    window.addEventListener("click", (e) => {
        const detailsModal = document.getElementById("details-modal");
        const checkoutModal = document.getElementById("checkout-modal");
        
        if (e.target === detailsModal) {
            detailsModal.style.display = "none";
        }
        if (e.target === checkoutModal) {
            // Do not close during payment processing
            const loaderStep = document.getElementById("checkout-step-3");
            if (!loaderStep.classList.contains("active")) {
                checkoutModal.style.display = "none";
            }
        }
        if (e.target === adminLoginModal) {
            closeAdminLogin();
        }
    });

    // Detail Add to Cart button
    document.getElementById("btn-details-checkout").addEventListener("click", () => {
        if (selectedProductForPurchase) {
            addToCart(selectedProductForPurchase.id);
            document.getElementById("details-modal").style.display = "none";
        }
    });

    // Checkout Step 1 Shipping Form Submission
    const shippingForm = document.getElementById("checkout-shipping-form");
    shippingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Populate step 2 credit card preview name
        const nameVal = document.getElementById("chk-name").value;
        document.getElementById("preview-card-name").innerText = nameVal.toUpperCase() || "JOHN DOE";
        
        // Go to payment step
        showCheckoutStep(2);
    });

    // Card Input Syncing to Card Widget Preview
    const cardholderInput = document.getElementById("pay-name");
    const cardnumberInput = document.getElementById("pay-number");
    const cardexpiryInput = document.getElementById("pay-expiry");

    cardholderInput.addEventListener("input", (e) => {
        document.getElementById("preview-card-name").innerText = e.target.value.toUpperCase() || "CARDHOLDER NAME";
    });

    cardnumberInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = "";
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += " ";
            }
            formatted += value[i];
        }
        e.target.value = formatted;
        document.getElementById("preview-card-number").innerText = formatted || "•••• •••• •••• ••••";
    });

    cardexpiryInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (value.length > 2) {
            e.target.value = value.slice(0, 2) + "/" + value.slice(2, 4);
        } else {
            e.target.value = value;
        }
        document.getElementById("preview-card-expiry").innerText = e.target.value || "MM/YY";
    });

    // Back to Step 1 Button
    document.getElementById("btn-back-to-step-1").addEventListener("click", () => {
        showCheckoutStep(1);
    });

    // Checkout Step 2 Payment Submission & Simulated Gateway Processing
    const paymentForm = document.getElementById("checkout-payment-form");
    paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        showCheckoutStep(3); // Go to loading screen
        
        const progressSteps = [
            "Contacting secure merchant server...",
            "Encrypting payload with AES-256 keys...",
            "Authenticating credentials with bank issuer...",
            "Processing card clearance...",
            "Securing order transaction lock..."
        ];

        const loaderStatus = document.getElementById("payment-loader-status");
        
        // Sequentially update progress statements to simulate processing
        let currentStatusIndex = 0;
        const progressInterval = setInterval(() => {
            if (currentStatusIndex < progressSteps.length) {
                loaderStatus.innerText = progressSteps[currentStatusIndex];
                currentStatusIndex++;
            } else {
                clearInterval(progressInterval);
                completeTransaction();
            }
        }, 800);
    });

    // Digital Receipt back to store button
    document.getElementById("btn-close-receipt").addEventListener("click", () => {
        document.getElementById("checkout-modal").style.display = "none";
    });

    // Admin form toggler
    const toggleFormBtn = document.getElementById("btn-toggle-add-form");
    const closeFormBtn = document.getElementById("btn-close-form");
    const cancelFormBtn = document.getElementById("btn-cancel-form");
    const formContainer = document.getElementById("product-form-container");
    
    function toggleAddForm(show) {
        if (show) {
            formContainer.style.display = "block";
            toggleFormBtn.style.display = "none";
            document.getElementById("form-title").innerText = "Add New Phone Listing";
            document.getElementById("product-form").reset();
            toggleImageUploadMode('preset');
            document.getElementById("form-product-id").value = "";
        } else {
            formContainer.style.display = "none";
            toggleFormBtn.style.display = "flex";
        }
    }

    toggleFormBtn.addEventListener("click", () => toggleAddForm(true));
    closeFormBtn.addEventListener("click", () => toggleAddForm(false));
    cancelFormBtn.addEventListener("click", () => toggleAddForm(false));

    // Admin Add/Edit Form Submit
    const productForm = document.getElementById("product-form");
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const productIdVal = document.getElementById("form-product-id").value;
        const brand = document.getElementById("form-brand").value;
        const model = document.getElementById("form-model").value;
        const price = parseFloat(document.getElementById("form-price").value);
        const originalPrice = parseFloat(document.getElementById("form-original-price").value) || null;
        const imei = document.getElementById("form-imei").value;
        const ageValue = parseFloat(document.getElementById("form-age-value").value);
        const ageUnit = document.getElementById("form-age-unit").value;
        const warrantyValue = parseFloat(document.getElementById("form-warranty-value").value);
        const warrantyUnit = document.getElementById("form-warranty-unit").value;
        const condition = document.getElementById("form-condition").value;
        const seal = document.getElementById("form-seal").value;
        const stock = document.getElementById("form-stock").value;
        const description = document.getElementById("form-description").value;
        const ram = parseInt(document.getElementById("form-ram").value);
        const rom = parseInt(document.getElementById("form-rom").value);
        const batteryHealth = parseInt(document.getElementById("form-battery-health").value);

        if (originalPrice && originalPrice < price) {
            toast("Original MSRP price cannot be less than the listed selling price.", "warning");
            return;
        }

        // Perform edit vs add
        const productId = productIdVal || `PZ-${Math.floor(1000 + Math.random() * 9000)}`;

        const imageMode = document.querySelector('input[name="image-mode"]:checked').value;
        let imagePromise;
        if (imageMode === 'upload') {
            const files = document.getElementById("form-image-upload").files;
            if (files.length === 0) {
                const product = products.find(p => p.id === productIdVal);
                if (product && product.image) {
                    imagePromise = Promise.resolve(product.image);
                } else {
                    toast("Please upload at least one phone photo.", "warning");
                    return;
                }
            } else {
                imagePromise = readImagesAsBase64(files).then(base64s => base64s.join(","));
            }
        } else {
            imagePromise = Promise.resolve(document.getElementById("form-image-preset").value);
        }

        imagePromise.then(image => {
            const productPayload = {
                id: productId,
                brand,
                model,
                price,
                originalPrice,
                imei,
                ageValue,
                ageUnit,
                warrantyValue,
                warrantyUnit,
                phoneCondition: condition, // Maps to backend property
                seal,
                image,
                stock,
                description,
                ram,
                rom,
                batteryHealth
            };

            // Submit to Spring Boot API
            fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": sessionStorage.getItem("phonezone-admin-passcode") || ""
                },
                body: JSON.stringify(productPayload)
            })
            .then(async res => {
                if (!res.ok) {
                    let errMsg = "Failed to save product listing";
                    try {
                        const errData = await res.json();
                        if (errData && errData.error) {
                            errMsg = errData.error;
                        } else if (errData && errData.message) {
                            errMsg = errData.message;
                        }
                    } catch (e) {
                        try {
                            const txt = await res.text();
                            if (txt) errMsg = txt;
                        } catch (e2) {}
                    }
                    throw new Error(errMsg);
                }
                return res.json();
            })
            .then(savedProduct => {
                savedProduct.condition = savedProduct.phoneCondition || savedProduct.condition;
                
                const index = products.findIndex(p => p.id === savedProduct.id);
                if (index !== -1) {
                    products[index] = savedProduct;
                    toast("Listing updated successfully!");
                } else {
                    products.push(savedProduct);
                    toast("New phone listing published successfully!");
                }

                toggleAddForm(false);
                renderStorefront();
                renderDashboard();
            })
            .catch(err => {
                console.error(err);
                toast(`Failed to save phone listing: ${err.message}`, "danger");
            });
        }).catch(err => {
            console.error(err);
            toast("Failed to process photo uploads.", "danger");
        });
    });

    // Admin Inventory Search & Filter events
    document.getElementById("inventory-search").addEventListener("input", () => {
        renderDashboard();
    });
    
    document.getElementById("inventory-filter-stock").addEventListener("change", () => {
        renderDashboard();
    });

    // Admin Dashboard tabs toggle
    const tabInvBtn = document.getElementById("tab-btn-inventory");
    const tabSalesBtn = document.getElementById("tab-btn-sales");
    const tabInvContent = document.getElementById("tab-inventory");
    const tabSalesContent = document.getElementById("tab-sales");

    tabInvBtn.addEventListener("click", () => {
        tabInvBtn.classList.add("active");
        tabSalesBtn.classList.remove("active");
        tabInvContent.classList.add("active");
        tabSalesContent.classList.remove("active");
    });

    // Diagnostics report download click handler
    const btnDownloadDiag = document.getElementById("btn-download-diagnostics");
    if (btnDownloadDiag) {
        btnDownloadDiag.addEventListener("click", () => {
            if (selectedProductForPurchase) {
                downloadDiagnosticsPDF(selectedProductForPurchase);
            }
        });
    }

    // Invoice download click handler
    const btnDownloadInvoice = document.getElementById("btn-download-invoice");
    if (btnDownloadInvoice) {
        btnDownloadInvoice.addEventListener("click", () => {
            if (currentActiveSale) {
                downloadInvoicePDF(currentActiveSale);
            } else {
                toast("No active transaction found to download.", "warning");
            }
        });
    }

    tabSalesBtn.addEventListener("click", () => {
        tabInvBtn.classList.remove("active");
        tabSalesBtn.classList.add("active");
        tabInvContent.classList.remove("active");
        tabSalesContent.classList.add("active");
    });

    // --- Customer Reviews (Transparency Wall) Event Listeners ---
    
    // Reviews search
    const reviewsSearch = document.getElementById("reviews-search-input");
    if (reviewsSearch) {
        reviewsSearch.addEventListener("input", (e) => {
            activeReviewFilters.search = e.target.value;
            renderReviewsWall();
        });
    }

    // Reviews rating filter pills
    const filterPills = document.querySelectorAll("#reviews-rating-filters .filter-pill");
    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeReviewFilters.rating = pill.getAttribute("data-rating");
            renderReviewsWall();
        });
    });

    // Review Modal toggle
    const reviewModal = document.getElementById("review-modal");
    const openReviewBtn = document.getElementById("btn-trigger-review-modal");
    const closeReviewBtn = document.getElementById("btn-close-review-modal");
    const cancelReviewBtn = document.getElementById("btn-cancel-review");
    const reviewForm = document.getElementById("review-submission-form");

    function openWriteReviewModal(orderId = "") {
        if (reviewModal) {
            reviewModal.style.display = "flex";
            if (reviewForm) reviewForm.reset();
            
            // Clear star picker visual state
            const starItems = document.querySelectorAll(".star-picker-item");
            starItems.forEach(s => s.classList.remove("selected", "hovered"));
            document.getElementById("review-rating-value").value = "";

            if (orderId) {
                document.getElementById("review-order-id").value = orderId.toUpperCase();
            }
        }
    }

    if (openReviewBtn) {
        openReviewBtn.addEventListener("click", () => openWriteReviewModal());
    }

    const closeWriteReviewModal = () => {
        if (reviewModal) reviewModal.style.display = "none";
    };

    if (closeReviewBtn) closeReviewBtn.addEventListener("click", closeWriteReviewModal);
    if (cancelReviewBtn) cancelReviewBtn.addEventListener("click", closeWriteReviewModal);

    // Interactive Star Picker
    const starItems = document.querySelectorAll(".star-picker-item");
    const ratingInput = document.getElementById("review-rating-value");
    
    starItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            const val = parseInt(item.getAttribute("data-value"));
            starItems.forEach(s => {
                if (parseInt(s.getAttribute("data-value")) <= val) {
                    s.classList.add("hovered");
                } else {
                    s.classList.remove("hovered");
                }
            });
        });

        item.addEventListener("mouseleave", () => {
            starItems.forEach(s => s.classList.remove("hovered"));
        });

        item.addEventListener("click", () => {
            const val = parseInt(item.getAttribute("data-value"));
            ratingInput.value = val;
            starItems.forEach(s => {
                if (parseInt(s.getAttribute("data-value")) <= val) {
                    s.classList.add("selected");
                } else {
                    s.classList.remove("selected");
                }
            });
        });
    });

    // Review Form Submit handler
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const orderId = document.getElementById("review-order-id").value.trim().toUpperCase();
            const rating = parseInt(ratingInput.value);
            const title = document.getElementById("review-title").value.trim();
            const comment = document.getElementById("review-comment").value.trim();

            if (!rating) {
                toast("Please select a star rating for your review.", "warning");
                return;
            }

            const payload = {
                orderId,
                rating,
                title,
                comment
            };

            const reviewsUrl = API_BASE_URL.replace("/products", "/reviews");

            fetch(reviewsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(async res => {
                if (!res.ok) {
                    let errMsg = "Failed to submit review.";
                    try {
                        const errData = await res.json();
                        if (errData && errData.error) errMsg = errData.error;
                    } catch (err) {}
                    throw new Error(errMsg);
                }
                return res.json();
            })
            .then(savedReview => {
                reviews.unshift(savedReview); // Add to the top of list
                toast("Thank you! Your verified review has been published.", "success");
                closeWriteReviewModal();
                renderReviewsWall();
            })
            .catch(err => {
                console.error(err);
                toast(err.message, "danger");
            });
        });
    }

    // Checkout Step 4 Review Prompt Click
    const checkoutReviewBtn = document.getElementById("btn-checkout-write-review");
    if (checkoutReviewBtn) {
        checkoutReviewBtn.addEventListener("click", () => {
            let activeOrderId = "";
            if (currentActiveSale && currentActiveSale.length > 0) {
                activeOrderId = currentActiveSale[0].orderId;
            }
            document.getElementById("checkout-modal").style.display = "none";
            openWriteReviewModal(activeOrderId);
        });
    }

    // Tracking Panel Review Prompt Click
    const trackingReviewBtn = document.getElementById("btn-track-write-review");
    if (trackingReviewBtn) {
        trackingReviewBtn.addEventListener("click", () => {
            const trackOrderId = document.getElementById("track-order-id-display").innerText;
            openWriteReviewModal(trackOrderId);
        });
    }

    // Close review modal when clicking overlay
    window.addEventListener("click", (e) => {
        if (e.target === reviewModal) {
            closeWriteReviewModal();
        }
    });
}

// --- Finalize Purchase Transaction ---
function completeTransaction() {
    if (cart.length === 0) return;

    // Gather shipping/customer details
    const nameVal = document.getElementById("chk-name").value;
    const emailVal = document.getElementById("chk-email").value;
    const addressVal = document.getElementById("chk-address").value;
    const cityVal = document.getElementById("chk-city").value;
    
    // Generate order ID
    const randomOrderId = `PZ-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const salesPayload = cart.map(item => ({
        orderId: randomOrderId,
        txId: txId,
        productId: item.id,
        brand: item.brand,
        model: item.model,
        imei: item.imei,
        originalPrice: item.originalPrice,
        pricePaid: item.price,
        warrantyLeft: `${item.warrantyValue} ${item.warrantyUnit}`,
        customerName: nameVal,
        customerEmail: emailVal,
        customerAddress: addressVal,
        customerCity: cityVal
    }));

    // Submit bulk transaction to backend purchase endpoint
    fetch(`${API_BASE_URL}/purchase/bulk`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(salesPayload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Purchase processing failed");
        return res.json();
    })
    .then(savedSales => {
        // Update local state: mark all items as sold out
        savedSales.forEach(sale => {
            const index = products.findIndex(p => p.id === sale.productId);
            if (index !== -1) {
                products[index].stock = "Out of Stock";
            }
            sales.push(sale);
        });

        // Set active sales for invoice downloading
        currentActiveSale = savedSales; 

        // Update notifications count badge
        unseenSalesCount += savedSales.length;
        const badge = document.getElementById("admin-badge-count");
        if (badge) {
            badge.innerText = unseenSalesCount;
            badge.style.display = "inline-flex";
        }

        // Render digital receipt items
        const receiptContainer = document.getElementById("receipt-items-container");
        if (receiptContainer) {
            receiptContainer.innerHTML = savedSales.map(sale => `
                <div class="receipt-item-row" style="margin-bottom:6px;">
                    <span class="item-name" style="font-weight:600; color:var(--text-primary);">${sale.brand} ${sale.model}</span>
                    <span class="item-val" style="color:var(--color-cyan); font-weight:700;">${formatINR(sale.pricePaid)}</span>
                </div>
                <div class="receipt-item-row font-mono text-small" style="margin-top:-4px; margin-bottom:12px; font-size:11px; color:var(--text-secondary);">
                    <span>IMEI: ${sale.imei} | Warranty: ${sale.warrantyLeft || 'Expired'}</span>
                </div>
            `).join("");
        }

        let grandTotal = savedSales.reduce((sum, item) => sum + item.pricePaid, 0);

        document.getElementById("receipt-date-text").innerText = `Date: ${new Date(savedSales[0].timestamp).toLocaleDateString()}`;
        document.getElementById("receipt-customer-name").innerText = savedSales[0].customerName;
        document.getElementById("receipt-grand-total").innerText = formatINR(grandTotal);
        document.getElementById("receipt-txid").innerText = savedSales[0].txId;

        // Clear cart
        cart = [];
        saveCart();
        renderCart();

        // Show Success screen
        showCheckoutStep(4);

        // Trigger particle confetti celebration
        launchConfetti();

        // Refresh application renders
        renderStorefront();
        renderDashboard();

        // Trigger Notification Toast
        toast(`Insured payment approved. Order logged for ${savedSales[0].customerName}!`, "success");
    })
    .catch(err => {
        console.error(err);
        toast("Transaction declined by merchant server.", "danger");
        showCheckoutStep(2); // Go back to payment inputs
    });
}

// --- Order Status Operations & Tracking Lookups ---
window.updateSaleStatus = function(orderId, newStatus) {
    fetch(`${API_BASE_URL}/purchase/status/${orderId}?status=${newStatus}`, {
        method: "PUT",
        headers: {
            "X-API-KEY": sessionStorage.getItem("phonezone-admin-passcode") || ""
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
    })
    .then(updatedSales => {
        // Update status of all sales in local state sharing this orderId
        sales.forEach(sale => {
            if (sale.orderId === orderId) {
                sale.status = newStatus;
            }
        });
        toast(`Order ${orderId} status updated to ${newStatus}.`, "success");
        renderDashboard();
    })
    .catch(err => {
        console.error(err);
        toast("Failed to update order status. Dashboard access might be unauthorized.", "danger");
    });
};

window.trackOrder = function() {
    const inputEl = document.getElementById("track-order-id-input");
    const orderId = inputEl.value.trim().toUpperCase();
    if (!orderId) {
        toast("Please enter an Order ID.", "warning");
        return;
    }

    fetch(`${API_BASE_URL}/purchase/lookup/${orderId}`)
    .then(res => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
    })
    .then(orderItems => {
        document.getElementById("tracking-results-panel").style.display = "block";
        document.getElementById("track-order-id-display").innerText = orderId;
        
        const orderDate = new Date(orderItems[0].timestamp).toLocaleDateString('en-IN');
        document.getElementById("track-order-date").innerText = orderDate;

        // Render the items in lookup list
        const trackItemsList = document.getElementById("track-items-list");
        trackItemsList.innerHTML = orderItems.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-glass);">
                <div>
                    <span style="font-weight:600; color:var(--text-primary); font-size:13.5px;">${item.brand} ${item.model}</span>
                    <span style="font-family:monospace; font-size:11px; color:var(--text-secondary); margin-left:10px;">IMEI: ${item.imei}</span>
                </div>
                <span style="font-weight:700; color:var(--color-cyan); font-size:13.5px;">${formatINR(item.pricePaid)}</span>
            </div>
        `).join("");

        // Update Timeline
        const status = orderItems[0].status; 
        updateTimelineProgress(status);

        // Toggle review prompt based on Delivery status
        const reviewPrompt = document.getElementById("tracking-review-prompt");
        if (reviewPrompt) {
            if (status === "Delivered") {
                reviewPrompt.style.display = "flex";
            } else {
                reviewPrompt.style.display = "none";
            }
        }

        // Store for invoice re-download in lookup section
        window.trackActiveOrderItems = orderItems;

        toast("Order details retrieved successfully.", "success");
    })
    .catch(err => {
        console.error(err);
        document.getElementById("tracking-results-panel").style.display = "none";
        toast(`Order reference "${orderId}" not found.`, "danger");
    });
};

function updateTimelineProgress(status) {
    const steps = ["Pending", "Dispatched", "In Transit", "Delivered"];
    const currentStepIdx = steps.indexOf(status);

    // Map status to progress bar width
    let barWidth = "0%";
    if (currentStepIdx === 0) barWidth = "12.5%";
    else if (currentStepIdx === 1) barWidth = "37.5%";
    else if (currentStepIdx === 2) barWidth = "62.5%";
    else if (currentStepIdx === 3) barWidth = "100%";

    const bar = document.getElementById("track-timeline-bar");
    if (bar) bar.style.width = barWidth;

    // Highlight timeline steps
    const stepIds = ["step-pending", "step-dispatched", "step-intransit", "step-delivered"];
    stepIds.forEach((id, idx) => {
        const stepDiv = document.getElementById(id);
        if (!stepDiv) return;
        const dot = stepDiv.querySelector(".timeline-dot");
        const label = stepDiv.querySelector(".timeline-label");

        if (idx <= currentStepIdx) {
            dot.style.background = "linear-gradient(135deg, var(--color-cyan), var(--color-violet))";
            dot.style.borderColor = "var(--color-cyan)";
            dot.style.color = "white";
            dot.style.boxShadow = "0 0 10px rgba(6, 182, 212, 0.4)";
            label.style.color = "var(--text-primary)";
        } else {
            dot.style.background = "";
            dot.style.borderColor = "";
            dot.style.color = "";
            dot.style.boxShadow = "";
            label.style.color = "";
        }
    });
}

// --- App Entry point ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});
