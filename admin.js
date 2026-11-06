import {
  ADMIN_EMAIL
} from "./firebase-config.js";
import {
  auth,
  db,
  firestore,
  authentication,
  cloudStorage,
  storage
} from "./firebase-client.js";

const statusLabels = {
  new: "ອໍເດີໃໝ່",
  confirmed: "ຢືນຢັນແລ້ວ",
  preparing: "ກຳລັງກຽມ",
  shipped: "ຈັດສົ່ງແລ້ວ",
  completed: "ສຳເລັດ",
  cancelled: "ຍົກເລີກ"
};
const paymentLabels = {
  awaiting_payment: "ລໍຖ້າຊຳລະ",
  awaiting_proof_upload: "ລໍຖ້າອັບໂຫຼດສະລິບ",
  proof_submitted: "ສົ່ງສະລິບແລ້ວ · ລໍຖ້າກວດ",
  paid: "ຊຳລະແລ້ວ",
  rejected: "ສະລິບບໍ່ຜ່ານ"
};
let allOrders = [];
let unsubscribeOrders = null;
let toastTimer;

const loginCard = document.getElementById("admin-login-card");
const dashboard = document.getElementById("admin-dashboard");
const loginMessage = document.getElementById("admin-login-message");
const dataMessage = document.getElementById("admin-data-message");
const orderList = document.getElementById("admin-order-list");
const orderFilter = document.getElementById("order-filter");
const toast = document.getElementById("admin-toast");

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value) {
  return new Intl.NumberFormat("lo-LA").format(Number(value) || 0) + " ₭";
}

function dateLabel(value) {
  if (!value || typeof value.toDate !== "function") return "ກຳລັງບັນທຶກເວລາ...";
  return value.toDate().toLocaleString("lo-LA", { dateStyle: "medium", timeStyle: "short" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2600);
}

function optionMarkup(labels, selected) {
  return Object.keys(labels).map(function (key) {
    return '<option value="' + key + '"' + (key === selected ? " selected" : "") + ">" + escapeHtml(labels[key]) + "</option>";
  }).join("");
}

function renderOrders() {
  const filter = orderFilter.value;
  const visibleOrders = allOrders.filter(function (order) {
    return filter === "all" || order.data.orderStatus === filter;
  });

  document.getElementById("order-count").textContent = String(allOrders.length);
  if (allOrders.length === 0) {
    orderList.innerHTML = "";
    dataMessage.textContent = "ຍັງບໍ່ມີອໍເດີ. ເມື່ອລູກຄ້າສັ່ງຊື້, ລາຍການຈະສະແດງຢູ່ນີ້.";
    return;
  }
  dataMessage.textContent = "";
  if (visibleOrders.length === 0) {
    orderList.innerHTML = '<div class="admin-empty">ບໍ່ມີອໍເດີໃນສະຖານະນີ້.</div>';
    return;
  }

  orderList.innerHTML = visibleOrders.map(function (entry) {
    const data = entry.data;
    const customer = data.customer || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const itemsHtml = items.map(function (item) {
      return '<div class="admin-item-row"><div><strong>' + escapeHtml(item.productName) + '</strong><small>' + escapeHtml(item.pack) + " · " + escapeHtml(item.quantity) + " ໜ່ວຍ × " + money(item.unitPrice) + '</small></div><b>' + money(item.subtotal) + "</b></div>";
    }).join("");
    const proofButton = data.paymentProofPath
      ? '<button class="proof-button" type="button" data-proof-path="' + escapeHtml(data.paymentProofPath) + '">ເບິ່ງຫຼັກຖານການໂອນ ↗</button>'
      : '<span class="proof-missing">ຍັງບໍ່ມີສະລິບ</span>';
    return '<article class="admin-order-card" data-order-id="' + escapeHtml(entry.id) + '">' +
      '<div class="admin-order-head"><div><span class="order-code-label">ເລກອໍເດີ</span><strong class="admin-order-code">' + escapeHtml(entry.id) + '</strong><span class="admin-order-date">' + escapeHtml(dateLabel(data.createdAt)) + '</span></div><span class="order-badge">' + escapeHtml(statusLabels[data.orderStatus] || data.orderStatus || "—") + '</span></div>' +
      '<div class="admin-order-body">' +
        '<section class="admin-customer"><h3>ຂໍ້ມູນລູກຄ້າ</h3><p><span>ຊື່</span><strong>' + escapeHtml(customer.name) + '</strong></p><p><span>ເບີໂທ</span><a href="tel:' + escapeHtml(customer.phone) + '">' + escapeHtml(customer.phone) + '</a></p><p><span>ທີ່ຢູ່</span><strong>' + escapeHtml(customer.address) + '</strong></p>' + (customer.note ? '<p><span>ໝາຍເຫດ</span><strong>' + escapeHtml(customer.note) + '</strong></p>' : "") + '</section>' +
        '<section class="admin-products"><h3>ລາຍການສິນຄ້າ</h3>' + itemsHtml + '<div class="admin-total"><span>ຍອດລວມ</span><strong>' + money(data.total) + '</strong></div></section>' +
        '<section class="admin-payment"><h3>ການຊຳລະ</h3><p><span>ວິທີ</span><strong>' + escapeHtml(data.paymentMethod || "BCEL QR") + '</strong></p><p><span>ສະຖານະ</span><strong>' + escapeHtml(paymentLabels[data.paymentStatus] || data.paymentStatus || "—") + '</strong></p>' + proofButton + '</section>' +
      '</div>' +
      '<div class="admin-order-controls"><label>ສະຖານະອໍເດີ<select data-order-status>' + optionMarkup(statusLabels, data.orderStatus || "new") + '</select></label><label>ສະຖານະຊຳລະ<select data-payment-status>' + optionMarkup(paymentLabels, data.paymentStatus || "awaiting_payment") + '</select></label><button class="button button-primary" type="button" data-save-order>ບັນທຶກສະຖານະ</button></div>' +
      "</article>";
  }).join("");
}

function watchOrders() {
  if (unsubscribeOrders) unsubscribeOrders();
  dataMessage.textContent = "ກຳລັງໂຫຼດອໍເດີ...";
  const ordersQuery = firestore.query(
    firestore.collection(db, "orders"),
    firestore.orderBy("createdAt", "desc")
  );
  unsubscribeOrders = firestore.onSnapshot(ordersQuery, function (snapshot) {
    allOrders = snapshot.docs.map(function (item) { return { id: item.id, data: item.data() }; });
    renderOrders();
  }, function (error) {
    console.error("Could not load orders.", error);
    dataMessage.textContent = "ໂຫຼດອໍເດີບໍ່ສຳເລັດ. ກວດກາ Firestore Rules ແລະ ສະຖານະ Firebase.";
  });
}

function showDashboard(user) {
  loginCard.hidden = true;
  dashboard.hidden = false;
  document.getElementById("admin-signed-in").textContent = "ເຂົ້າລະບົບເປັນ " + user.email;
  watchOrders();
}

document.getElementById("admin-login-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const button = document.getElementById("admin-login-button");
  const email = document.getElementById("admin-email").value.trim().toLowerCase();
  const password = document.getElementById("admin-password").value;
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    loginMessage.textContent = "email ນີ້ບໍ່ມີສິດເຂົ້າໜ້າ Admin.";
    return;
  }
  button.disabled = true;
  loginMessage.textContent = "ກຳລັງກວດສອບ...";
  try {
    await authentication.signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = "";
  } catch (error) {
    console.error("Admin sign in failed.", error);
    loginMessage.textContent = "ເຂົ້າລະບົບບໍ່ສຳເລັດ. ກວດ email/password ແລະ Firebase Authentication.";
  } finally {
    button.disabled = false;
  }
});

