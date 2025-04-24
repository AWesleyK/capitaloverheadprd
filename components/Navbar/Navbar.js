import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.scss";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({ services = [] }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);

  const mobileMenuRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);

  const handleResize = () => setIsMobile(window.innerWidth <= 768);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowCatalogDropdown(false);
    setShowServicesDropdown(false);
    setShowAboutDropdown(false);
  };

  const toggleServicesDropdown = () => {
    setShowServicesDropdown((prev) => {
      if (!prev) {
        setShowCatalogDropdown(false);
        setShowAboutDropdown(false);
      }
      return !prev;
    });
  };

  const toggleCatalogDropdown = () => {
    setShowCatalogDropdown((prev) => {
      if (!prev) {
        setShowServicesDropdown(false);
        setShowAboutDropdown(false);
      }
      return !prev;
    });
  };

  const toggleAboutDropdown = () => {
    setShowAboutDropdown((prev) => {
      if (!prev) {
        setShowServicesDropdown(false);
        setShowCatalogDropdown(false);
      }
      return !prev;
    });
  };

  const handleOutsideClick = (event) => {
    const target = event.target;
    if (
      mobileMenuToggleRef.current &&
      !mobileMenuToggleRef.current.contains(target) &&
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(target)
    ) {
      closeMobileMenu();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    document.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const renderCallButton = () => (
    <a href="tel:4054560399" className={styles.navButton}>
      Call Now!
    </a>
  );

  const renderServicesDropdown = () => (
    <li
      className={`${styles.navItem} ${styles.dropdown}`}
      onMouseEnter={() => !isMobile && setShowServicesDropdown(true)}
      onMouseLeave={() => !isMobile && setShowServicesDropdown(false)}
    >
      <div className={styles.navLink} onClick={isMobile ? toggleServicesDropdown : undefined}>
        Services▾
      </div>
      <div className={`${styles.dropdownContent} ${showServicesDropdown ? styles.showDropdown : ""}`}>
        <Link href="/services" onClick={closeMobileMenu}>
          <span className={styles.dropdownItem}>All Services</span>
        </Link>
        {services.map((service) => (
          <Link key={service._id} href={`/services/${service.slug}`} onClick={closeMobileMenu}>
            <span className={styles.dropdownItem}>{service.name}</span>
          </Link>
        ))}
      </div>
    </li>
  );

  const renderCatalogDropdown = () => (
    <li
      className={`${styles.navItem} ${styles.dropdown}`}
      onMouseEnter={() => !isMobile && setShowCatalogDropdown(true)}
      onMouseLeave={() => !isMobile && setShowCatalogDropdown(false)}
    >
      <div className={styles.navLink} onClick={isMobile ? toggleCatalogDropdown : undefined}>
        Catalog▾
      </div>
      <div className={`${styles.dropdownContent} ${showCatalogDropdown ? styles.showDropdown : ""}`}>
        <Link href="/catalog/garage doors" className={styles.dropdownItem} onClick={closeMobileMenu}>Garage Doors</Link>
        <Link href="/catalog/gates" className={styles.dropdownItem} onClick={closeMobileMenu}>Gates</Link>
      </div>
    </li>
  );

  const renderAboutDropdown = () => (
    <li
  className={`${styles.navItem} ${styles.dropdown}`}
  onMouseEnter={() => !isMobile && setShowAboutDropdown(true)}
  onMouseLeave={() => !isMobile && setShowAboutDropdown(false)}
>
  <div className={styles.navLink} onClick={isMobile ? toggleAboutDropdown : undefined}>
    About▾
  </div>
  <div className={`${styles.dropdownContent} ${showAboutDropdown ? styles.showDropdown : ""}`}>
    <Link href="/about" className={styles.dropdownItem} onClick={closeMobileMenu}>Meet the Owner</Link>
    <Link href="/about/learn-more" className={styles.dropdownItem} onClick={closeMobileMenu}>Core Values</Link>
    <Link href="/about/blogs" className={styles.dropdownItem} onClick={closeMobileMenu}>Blog</Link>
  </div>
</li>
  );

  const renderNavbarLinks = () => {
    if (isMobile) {
      return (
        <>
          <div className={styles.navButtonContainer}>{renderCallButton()}</div>
          <div
            ref={mobileMenuToggleRef}
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
          >
            <div className={`${styles.hamburgerMenu} ${isMobileMenuOpen ? styles.open : ""}`}>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className={styles.mobileMenu}>
              <ul className={styles.mobileNavList}>
                <li className={styles.mobileNavItem}>
                  <Link href="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                    Home
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <div className={styles.mobileNavLink} onClick={toggleAboutDropdown}>
                    About ▾
                  </div>
                  <div className={`${styles.mobileDropdown} ${showAboutDropdown ? styles.show : ""}`}>
                    <Link href="/about" className={styles.mobileDropdownItem} onClick={closeMobileMenu}>Meet the Owner</Link>
                    <Link href="/about/learn-more" className={styles.mobileDropdownItem} onClick={closeMobileMenu}>Core Values</Link>
                    <Link href="/about/blogs" className={styles.mobileDropdownItem} onClick={closeMobileMenu}>Blogs</Link>
                  </div>
                </li>
                <li className={styles.mobileNavItem}>
                  <div className={styles.mobileNavLink} onClick={toggleServicesDropdown}>
                    Services ▾
                  </div>
                  <div className={`${styles.mobileDropdown} ${showServicesDropdown ? styles.show : ""}`}>
                    {services.map((service) => (
                      <Link key={service._id} href={`/services/${service.slug}`} className={styles.mobileDropdownItem} onClick={closeMobileMenu}>
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </li>
                <li className={styles.mobileNavItem}>
                  <div className={styles.mobileNavLink} onClick={toggleCatalogDropdown}>
                    Catalog ▾
                  </div>
                  <div className={`${styles.mobileDropdown} ${showCatalogDropdown ? styles.show : ""}`}>
                    <Link href="/catalog/garage doors" className={styles.mobileDropdownItem} onClick={closeMobileMenu}>Garage Doors</Link>
                    <Link href="/catalog/gates" className={styles.mobileDropdownItem} onClick={closeMobileMenu}>Gates</Link>
                  </div>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link href="/services/service-area" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                    Service Area
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className={styles.linksContainer}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>Home</Link>
            </li>
            {renderAboutDropdown()}
            {renderServicesDropdown()}
            {renderCatalogDropdown()}
            <li className={styles.navItem}>
              <Link href="/services/service-area" className={styles.navLink}>Service Area</Link>
            </li>
          </ul>
          {renderCallButton()}
        </div>
      );
    }
  };

  return (
    <nav id="navbar" className={`${styles.navbar} ${isSticky ? styles.sticky : ""}`}>
      <div className={styles.logoContainer}>
        <Link href="/" passHref>
          <Image
            className={styles.logo}
            src="/images/Dino_Doors_Logo_No_bg.png"
            alt="Logo"
            width={140}
            height={140}
          />
        </Link>
      </div>
      {renderNavbarLinks()}
    </nav>
  );
};

export default Navbar;
