const products = [
  {
    id: 1,
    name: 'Premium Dog Food',
    description: 'High-quality nutrition for adult dogs with real protein.',
    price: 49.99,
    weight: 2000, // grams
    category: 'Pet Nutrition',
    image: 'https://images.unsplash.com/photo-1590080876/dog-food-bag.jpg?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 2,
    name: 'Cat Food Formula',
    description: 'Balanced cat nutrition to support healthy weight and energy.',
    price: 39.99,
    weight: 1500, // grams
    category: 'Pet Nutrition',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b35c?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 3,
    name: 'Pet Shampoo',
    description: 'Gentle shampoo for clean, soft fur with natural ingredients.',
    price: 15.99,
    weight: 500, // grams (ml)
    category: 'Health & Wellness',
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 4,
    name: 'Pet Vitamins',
    description: 'Daily vitamin supplement for joint, coat, and immune health.',
    price: 24.99,
    weight: 250, // grams
    category: 'Health & Wellness',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 5,
    name: 'Flea & Tick Spray',
    description: 'Protect your pet from fleas and ticks with gentle care.',
    price: 19.99,
    weight: 250, // grams (ml)
    category: 'Vet Medicine',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b35c?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 6,
    name: 'Pet Carrier',
    description: 'Comfortable carrier for pets during travel and vet visits.',
    price: 59.99,
    weight: 1200, // grams
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 7,
    name: 'Dog Leash',
    description: 'Durable leash for walks and outdoor activities.',
    price: 17.99,
    weight: 200, // grams
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1568393691622-cef2d0471c01?auto=format&fit=crop&w=500&h=500'
  },
  {
    id: 8,
    name: 'Pet Toy Set',
    description: 'Engaging toys to keep pets active and happy.',
    price: 22.99,
    weight: 300, // grams
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587300411107-ec8b6eab60d2?auto=format&fit=crop&w=500&h=500'
  }
];

let cart = JSON.parse(localStorage.getItem('vetcart_cart')) || [];

function reconcileCartWeights() {
  let changed = false;
  cart = cart.map(item => {
    if (!item.weight) {
      const prod = products.find(p => p.id === item.id);
      if (prod && prod.weight) {
        item.weight = prod.weight;
        changed = true;
      }
    }
    return item;
  });
  if (changed) saveCart();
}

reconcileCartWeights();

function saveCart() {
  localStorage.setItem('vetcart_cart', JSON.stringify(cart));
}

function convertToRupee(value) {
  return value * 100;
}

function formatPrice(value) {
  return '₹' + value.toFixed(2);
}

function formatWeight(g) {
  if (!g && g !== 0) return '—';
  if (g >= 1000) return (g / 1000).toFixed(2) + ' kg';
  return g + ' g';
}

function renderProducts(items) {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;


  productGrid.innerHTML = items.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="product-weight">Weight: ${formatWeight(product.weight)}</p>
        <div class="price-row">
          <span class="price">${formatPrice(convertToRupee(product.price))}</span>
          <span class="price-per-gram">
            ${product.weight ? (() => {
              const ppg = convertToRupee(product.price) / product.weight;
              const pkg = ppg * 1000;
              return `${formatPrice(ppg)} /g (${formatPrice(pkg)} /kg)`;
            })() : ''}
          </span>
          <button class="add-button" data-product-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');

  productGrid.querySelectorAll('.add-button').forEach(button => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.productId)));
  });
}

function updateCartSummary() {
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartTotal) cartTotal.textContent = formatPrice(cart.reduce((sum, item) => sum + convertToRupee(item.quantity * item.price), 0));
  saveCart();
}

function getGSTRate() {
  return 0.05;
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartGST = document.getElementById('cartGST');
  const cartGstLabel = document.getElementById('cartGstLabel');
  if (!cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty. Add something amazing!</p>';
    cartTotal.textContent = '0.00';
    if (cartSubtotal) cartSubtotal.textContent = '0.00';
    if (cartGST) cartGST.textContent = '0.00';
    if (cartGstLabel) cartGstLabel.textContent = 'GST';
    
    // Hide calculator when cart is empty
    const calculator = document.getElementById('dailyCostCalculator');
    if (calculator) calculator.style.display = 'none';
    
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.quantity} × ${formatPrice(convertToRupee(item.price))}</p>
        <p>${item.weight ? formatWeight(item.weight) + ' each' : 'Weight: —'}</p>
        <p>${item.weight ? formatWeight(item.weight * item.quantity) + ' total' : ''}</p>
        <p class="cart-price-per-gram">${item.weight ? (() => {
          const ppg = convertToRupee(item.price) / item.weight;
          const pkg = ppg * 1000;
          return `Price: ${formatPrice(ppg)} /g (${formatPrice(pkg)} /kg)`;
        })() : ''}</p>
      </div>
      <div>${formatPrice(convertToRupee(item.quantity * item.price))}</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + convertToRupee(item.quantity * item.price), 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight ? item.weight * item.quantity : 0), 0);
  const gst = subtotal * getGSTRate();
  const total = subtotal + gst;
  const gstLabel = 'GST (5%)';

  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
  if (cartGST) cartGST.textContent = formatPrice(gst);
  if (cartGstLabel) cartGstLabel.textContent = gstLabel;
  cartTotal.textContent = formatPrice(total);

  // show overall price-per-gram when weight is available
  const cartPricePerGramEl = document.getElementById('cartPricePerGram');
  if (cartPricePerGramEl) {
    if (totalWeight > 0) {
      const overallPPG = subtotal / totalWeight; // rupees per gram
      const overallPKG = overallPPG * 1000; // rupees per kg
      const formatWeightDisplay = (g) => {
        if (g >= 1000) return (g / 1000).toFixed(2) + ' kg';
        return g + ' g';
      };
      const cartTotalWeightEl = document.getElementById('cartTotalWeight');
      if (cartTotalWeightEl) cartTotalWeightEl.textContent = formatWeightDisplay(totalWeight);
      cartPricePerGramEl.textContent = `${formatPrice(overallPPG)} /g (${formatPrice(overallPKG)} /kg)`;
    } else {
      cartPricePerGramEl.textContent = '—';
    }
  }
  
  // Show/hide calculator based on cart contents
  const calculator = document.getElementById('dailyCostCalculator');
  if (calculator) {
    const hasWeights = cart.some(item => item.weight);
    calculator.style.display = (hasWeights && cart.length > 0) ? 'block' : 'none';
  }
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartSummary();
  renderCart();
  saveCart();
}

