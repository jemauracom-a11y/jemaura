// app.js - Frontend logic that talks to your backend
// If you later deploy your backend, replace DEPLOYED_BASE (or keep the auto-detect)
const DEPLOYED_BASE = 'https://YOUR_DEPLOYED_BACKEND_URL'; // replace when live

const BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
  ? 'http://localhost:5000' 
  : DEPLOYED_BASE;

const PRODUCTS_URL = `${BASE}/products`;

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '{}');

const el = id => document.getElementById(id);

// Elements expected in index.html
const productsEl = el('products');
const emptyEl = el('empty');
const cartCountEl = el('cartCount');
const cartModal = el('cartModal');
const cartItemsEl = el('cartItems');
const cartTotalEl = el('cartTotal');
const productModal = el('productModal');
const productViewEl = el('productView');

function formatPrice(n){ return Number(n).toFixed(2) }

fetch(PRODUCTS_URL)
  .then(r => r.json())
  .then(data => { products = data; renderProducts(data); updateCartUI(); })
  .catch(err => {
    productsEl.innerHTML = '<div class="card">Could not load products from backend. Check server & URL.</div>';
    console.error('Fetch products error:', err);
  });

function renderProducts(list){
  productsEl.innerHTML = '';
  if(!list || !list.length){ emptyEl.style.display='block'; return; }
  emptyEl.style.display='none';
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="title">${p.name}</div>
      <div class="desc">${p.desc}</div>
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="price">₹${formatPrice(p.price)}</div>
        <div class="row">
          <button class="btn btn-ghost" data-id="${p.id}" data-action="view">View</button>
          <button class="btn btn-primary" data-id="${p.id}" data-action="add">Add</button>
        </div>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

productsEl.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if(action === 'add'){ addToCart(id); }
  if(action === 'view'){ openProduct(id); }
});

// Search
if (el('search')) {
  el('search').addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    renderProducts(filtered);
  });
}

// Sort
if (el('sortSelect')) {
  el('sortSelect').addEventListener('change', e=>{
    const v = e.target.value;
    let arr = [...products];
    if(v === 'low') arr.sort((a,b)=>a.price-b.price);
    if(v === 'high') arr.sort((a,b)=>b.price-a.price);
    renderProducts(arr);
  });
}

function addToCart(id, qty=1){
  cart[id] = (cart[id] || 0) + qty;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  alert('Added to cart');
}

function updateCartUI(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  if(cartCountEl) cartCountEl.textContent = count;
}

if (el('cartBtn')) el('cartBtn').addEventListener('click', openCart);
if (el('closeCart')) el('closeCart').addEventListener('click', ()=>cartModal.classList.add('hidden'));

function openCart(){
  cartModal.classList.remove('hidden');
  renderCartItems();
}

function renderCartItems(){
  cartItemsEl.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length === 0){
    cartItemsEl.innerHTML = '<div style="padding:18px">Your cart is empty.</div>';
    if(cartTotalEl) cartTotalEl.textContent = '0.00';
    return;
  }
  let total = 0;
  ids.forEach(id=>{
    const p = products.find(x=>String(x.id)===String(id));
    if(!p) return;
    const qty = cart[id];
    const itemTotal = p.price * qty;
    total += itemTotal;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div style="flex:1">
        <div class="title">${p.name}</div>
        <div>₹${formatPrice(p.price)} × ${qty} = ₹${formatPrice(itemTotal)}</div>
        <div class="qty-control" style="margin-top:8px">
          <button class="btn btn-ghost" data-id="${id}" data-action="dec">-</button>
          <div style="padding:6px 10px;border-radius:6px;background:#f7fbff">${qty}</div>
          <button class="btn btn-ghost" data-id="${id}" data-action="inc">+</button>
          <button class="btn" style="margin-left:8px" data-id="${id}" data-action="remove">Remove</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  if(cartTotalEl) cartTotalEl.textContent = formatPrice(total);
}

cartItemsEl.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if(action === 'inc') { cart[id] = (cart[id]||0) + 1; }
  if(action === 'dec') { cart[id] = Math.max(0, (cart[id]||0) - 1); if(cart[id] === 0) delete cart[id]; }
  if(action === 'remove') { delete cart[id]; }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
  updateCartUI();
});

if (el('checkoutBtn')) el('checkoutBtn').addEventListener('click', ()=> {
  cartItemsEl.innerHTML = `
    <h3>Checkout (Demo)</h3>
    <form id="checkoutForm" class="checkout-form">
      <input name="name" placeholder="Full name" required />
      <input name="phone" placeholder="Phone" required />
      <input name="address" placeholder="Address" required />
      <textarea name="notes" placeholder="Notes (optional)"></textarea>
      <div style="display:flex; gap:8px; justify-content:flex-end">
        <button type="button" class="btn btn-ghost" id="cancelCheckout">Cancel</button>
        <button type="submit" class="btn btn-primary">Place Order</button>
      </div>
    </form>
  `;
  el('cancelCheckout').addEventListener('click', renderCartItems);
  el('checkoutForm').addEventListener('submit', e=>{
    e.preventDefault();
    localStorage.removeItem('cart');
    cart = {};
    updateCartUI();
    cartItemsEl.innerHTML = '<div style="padding:18px">Order placed (demo). Thank you!</div>';
    if(cartTotalEl) cartTotalEl.textContent = '0.00';
  });
});

function openProduct(id){
  const p = products.find(x=>String(x.id)===String(id));
  if(!p) return;
  productViewEl.innerHTML = `
    <img src="${p.image}" alt="${p.name}" style="width:100%;height:280px;object-fit:cover;border-radius:6px" />
    <h2 style="margin-top:10px">${p.name}</h2>
    <p style="color:var(--muted)">${p.desc}</p>
    <div style="font-weight:700; font-size:18px">₹${formatPrice(p.price)}</div>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-ghost" id="viewClose">Close</button>
      <button class="btn btn-primary" id="viewAdd">Add to Cart</button>
    </div>
  `;
  productModal.classList.remove('hidden');

  el('viewAdd').addEventListener('click', ()=>{
    addToCart(p.id);
    productModal.classList.add('hidden');
  });
  el('viewClose').addEventListener('click', ()=>productModal.classList.add('hidden'));
}

if (el('closeProduct')) el('closeProduct').addEventListener('click', ()=>productModal.classList.add('hidden'));
