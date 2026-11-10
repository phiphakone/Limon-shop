const facebookUrl = "https://www.facebook.com/profile.php?id=61596329459044&rdid=AwJJqnTlbzwqRck1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DraSRR1PH%2F#";
const firebaseClientPromise = import("./firebase-client.js").catch(function (error) {
  console.error("Firebase SDK could not be loaded.", error);
  return null;
});
let directCartBackup = null;
const products = [
  {
    id: "elephant",
    code: "L01",
    name: "ເຈ້ຍທິດຊູລາຍຊ້າງ",
    subtitle: "ລາຍຊ້າງ · ຂາຍແບບແພັກ",
    category: "pack",
    tag: "ລາຍຊ້າງ",
    image: "./Ảnh/product-l01.webp",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 29000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 15 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 15 ແພັກ)", unit: "ແກັດ", price: 400000, count: 15 }
    ]
  },
  {
    id: "flower-box",
    code: "L02",
    name: "ເຈ້ຍທິດຊູແບບກ່ອງລາຍດອກໄມ້",
    subtitle: "ແບບກ່ອງ · ລາຍກິ່ງດອກຈໍາປາ",
    category: "box",
    tag: "ລາຍດອກໄມ້",
    image: "./Ảnh/product-l02.webp",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 40000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 10 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 10 ແພັກ)", unit: "ແກັດ", price: 400000, count: 10 }
    ]
  },
  {
    id: "branch-box",
    code: "L03",
    name: "ເຈ້ຍທີດຊູ້ລາຍດອກຈໍາປາແບບດຶງຈາກດ້ານລຸ່ມ",
    subtitle: "ແບບກ່ອງ · ລາຍກິ່ງດອກຈໍາປາ",
    category: "box",
    tag: "ກ່ອງລາຍກິ່ງໄມ້",
    image: "./Ảnh/product-l03.webp",
    options: [
      { id: "single", label: "1 ອັນ", quantityLabel: "1 ອັນ", unit: "ອັນ", price: 19000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 24 ອັນ", quantityLabel: "1 ແກັດ (ລວມ 24 ອັນ)", unit: "ແກັດ", price: 440000, count: 24 }
    ]
  },
  {
    id: "roll-flower",
    code: "L04",
    name: "ເຈ້ຍກໍ້ມ້ວນໃຫຍ່",
    subtitle: "ເຈ້ຍມ້ວນ · ລາຍກິ່ງດອກຈໍາປາ",
    category: "roll",
    tag: "ເຈ້ຍມ້ວນ",
    image: "./Ảnh/product-l04.webp",
    options: [
      { id: "single", label: "1 ອັນ", quantityLabel: "1 ອັນ", unit: "ອັນ", price: 30000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 24 ອັນ", quantityLabel: "1 ແກັດ (ລວມ 24 ອັນ)", unit: "ແກັດ", price: 580000, count: 24 }
    ]
  },
  {
    id: "flower-pack",
    code: "L05",
    name: "ເຈ້ຍທິດຊູ້ລາຍດອກຈໍາປາ",
    subtitle: "ລາຍກິ່ງດອກຈໍາປາ · 12 ແພັກຕໍ່ແກັດ",
    category: "pack",
    tag: "ລາຍກິ່ງດອກໄມ້",
    image: "./Ảnh/product-l05.webp",
    options: [
      { id: "single", label: "1 ແພັກ", quantityLabel: "1 ແພັກ", unit: "ແພັກ", price: 35000 },
      { id: "carton", label: "1 ແກັດ · ລວມ 12 ແພັກ", quantityLabel: "1 ແກັດ (ລວມ 12 ແພັກ)", unit: "ແກັດ", price: 400000, count: 12 }
    ]
  }
];

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
const toast = document.getElementById("toast");
const accountArea = document.getElementById("account-area");
const accountMenu = document.getElementById("account-menu");
const accountModal = document.getElementById("account-modal");
const accountForm = document.getElementById("account-form");
const accountMessage = document.getElementById("account-message");
const orderHistoryModal = document.getElementById("order-history-modal");
const orderHistoryList = document.getElementById("order-history-list");
let currentAccountUser = null;
let accountMode = "register";

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
      const optionName = option.label.split(" · ")[0];
      const optionDetails = option.count
        ? "ລວມ " + option.count + " " + firstOption.unit
        : "ລາຄາຕໍ່ " + firstOption.unit;
      return '<button class="option-choice" type="button" data-option-choice="' + product.id + '" data-option-id="' + option.id + '" aria-pressed="false">' +
        '<span class="option-choice-name">' + optionName + '</span>' +
        '<span class="option-choice-details">' + optionDetails + '</span>' +
        '<strong class="option-choice-price">' + formatMoney(option.price) + '</strong>' +
      '</button>';
    }).join("");
    return '<article class="product-card" data-product-card="' + product.id + '">' +
      '<div class="product-photo"><img src="' + product.image + '" alt="' + product.name + '" loading="lazy"><span class="product-tag">' + product.tag + '</span></div>' +
      '<div class="product-content">' +
        '<div class="product-topline"><h3 class="product-title">' + product.name + '</h3><span class="product-number">' + product.code + '</span></div>' +
        '<p class="product-subtitle">' + product.subtitle + '</p>' +
        '<p class="product-option-label">ເລືອກແບບບັນຈຸ</p>' +
        '<div class="option-choice-list" role="group" aria-label="ເລືອກແບບບັນຈຸ">' + optionMarkup + '</div>' +
        '<p class="option-selection-hint">ເລືອກແບບທີ່ຕ້ອງການກ່ອນສັ່ງຊື້</p>' +
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

