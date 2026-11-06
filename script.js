const facebookUrl = "https://www.facebook.com/mon.mon.602100";
const firebaseClientPromise = import("./firebase-client.js").catch(function (error) {
  console.error("Firebase SDK could not be loaded.", error);
  return null;
});
let currentUser = null;
let authResolved = false;
let authMode = "login";
let pendingCheckout = false;
let directCartBackup = null;
let resolveAuthReady;
const authReady = new Promise(function (resolve) { resolveAuthReady = resolve; });
const products = [
  {
    id: "elephant",
    code: "L01",
    name: "ເຈ້ຍທິດຊູລາຍຊ້າງ",
    subtitle: "ລາຍຊ້າງ · ຂາຍແບບແພັກ",
    category: "pack",
    tag: "ລາຍຊ້າງ",
    image: "./Ảnh/1793952038871_775144749478927533_8960683272696312118_eb5ba513852291c77f6408f3667cb22f.jpg",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 30000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 15 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 15 ແພັກ)", unit: "ແກັດ", price: 420000, count: 15 }
    ]
  },
  {
    id: "flower-box",
    code: "L02",
    name: "ເຈ້ຍທິດຊູແບບກ່ອງລາຍດອກໄມ້",
    subtitle: "ແບບກ່ອງ · ລາຍດອກໄມ້",
    category: "box",
    tag: "ລາຍດອກໄມ້",
    image: "./Ảnh/1793952038752_775144749478927533_8960683272696312118_59cb1f84777e2732ea7302d9759c6f55.jpg",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 45000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 10 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 10 ແພັກ)", unit: "ແກັດ", price: 430000, count: 10 }
    ]
  },
  {
    id: "branch-box",
    code: "L03",
    name: "ເຈ້ຍທິດຊູແບບກ່ອງລາຍກິ່ງໄມ້",
    subtitle: "ແບບກ່ອງ · ລາຍກິ່ງໄມ້",
    category: "box",
    tag: "ກ່ອງລາຍກິ່ງໄມ້",
    image: "./Ảnh/1793952038636_775144749478927533_8960683272696312118_71e3bd2cd4b27f269ed03eab2b796f66.jpg",
    options: [
      { id: "single", label: "1 ມັດ", quantityLabel: "1 ມັດ", unit: "ມັດ", price: 22000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 24 ມັດ", quantityLabel: "1 ແກັດ (ລວມ 24 ມັດ)", unit: "ແກັດ", price: 450000, count: 24 }
    ]
  },
  {
    id: "roll-flower",
    code: "L04",
    name: "ເຈ້ຍກໍ້ມ້ວນໃຫຍ່",
    subtitle: "ເຈ້ຍມ້ວນ · ລາຍດອກໄມ້",
    category: "roll",
    tag: "ເຈ້ຍມ້ວນ",
    image: "./Ảnh/1793952038431_775144749478927533_8960683272696312118_c23ba2ac5c42df176570db92e18c75ca.jpg",
    options: [
      { id: "single", label: "1 ມັດ", quantityLabel: "1 ມັດ", unit: "ມັດ", price: 25000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 24 ມັດ", quantityLabel: "1 ແກັດ (ລວມ 24 ມັດ)", unit: "ແກັດ", price: 580000, count: 24 }
    ]
  },
  {
    id: "flower-pack",
    code: "L05",
    name: "ເຈ້ຍທິດຊູລາຍດອກຈຳປາແພັກໃຫຍ່4ອັນ",
    subtitle: "ລາຍກິ່ງດອກໄມ້ · 12 ແພັກຕໍ່ແກັດ",
    category: "pack",
    tag: "ລາຍກິ່ງດອກໄມ້",
    image: "./Ảnh/1793952038474_775144749478927533_8960683272696312118_9ec6e608f28a7e95c8d64fa55ad17763.jpg",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 39000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 12 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 12 ແພັກ)", unit: "ແກັດ", price: 440000, count: 12 }
    ]
  }
];

