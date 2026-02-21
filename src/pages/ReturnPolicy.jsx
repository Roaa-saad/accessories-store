import React from "react";
import Navbar from "../components/Navbar";

const ReturnPolicy = () => {
  return (
    <>
      <div className="policy-page">
        <h1 className="policy-title">Shipping & Return Policy – Lumie ✨</h1>

        <section className="policy-section">
          <h2 className="policy-heading">Shipping Policy</h2>
          <p className="policy-text">
            We ship all orders every <strong>Saturday</strong>.
          </p>
          <p className="policy-text">
            Your order will arrive within <strong>up to one week</strong> from the shipping date.
          </p>
          <p className="policy-text">
            Our courier will contact you before delivery to make sure everything goes smoothly 💛
          </p>
        </section>

        <section className="policy-section">
          <h2 className="policy-heading">Return & Exchange Policy</h2>
          <p className="policy-text">
            At Lumie, every piece is prepared with love and care.
          </p>
          <p className="policy-text">
            For this reason, we do not offer returns or exchanges unless the mistake is from our side — such as receiving a wrong item or a damaged product.
          </p>
          <p className="policy-text">
            If that happens (which we truly try to avoid 🤍), please contact us within <strong>48 hours</strong> with your order number and a clear photo, and we'll fix it right away.
          </p>
          <p className="policy-text policy-thank-you">
            Thank you for understanding and trusting Lumie ✨
          </p>
        </section>
      </div>
    </>
  );
};

export default ReturnPolicy;