function openCart() {
  const cartModal = document.getElementById('cartModal');
  if (!cartModal) return;
  cartModal.classList.remove('hidden');
  renderCart();
}

function closeCart() {
  const cartModal = document.getElementById('cartModal');
  if (!cartModal) return;
  cartModal.classList.add('hidden');
}

function clearAllCart() {
  if (confirm('Are you sure you want to clear all items from your cart?')) {
    cart = [];
    saveCart();
    updateCartSummary();
    renderCart();
  }
}

function searchProducts() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderProducts(products);
    return;
  }

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    (product.category && product.category.toLowerCase().includes(query))
  );

  renderProducts(filtered);
}

function filterProductsByCategory(category) {
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    if (card.dataset.category === category) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  const filtered = products.filter(product => product.category === category);
  renderProducts(filtered);
}

function setStatus(message, isActive = true) {
  const statusElement = document.getElementById('jsStatus');
  if (!statusElement) return;
  statusElement.textContent = `JavaScript status: ${message}`;
  statusElement.style.color = isActive ? '#1f5f20' : '#8f5c00';
  statusElement.style.background = isActive ? '#e6ffed' : '#fff7e6';
}

function updateDailyCostCalculator(dailyGrams = 50) {
  const calculator = document.getElementById('dailyCostCalculator');
  const resultsDiv = document.getElementById('calculatorResults');
  
  if (!calculator || !resultsDiv) return;
  
  // Show calculator only if cart has items with weights
  const hasWeights = cart.some(item => item.weight);
  if (!hasWeights || cart.length === 0) {
    calculator.style.display = 'none';
    return;
  }
  
  calculator.style.display = 'block';
  
  // If no grams selected yet, show empty results
  if (!dailyGrams || dailyGrams <= 0) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  // Group by item and calculate costs
  let html = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
  html += '<tr style="border-bottom: 1px solid #ddd;"><th style="text-align: left; padding: 8px;">Product</th><th style="text-align: right; padding: 8px;">Daily</th><th style="text-align: right; padding: 8px;">Weekly</th><th style="text-align: right; padding: 8px;">Monthly</th></tr>';
  
  cart.forEach(item => {
    if (!item.weight) return;
    
    const pricePerGram = convertToRupee(item.price) / item.weight;
    const dailyCost = pricePerGram * dailyGrams;
    const weeklyCost = dailyCost * 7;
    const monthlyCost = dailyCost * 30;
    
    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${item.name}</td>
        <td style="text-align: right; padding: 8px;">${formatPrice(dailyCost)}</td>
        <td style="text-align: right; padding: 8px;">${formatPrice(weeklyCost)}</td>
        <td style="text-align: right; padding: 8px;">${formatPrice(monthlyCost)}</td>
      </tr>
    `;
  });
  
  html += '</table>';
  resultsDiv.innerHTML = html;
}

function setStatus(message, isActive = true) {
  const statusElement = document.getElementById('jsStatus');
  if (!statusElement) return;
  statusElement.textContent = `JavaScript status: ${message}`;
  statusElement.style.color = isActive ? '#1f5f20' : '#8f5c00';
  statusElement.style.background = isActive ? '#e6ffed' : '#fff7e6';
}

document.addEventListener('DOMContentLoaded', function () {
  const cartButton = document.getElementById('cartButton');
  const closeCartButton = document.getElementById('closeCartButton');
  const checkoutButton = document.getElementById('checkoutButton');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const shopNowButton = document.getElementById('shopNowButton');
  const categoryCards = document.querySelectorAll('.category-card');
  const clearCartBtn = document.getElementById('clearCartBtn');

  console.log('VetCart script loaded');
  setStatus('active', true);

  if (cartButton) cartButton.addEventListener('click', openCart);
  if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
  if (checkoutButton) checkoutButton.addEventListener('click', () => alert('Checkout flow is demo-only.'));
  if (searchButton) searchButton.addEventListener('click', searchProducts);
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearAllCart);
  if (searchInput) {
    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        searchProducts();
      }
    });
  }
  if (shopNowButton) shopNowButton.addEventListener('click', () => {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
  });

  categoryCards.forEach(card => {
    const category = card.dataset.category;
    if (category) {
      card.addEventListener('click', () => filterProductsByCategory(category));
    }
  });

  // Daily cost calculator preset buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const grams = parseInt(btn.dataset.grams);
      presetBtns.forEach(b => b.style.backgroundColor = '');
      btn.style.backgroundColor = '#ff9900';
      updateDailyCostCalculator(grams);
    });
  });

  renderProducts(products);
  updateCartSummary();
  renderCart();
});