let heroImages = [
  "./Ảnh/1793952038871_775144749478927533_8960683272696312118_eb5ba513852291c77f6408f3667cb22f.jpg",
  "./Ảnh/1793952038752_775144749478927533_8960683272696312118_59cb1f84777e2732ea7302d9759c6f55.jpg",
  "./Ảnh/1793952038836_775144749478927533_8960683272696312118_98262a53333be379d4d26be935bd6bee.jpg",
  "./Ảnh/1793952038800_775144749478927533_8960683272696312118_0c988ed0b31de9d0a81954d90fefd77b.jpg",
  "./Ảnh/1793952038235_775144749478927533_8960683272696312118_22617186f198bdc034e85be04524c695.jpg",
  "./Ảnh/1793952038273_775144749478927533_8960683272696312118_fbdbb2e8fccb3b0e7119240baea47bf9.jpg",
  "./Ảnh/1793952038311_775144749478927533_8960683272696312118_30e366b2f89d12fdab5b9b81c58b8d99.jpg",
  "./Ảnh/1793952038350_775144749478927533_8960683272696312118_f16cf7632dab09cfa412ec41c5dabd68.jpg",
  "./Ảnh/1793952038391_775144749478927533_8960683272696312118_f3db8899aac9e75fc0f53cbe7dda2618.jpg",
  "./Ảnh/1793952038431_775144749478927533_8960683272696312118_c23ba2ac5c42df176570db92e18c75ca.jpg",
  "./Ảnh/1793952038474_775144749478927533_8960683272696312118_9ec6e608f28a7e95c8d64fa55ad17763.jpg",
  "./Ảnh/1793952038520_775144749478927533_8960683272696312118_61bfa2c13493ab065d158bb8f06e7398.jpg",
  "./Ảnh/1793952038559_775144749478927533_8960683272696312118_c61118f502456e54e9fef29bff680673.jpg",
  "./Ảnh/1793952038601_775144749478927533_8960683272696312118_c9a440fcdd8278d36eb68e55871b7647.jpg",
  "./Ảnh/1793952038636_775144749478927533_8960683272696312118_71e3bd2cd4b27f269ed03eab2b796f66.jpg",
  "./Ảnh/1793952038674_775144749478927533_8960683272696312118_f545998ff4bab40a93cf74bfb1e0caad.jpg",
  "./Ảnh/1793952038714_775144749478927533_8960683272696312118_6bc105f72b0c2d3ed3107f54e539f35e.jpg"
];
let heroImageIndex = 0;

function showHeroImage(index) {
  heroImageIndex = (index + heroImages.length) % heroImages.length;
  const image = document.getElementById("hero-carousel-image");
  image.src = heroImages[heroImageIndex];
  image.alt = "ຮູບສິນຄ້າ Limon Shop " + (heroImageIndex + 1);
  document.getElementById("hero-carousel-count").textContent = (heroImageIndex + 1) + " / " + heroImages.length;
}
document.getElementById("hero-previous").addEventListener("click", function () { showHeroImage(heroImageIndex - 1); });
document.getElementById("hero-next").addEventListener("click", function () { showHeroImage(heroImageIndex + 1); });
async function loadUploadedGalleryImages() {
  const galleryUrl = "https://api.github.com/repos/phiphakone/Limon-shop/contents/" + encodeURIComponent("Ảnh");
  try {
    const response = await fetch(galleryUrl, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("gallery_listing_unavailable");
    const files = await response.json();
    const imageFiles = files
      .filter(function (file) {
        return file.type === "file" && !file.name.startsWith(".") && !/qr[-_]?payment/i.test(file.name)
          && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name) && file.download_url;
      })
      .sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });
    const imageByName = new Map(imageFiles.map(function (file) { return [file.name, file.download_url]; }));
    const productImageNames = products.map(function (product) { return product.image.split("/").pop(); });
    const orderedNames = Array.from(new Set(productImageNames.concat(imageFiles.map(function (file) { return file.name; }))));
    const uploadedImages = orderedNames.map(function (name) { return imageByName.get(name); }).filter(Boolean);
    if (uploadedImages.length) {
      heroImages = uploadedImages;
      showHeroImage(0);
    }
  } catch (error) {
    console.warn("Could not refresh the gallery from the uploaded image folder.", error);
  }
}
loadUploadedGalleryImages();
const heroImageWrap = document.querySelector(".hero-image-wrap");
let heroTouchStartX = null;
heroImageWrap.addEventListener("touchstart", function (event) { heroTouchStartX = event.changedTouches[0].clientX; }, { passive: true });
heroImageWrap.addEventListener("touchend", function (event) {
  if (heroTouchStartX === null) return;
  const distance = event.changedTouches[0].clientX - heroTouchStartX;
  if (Math.abs(distance) > 45) showHeroImage(heroImageIndex + (distance < 0 ? 1 : -1));
  heroTouchStartX = null;
}, { passive: true });

