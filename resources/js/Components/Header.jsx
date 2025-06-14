import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'
import './Header.css'; // Import custom CSS
import SearchBar from './SearchForm';
import RideForm from './RideForm';

function Header() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileDropdownOpen2, setProfileDropdownOpen2] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  const {url} = usePage()
  const [isWhich] = useState(url.split('?')[0]);
  

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleProfileDropdown2 = () => {
    setProfileDropdownOpen2(!profileDropdownOpen2);
  };

  // Handle dropdown link clicks
  const handleDropdownClick = (e) => {
    // Allow the link to navigate, then close dropdown after a short delay
    setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 100);
  };

  const handleDropdownClick2 = (e) => {
    // Allow the link to navigate, then close dropdown after a short delay
    setTimeout(() => {
      setProfileDropdownOpen2(false);
    }, 100);
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
                              className={`navigation__menu--item__link dark:text-white flex items-center gap-2 ${(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking') ? 'lowBorder' : ''}`}
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
                            
                            {/* Profile Dropdown Menu */}
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
        
        {/* header menu */}
        <div className={`header-main ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="header-container">
            <div className="header-grid">
                <div className="logo-container">
                  {(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking') &&
                    <SearchBar />
                  }
                  {(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking') &&
                  <RideForm />}
                </div>
                
            </div>
            </div>
        </div>
    </div>
  )
}

export default Header;