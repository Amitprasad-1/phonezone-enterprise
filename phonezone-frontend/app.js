/* ==========================================================================
   PHONEZONE MAIN JAVASCRIPT APPLICATION LOGIC (AJAX & SPRING BOOT MYSQL VERSION)
   ========================================================================== */

const API_BASE_URL = "https://phonezone-enterprise.onrender.com/api/products";

// --- Application State ---
let products = [];
let sales = [];
let activeFilters = {
    search: "",
    brands: [],
    seals: [],
    conditions: [],
    maxPrice: 2000
};
let selectedProductForPurchase = null;
let unseenSalesCount = 0;

// --- Initialize Database & State ---
function initApp() {
    // Show visual loading indicator in products grid
    const grid = document.getElementById("products-grid");
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-secondary);">
        <div class="payment-spinner" style="position:static; margin:0 auto 15px auto; width:40px; height:40px;"></div>
        <p>Connecting to backend API services...</p>
    </div>`;

    // Fetch Products and Sales logs concurrently from Spring Boot MySQL Server
    Promise.all([
        fetch(API_BASE_URL).then(res => {
            if (!res.ok) throw new Error("Could not fetch inventory");
            return res.json();
        }),
        fetch(`${API_BASE_URL}/sales`).then(res => {
            if (!res.ok) throw new Error("Could not fetch sales log");
            return res.json();
        })
    ])
    .then(([fetchedProducts, fetchedSales]) => {
        // Map backend phoneCondition to condition for UI compatibility
        products = fetchedProducts.map(p => {
            p.condition = p.phoneCondition || p.condition;
            return p;
        });
        
        sales = fetchedSales;

        // Populate Dynamic Filter Lists
        populateFilterOptions();
        
        // Initial Render
        renderStorefront();
        renderDashboard();
        
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

    // Toggle Empty State
    if (filtered.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";
        
        grid.innerHTML = filtered.map(product => {
            const isOutOfStock = product.stock === "Out of Stock";
            const originalPriceHTML = product.originalPrice ? `<span class="card-original-price">${formatUSD(product.originalPrice)}</span>` : "";
            const discountHTML = product.originalPrice ? `<span class="discount-percentage">${calculateDiscount(product.price, product.originalPrice)}% OFF</span>` : "";
            
            // Build badge classes
            const sealClass = `badge-${product.seal.toLowerCase().replace("-", "")}`;
            const condClass = `badge-${product.condition.toLowerCase().replace(" ", "")}`;
            
            return `
                <div class="phone-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${product.id}">
                    <div class="card-badges">
                        ${isOutOfStock ? '<span class="badge badge-outstock">Sold Out</span>' : ''}
                        <span class="badge ${sealClass}">${product.seal}</span>
                        <span class="badge ${condClass}">${product.condition}</span>
                    </div>
                    <div class="phone-card-image-box">
                        <div class="card-decor-glow"></div>
                        <img src="${product.image}" alt="${product.brand} ${product.model}" class="phone-card-img" onerror="this.src='assets/images/iphone.png'">
                    </div>
                    <div class="phone-card-details">
                        <div class="phone-meta-row">
                            <span class="phone-brand">${product.brand}</span>
                            <span class="phone-age">${product.ageValue} ${product.ageUnit} old</span>
                        </div>
                        <h3 class="phone-title">${product.model}</h3>
                        
                        <div class="phone-specs-mini">
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
                            <span class="card-price">${formatUSD(product.price)}</span>
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
    document.getElementById("stat-revenue").innerText = formatUSD(totalRevenue);
    document.getElementById("stat-sold").innerText = totalSold;
    document.getElementById("stat-active").innerText = activeProducts;
    document.getElementById("stat-in-stock").innerText = `${activeProducts} active, ${outOfStockProducts} sold out`;
    document.getElementById("stat-avg-price").innerText = formatUSD(avgPrice);

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
                        <img src="${p.image}" alt="${p.model}" class="table-device-thumb" onerror="this.src='assets/images/iphone.png'">
                        <div>
                            <div class="device-name-bold">${p.model}</div>
                            <div class="device-sub-brand">${p.brand}</div>
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
                <td style="font-weight: 700;">${formatUSD(p.price)}</td>
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
            const originalMSRP = sale.originalPrice ? formatUSD(sale.originalPrice) : '<span class="text-muted">N/A</span>';
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
                    <td class="text-success" style="font-weight: 800;">${formatUSD(sale.pricePaid)}</td>
                    <td>
                        <span class="stock-badge-active">
                            <span class="status-dot dot-success"></span>
                            <span>Success</span>
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }
}

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
        maxPrice: 2000
    };
    
    document.getElementById("search-input").value = "";
    document.getElementById("price-slider").value = 2000;
    document.getElementById("price-slider-value").innerText = "$2000";
    
    const checkboxes = document.querySelectorAll('.checkbox-item input');
    checkboxes.forEach(chk => chk.checked = false);
}

