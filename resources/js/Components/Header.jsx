import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'
import './Header.css'; // Import custom CSS
import SearchBar from './SearchForm';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className='bgbg'>
        <div className={`header-top ${isScrolled ? 'header-scrolled' : ''}`}>
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
                            className="navigation__menu--item__link dark:text-white flex items-center gap-2"
                            >
                              <img src='/image/houses.png' alt='' className='h-8' />
                              Properties
                          </Link>
                          </li>
                          <li className="navigation__menu--item has-child has-arrow  dark:before:!text-white">
                            <Link
                                href={route('all-cars')}
                                className="navigation__menu--item__link dark:text-white flex items-center gap-2"
                            >
                              <img src='/image/car.png' alt='' className='h-8' />
                                Cars
                            </Link>
                          </li>
                      </ul>
                      </nav>
                  </div>
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
                </div>
            </div>
            </div>
        </div>
        
        {/* header menu */}
        <div className={`header-main ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="header-container">
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

                <div className="logo-container">
                  <SearchBar />
                </div>
                
                <div className={`header-right mopper ${isScrolled ? 'mopper-scrolled' : ''}`}>
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
                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default Header;