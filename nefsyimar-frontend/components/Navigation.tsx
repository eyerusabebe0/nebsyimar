'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, LogIn, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = user?.role === 'Administrator'
  const isVendor = user?.role === 'Vendor'
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRepatriationClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(false)
    if (user) {
      router.push('/repatriation')
    } else {
      router.push('/signin')
    }
  }

  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', href: '/admin' },
        { name: 'Memorial Admin', href: '/admin/memorials' },
        { name: 'Marketplace Admin', href: '/admin/marketplace' },
      ]
    : isVendor
    ? []
    : [
      { name: 'Memorials', href: '/memorials' },
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Events', href: '/events' },
      { name: 'Resources', href: '/resources' },
      { name: 'Body Shipping', href: '/repatriation', isAction: true },
      { name: 'Contact', href: '/contact' },
    ]

  const dashboardHref = isAdmin ? '/admin' : isVendor ? '/vendor' : '/dashboard'
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : isVendor ? 'Vendor Dashboard' : 'Dashboard'

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'))

  return (
    <>
      <style jsx global>{`
        .nav-root {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.3s ease;
        }
        .nav-root.scrolled {
          background: rgba(10, 10, 18, 0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(212, 175, 55, 0.08);
        }
        .nav-root.top {
          background: rgba(8, 8, 16, 0.75);
          backdrop-filter: blur(12px) saturate(140%);
          -webkit-backdrop-filter: blur(12px) saturate(140%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          position: relative;
        }
        @media (max-width: 1023px) {
          .nav-inner {
            justify-content: center;
            height: 64px;
            padding: 0 16px;
          }
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .nav-logo {
            gap: 8px;
          }
        }
        .nav-logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        @media (max-width: 1023px) {
          .nav-logo-img {
            width: 42px;
            height: 42px;
          }
        }
        .nav-brand-name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #D4AF37 0%, #F5D769 45%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: inherit;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .nav-brand-name {
            display: none;
          }
        }
        .nav-links {
          display: none;
          align-items: center;
          gap: 2px;
        }
        @media (min-width: 1024px) {
          .nav-links { display: flex; }
        }
        .nav-link, .nav-link-btn {
          position: relative;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(210, 210, 222, 0.62);
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .nav-link::after, .nav-link-btn::after {
          content: "";
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 24px);
          height: 1.5px;
          background: linear-gradient(90deg, #D4AF37, #F5D769);
          border-radius: 2px;
          transition: transform 0.25s ease;
        }
        .nav-link:hover, .nav-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-link:hover::after, .nav-link-btn:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-link.active, .nav-link-btn.active {
          color: #ffffff;
          font-weight: 600;
        }
        .nav-link.active::after, .nav-link-btn.active::after {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-actions {
          display: none;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .nav-actions { display: flex; }
        }
        .nav-login {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(220, 220, 230, 0.8);
          text-decoration: none;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          transition: all 0.2s;
        }
        .nav-login:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .nav-cta {
          display: inline-flex;
          align-items: center;
          padding: 8px 20px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #D4AF37 0%, #F5D769 50%, #D4AF37 100%);
          background-size: 200% 100%;
          background-position: right center;
          color: #0a0a12;
          border: none;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.5), 0 4px 16px rgba(212, 175, 55, 0.25);
          transition: background-position 0.4s ease, box-shadow 0.2s, transform 0.15s;
        }
        .nav-cta:hover {
          background-position: left center;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.7), 0 6px 24px rgba(212, 175, 55, 0.4);
          transform: translateY(-1px);
        }
        .nav-cta:active {
          transform: translateY(0);
        }
        .user-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .user-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(212, 175, 55, 0.35);
        }
        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: radial-gradient(ellipse at 30% 20%, #c9a84c 0%, #a8872a 40%, #7a6320 80%, #5c4a18 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #1a1408;
          text-shadow: 0 1px 0 rgba(212, 175, 55, 0.5), 0 -1px 0 rgba(0, 0, 0, 0.3);
          font-family: 'Georgia', 'Times New Roman', serif;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow:
            0 0 0 1.5px rgba(212, 175, 55, 0.6),
            inset 0 2px 4px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 235, 150, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          position: relative;
        }
        .user-avatar::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 1px solid rgba(255, 235, 150, 0.15);
          pointer-events: none;
        }
        .user-chevron {
          color: rgba(200, 200, 210, 0.6);
          transition: transform 0.2s;
        }
        .user-chevron.open {
          transform: rotate(180deg);
        }
        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 200px;
          background: rgba(14, 14, 24, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(212, 175, 55, 0.18);
          border-radius: 12px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 6px;
          overflow: hidden;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dropdown-header {
          padding: 10px 12px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.01em;
        }
        .dropdown-role {
          font-size: 11px;
          color: rgba(212, 175, 55, 0.7);
          margin-top: 1px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(210, 210, 220, 0.85);
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }
        .dropdown-item:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.07);
        }
        .dropdown-item.danger {
          color: rgba(248, 113, 113, 0.85);
        }
        .dropdown-item.danger:hover {
          color: #f87171;
          background: rgba(248, 113, 113, 0.08);
        }
        .dropdown-item svg {
          opacity: 0.7;
          flex-shrink: 0;
        }
        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 4px 0;
        }
        .mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(220, 220, 230, 0.85);
          cursor: pointer;
          transition: all 0.2s;
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        }
        .mobile-toggle:hover {
          background: rgba(255,255,255,0.07);
          color: #ffffff;
        }
        @media (min-width: 1024px) {
          .mobile-toggle { display: none; }
        }
        .mobile-panel {
          display: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 12px 8px 16px;
          animation: slideDown 0.2s ease;
        }
        .mobile-panel.open {
          display: block;
        }
        @media (min-width: 1024px) {
          .mobile-panel { display: none !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-link, .mobile-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(200, 200, 215, 0.7);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s;
          background: none;
          border: none;
          cursor: pointer;
        }
        .mobile-link:hover, .mobile-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.07);
        }
        .mobile-link.active, .mobile-btn.active {
          color: #ffffff;
          font-weight: 600;
          background: rgba(212, 175, 55, 0.08);
          border-left: 2px solid #D4AF37;
        }
        .mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 10px 0;
        }
        .mobile-user-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
        }
        .mobile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(ellipse at 30% 20%, #c9a84c 0%, #a8872a 40%, #7a6320 80%, #5c4a18 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: #1a1408;
          text-shadow: 0 1px 0 rgba(212, 175, 55, 0.5), 0 -1px 0 rgba(0, 0, 0, 0.3);
          font-family: 'Georgia', 'Times New Roman', serif;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow:
            0 0 0 1.5px rgba(212, 175, 55, 0.6),
            inset 0 2px 4px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 235, 150, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          position: relative;
        }
        .mobile-avatar::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 1px solid rgba(255, 235, 150, 0.15);
          pointer-events: none;
        }
        .mobile-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }
        .mobile-user-role {
          font-size: 11px;
          color: rgba(212,175,55,0.7);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .mobile-btn-danger {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(248, 113, 113, 0.85);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mobile-btn-danger:hover {
          color: #f87171;
          background: rgba(248,113,113,0.08);
        }
        .mobile-cta {
          display: block;
          margin-top: 8px;
          padding: 11px 20px;
          text-align: center;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #D4AF37, #F5D769);
          color: #0a0a12;
          box-shadow: 0 4px 16px rgba(212,175,55,0.25);
        }
        .mobile-login {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(200, 200, 215, 0.85);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .mobile-login:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.07);
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="nav-inner">
          <Link href={isAdmin ? '/admin' : isVendor ? '/vendor' : '/'} className="nav-logo">
            <Image src="/Logo.png" alt="Nefsyimar" width={48} height={48} className="nav-logo-img" />
            <span className="nav-brand-name">Nefsyimar</span>
          </Link>

          <div className="nav-links">
            {navItems.map((item) => (
              item.isAction ? (
                <button
                  key={item.name}
                  onClick={handleRepatriationClick}
                  className={`nav-link-btn${isActive(item.href) ? ' active' : ''}`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  className="user-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="user-avatar">{userInitial}</div>
                  <ChevronDown size={14} className={`user-chevron${userMenuOpen ? ' open' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    {user?.name && (
                      <div className="dropdown-header">
                        <div className="dropdown-name">{user.name}</div>
                        {user?.role && <div className="dropdown-role">{user.role}</div>}
                      </div>
                    )}
                    <Link href={dashboardHref} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={15} />
                      {dashboardLabel}
                    </Link>
                    <Link href="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={15} />
                      Profile Settings
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={() => { logout(); setUserMenuOpen(false) }}>
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="nav-login">
                <LogIn size={14} />
                Sign In
              </Link>
            )}
            <Link href="/memorials/create" className="nav-cta">
              + Create Memorial
            </Link>
          </div>

          <button className="mobile-toggle" onClick={() => setIsOpen((v) => !v)} aria-label="Toggle menu">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className={`mobile-panel${isOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            item.isAction ? (
              <button
                key={item.name}
                onClick={handleRepatriationClick}
                className={`mobile-btn${isActive(item.href) ? ' active' : ''}`}
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`mobile-link${isActive(item.href) ? ' active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            )
          ))}

          <div className="mobile-divider" />

          {user ? (
            <>
              <div className="mobile-user-header">
                <div className="mobile-avatar">{userInitial}</div>
                <div>
                  {user?.name && <div className="mobile-user-name">{user.name}</div>}
                  {user?.role && <div className="mobile-user-role">{user.role}</div>}
                </div>
              </div>
              <Link href={dashboardHref} className="mobile-link" onClick={() => setIsOpen(false)}>
                {dashboardLabel}
              </Link>
              <Link href="/profile" className="mobile-link" onClick={() => setIsOpen(false)}>
                Profile Settings
              </Link>
              <button className="mobile-btn-danger" onClick={() => { logout(); setIsOpen(false) }}>
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="mobile-login" onClick={() => setIsOpen(false)}>
                <LogIn size={14} />
                Sign In
              </Link>
              <Link href="/memorials/create" className="mobile-cta" onClick={() => setIsOpen(false)}>
                + Create Memorial
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}