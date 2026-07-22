import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import "./Footer.css";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1Fvx5te2b7/",
  instagram: "https://www.instagram.com/lumiie.eg?igsh=MXB5bjRlejg5bnAzYw==",
};

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo-link" aria-label="Lumie home">
            <img
              src="/lumie-logo.png"
              alt="Lumie Jewelry Boutique"
              className="footer-logo"
              loading="lazy"
            />
          </Link>

          <p className="footer-description">
            Delicate jewelry inspired by softness, femininity, and thoughtful
            details. Every order is carefully wrapped with love.
          </p>

          <div className="footer-socials" aria-label="Social media links">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Visit Lumie on Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Visit Lumie on Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
