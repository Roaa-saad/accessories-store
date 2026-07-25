import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import CartItem from "../components/CartItem";
import "../styles/admin-dashboard.css";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  "https://accessories-backend-production.up.railway.app";

const getShippingCost = (city) => {
  if (!city) return 85;

  if (
    [
      "Cairo",
      "Giza",
      "6th October",
      "Sheikh Zayed",
      "New Cairo",
      "Shorouk",
      "Obour",
      "Badr",
      "New Capital",
    ].includes(city)
  ) {
    return 75;
  }

  if (
    [
      "Alexandria",
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
    return 85;
  }

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

  return 85;
};

const getLegacyDiscountAmount = (subtotal, discountCode) => {
  if (!discountCode) return 0;
  return discountCode.toUpperCase().trim() === "BACKTOLUMIE"
    ? subtotal * 0.1
    : 0;
};

const processOrderItems = (orderItems = []) =>
  orderItems.map((item) => {
    const price =
      item.discount_price && item.discount_price > 0
        ? item.discount_price
        : Number(item.price || 0);

    return {
      ...item,
      name: item.product_name || item.name || `Product #${item.product_id}`,
      final_price: price,
      original_price: price,
      quantity: item.quantity || 1,
    };
  });

const getOrderTotals = (order) => {
  const processedItems = processOrderItems(order.items);
  const calculatedSubtotal = processedItems.reduce(
    (sum, item) => sum + item.final_price * item.quantity,
    0
  );

  const subtotal =
    order.subtotal_amount !== null && order.subtotal_amount !== undefined
      ? Number(order.subtotal_amount)
      : calculatedSubtotal;

  const discountAmount =
    order.discount_amount !== null && order.discount_amount !== undefined
      ? Number(order.discount_amount)
      : getLegacyDiscountAmount(subtotal, order.discount_code);

  const subtotalAfterDiscount = Math.max(subtotal - discountAmount, 0);

  const shippingAmount =
    order.shipping_amount !== null && order.shipping_amount !== undefined
      ? Number(order.shipping_amount)
      : subtotalAfterDiscount >= 900
        ? 0
        : getShippingCost(order.customer_city);

  const totalAmount =
    order.total_amount !== null && order.total_amount !== undefined
      ? Number(order.total_amount)
      : subtotalAfterDiscount + shippingAmount;

  return {
    processedItems,
    subtotal,
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
    "Subtotal",
    "Coupon Code",
    "Discount",
    "Shipping",
    "Total",
    "Notes",
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
      : [{ product_id: "", name: "", quantity: "", final_price: "" }];

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
        totals.subtotal,
        order.discount_code || "",
        totals.discountAmount,
        totals.shippingAmount,
        totals.totalAmount,
        order.notes || "",
      ]);
    });
  });

  const headerXml = `<Row>${headers.map((header) => excelCell(header)).join("")}</Row>`;
  const rowsXml = rows
    .map(
      (row) =>
        `<Row>${row
          .map((value, index) =>
            [0, 7, 9, 10, 11, 13, 14, 15].includes(index) && value !== ""
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
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetch(`${apiUrl}/admin/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || "Failed to load orders");
        }
        return response.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoadError("");
      })
      .catch((error) => {
        console.error(error);
        setLoadError(error.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [token]);

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
              </div>

              <div
                className="order-items"
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                {totals.processedItems.map((item, index) => (
                  <CartItem
                    key={`${order.order_id}-${item.product_id}-${index}`}
                    item={item}
                  />
                ))}
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
                  <span>Total:</span>
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
