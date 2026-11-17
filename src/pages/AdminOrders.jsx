import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import CartItem from "../components/CartItem";
import "../styles/admin-dashboard.css";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  "https://accessories-backend-production.up.railway.app";

const getShippingCost = (city) => {
  if (!city) return 90;

  if (["Cairo", "Giza"].includes(city)) return 75;

  if (
    ["6th October", "Sheikh Zayed", "New Cairo", "Shorouk"].includes(city)
  ) {
    return 80;
  }

  if (["Obour", "Badr", "New Capital"].includes(city)) return 80;
  

  if (
    [
      "Beheira",
      "Kafr El Sheikh",
      "Gharbia",
      "Tanta",
      "Dakahlia",
      "Mansoura",
      "Damietta",
      "Port Said",
      "Ismailia",
      "Suez",
      "Sharqia",
      "Zagazig",
      "Qalyubia",
      "Monufia",
    ].includes(city)
  ) {
    return 90;
  }

  if (["Alexandria"].includes(city)) return 90;

  if (["Fayoum", "Beni Suef", "Minya", "Assiut", "Sohag", "Qena"].includes(city)) {
    return 95;
  }

  if (["Hurghada", "Aswan"].includes(city)) return 125;
  if (["Matrouh", "Marsa Matrouh"].includes(city)) return 130;
  if (["North Coast", "New Valley"].includes(city)) return 135;

  if (
    [
      "Red Sea",
      "Sharm El Sheikh",
      "Arish",
      "El Arish",
      "North Sinai",
      "South Sinai",
    ].includes(city)
  ) {
    return 145;
  }

  return 90;
};

const getLegacyDiscountAmount = (subtotal, discountCode) => {
  if (!discountCode) return 0;
  return discountCode.toUpperCase().trim() === "BACKTOLUMIE"
    ? subtotal * 0.1
    : 0;
};

// Apply the exact same Buy X Get Y rules used in Cart.jsx.
// Orders from the API contain the original product lines, so the admin
// recalculates the free items locally without changing the backend.
const processOrderItems = (orderItems = [], applyOffer = true) => {
  const unitItems = [];

  orderItems.forEach((item) => {
    const quantity = Math.max(Number(item.quantity) || 1, 1);
    const unitPrice = Number(
      item.unit_price_after_discount ?? item.price ??
      (item.total_price_after_discount !== undefined
        ? Number(item.total_price_after_discount) / quantity
        : 0)
    );

    for (let i = 0; i < quantity; i += 1) {
      unitItems.push({
        ...item,
        name: item.product_name || item.name || `Product #${item.product_id}`,
        original_price: Number(item.original_price ?? unitPrice),
        final_price: unitPrice,
        is_free: false,
        quantity: 1,
      });
    }
  });

  // Historical orders (up to #583) must remain exactly as originally placed.
  // Only orders #584 and newer are eligible for the frontend offer calculation.
  if (!applyOffer) {
    const groupedPaidItems = new Map();
    unitItems.forEach((item) => {
      const key = `${item.product_id}_${item.original_price}`;
      if (!groupedPaidItems.has(key)) {
        groupedPaidItems.set(key, {
          ...item,
          final_price: item.original_price,
          is_free: false,
          discount_amount: 0,
          quantity: 0,
        });
      }
      groupedPaidItems.get(key).quantity += 1;
    });
    return [...groupedPaidItems.values()];
  }

  // Same dynamic-programming calculation as the cart:
  // 4 total items => 1 free; 7 total items => 2 free.
  const maxFree = Array(unitItems.length + 1).fill(0);
  for (let quantity = 1; quantity <= unitItems.length; quantity += 1) {
    maxFree[quantity] = maxFree[quantity - 1];
    if (quantity >= 4) {
      maxFree[quantity] = Math.max(maxFree[quantity], maxFree[quantity - 4] + 1);
    }
    if (quantity >= 7) {
      maxFree[quantity] = Math.max(maxFree[quantity], maxFree[quantity - 7] + 2);
    }
  }

  const freeCount = maxFree[unitItems.length];
  const cheapestIndexes = [...unitItems.keys()]
    .sort((a, b) => unitItems[a].original_price - unitItems[b].original_price)
    .slice(0, freeCount);
  const freeIndexes = new Set(cheapestIndexes);

  const markedItems = unitItems.map((item, index) => {
    const isFree = freeIndexes.has(index);
    return {
      ...item,
      is_free: isFree,
      final_price: isFree ? 0 : item.original_price,
      discount_amount: isFree ? item.original_price : 0,
    };
  });

  // Keep paid and free quantities as separate rows, even when they are the
  // same product, so the admin can visibly identify the free unit(s).
  const grouped = new Map();
  markedItems.forEach((item) => {
    const key = `${item.product_id}_${item.is_free ? 'free' : 'paid'}_${item.original_price}`;
    if (!grouped.has(key)) {
      grouped.set(key, { ...item, quantity: 0 });
    }
    grouped.get(key).quantity += 1;
  });

  return [...grouped.values()];
};