const storageKey = "limon-shop-cart-v1";
let cart = [];
let activeFilter = "all";
let toastTimer;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(saved)) cart = saved.filter(function (item) { return products.some(function (product) { return product.id === item.productId; }) && Number(item.quantity) > 0; });
} catch (error) {
  cart = [];
}

const productGrid = document.getElementById("product-grid");
const noResults = document.getElementById("no-results");
const drawer = document.getElementById("cart-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const drawerBottom = document.getElementById("drawer-bottom");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const orderModal = document.getElementById("order-modal");
const orderPreview = document.getElementById("order-preview");
const orderForm = document.getElementById("order-form");
const orderSuccess = document.getElementById("order-success");
const authModal = document.getElementById("auth-modal");
const toast = document.getElementById("toast");

function formatMoney(amount) {
  return new Intl.NumberFormat("lo-LA").format(amount) + " ₭";
}

function productById(id) {
  return products.find(function (product) { return product.id === id; });
}

function selectedOption(product, optionId) {
  return product.options.find(function (option) { return option.id === optionId; }) || product.options[0];
}

function renderProducts(searchText) {
  const query = (searchText || "").trim().toLocaleLowerCase();
  const visible = products.filter(function (product) {
    const matchesFilter = activeFilter === "all" || product.category === activeFilter;
    const matchesQuery = !query || (product.code + " " + product.name + " " + product.subtitle + " " + product.tag).toLocaleLowerCase().indexOf(query) !== -1;
    return matchesFilter && matchesQuery;
  });

  productGrid.innerHTML = visible.map(function (product, index) {
    const firstOption = product.options[0];
    const optionMarkup = product.options.map(function (option) {
      return '<option value="' + option.id + '">' + option.label + ' — ' + formatMoney(option.price) + '</option>';
    }).join("");
    const savings = product.options[1].count * firstOption.price - product.options[1].price;
    const savingsText = savings > 0 ? "ຊື້ 1 ແກັດ ປະຢັດ " + formatMoney(savings) : "1 ແກັດ ລວມ " + product.options[1].count + " " + firstOption.unit;
    return '<article class="product-card" data-product-card="' + product.id + '">' +
      '<div class="product-photo"><img src="' + product.image + '" alt="' + product.name + '" loading="lazy"><span class="product-tag">' + product.tag + '</span></div>' +
      '<div class="product-content">' +
        '<div class="product-topline"><h3 class="product-title">' + product.name + '</h3><span class="product-number">' + product.code + '</span></div>' +
        '<p class="product-subtitle">' + product.subtitle + '</p>' +
        '<label class="product-option-label" for="option-' + product.id + '"><span>ເລືອກແບບບັນຈຸ</span></label>' +
        '<div class="option-select-wrap"><select class="option-select" id="option-' + product.id + '" data-option-select="' + product.id + '">' + optionMarkup + '</select></div>' +
        '<div class="price-line"><strong class="current-price" data-price="' + product.id + '">' + formatMoney(firstOption.price) + '</strong><span class="price-unit" data-unit="' + product.id + '">/ ' + firstOption.unit + '</span></div>' +
        '<p class="bulk-note" data-bulk-note="' + product.id + '">' + savingsText + '</p>' +
        '<div class="product-actions"><div class="quantity-control" aria-label="ຈຳນວນທີ່ສັ່ງຊື້"><button type="button" data-step="-1" data-quantity-for="' + product.id + '" aria-label="ຫຼຸດຈຳນວນ">−</button><input type="number" min="1" max="99" value="1" inputmode="numeric" data-quantity-input="' + product.id + '" aria-label="ຈຳນວນທີ່ສັ່ງຊື້"><button type="button" data-step="1" data-quantity-for="' + product.id + '" aria-label="ເພີ່ມຈຳນວນ">+</button></div>' +
        '<button class="button button-outline add-button" type="button" data-add="' + product.id + '"><span aria-hidden="true">＋</span> ໃສ່ກະຕ່າ</button>' +
        '<button class="button button-primary add-button buy-now-button" type="button" data-buy-now="' + product.id + '"><span aria-hidden="true">↗</span> ສັ່ງຊື້ທັນທີ</button></div>' +
      '</div></article>';
  }).join("");
  noResults.hidden = visible.length !== 0;
}

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function totalQuantity() {
  return cart.reduce(function (sum, item) { return sum + Number(item.quantity); }, 0);
}

function totalPrice() {
  return cart.reduce(function (sum, item) {
    const product = productById(item.productId);
    const option = product && selectedOption(product, item.optionId);
    return sum + (option ? option.price * Number(item.quantity) : 0);
  }, 0);
}

function renderCart() {
  cartCount.textContent = String(totalQuantity());
  cartEmpty.hidden = cart.length > 0;
  drawerBottom.hidden = cart.length === 0;
  cartItems.innerHTML = cart.map(function (item) {
    const product = productById(item.productId);
    const option = selectedOption(product, item.optionId);
    return '<div class="cart-row" data-cart-key="' + product.id + ':' + option.id + '">' +
      '<img src="' + product.image + '" alt="">' +
      '<div><p class="cart-row-name">' + product.code + ' · ' + product.name + '</p><p class="cart-row-variant">' + option.quantityLabel + '</p><strong class="cart-row-price">' + formatMoney(option.price * item.quantity) + '</strong>' +
      '<div class="cart-row-controls"><button type="button" data-cart-change="-1" aria-label="ຫຼຸດຈຳນວນ">−</button><span>' + item.quantity + ' ' + option.unit + '</span><button type="button" data-cart-change="1" aria-label="ເພີ່ມຈຳນວນ">+</button></div></div>' +
      '<button class="remove-item" type="button" data-cart-remove aria-label="ເອົາອອກ">×</button></div>';
  }).join("");
  cartTotal.textContent = formatMoney(totalPrice());
  saveCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2300);
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  document.getElementById("auth-title").textContent = registering ? "ລົງທະບຽນ" : "ເຂົ້າລະບົບ";
  document.getElementById("auth-description").textContent = registering
    ? "ສ້າງບັນຊີດ້ວຍອີເມວ ຫຼື Google ກ່ອນສັ່ງຊື້."
    : "ເຂົ້າລະບົບກ່ອນສັ່ງຊື້.";
  document.getElementById("auth-name-label").hidden = !registering;
  document.getElementById("auth-name").hidden = !registering;
  document.getElementById("auth-name").required = registering;
  document.getElementById("auth-password").autocomplete = registering ? "new-password" : "current-password";
  document.getElementById("auth-submit").innerHTML = registering
    ? 'ສ້າງບັນຊີ <span aria-hidden="true">→</span>'
    : 'ເຂົ້າລະບົບ <span aria-hidden="true">→</span>';
  document.getElementById("auth-switch-prompt").textContent = registering ? "ມີບັນຊີແລ້ວ?" : "ຍັງບໍ່ມີບັນຊີ?";
  document.getElementById("auth-switch").textContent = registering ? "ເຂົ້າລະບົບ" : "ລົງທະບຽນ";
}