// --- Modal Functions ---
window.openDetailsModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    selectedProductForPurchase = product;

    // Set UI Values
    document.getElementById("detail-image").src = product.image;
    document.getElementById("detail-image").onerror = function() { this.src = "assets/images/iphone.png"; };
    
    const badgeSeal = document.getElementById("detail-badge-seal");
    badgeSeal.innerText = product.seal;
    badgeSeal.className = `badge badge-${product.seal.toLowerCase().replace("-", "")}`;
    
    const badgeCond = document.getElementById("detail-badge-condition");
    badgeCond.innerText = product.condition;
    badgeCond.className = `badge badge-${product.condition.toLowerCase().replace(" ", "")}`;

    document.getElementById("detail-title-text").innerText = product.model;
    document.getElementById("detail-brand-text").innerText = `Brand: ${product.brand}`;
    document.getElementById("detail-price-text").innerText = formatUSD(product.price);
    
    const origPriceEl = document.getElementById("detail-original-price-text");
    const savingsEl = document.getElementById("detail-savings-text");
    
    if (product.originalPrice) {
        origPriceEl.style.display = "inline";
        origPriceEl.innerText = formatUSD(product.originalPrice);
        savingsEl.style.display = "inline-flex";
        
        const savingsAmt = product.originalPrice - product.price;
        const savingsPct = calculateDiscount(product.price, product.originalPrice);
        savingsEl.innerText = `Save ${formatUSD(savingsAmt)} (${savingsPct}% off)`;
    } else {
        origPriceEl.style.display = "none";
        savingsEl.style.display = "none";
    }

    document.getElementById("detail-age-text").innerText = `${product.ageValue} ${product.ageUnit}`;
    document.getElementById("detail-warranty-text").innerText = product.warrantyValue > 0 ? `${product.warrantyValue} ${product.warrantyUnit} remaining` : "Expired / No Warranty";
    document.getElementById("detail-imei-text").innerText = product.imei;
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
    if (!selectedProductForPurchase) return;

    // Reset Forms
    document.getElementById("checkout-shipping-form").reset();
    document.getElementById("checkout-payment-form").reset();

    // Populate checkout item summary
    document.getElementById("chk-summary-phone").innerText = `${selectedProductForPurchase.brand} ${selectedProductForPurchase.model}`;
    document.getElementById("chk-summary-total").innerText = formatUSD(selectedProductForPurchase.price);

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
        method: "PUT"
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
            method: "DELETE"
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
    document.getElementById("form-image-preset").value = product.image;
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
function formatUSD(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

// Discount calculator
function calculateDiscount(price, original) {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
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

// --- Event Binding ---
function bindEvents() {
    // Nav view switcher buttons
    const btnStore = document.getElementById("btn-store-view");
    const btnAdmin = document.getElementById("btn-admin-view");
    const logo = document.getElementById("nav-logo");
    
    const customerView = document.getElementById("customer-view");
    const adminView = document.getElementById("admin-view");

    function switchView(viewName) {
        if (viewName === "store") {
            btnStore.classList.add("active");
            btnAdmin.classList.remove("active");
            customerView.classList.add("active");
            adminView.classList.remove("active");
        } else {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnStore.addEventListener("click", () => switchView("store"));
    btnAdmin.addEventListener("click", () => switchView("admin"));
    logo.addEventListener("click", () => switchView("store"));
    
    // Quick Checkout Cart Button Click
    document.getElementById("btn-cart-view").addEventListener("click", () => {
        // Quick checkout checks first product available in stock
        const firstInStock = products.find(p => p.stock === "In Stock");
        if (firstInStock) {
            selectedProductForPurchase = firstInStock;
            openCheckoutModal();
        } else {
            toast("No items are currently in stock for purchase.", "warning");
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
        priceSliderValue.innerText = formatUSD(activeFilters.maxPrice);
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
    });

    // Detail buy button
    document.getElementById("btn-details-checkout").addEventListener("click", () => {
        document.getElementById("details-modal").style.display = "none";
        openCheckoutModal();
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
        const image = document.getElementById("form-image-preset").value;
        const condition = document.getElementById("form-condition").value;
        const seal = document.getElementById("form-seal").value;
        const stock = document.getElementById("form-stock").value;
        const description = document.getElementById("form-description").value;

        // Perform edit vs add
        const productId = productIdVal || `PZ-${Math.floor(1000 + Math.random() * 9000)}`;
        
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
            description
        };

        // Submit to Spring Boot API
        fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productPayload)
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to save product listing");
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
            toast("Failed to save phone listing to backend.", "danger");
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

    tabSalesBtn.addEventListener("click", () => {
        tabInvBtn.classList.remove("active");
        tabSalesBtn.classList.add("active");
        tabInvContent.classList.remove("active");
        tabSalesContent.classList.add("active");
    });
}

// --- Finalize Purchase Transaction ---
function completeTransaction() {
    if (!selectedProductForPurchase) return;

    // Gather shipping/customer details
    const nameVal = document.getElementById("chk-name").value;
    const emailVal = document.getElementById("chk-email").value;
    const addressVal = document.getElementById("chk-address").value;
    const cityVal = document.getElementById("chk-city").value;
    
    // Generate order ID
    const randomOrderId = `PZ-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const salePayload = {
        orderId: randomOrderId,
        txId: txId,
        productId: selectedProductForPurchase.id,
        brand: selectedProductForPurchase.brand,
        model: selectedProductForPurchase.model,
        imei: selectedProductForPurchase.imei,
        originalPrice: selectedProductForPurchase.originalPrice,
        pricePaid: selectedProductForPurchase.price,
        warrantyLeft: `${selectedProductForPurchase.warrantyValue} ${selectedProductForPurchase.warrantyUnit}`,
        customerName: nameVal,
        customerEmail: emailVal,
        customerAddress: addressVal,
        customerCity: cityVal
    };

    // Submit transaction to backend purchase endpoint
    fetch(`${API_BASE_URL}/purchase/${selectedProductForPurchase.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(salePayload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Purchase processing failed");
        return res.json();
    })
    .then(savedSale => {
        // Update local state
        const index = products.findIndex(p => p.id === selectedProductForPurchase.id);
        if (index !== -1) {
            products[index].stock = "Out of Stock";
        }
        
        sales.push(savedSale);

        // Update notifications count badge
        unseenSalesCount++;
        const badge = document.getElementById("admin-badge-count");
        badge.innerText = unseenSalesCount;
        badge.style.display = "inline-flex";

        // Populate digital receipt values
        document.getElementById("receipt-date-text").innerText = `Date: ${new Date(savedSale.timestamp).toLocaleDateString()}`;
        document.getElementById("receipt-phone-name").innerText = `${savedSale.brand} ${savedSale.model}`;
        document.getElementById("receipt-phone-price").innerText = formatUSD(savedSale.pricePaid);
        document.getElementById("receipt-phone-imei").innerText = savedSale.imei;
        document.getElementById("receipt-phone-warranty").innerText = savedSale.warrantyLeft || "Expired";
        document.getElementById("receipt-customer-name").innerText = savedSale.customerName;
        document.getElementById("receipt-grand-total").innerText = formatUSD(savedSale.pricePaid);
        document.getElementById("receipt-txid").innerText = savedSale.txId;

        // Show Success screen
        showCheckoutStep(4);

        // Refresh application renders
        renderStorefront();
        renderDashboard();

        // Trigger Notification Toast
        toast(`Insured payment approved. Order logged for ${savedSale.customerName}!`, "success");
    })
    .catch(err => {
        console.error(err);
        toast("Transaction declined by merchant server.", "danger");
        showCheckoutStep(2); // Go back to payment inputs
    });
}

// --- App Entry point ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});