const getOrderTotals = (order) => {
  const isNewOfferOrder = Number(order.order_id) >= 584;
  const processedItems = processOrderItems(order.items, isNewOfferOrder);

  const calculatedSubtotal = processedItems.reduce(
    (sum, item) => sum + item.original_price * item.quantity,
    0
  );
  const subtotal = isNewOfferOrder
    ? calculatedSubtotal
    : Number(order.subtotal_amount ?? calculatedSubtotal);

  const freeItems = processedItems.filter((item) => item.is_free);
  const freeCount = freeItems.reduce((sum, item) => sum + item.quantity, 0);
  const buyXGetYDiscount = freeItems.reduce(
    (sum, item) => sum + item.original_price * item.quantity,
    0
  );

  const itemsTotalAfterOffer = processedItems.reduce(
    (sum, item) => sum + item.final_price * item.quantity,
    0
  );

  const savedShipping = order.shipping_amount ?? order.shipping;
  const shippingAmount =
    savedShipping !== null && savedShipping !== undefined
      ? Number(savedShipping)
      : getShippingCost(order.customer_city);

  // Older orders keep their saved totals unchanged. New orders calculate
  // the Buy X Get Y offer locally in the admin page.
  const discountAmount = Math.max(Number(order.discount_amount || 0), 0);
  const subtotalAfterDiscount = isNewOfferOrder
    ? Math.max(itemsTotalAfterOffer - discountAmount, 0)
    : Math.max(subtotal - discountAmount, 0);
  const totalAmount = isNewOfferOrder
    ? subtotalAfterDiscount + shippingAmount
    : Number(order.total_amount ?? subtotalAfterDiscount + shippingAmount);

  return {
    processedItems,
    subtotal,
    freeCount,
    buyXGetYDiscount,
    discountAmount,
    shippingAmount,
    totalAmount,
  };
};
const normalizeWhatsAppPhone = (value) => {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("1")) digits = `20${digits}`;

  return digits;
};