function openAuthModal(mode, checkoutPending) {
  setAuthMode(mode);
  pendingCheckout = Boolean(checkoutPending);
  document.getElementById("auth-status").textContent = pendingCheckout
    ? "ກະລຸນາລົງທະບຽນ ຫຼື ເຂົ້າລະບົບກ່ອນສັ່ງຊື້."
    : "";
  authModal.hidden = false;
  document.body.classList.add("has-overlay");
  document.getElementById("auth-email").focus();
}

function closeAuthModal(restorePurchase) {
  authModal.hidden = true;
  document.body.classList.remove("has-overlay");
  if (restorePurchase) {
    pendingCheckout = false;
    restoreDirectCart();
  }
}

function updateAuthHeader(user) {
  currentUser = user || null;
  document.getElementById("login-open").hidden = Boolean(user);
  document.getElementById("register-open").hidden = Boolean(user);
  document.getElementById("auth-user").hidden = !user;
  document.getElementById("logout-button").hidden = !user;
  document.getElementById("auth-user").textContent = user ? (user.displayName || user.email || "ບັນຊີຂອງຂ້ອຍ") : "";
  if (user && user.displayName && !document.getElementById("customer-name").value) {
    document.getElementById("customer-name").value = user.displayName;
  }
  authResolved = true;
  resolveAuthReady();
  if (user) {
    closeAuthModal();
    if (pendingCheckout) {
      pendingCheckout = false;
      openOrder();
    }
  }
}

firebaseClientPromise.then(function (client) {
  if (!client) {
    authResolved = true;
    resolveAuthReady();
    return;
  }
  client.authentication.onAuthStateChanged(client.auth, updateAuthHeader);
}).catch(function (error) {
  console.error("Firebase Authentication could not start.", error);
  authResolved = true;
  resolveAuthReady();
});