document.getElementById("admin-logout").addEventListener("click", async function () {
  if (unsubscribeOrders) unsubscribeOrders();
  await authentication.signOut(auth);
  allOrders = [];
  dashboard.hidden = true;
  loginCard.hidden = false;
  document.getElementById("admin-password").value = "";
});

document.getElementById("admin-order-list").addEventListener("click", async function (event) {
  const saveButton = event.target.closest("[data-save-order]");
  if (saveButton) {
    const card = saveButton.closest("[data-order-id]");
    const orderId = card.dataset.orderId;
    const orderStatus = card.querySelector("[data-order-status]").value;
    const paymentStatus = card.querySelector("[data-payment-status]").value;
    saveButton.disabled = true;
    try {
      await firestore.updateDoc(firestore.doc(db, "orders", orderId), {
        orderStatus: orderStatus,
        paymentStatus: paymentStatus
      });
      showToast("ບັນທຶກສະຖານະແລ້ວ");
    } catch (error) {
      console.error("Order status could not be updated.", error);
      showToast("ບັນທຶກບໍ່ສຳເລັດ. ກວດ Firestore Rules.");
    } finally {
      saveButton.disabled = false;
    }
    return;
  }
  const proofButton = event.target.closest("[data-proof-path]");
  if (proofButton) {
    const proofWindow = window.open("about:blank", "_blank");
    if (!proofWindow) {
      showToast("ອະນຸຍາດ pop-up ເພື່ອເບິ່ງສະລິບ.");
      return;
    }
    proofWindow.opener = null;
    proofButton.disabled = true;
    try {
      const url = await cloudStorage.getDownloadURL(cloudStorage.ref(storage, proofButton.dataset.proofPath));
      proofWindow.location.href = url;
    } catch (error) {
      proofWindow.close();
      console.error("Payment proof could not be opened.", error);
      showToast("ຍັງບໍ່ພົບຮູບສະລິບ. ອາດຈະອັບໂຫຼດບໍ່ສຳເລັດ.");
    } finally {
      proofButton.disabled = false;
    }
  }
});

orderFilter.addEventListener("change", renderOrders);

authentication.onAuthStateChanged(auth, async function (user) {
  if (!user) {
    if (unsubscribeOrders) unsubscribeOrders();
    dashboard.hidden = true;
    loginCard.hidden = false;
    return;
  }
  if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await authentication.signOut(auth);
    loginMessage.textContent = "ບັນຊີນີ້ບໍ່ມີສິດເປັນ Admin.";
    return;
  }
  showDashboard(user);
});