function updateAccountButton(user) {
  currentAccountUser = user || null;
  const button = document.getElementById("account-open");
  const label = document.getElementById("account-label");
  const avatar = document.getElementById("account-avatar");
  if (!currentAccountUser) {
    label.textContent = "ບັນຊີ";
    avatar.textContent = "👤";
    button.setAttribute("aria-label", "ລົງທະບຽນ ຫຼື ເຂົ້າລະບົບ");
    accountMenu.hidden = true;
    return;
  }
  const name = currentAccountUser.displayName || currentAccountUser.email || "ບັນຊີ";
  label.textContent = name;
  avatar.textContent = Array.from(name.trim())[0] || "👤";
  button.setAttribute("aria-label", "ບັນຊີ " + name);
  document.getElementById("account-menu-name").textContent = currentAccountUser.displayName || "ບັນຊີ Limon Shop";
  document.getElementById("account-menu-email").textContent = currentAccountUser.email || "";
}

function setAccountMode(mode) {
  accountMode = mode === "login" ? "login" : "register";
  const isRegister = accountMode === "register";
  const nameField = document.getElementById("account-name-field");
  const nameInput = document.getElementById("account-name");
  nameField.hidden = !isRegister;
  nameInput.required = isRegister;
  document.getElementById("account-password").autocomplete = isRegister ? "new-password" : "current-password";
  document.getElementById("account-submit").textContent = isRegister ? "ລົງທະບຽນ" : "ເຂົ້າລະບົບ";
  document.querySelectorAll("[data-account-mode]").forEach(function (button) {
    const selected = button.dataset.accountMode === accountMode;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  accountMessage.textContent = "";
}

function openAccountModal(mode) {
  accountMenu.hidden = true;
  setAccountMode(mode);
  accountForm.reset();
  accountModal.hidden = false;
  document.body.classList.add("has-overlay");
  document.getElementById(isAccountRegisterMode() ? "account-name" : "account-email").focus();
}

function isAccountRegisterMode() {
  return accountMode === "register";
}

function closeAccountModal() {
  accountModal.hidden = true;
  if (orderModal.hidden && orderHistoryModal.hidden && !drawer.classList.contains("is-open")) document.body.classList.remove("has-overlay");
}

function closeOrderHistory() {
  orderHistoryModal.hidden = true;
  if (accountModal.hidden && orderModal.hidden && !drawer.classList.contains("is-open")) document.body.classList.remove("has-overlay");
}

function historyText(message) {
  orderHistoryList.replaceChildren();
  const empty = document.createElement("p");
  empty.className = "order-history-empty";
  empty.textContent = message;
  orderHistoryList.appendChild(empty);
}

function orderStatusLabel(status) {
  const labels = {
    "new": "ໃໝ່",
    "confirmed": "ຢືນຢັນແລ້ວ",
    "preparing": "ກຳລັງກຽມ",
    "shipped": "ກຳລັງຈັດສົ່ງ",
    "completed": "ສຳເລັດ",
    "cancelled": "ຍົກເລີກ"
  };
  return labels[status] || status || "—";
}

function renderOrderHistory(orders) {
  orderHistoryList.replaceChildren();
  if (!orders.length) {
    historyText("ຍັງບໍ່ມີຄຳສັ່ງຊື້ທີ່ຜູກກັບບັນຊີນີ້. ຄຳສັ່ງຊື້ແບບບໍ່ໄດ້ເຂົ້າລະບົບຈະບໍ່ປາກົດໃນປະຫວັດນີ້.");
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat("lo-LA", { dateStyle: "medium", timeStyle: "short" });
  orders.slice().sort(function (left, right) {
    const leftDate = left.createdAt && typeof left.createdAt.toDate === "function" ? left.createdAt.toDate().getTime() : 0;
    const rightDate = right.createdAt && typeof right.createdAt.toDate === "function" ? right.createdAt.toDate().getTime() : 0;
    return rightDate - leftDate;
  }).forEach(function (order) {
    const card = document.createElement("article");
    card.className = "order-history-card";

    const top = document.createElement("div");
    top.className = "order-history-topline";
    const code = document.createElement("strong");
    code.className = "order-history-code";
    code.textContent = "#" + order.id;
    const date = document.createElement("time");
    date.className = "order-history-date";
    const createdAt = order.createdAt && typeof order.createdAt.toDate === "function" ? order.createdAt.toDate() : null;
    if (createdAt) {
      date.dateTime = createdAt.toISOString();
      date.textContent = dateFormatter.format(createdAt);
    } else {
      date.textContent = "";
    }
    top.append(code, date);
    card.appendChild(top);

    const items = document.createElement("ul");
    items.className = "order-history-items";
    (Array.isArray(order.items) ? order.items : []).forEach(function (item) {
      const line = document.createElement("li");
      line.textContent = (item.productName || item.productCode || "ສິນຄ້າ") + " · " + (item.pack || "") + " × " + Number(item.quantity || 0);
      items.appendChild(line);
    });
    card.appendChild(items);

    const bottom = document.createElement("div");
    bottom.className = "order-history-bottom";
    const status = document.createElement("span");
    status.className = "order-status";
    status.textContent = orderStatusLabel(order.orderStatus);
    const total = document.createElement("strong");
    total.className = "order-history-total";
    total.textContent = formatMoney(Number(order.total || 0));
    bottom.append(status, total);
    card.appendChild(bottom);
    orderHistoryList.appendChild(card);
  });
}

async function openOrderHistory() {
  accountMenu.hidden = true;
  if (!currentAccountUser) {
    openAccountModal("login");
    accountMessage.textContent = "ກະລຸນາເຂົ້າລະບົບເພື່ອເບິ່ງປະຫວັດຄຳສັ່ງຊື້.";
    return;
  }

  orderHistoryModal.hidden = false;
  document.body.classList.add("has-overlay");
  historyText("ກຳລັງໂຫຼດຄຳສັ່ງຊື້...");
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    const user = client.auth.currentUser || currentAccountUser;
    const ordersQuery = client.firestore.query(
      client.firestore.collection(client.db, "orders"),
      client.firestore.where("customerUid", "==", user.uid)
    );
    const snapshot = await client.firestore.getDocs(ordersQuery);
    renderOrderHistory(snapshot.docs.map(function (orderDoc) {
      return Object.assign({ id: orderDoc.id }, orderDoc.data());
    }));
  } catch (error) {
    console.error("Customer order history could not be loaded.", error);
    historyText("ໂຫຼດປະຫວັດບໍ່ສຳເລັດ. ກວດກາກົດ Firestore ແລະລອງໃໝ່ຫຼັງຈາກຕັ້ງຄ່າ Firebase ແລ້ວ.");
  }
}

function accountAuthError(error) {
  if (error.code === "auth/email-already-in-use") return "ອີເມວນີ້ມີບັນຊີແລ້ວ. ລອງເຂົ້າລະບົບແທນ.";
  if (error.code === "auth/weak-password") return "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ.";
  if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") return "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ.";
  if (error.code === "auth/popup-blocked") return "ບຣາວເຊີບລັອກໜ້າ Google. ອະນຸຍາດ popup ແລ້ວລອງໃໝ່.";
  if (error.code === "auth/unauthorized-domain") return "ໂດເມນນີ້ຍັງບໍ່ຖືກເພີ່ມໃນ Firebase Authorized domains.";
  return "ດຳເນີນການບໍ່ສຳເລັດ. ກວດອີເມວ ແລະ ລອງໃໝ່.";
}

firebaseClientPromise.then(function (client) {
  if (!client) return;
  client.authentication.onAuthStateChanged(client.auth, updateAccountButton);
}).catch(function (error) {
  console.error("Account status could not be loaded.", error);
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
    showToast("ລະບົບສັ່ງຊື້ຍັງບໍ່ພ້ອມ. ລອງອີກຄັ້ງ.");
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

function selectProductOption(productId, optionId) {
  const card = productGrid.querySelector('[data-product-card="' + productId + '"]');
  if (!card) return;
  const selectedChoice = card.querySelector('[data-option-choice="' + productId + '"][data-option-id="' + optionId + '"]');
  if (!selectedChoice) return;
  card.querySelectorAll("[data-option-choice]").forEach(function (choice) {
    const isSelected = choice === selectedChoice;
    choice.setAttribute("aria-pressed", String(isSelected));
    choice.classList.toggle("is-selected", isSelected);
  });
}

function selectedOrDefaultOptionId(productId) {
  const product = productById(productId);
  if (!product) return null;
  const selectedChoice = productGrid.querySelector('[data-option-choice="' + productId + '"][aria-pressed="true"]');
  const optionId = selectedChoice ? selectedChoice.dataset.optionId : product.options[0].id;
  if (!selectedChoice) selectProductOption(productId, optionId);
  return optionId;
}

function startDirectCheckout(productId) {
  const product = productById(productId);
  if (!product) return;
  const optionId = selectedOrDefaultOptionId(productId);
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

async function submitOrder(event) {
  event.preventDefault();
  if (!cart.length || !orderForm.reportValidity()) return;

  const button = document.getElementById("place-order");
  const copyButton = document.getElementById("copy-order");

  button.disabled = true;
  copyButton.disabled = true;
  button.textContent = "ກຳລັງບັນທຶກຄຳສັ່ງຊື້...";
  document.getElementById("copy-status").textContent = "";

  let client;
  let orderRef;
  let orderSaved = false;

  try {
    client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    orderRef = client.firestore.doc(client.firestore.collection(client.db, "orders"));
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
      deliveryArea: document.getElementById("delivery-area").value,
      note: document.getElementById("customer-note").value.trim()
    };

    const signedInUser = client.auth.currentUser || currentAccountUser;
    await client.firestore.setDoc(orderRef, {
      customerUid: signedInUser ? signedInUser.uid : "",
      customerEmail: signedInUser ? (signedInUser.email || "") : "",
      customer: customer,
      items: items,
      total: totalPrice(),
      currency: "LAK",
      paymentMethod: "cash_on_delivery",
      paymentStatus: "pay_on_delivery",
      paymentProofPath: "",
      orderStatus: "new",
      createdAt: client.firestore.serverTimestamp()
    });
    orderSaved = true;

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
  const receiptMessage = "ສັ່ງຊື້ສຳເລັດ. ຊຳລະເງິນປາຍທາງໃນເຂດຕົວເມືອງຫຼວງພະບາງ.";
  orderSuccess.innerHTML = '<span class="success-mark" aria-hidden="true">✓</span><h3>ຂອບໃຈທີ່ສັ່ງຊື້</h3><p>' + receiptMessage + '</p><p class="order-code">ເລກທີຄຳສັ່ງຊື້: <strong>' + orderRef.id + '</strong></p><a class="button button-outline button-wide" href="' + facebookUrl + '" target="_blank" rel="noreferrer">ຕິດຕໍ່ຮ້ານທາງ Facebook <span aria-hidden="true">↗</span></a><button class="button button-quiet button-wide" type="button" data-close-order-success>ກັບຄືນໜ້າຮ້ານ</button>';
  showToast("ບັນທຶກຄຳສັ່ງຊື້ແລ້ວ");
}

productGrid.addEventListener("click", function (event) {
  const optionChoice = event.target.closest("[data-option-choice]");
  if (optionChoice) {
    selectProductOption(optionChoice.dataset.optionChoice, optionChoice.dataset.optionId);
    return;
  }

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
    const optionId = selectedOrDefaultOptionId(productId);
    const quantityInput = productGrid.querySelector('[data-quantity-input="' + productId + '"]');
    const quantity = Math.max(1, Math.min(99, Number(quantityInput.value) || 1));
    const existing = cart.find(function (item) { return item.productId === productId && item.optionId === optionId; });
    if (existing) existing.quantity = Math.min(99, Number(existing.quantity) + quantity);
    else cart.push({ productId: productId, optionId: optionId, quantity: quantity });
    renderCart();
    showToast("ເພີ່ມລົງໃນກະຕ່າແລ້ວ");
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
document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("account-open").addEventListener("click", function () {
  if (currentAccountUser) {
    accountMenu.hidden = !accountMenu.hidden;
    return;
  }
  openAccountModal("register");
});
document.querySelectorAll("[data-account-mode]").forEach(function (button) {
  button.addEventListener("click", function () { setAccountMode(button.dataset.accountMode); });
});
document.getElementById("account-close").addEventListener("click", closeAccountModal);
accountModal.addEventListener("click", function (event) {
  if (event.target === accountModal) closeAccountModal();
});
document.addEventListener("click", function (event) {
  if (!accountArea.contains(event.target)) accountMenu.hidden = true;
});
accountForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!accountForm.reportValidity()) return;
  const submitButton = document.getElementById("account-submit");
  const email = document.getElementById("account-email").value.trim().toLowerCase();
  const password = document.getElementById("account-password").value;
  const name = document.getElementById("account-name").value.trim();
  submitButton.disabled = true;
  submitButton.textContent = accountMode === "register" ? "ກຳລັງລົງທະບຽນ..." : "ກຳລັງເຂົ້າລະບົບ...";
  accountMessage.textContent = "";
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    if (accountMode === "register") {
      const credential = await client.authentication.createUserWithEmailAndPassword(client.auth, email, password);
      if (name) {
        try {
          await client.authentication.updateProfile(credential.user, { displayName: name });
        } catch (profileError) {
          console.warn("The account was created, but its display name could not be saved.", profileError);
        }
      }
      updateAccountButton(credential.user);
      closeAccountModal();
      showToast("ລົງທະບຽນສຳເລັດ. ບັນຊີຂອງທ່ານຢູ່ມຸມຂວາເທິງແລ້ວ.");
    } else {
      const credential = await client.authentication.signInWithEmailAndPassword(client.auth, email, password);
      updateAccountButton(credential.user);
      closeAccountModal();
      showToast("ເຂົ້າລະບົບແລ້ວ.");
    }
  } catch (error) {
    console.error("Customer account authentication failed.", error);
    accountMessage.textContent = accountAuthError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = accountMode === "register" ? "ລົງທະບຽນ" : "ເຂົ້າລະບົບ";
  }
});
document.getElementById("account-google").addEventListener("click", async function () {
  const button = document.getElementById("account-google");
  button.disabled = true;
  accountMessage.textContent = "ກຳລັງເປີດ Google...";
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    const provider = new client.authentication.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await client.authentication.signInWithPopup(client.auth, provider);
    updateAccountButton(credential.user);
    closeAccountModal();
    showToast("ເຂົ້າລະບົບ Google ແລ້ວ.");
  } catch (error) {
    console.error("Customer Google sign in failed.", error);
    accountMessage.textContent = accountAuthError(error);
  } finally {
    button.disabled = false;
  }
});
document.getElementById("account-sign-out").addEventListener("click", async function () {
  try {
    const client = await firebaseClientPromise;
    if (!client) throw new Error("firebase_sdk_unavailable");
    await client.authentication.signOut(client.auth);
    accountMenu.hidden = true;
    showToast("ອອກຈາກລະບົບແລ້ວ.");
  } catch (error) {
    console.error("Customer sign out failed.", error);
    showToast("ອອກຈາກລະບົບບໍ່ສຳເລັດ. ລອງໃໝ່.");
  }
});
document.getElementById("account-orders-open").addEventListener("click", openOrderHistory);
document.getElementById("order-history-close").addEventListener("click", closeOrderHistory);
orderHistoryModal.addEventListener("click", function (event) {
  if (event.target === orderHistoryModal) closeOrderHistory();
});
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
    if (!accountModal.hidden) closeAccountModal();
    else if (!orderHistoryModal.hidden) closeOrderHistory();
    else if (!orderModal.hidden) closeOrder();
    else if (drawer.classList.contains("is-open")) closeCart();
  }
});

renderProducts("");
renderCart();