function openCart() {
  drawerBackdrop.hidden = false;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-overlay");
  document.getElementById("close-cart").focus();
}

function closeCart() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("has-overlay");
}

function orderMessage() {
  const lines = ["ສະບາຍດີ Limon Shop, ຂ້ອຍຕ້ອງການສັ່ງຊື້ສິນຄ້າດັ່ງນີ້:"];
  cart.forEach(function (item, index) {
    const product = productById(item.productId);
    const option = selectedOption(product, item.optionId);
    const orderQuantity = option.count
      ? item.quantity + " ແກັດ (ແກັດລະ " + option.count + " " + product.options[0].unit + ")"
      : item.quantity + " " + option.unit;
    lines.push((index + 1) + ". " + product.code + " · " + product.name + " — " + orderQuantity + " = " + formatMoney(option.price * item.quantity));
  });
  lines.push("ຍອດລວມທັງໝົດ: " + formatMoney(totalPrice()));
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  if (name) lines.push("ຊື່ຜູ້ຮັບ: " + name);
  if (phone) lines.push("ເບີໂທຕິດຕໍ່: " + phone);
  if (address) lines.push("ທີ່ຢູ່ຈັດສົ່ງ: " + address);
  return lines.join("\n");
}

function updateOrderPreview() {
  orderPreview.textContent = orderMessage();
}

async function openOrder() {
  if (!cart.length) return;
  const client = await firebaseClientPromise;
  if (!client) {
    restoreDirectCart();
    showToast("ລະບົບບັນຊີຍັງບໍ່ພ້ອມ. ລອງອີກຄັ້ງພາຍຫຼັງ.");
    return;
  }
  await authReady;
  if (!currentUser) {
    closeCart();
    openAuthModal("login", true);
    return;
  }
  closeCart();
  orderForm.reset();
  orderForm.hidden = false;
  orderSuccess.hidden = true;
  document.getElementById("copy-status").textContent = "";
  updateOrderPreview();
  orderModal.hidden = false;
  document.body.classList.add("has-overlay");
  document.getElementById("customer-name").focus();
}

function closeOrder() {
  orderModal.hidden = true;
  document.body.classList.remove("has-overlay");
  restoreDirectCart();
}

function restoreDirectCart() {
  if (directCartBackup === null) return;
  cart = directCartBackup;
  directCartBackup = null;
  renderCart();
}

function startDirectCheckout(productId) {
  const product = productById(productId);
  if (!product) return;
  const optionId = productGrid.querySelector('[data-option-select="' + productId + '"]').value;
  const quantityInput = productGrid.querySelector('[data-quantity-input="' + productId + '"]');
  const quantity = Math.max(1, Math.min(99, Number(quantityInput.value) || 1));
  if (directCartBackup === null) directCartBackup = cart.map(function (item) { return { productId: item.productId, optionId: item.optionId, quantity: item.quantity }; });
  cart = [{ productId: productId, optionId: optionId, quantity: quantity }];
  renderCart();
  openOrder();
}

