import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);
  
    const renderCallButton = () => (
    <a href="tel:4054560399" className={styles.navButton}>
          Call Now!
	      </a>
  );

  const handleScroll = () => {
    const navbarHeight = document.getElementById('navbar').clientHeight;
    const scrollPosition = window.pageYOffset;
    if (scrollPosition > navbarHeight) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  const handleResize = () => {
    const isMobile = window.innerWidth <= 768;
    setIsMobile(isMobile);
  };

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    if (window.location.pathname === '/') {
      const section = document.getElementById(sectionId);
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      const url = `/#${sectionId}`;
      window.location.href = url;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    //window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check for mobile

    // Close mobile menu when clicked outside
    document.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNavbarLinks = () => {
    if (isMobile) {
      return (
        <>
          <div className={styles.navButtonContainer}>
	              {renderCallButton()} {/* Button added here for mobile */}
            {/*<ul>
              <li>
                <Link
                  href="#home"
                  className={styles.navbarMobileLabel}
                  onClick={(e) => scrollToSection(e, 'home')}
                  data-hover-text="Home"
                >
                  Capital Overhead
                </Link>
              </li>
            </ul>*/}
      </div>
          <div
            ref={mobileMenuToggleRef}
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
          >
            <div
              className={`${styles.hamburgerMenu} ${
                isMobileMenuOpen ? styles.open : ''
              }`}
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className={styles.mobileMenu}>
              <ul className={styles.mobileNavList}>
                <li className={styles.mobileNavItem}>
                  <Link
                    href="#home"
                    className={styles.mobileNavLink}
                    onClick={(e) => {
                      scrollToSection(e, 'home');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link
                    href="#about"
                    className={styles.mobileNavLink}
                    onClick={(e) => {
                      scrollToSection(e, 'about');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    About
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link
                    href="#services"
                    className={styles.mobileNavLink}
                    onClick={(e) => {
                      scrollToSection(e, 'services');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Services
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
              <Link
                href="#home"
                className={styles.navLink}
                onClick={(e) => scrollToSection(e, 'home')}
                data-hover-text="Home"
              >
                Home
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="#about"
                className={styles.navLink}
                onClick={(e) => scrollToSection(e, 'about')}
                data-hover-text="About"
              >
                About
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="#services"
                className={styles.navLink}
                onClick={(e) => scrollToSection(e, 'services')}
                data-hover-text="Services"
              >
                Services
              </Link>
            </li>
          </ul>
          {renderCallButton()} {/* Button added here for desktop */}
        </div>
      );
    }
  };

  return (
    <nav
      id="navbar"
      className={`${styles.navbar} ${isSticky ? styles.sticky : ''}`}
    >
      <div className={styles.logoContainer}>
        <Image
          className={styles.logo}
          src="/images/Dino_Doors_Logo_No_bg.png"
          alt="Logo"
          onClick={scrollToTop}
          width={140}
          height={140}
        />
  </div>
      {renderNavbarLinks()}
    </nav>
  );
};

export default Navbar;
