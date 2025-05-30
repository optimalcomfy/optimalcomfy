import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'
import './Header.css'; // Import custom CSS

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
        <div className="header-top">
            <div className="header-container">
            <div className="header-top-content">
                <div className="contact-info">
                <a className="contact-link" href="callto:#">
                    <i className="flaticon-phone-flip phone-icon" />{" "}
                    +12505550199
                </a>
                <a className="contact-link" href="mailto:#">
                    <i className="flaticon-envelope email-icon" />{" "}
                    Optimalcomfy@gmail.com
                </a>
                </div>
                <div></div>
            </div>
            </div>
        </div>
        
        {/* header menu */}
        <div className="header-main">
            <div className="header-container">
            <div className="header-grid">
                <div className="navigation-menu">
                <div className="navigation d-none d-lg-block">
                    <nav className="navigation__menu" id="main__menu">
                    <ul className="list-unstyled">
                        <li className="navigation__menu--item has-child has-arrow dark:before:!text-white">
                        <Link
                          href={route('home')}
                          className="navigation__menu--item__link dark:text-white"
                          >
                            Properties
                        </Link>
                        </li>
                        <li className="navigation__menu--item has-child has-arrow  dark:before:!text-white">
                          <Link
                              href={route('all-cars')}
                              className="navigation__menu--item__link dark:text-white"
                          >
                              Cars
                          </Link>
                        </li>
                    </ul>
                    </nav>
                </div>
                </div>
                
                <div className="logo-container">
                <Link href={route('home')}>
                    <img
                    className="logo-image"
                    src="/image/logo/logo.png"
                    alt="Optimalcomfy"
                    />
                </Link>
                </div>
                
                <div className="header-right">
                <div className="header-right-content">
                    <p className="airbnb-text">Airbnb your home</p>
                    <div 
                      className="profile-menu-button"
                      onClick={toggleProfileDropdown}
                      ref={dropdownRef}
                    >
                        <i className="fa-solid fa-bars"></i>
                        <p className="profile-avatar">E</p>
                        
                        {/* Profile Dropdown Menu */}
                        {profileDropdownOpen && (
                          <div className="profile-dropdown">
                            <Link 
                              href={route('login')} 
                              className="dropdown-item"
                            >
                              Log in
                            </Link>
                            <Link 
                              href={route('register')} 
                              className="dropdown-item"
                            >
                              Sign up
                            </Link>
                            <hr className="dropdown-divider" />
                            <Link 
                              href={route('all-properties')} 
                              className="dropdown-item"
                            >
                              Book a property
                            </Link>
                            <Link 
                              href={route('all-cars')} 
                              className="dropdown-item"
                            >
                              Rent a car
                            </Link>
                            <Link 
                              href={route('contact')} 
                              className="dropdown-item"
                            >
                              Contact us
                            </Link>
                          </div>
                        )}
                    </div>
                </div>
                <button
                    className="mobile-menu-button"
                    onClick={toggleMobileMenu}
                >
                    <span>
                    <img src="assets/images/icon/menu-icon.svg" alt="" />
                    </span>
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'}`}>
          <div className="mobile-menu-header">
            <a href="index.html" className="mobile-logo-link">
              <img className="mobile-logo" src="/image/logo/logo.png" alt="Optimalcomfy" />
            </a>
            <button 
              onClick={toggleMobileMenu}
              className="mobile-close-button"
            >
              ✕
            </button>
          </div>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <Link href={route('home')} className="mobile-nav-link">Home</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('about')} className="mobile-nav-link">About</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('restaurant')} className="mobile-nav-link">Restaurant</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('gallery')} className="mobile-nav-link">Gallery</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('all-services')} className="mobile-nav-link">Services</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('all-properties')} className="mobile-nav-link">Properties</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('all-cars')} className="mobile-nav-link">Cars</Link>
              </li>
              <li className="mobile-nav-item">
                <Link href={route('contact')} className="mobile-nav-link">Contact</Link>
              </li>
            </ul>
            <div className="mobile-buttons">
              <Link href={route('login')} className="mobile-button mobile-button-outline">
                Sign In
              </Link>
              <Link href={route('register')} className="mobile-button mobile-button-outline">
                Sign Up
              </Link>
              <Link href={route('all-properties')} className="mobile-button mobile-button-filled">
                <span>Book Now</span>
              </Link>
            </div>
          </nav>
        </div>
    </>
  )
}

export default Header;