async function copyOrder() {
  const message = orderMessage();
  try {
    await navigator.clipboard.writeText(message);
    document.getElementById("copy-status").textContent = "ຄັດລອກລາຍການແລ້ວ.";
    return true;
  } catch (error) {
    orderPreview.focus();
    const range = document.createRange();
    range.selectNodeContents(orderPreview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.getElementById("copy-status").textContent = "ເລືອກຂໍ້ຄວາມແລ້ວ. ກົດຄັດລອກ.";
    return false;
  }
}

function renderPaymentAccount(details) {
  const account = document.getElementById("payment-account");
  const parts = [details.bankName, details.accountName, details.accountNumber].filter(Boolean);
  account.textContent = parts.join(" · ");
  const qr = document.getElementById("payment-qr");
  if (details.qrImage) qr.src = details.qrImage;
}

import("./firebase-config.js").then(function (config) {
  renderPaymentAccount(config.PAYMENT_DETAILS);
}).catch(function (error) {
  console.warn("Payment details could not be loaded.", error);
});

async function submitOrder(event) {
  event.preventDefault();
  if (!cart.length || !orderForm.reportValidity()) return;
  if (!currentUser) {
    orderModal.hidden = true;
    openAuthModal("login", true);
    return;
  }

  const button = document.getElementById("place-order");
  const proofFile = document.getElementById("payment-proof").files[0] || null;
  const copyButton = document.getElementById("copy-order");
  if (proofFile && (!["image/jpeg", "image/png", "image/webp"].includes(proofFile.type) || proofFile.size > 5 * 1024 * 1024)) {
    document.getElementById("copy-status").textContent = "ເລືອກຮູບ JPG, PNG ຫຼື WEBP ຂະໜາດບໍ່ເກີນ 5 MB.";
    return;
  }

  button.disabled = true;
  copyButton.disabled = true;
  button.textContent = "ກຳລັງບັນທຶກຄຳສັ່ງຊື້...";
  document.getElementById("copy-status").textContent = "";

  let client;
  let orderRef;
  let orderSaved = false;
  let proofUploaded = false;
  let uploadFailed = false;

  try {
    client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    orderRef = client.firestore.doc(client.firestore.collection(client.db, "orders"));
    const proofPath = proofFile ? "payment-proofs/" + orderRef.id + "/receipt" : "";
    const items = cart.map(function (item) {
      const product = productById(item.productId);
      const option = selectedOption(product, item.optionId);
      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        image: product.image,
        pack: option.quantityLabel,
        unit: option.unit,
        quantity: Number(item.quantity),
        unitPrice: option.price,
        subtotal: option.price * Number(item.quantity)
      };
    });
    const customer = {
      name: document.getElementById("customer-name").value.trim(),
      phone: document.getElementById("customer-phone").value.trim(),
      address: document.getElementById("customer-address").value.trim(),
      note: document.getElementById("customer-note").value.trim()
    };

    await client.firestore.setDoc(orderRef, {
      customerUid: currentUser.uid,
      customerEmail: currentUser.email || "",
      customer: customer,
      items: items,
      total: totalPrice(),
      currency: "LAK",
      paymentMethod: "BCEL QR",
      paymentStatus: proofFile ? "awaiting_proof_upload" : "awaiting_payment",
      paymentProofPath: proofPath,
      orderStatus: "new",
      createdAt: client.firestore.serverTimestamp()
    });
    orderSaved = true;

    if (proofFile) {
      try {
        const proofRef = client.cloudStorage.ref(client.storage, proofPath);
        await client.cloudStorage.uploadBytes(proofRef, proofFile, { contentType: proofFile.type });
        await client.firestore.updateDoc(orderRef, { paymentStatus: "proof_submitted" });
        proofUploaded = true;
      } catch (error) {
        console.error("The order was saved, but its payment proof could not be uploaded.", error);
        uploadFailed = true;
      }
    }
  } catch (error) {
    console.error("The order could not be saved.", error);
    if (!orderSaved) {
      document.getElementById("copy-status").textContent = "ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາກວດສອບການຕັ້ງຄ່າ Firestore ແລ້ວລອງອີກຄັ້ງ.";
    }
  }

  button.disabled = false;
  copyButton.disabled = false;
  button.innerHTML = 'ຢືນຢັນຄຳສັ່ງຊື້ <span aria-hidden="true">→</span>';

  if (!orderSaved) return;

  cart = [];
  if (directCartBackup !== null) {
    cart = directCartBackup;
    directCartBackup = null;
  }
  renderCart();
  orderForm.hidden = true;
  orderSuccess.hidden = false;
  const receiptMessage = proofUploaded
    ? "ຮ້ານໄດ້ຮັບຫຼັກຖານການໂອນແລ້ວ."
    : uploadFailed
      ? "ບັນທຶກຄຳສັ່ງຊື້ແລ້ວ ແຕ່ອັບໂຫຼດຫຼັກຖານການໂອນບໍ່ສຳເລັດ. ກະລຸນາສົ່ງຫຼັກຖານການໂອນໃຫ້ຮ້ານທາງ Facebook."
      : "ບັນທຶກຄຳສັ່ງຊື້ແລ້ວ. ສາມາດສົ່ງຫຼັກຖານການໂອນໃຫ້ຮ້ານທາງ Facebook ໄດ້.";
  orderSuccess.innerHTML = '<span class="success-mark" aria-hidden="true">✓</span><h3>ຂອບໃຈທີ່ສັ່ງຊື້</h3><p>' + receiptMessage + '</p><p class="order-code">ເລກທີຄຳສັ່ງຊື້: <strong>' + orderRef.id + '</strong></p><a class="button button-outline button-wide" href="' + facebookUrl + '" target="_blank" rel="noreferrer">ຕິດຕໍ່ຮ້ານທາງ Facebook <span aria-hidden="true">↗</span></a><button class="button button-quiet button-wide" type="button" data-close-order-success>ກັບຄືນໜ້າຮ້ານ</button>';
  showToast("ບັນທຶກຄຳສັ່ງຊື້ແລ້ວ");
}

