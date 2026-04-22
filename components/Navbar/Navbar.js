import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.scss";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({ services = [], catalogTypes = [] }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1100);
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const handleOutsideClick = (event) => {
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        mobileMenuToggleRef.current && !mobileMenuToggleRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { 
      name: "About", 
      href: "/about",
      dropdown: [
        { name: "Meet the Owner", href: "/about" },
        { name: "Core Values", href: "/about/core-values" },
        { name: "Blog", href: "/about/blogs" },
        { name: "FAQ", href: "/about/faq" },
      ]
    },
    { 
      name: "Services", 
      href: "/services",
      dropdown: [
        { name: "All Services", href: "/services" },
        ...services.map(s => ({ name: s.name, href: `/services/${s.slug}` }))
      ]
    },
    { 
      name: "Catalog", 
      href: "/catalog",
      dropdown: catalogTypes.map(t => ({ 
        name: t.typeName, 
        href: `/catalog/${t.type.toLowerCase().replace(/\s+/g, "%20")}` 
      }))
    },
    { 
      name: "Service Area", 
      href: "/services/service-area",
      dropdown: [
        { name: "Service Area Info", href: "/services/service-area" }
      ]
    },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link href="/" onClick={closeMenu}>
            <Image
              src="/images/Dino_Doors_Logo_No_bg.png"
              alt="Dino Doors"
              width={180}
              height={180}
              className={styles.logo}
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className={styles.centerSection}>
            <ul className={styles.navLinks}>
              {navLinks.map((link) => (
                <li 
                  key={link.name} 
                  className={styles.navItem}
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
                >
                  <div className={styles.navLinkWrapper}>
                    {link.dropdown ? (
                      <div className={styles.linkWithCarat}>
                        <span className={styles.navLink}>{link.name}</span>
                        <span className={styles.carat}>▾</span>
                      </div>
                    ) : (
                      <Link href={link.href} className={styles.navLink}>
                        {link.name}
                      </Link>
                    )}
                  </div>
                  {link.dropdown && activeDropdown === link.name && (
                    <div className={styles.dropdown}>
                      {link.dropdown.map(item => (
                        <Link key={item.name} href={item.href} className={styles.dropdownItem} onClick={closeMenu}>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call Button Section */}
        {!isMobile && (
          <div className={styles.buttonSection}>
            <a href="tel:4054560399" className={styles.callButton}>
              <span className={styles.phoneIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              405-456-0399
            </a>
          </div>
        )}

        {/* Mobile Controls */}
        {isMobile && (
          <div className={styles.mobileActions}>
            <a href="tel:4054560399" className={styles.mobileCallIcon}>
              <span className={styles.phoneIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
            </a>
            <button 
              ref={mobileMenuToggleRef}
              className={styles.mobileToggle} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <div ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileNavLinks}>
          {navLinks.map((link) => (
            <li key={link.name} className={styles.mobileNavItem}>
              {link.dropdown ? (
                <>
                  <div className={styles.mobileNavLink} onClick={() => toggleDropdown(link.name)}>
                    {link.name} <span className={styles.carat}>▾</span>
                  </div>
                  <div className={`${styles.mobileDropdown} ${activeDropdown === link.name ? styles.showMobileDropdown : ""}`}>
                    {link.dropdown.map(item => (
                      <Link key={item.name} href={item.href} className={styles.mobileDropdownItem} onClick={closeMenu}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={link.href} className={styles.mobileNavLink} onClick={closeMenu}>
                  {link.name}
                </Link>
              )}
            </li>
          ))}
          <li className={styles.mobileNavItem}>
             <a href="tel:4054560399" className={styles.mobileMenuCallButton}>
              405-456-0399
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
