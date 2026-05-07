import { Link } from "react-router-dom";
import { Gavel, Github, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const colHead: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#94a3b8', marginBottom: '16px',
  };

  const footerLink: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px', fontWeight: 400,
    color: '#64748b', textDecoration: 'none',
    display: 'block', transition: 'color 0.15s ease',
  };

  return (
    <footer style={{ background: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Blue accent top bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed)' }} />

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', width: 'fit-content' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Gavel style={{ width: '14px', height: '14px', color: '#fff' }} />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '19px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.04em' }}>
                Auctify
              </span>
            </Link>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65, maxWidth: '210px', fontFamily: 'Inter, sans-serif' }}>
              A transparent platform where anyone can buy and sell unique items at fair market prices.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Github, label: 'GitHub' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '7px',
                    background: '#1e293b', color: '#475569',
                    border: '1px solid #1e293b', textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2563eb20'; e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = '#2563eb50'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1e293b'; }}
                >
                  <Icon style={{ width: '13px', height: '13px' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={colHead}>Navigation</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{ label: "Home", to: "/" }, { label: "Auctions", to: "/auction" }, { label: "About Us", to: "/about" }, { label: "Contact", to: "/contact" }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={footerLink}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p style={colHead}>Categories</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: "Jewelry",     value: "jewelry" },
                { label: "Cars",        value: "cars" },
                { label: "Phones",      value: "phones" },
                { label: "Electronics", value: "electronics" },
                { label: "Watches",     value: "watches" },
                { label: "Real Estate", value: "real estate" },
              ].map(c => (
                <li key={c.value}>
                  <Link
                    to={`/auction?category=${encodeURIComponent(c.value)}`}
                    style={footerLink}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p style={colHead}>Account</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{ label: "Log in", to: "/login" }, { label: "Sign up", to: "/signup" }, { label: "Payment Methods", to: "/payment-methods" }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={footerLink}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
            © {currentYear} Auctify. All rights reserved.
          </p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa', fontFamily: 'Inter, sans-serif' }}>
            Final Year Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