productGrid.addEventListener("click", function (event) {
  const stepButton = event.target.closest("[data-quantity-for]");
  if (stepButton) {
    const input = productGrid.querySelector('[data-quantity-input="' + stepButton.dataset.quantityFor + '"]');
    input.value = Math.max(1, Math.min(99, (Number(input.value) || 1) + Number(stepButton.dataset.step)));
    return;
  }

  const buyButton = event.target.closest("[data-buy-now]");
  if (buyButton) {
    startDirectCheckout(buyButton.dataset.buyNow);
    return;
  }

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const productId = addButton.dataset.add;
    const optionId = productGrid.querySelector('[data-option-select="' + productId + '"]').value;
    const quantityInput = productGrid.querySelector('[data-quantity-input="' + productId + '"]');
    const quantity = Math.max(1, Math.min(99, Number(quantityInput.value) || 1));
    const existing = cart.find(function (item) { return item.productId === productId && item.optionId === optionId; });
    if (existing) existing.quantity = Math.min(99, Number(existing.quantity) + quantity);
    else cart.push({ productId: productId, optionId: optionId, quantity: quantity });
    renderCart();
    showToast("ເພີ່ມລົງໃນກະຕ່າແລ້ວ");
  }
});

productGrid.addEventListener("change", function (event) {
  const select = event.target.closest("[data-option-select]");
  if (!select) return;
  const product = productById(select.dataset.optionSelect);
  const option = selectedOption(product, select.value);
  const price = productGrid.querySelector('[data-price="' + product.id + '"]');
  const unit = productGrid.querySelector('[data-unit="' + product.id + '"]');
  const note = productGrid.querySelector('[data-bulk-note="' + product.id + '"]');
  price.textContent = formatMoney(option.price);
  unit.textContent = "/ " + option.unit;
  if (option.count) {
    const savings = option.count * product.options[0].price - option.price;
    note.textContent = savings > 0 ? "ຊື້ 1 ແກັດ ປະຢັດ " + formatMoney(savings) : "1 ແກັດ ລວມ " + option.count + " " + product.options[0].unit;
  } else {
    note.textContent = "ເລືອກຈຳນວນ " + option.unit + " ໄດ້";
  }
});

productGrid.addEventListener("input", function (event) {
  if (event.target.matches("[data-quantity-input]")) {
    event.target.value = Math.max(1, Math.min(99, Number(event.target.value) || 1));
  }
});

