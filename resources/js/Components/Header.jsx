import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/style.css';
import '../../css/plugins.min.css';
import './Header.css';
import SearchBar from './SearchForm';
import RideForm from './RideForm';

function Header() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileDropdownOpen2, setProfileDropdownOpen2] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  const mobileMenuRef = useRef(null);
  const { url } = usePage();
  const [isWhich] = useState(url.split('?')[0]);

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.pageYOffset;
      
      if (currentScrollPosition < lastScrollPosition) {
        // Scrolling up
        if (!isModalOpen && isMobile) {
          setIsModalOpen(true);
        }
      } else if (currentScrollPosition > lastScrollPosition) {
        // Scrolling down
        if (isModalOpen && isMobile) {
          setIsModalOpen(false);
        }
      }
      
      setLastScrollPosition(currentScrollPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition, isModalOpen, isMobile]);
  

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleProfileDropdown2 = () => {
    setProfileDropdownOpen2(!profileDropdownOpen2);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleDropdownClick = (e) => {
    setTimeout(() => {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
    }, 100);
  };

  const handleDropdownClick2 = (e) => {
    setTimeout(() => {
      setProfileDropdownOpen2(false);
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
        setProfileDropdownOpen2(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const isMenuButton = event.target.closest('.mobile-menu-toggle');
        if (!isMenuButton) {
          setMobileMenuOpen(false);
          document.body.style.overflow = '';
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='bgbg'>
      {/* Mobile Header (hidden on desktop) */}
      <div className="mobile-header d-lg-none">
        <div className={`mobile-header-container ${isScrolled ? 'scrolled' : ''}`}>
          <div className="mobile-header-content">
            <Link href={route('home')} className="mobile-logo-link">
              <img
                className="mobile-logo-image"
                src="/image/logo/logo.png"
                alt="Ristay"
              />
            </Link>

            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
          ref={mobileMenuRef}
        >
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <button 
                className="mobile-menu-close" 
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="mobile-nav">
              <ul className="mobile-nav-list">
                <li className="mobile-nav-item">
                  <Link
                    href={route('home')}
                    className={`mobile-nav-link ${(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking') ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    <img src='/image/houses.png' alt='' className='mobile-nav-icon' />
                    Stays
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link
                    href={route('all-cars')}
                    className={`mobile-nav-link ${(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking') ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    <img src='/image/car.png' alt='' className='mobile-nav-icon' />
                    Rides
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link 
                    href={route('login')} 
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    <i className="fa-solid fa-list mobile-nav-icon"></i>
                    List your property
                  </Link>
                </li>
              </ul>
              
              <div className="mobile-search-container">
                {(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking') &&
                  <SearchBar mobile={true} />
                }
                {(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking') &&
                  <RideForm mobile={true} />
                }
              </div>
              
              <div className="mobile-auth-buttons">
                <Link 
                  href={route('login')} 
                  className="mobile-auth-button login"
                  onClick={toggleMobileMenu}
                >
                  Log in
                </Link>
                <Link 
                  href={route('register')} 
                  className="mobile-auth-button signup"
                  onClick={toggleMobileMenu}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Desktop Header (completely unchanged) */}
      <div className={`header-top ${isScrolled ? 'header-scrolled' : ''} d-none d-lg-block`}>
        <div className="header-container">
          <div className="header-top-content">
              <div className="logo-container">
                <Link href={route('home')}>
                    <img
                    className={`logo-image ${isScrolled ? 'logo-scrolled' : ''}`}
                    src="/image/logo/logo.png"
                    alt="Ristay"
                    />
                </Link>
              </div>
              <div className="navigation-menu">
                <div className="navigation d-none d-lg-block">
                    <nav className="navigation__menu" id="main__menu">
                    <ul className="list-unstyled">
                        <li className="navigation__menu--item has-child has-arrow dark:before:!text-white">
                        <Link
                          href={route('home')}
                          className={`navigation__menu--item__link dark:text-white flex items-center gap-2 ${(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking' || isWhich === '/privacy-policy' || isWhich === '/host-calendar-policy' || isWhich === '/terms-and-conditions') ? 'lowBorder' : ''}`}
                          >
                            <img src='/image/houses.png' alt='' className='h-8' />
                            Stays
                        </Link>
                        </li>
                        <li className="navigation__menu--item has-child has-arrow  dark:before:!text-white">
                          <Link
                              href={route('all-cars')}
                              className={`navigation__menu--item__link dark:text-white flex items-center gap-2 ${(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking' || isWhich === '/car-booking') ? 'lowBorder' : ''}`}
                          >
                            <img src='/image/car.png' alt='' className='h-8' />
                              Rides
                          </Link>
                        </li>
                    </ul>
                    </nav>
                </div>
              </div>
              <div className="header-right">
                <div className="header-right-content">
                    <p className="airbnb-text">List your property</p>
                    <div 
                      className="profile-menu-button"
                      onClick={toggleProfileDropdown2}
                      ref={dropdownRef2}
                    >
                        <i className="fa-solid fa-bars"></i>
                        <p className="profile-avatar">E</p>
                        
                        {profileDropdownOpen2 && (
                          <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                            <Link 
                              href={route('login')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick2}
                            >
                              Log in
                            </Link>
                            <Link 
                              href={route('register')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick2}
                            >
                              Sign up
                            </Link>
                            <hr className="dropdown-divider" />
                            <Link 
                              href={route('all-properties')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick2}
                            >
                              Book a stay
                            </Link>
                            <Link 
                              href={route('all-cars')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick2}
                            >
                              Rent a ride
                            </Link>
                          </div>
                        )}
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>
      
      <div className='text-center d-none d-lg-block pt-2'>
          <h4 className='rideH2'>Let's ride and let's stay - <br /> the Ristay way </h4>
      </div>
      
      <div className={`header-main ${isScrolled ? 'header-scrolled' : ''} d-none d-lg-block`}>
          <div className="header-container relative">
          <div className="header-grid">
              <div className={`logo-container`}>
                <Link href={route('home')} className={`mopper ${isScrolled ? 'mopper-scrolled' : ''}`}>
                    <img
                    className={`logo-image ${isScrolled ? 'logo-scrolled' : ''}`}
                    src="/image/logo/logo.png"
                    alt="Ristay"
                    />
                </Link>
              </div>

              <div className={`logo-container px-2`}>
                {(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking' || isWhich === '/privacy-policy' || isWhich === '/host-calendar-policy' || isWhich === '/terms-and-conditions') &&
                  <>
                  {isModalOpen &&
                    <SearchBar />
                  }
                  </>
                }
                {(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking') &&
                <>
                 {isModalOpen &&
                 <RideForm />
                 }
                </>
                }
              </div>
              
              <div className={`header-right mopper ${isScrolled ? 'mopper-scrolled' : ''}`}>
                <div className="header-right-content">
                    <p className="airbnb-text">List your property</p>
                    <div 
                      className="profile-menu-button absolute lg:relative top-8 lg:top-0"
                      onClick={toggleProfileDropdown}
                      ref={dropdownRef}
                    >
                        <i className="fa-solid fa-bars"></i>
                        <p className="profile-avatar">E</p>
                        
                        {profileDropdownOpen && (
                          <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                            <Link 
                              href={route('login')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick}
                            >
                              Log in
                            </Link>
                            <Link 
                              href={route('register')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick}
                            >
                              Sign up
                            </Link>
                            <hr className="dropdown-divider" />
                            <Link 
                              href={route('all-properties')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick}
                            >
                              Book a stay
                            </Link>
                            <Link 
                              href={route('all-cars')} 
                              className="dropdown-item"
                              onClick={handleDropdownClick}
                            >
                              Rent a ride
                            </Link>
                          </div>
                        )}
                    </div>
                </div>
              </div>
          </div>
          </div>
          <div className={`text-center px-2 text-xl text-black mb-2 ${isScrolled ? 'hidden' : 'flex items-center justify-center'}`}>
              <p>From Nairobi to Mombasa. Across Kenya - Just Ristay!</p>
          </div>
      </div>
    </div>
  );
}

export default Header;