const getWhatsAppUrl = (order) => {
  const phone = normalizeWhatsAppPhone(order.customer_phone);
  const message = `Hello ${order.customer_name}, regarding your Lumie order #${String(
    order.order_id
  ).padStart(3, "0")}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const excelCell = (value, type = "String") =>
  `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;

const downloadOrdersExcel = (orders) => {
  if (!orders.length) return;

  const headers = [
    "Order ID",
    "Status",
    "Customer Name",
    "Phone",
    "Email",
    "City",
    "Address",
    "Product ID",
    "Product",
    "Quantity",
    "Unit Price",
    "Is Free",
    "Subtotal",
    "Coupon Code",
    "Buy X Get Y Discount",
    "Coupon Discount",
    "Shipping",
    "Total",
    "Notes",
    "Source",
  ];

  const rows = [];

  orders.forEach((order) => {
    const totals = getOrderTotals(order);
    const status = order.is_cancelled
      ? "Cancelled"
      : order.is_delivered
        ? "Delivered"
        : "Pending";
    const items = totals.processedItems.length
      ? totals.processedItems
      : [{
          product_id: "",
          name: "",
          quantity: "",
          final_price: "",
          is_free: false,
        }];

    items.forEach((item) => {
      rows.push([
        order.order_id,
        status,
        order.customer_name,
        order.customer_phone,
        order.customer_email,
        order.customer_city,
        order.customer_address,
        item.product_id,
        item.name,
        item.quantity,
        item.final_price,
        item.is_free ? "YES" : "NO",
        totals.subtotal,
        order.discount_code || "",
        totals.buyXGetYDiscount,
        totals.discountAmount,
        totals.shippingAmount,
        totals.totalAmount,
        order.notes || "",
        order.source || "",
      ]);
    });
  });

  const headerXml = `<Row>${headers.map((header) => excelCell(header)).join("")}</Row>`;
  const rowsXml = rows
    .map(
      (row) =>
        `<Row>${row
          .map((value, index) =>
            [0, 7, 9, 10, 12, 14, 15, 16, 17].includes(index) && value !== ""
              ? excelCell(Number(value), "Number")
              : excelCell(value)
          )
          .join("")}</Row>`
    )
    .join("");

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Orders">
  <Table>${headerXml}${rowsXml}</Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([`\ufeff${workbook}`], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lumie-orders-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const handleUnauthorized = useCallback(
    (response) => {
      if (response.status !== 401) return false;

      localStorage.removeItem("admin_token");
      navigate("/admin/login", { replace: true });
      return true;
    },
    [navigate]
  );

  useEffect(() => {
    fetch(`${apiUrl}/admin/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        if (handleUnauthorized(response)) return null;

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || "Failed to load orders");
        }
        return response.json();
      })
      .then((data) => {
        if (data === null) return;
        setOrders(Array.isArray(data) ? data : []);
        setLoadError("");
      })
      .catch((error) => {
        console.error(error);
        setLoadError(error.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [token, handleUnauthorized]);

  const toggleDelivered = async (orderId, currentStatus) => {
    try {
      const response = await fetch(
        `${apiUrl}/admin/orders/${orderId}/deliver`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: `delivered=${!currentStatus}`,
        }
      );

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        alert("Failed to update order ❌");
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? { ...order, is_delivered: !currentStatus }
            : order
        )
      );
      window.dispatchEvent(new Event("ordersUpdated"));
    } catch (error) {
      console.error(error);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${apiUrl}/admin/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.detail || "Failed to cancel order ❌");
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                is_cancelled: !order.is_cancelled,
                is_delivered: false,
              }
            : order
        )
      );
      window.dispatchEvent(new Event("ordersUpdated"));
    } catch (error) {
      console.error("Cancel Error:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      `Permanently delete order #${String(orderId).padStart(3, "0")}?\n\nThis removes the order record only and does not change product stock.`
    );

    if (!confirmed) return;

    setDeletingOrderId(orderId);
    try {
      const response = await fetch(`${apiUrl}/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.detail || "Failed to delete order ❌");
        return;
      }

      setOrders((current) =>
        current.filter((order) => order.order_id !== orderId)
      );
      window.dispatchEvent(new Event("ordersUpdated"));
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete order ❌");
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="admin-content">
        <div className="orders-page-toolbar">
          <div>
            <h1 className="section-title">Orders</h1>
            <span>{orders.length} total orders</span>
          </div>

          <button
            type="button"
            className="download-orders-btn"
            onClick={() => downloadOrdersExcel(orders)}
            disabled={orders.length === 0}
          >
            Download Excel
          </button>
        </div>

        {loading && <p>Loading orders…</p>}
        {loadError && <p className="orders-load-error">{loadError}</p>}

        {!loading && !loadError && orders.length === 0 && (
          <p>No orders yet 🤍</p>
        )}

        {orders.map((order) => {
          const totals = getOrderTotals(order);

          return (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <div className="order-main-info">
                  <h3>Order #{String(order.order_id).padStart(3, "0")}</h3>
                  <p className="order-name">{order.customer_name}</p>
                  <span className="order-email">{order.customer_email}</span>

                  <a
                    className="order-phone whatsapp-order-link"
                    href={getWhatsAppUrl(order)}
                    target="_blank"
                    rel="noreferrer"
                    title="Open customer chat on WhatsApp"
                  >
                    {order.customer_phone} · WhatsApp
                  </a>
                </div>

                <div className="order-address">{order.customer_address}</div>

                {order.customer_city && (
                  <div className="order-city">
                    <strong>City:</strong> {order.customer_city}
                  </div>
                )}

                {order.discount_code && (
                  <div className="order-discount-code">
                    <strong>Discount Code:</strong> {order.discount_code}
                  </div>
                )}

                <div className="order-note">
                  <strong>Note:</strong>{" "}
                  {order.notes && order.notes.trim() ? (
                    order.notes
                  ) : (
                    <span style={{ color: "#b7a78c" }}>No note</span>
                  )}
                </div>
                <div className="order-source">
                  <strong>Found us through:</strong>{" "}
                  {order.source ? (
                    order.source
                  ) : (
                    <span style={{ color: "#b7a78c" }}>Not specified</span>
                  )}
                </div>
              </div>

              <div className="order-status">
                <span
                  className={`status-badge ${
                    order.is_cancelled
                      ? "cancelled"
                      : order.is_delivered
                        ? "delivered"
                        : "pending"
                  }`}
                >
                  {order.is_cancelled
                    ? "Cancelled ❌"
                    : order.is_delivered
                      ? "Delivered ✓"
                      : "Pending ⏳"}
                </span>

                <button
                  className="deliver-btn"
                  type="button"
                  onClick={() =>
                    toggleDelivered(order.order_id, order.is_delivered)
                  }
                >
                  {order.is_delivered
                    ? "Mark as not delivered"
                    : "Mark as delivered"}
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() => cancelOrder(order.order_id)}
                >
                  {order.is_cancelled ? "Restore Order" : "Cancel Order"}
                </button>

                <button
                  className="delete-order-btn"
                  type="button"
                  onClick={() => deleteOrder(order.order_id)}
                  disabled={deletingOrderId === order.order_id}
                >
                  {deletingOrderId === order.order_id
                    ? "Deleting..."
                    : "Delete Order"}
                </button>
              </div>

              <div
                className="order-items"
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                {totals.processedItems.length === 0 ? (
                  <div className="empty-order-warning">
                    This order has no products. You can delete it using the button above.
                  </div>
                ) : (
                  totals.processedItems.map((item, index) => (
                    <CartItem
                      key={`${order.order_id}-${item.product_id}-${index}`}
                      item={item}
                      displayQuantity={item.quantity || 1}
                    />
                  ))
                )}
              </div>

              <div
                className="order-total"
                style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "2px solid #e0d5cc",
                }}
              >
                <div className="order-total-row">
                  <span>Subtotal:</span>
                  <span>{totals.subtotal.toFixed(2)} EGP</span>
                </div>

                {totals.buyXGetYDiscount > 0 && (
                  <div className="order-total-row order-discount-total">
                    <span>
                      {totals.freeCount === 1
                        ? "Buy 4 Get 1 Free:"
                        : totals.freeCount === 2
                          ? "Buy 7 Get 2 Free:"
                          : `Offer (${totals.freeCount} free items):`}
                    </span>
                    <span>-{totals.buyXGetYDiscount.toFixed(2)} EGP</span>
                  </div>
                )}

                {order.discount_code && (
                  <div className="order-total-row order-discount-total">
                    <span>Discount ({order.discount_code}):</span>
                    <span>-{totals.discountAmount.toFixed(2)} EGP</span>
                  </div>
                )}

                <div className="order-total-row">
                  <span>Shipping:</span>
                  <span>
                    {totals.shippingAmount === 0
                      ? "Free Shipping"
                      : `${totals.shippingAmount.toFixed(2)} EGP`}
                  </span>
                </div>

                <div className="order-total-row order-grand-total">
                  <span>Total after discount:</span>
                  <span>{totals.totalAmount.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
};

export default AdminOrders;