document.querySelectorAll(".filter-chip").forEach(function (button) {
  button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(function (chip) { chip.classList.toggle("is-active", chip === button); });
    renderProducts(document.getElementById("product-search").value);
  });
});
document.getElementById("product-search").addEventListener("input", function (event) { renderProducts(event.target.value); });
document.getElementById("login-open").addEventListener("click", function () { openAuthModal("login", false); });
document.getElementById("register-open").addEventListener("click", function () { openAuthModal("register", false); });
document.getElementById("auth-switch").addEventListener("click", function () { setAuthMode(authMode === "login" ? "register" : "login"); });
document.getElementById("close-auth").addEventListener("click", function () { closeAuthModal(true); });
authModal.addEventListener("click", function (event) { if (event.target === authModal) closeAuthModal(true); });
document.getElementById("auth-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const button = document.getElementById("auth-submit");
  const status = document.getElementById("auth-status");
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const name = document.getElementById("auth-name").value.trim();
  button.disabled = true;
  status.textContent = authMode === "register" ? "ກຳລັງສ້າງບັນຊີ..." : "ກຳລັງເຂົ້າລະບົບ...";
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    if (authMode === "register") {
      const credential = await client.authentication.createUserWithEmailAndPassword(client.auth, email, password);
      await client.authentication.updateProfile(credential.user, { displayName: name });
      updateAuthHeader(credential.user);
      status.textContent = "ສ້າງບັນຊີສຳເລັດ.";
    } else {
      const credential = await client.authentication.signInWithEmailAndPassword(client.auth, email, password);
      updateAuthHeader(credential.user);
      status.textContent = "ເຂົ້າລະບົບສຳເລັດ.";
    }
  } catch (error) {
    console.error("Customer authentication failed.", error);
    status.textContent = "ບໍ່ສຳເລັດ. ກະລຸນາກວດສອບອີເມວ, ລະຫັດຜ່ານ ແລະ ການເປີດໃຊ້ Email/Password ໃນ Firebase.";
  } finally {
    button.disabled = false;
  }
});
document.getElementById("google-login").addEventListener("click", async function () {
  const button = document.getElementById("google-login");
  const status = document.getElementById("auth-status");
  button.disabled = true;
  status.textContent = "ກຳລັງເຊື່ອມຕໍ່ Google...";
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    const provider = new client.authentication.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await client.authentication.signInWithPopup(client.auth, provider);
    updateAuthHeader(credential.user);
    status.textContent = "ເຂົ້າລະບົບດ້ວຍ Google ສຳເລັດ.";
  } catch (error) {
    console.error("Google sign-in failed.", error);
    if (error.code === "auth/unauthorized-domain") {
      status.textContent = "ໂດເມນນີ້ຍັງບໍ່ໄດ້ອະນຸຍາດ. ໃຫ້ເພີ່ມ phiphakone.github.io ໃນ Firebase Authentication > Settings > Authorized domains.";
    } else if (error.code === "auth/operation-not-allowed") {
      status.textContent = "Google Sign-In ຍັງບໍ່ໄດ້ເປີດ. ໃຫ້ເປີດ Google provider ໃນ Firebase Authentication > Sign-in method.";
    } else if (error.code === "auth/popup-blocked") {
      status.textContent = "ບຣາວເຊີບລັອກໜ້າຕ່າງ Google. ອະນຸຍາດ popup ແລ້ວລອງອີກຄັ້ງ.";
    } else if (error.code === "auth/popup-closed-by-user") {
      status.textContent = "ປິດໜ້າຕ່າງ Google ກ່ອນສຳເລັດ. ກົດເຂົ້າດ້ວຍ Google ອີກຄັ້ງໄດ້.";
    } else {
      status.textContent = "ເຊື່ອມຕໍ່ Google ບໍ່ສຳເລັດ. ກວດກາ Google provider ແລະ Authorized domains ໃນ Firebase.";
    }
  } finally {
    button.disabled = false;
  }
});
document.getElementById("logout-button").addEventListener("click", async function () {
  const client = await firebaseClientPromise;
  if (client) await client.authentication.signOut(client.auth);
});
document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("continue-shopping").addEventListener("click", function () { closeCart(); document.getElementById("products").scrollIntoView({ behavior: "smooth" }); });
document.getElementById("clear-cart").addEventListener("click", function () {
  cart = [];
  renderCart();
  showToast("ລ້າງກະຕ່າແລ້ວ");
});
cartItems.addEventListener("click", function (event) {
  const row = event.target.closest("[data-cart-key]");
  if (!row) return;
  const key = row.dataset.cartKey;
  const itemIndex = cart.findIndex(function (item) { return item.productId + ":" + item.optionId === key; });
  if (itemIndex < 0) return;
  if (event.target.closest("[data-cart-remove]")) {
    cart.splice(itemIndex, 1);
    renderCart();
    return;
  }
  const change = event.target.closest("[data-cart-change]");
  if (change) {
    cart[itemIndex].quantity = Number(cart[itemIndex].quantity) + Number(change.dataset.cartChange);
    if (cart[itemIndex].quantity < 1) cart.splice(itemIndex, 1);
    renderCart();
  }
});
document.getElementById("checkout-button").addEventListener("click", openOrder);
document.getElementById("close-order").addEventListener("click", closeOrder);
drawerBackdrop.addEventListener("click", closeCart);
orderModal.addEventListener("click", function (event) { if (event.target === orderModal) closeOrder(); });
document.getElementById("customer-name").addEventListener("input", updateOrderPreview);
document.getElementById("customer-phone").addEventListener("input", updateOrderPreview);
document.getElementById("customer-address").addEventListener("input", updateOrderPreview);
document.getElementById("customer-note").addEventListener("input", updateOrderPreview);
document.getElementById("copy-order").addEventListener("click", copyOrder);
orderForm.addEventListener("submit", submitOrder);
orderSuccess.addEventListener("click", function (event) {
  if (event.target.closest("[data-close-order-success]")) closeOrder();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (!orderModal.hidden) closeOrder();
    else if (!authModal.hidden) closeAuthModal(true);
    else if (drawer.classList.contains("is-open")) closeCart();
  }
});

renderProducts("");
renderCart();
