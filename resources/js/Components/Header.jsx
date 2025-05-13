import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'

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
        <div className="border-b-[.5px] border-[#E5E5E5] hidden md:block">
            <div className="container mx-auto py-[10px]">
            <div className="flex items-center justify-between">
                <div className="flex gap-[25px]">
                <a className="flex gap-[10px] items-center text-xs" href="callto:#">
                    <i className="flaticon-phone-flip relative top-[3px]" />{" "}
                    +12505550199
                </a>
                <a className="flex gap-[10px] items-center text-xs" href="mailto:#">
                    <i className="flaticon-envelope relative top-[3px]" />{" "}
                    Optimalcomfy@gmail.com
                </a>
                </div>
                <div>
                </div>
            </div>
            </div>
        </div>
        {/* header top end */}
        {/* header menu */}
        <div className="header transition header__function border-b-[.5px] border-[#E5E5E5]">
            <div className="container transition ">
            <div className="grid lg:grid-cols-3 grid-cols-2 justify-center items-center py-[20px] lg:py-[0]">
                <div className="menu hidden lg:block">
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
                <div className="logo grid justify-start lg:justify-center">
                <Link href={route('home')}>
                    <img
                    className="logo__class max-w-[160px] lg:max-w-[260px] pt-3"
                    src="/image/logo/logo.png"
                    alt="Optimalcomfy"
                    />
                </Link>
                </div>
                <div className="main__right flex justify-end gap-[15px]">
                <div className="flex justify-end items-center pr-15 gap-8">
                    <p className="text-sm font-medium">Airbnb your home</p>
                    <div 
                      className="flex justify-evenly items-center py-1.25 pr-1.25 pl-3 gap-2 rounded-full shadow-md h-10 w-20 border cursor-pointer relative"
                      onClick={toggleProfileDropdown}
                      ref={dropdownRef}
                    >
                        <i className="fa-solid fa-bars"></i>
                        <p className="bg-black text-white rounded-full w-7 h-7 text-center pt-1.5 text-[10px] font-semibold">E</p>
                        
                        {/* Profile Dropdown Menu */}
                        {profileDropdownOpen && (
                          <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md w-48 py-2 z-50">
                            <Link 
                              href={route('login')} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Log in
                            </Link>
                            <Link 
                              href={route('register')} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Sign up
                            </Link>
                            <hr className="my-1" />
                            <Link 
                              href={route('all-properties')} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Book a property
                            </Link>
                            <Link 
                              href={route('all-cars')} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Rent a car
                            </Link>
                            <Link 
                              href={route('contact')} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Contact us
                            </Link>
                          </div>
                        )}
                    </div>
                </div>
                <button
                    className="theme-btn btn-style sm-btn fill menu__btn rounded-[6px] lg:hidden block"
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
        <div className={`mobile-menu lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white shadow-lg fixed top-0 left-0 w-full h-screen z-50 overflow-y-auto`}>
          <div className="p-4 flex justify-between items-center border-b">
            <a href="index.html" className="block">
              <img className="w-32" src="/image/logo/logo.png" alt="Optimalcomfy" />
            </a>
            <button 
              onClick={toggleMobileMenu}
              className="text-2xl p-2"
            >
              ✕
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-4">
              <li className="py-2 border-b">
                <Link href={route('home')} className="block text-lg font-medium">Home</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('about')} className="block text-lg font-medium">About</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('restaurant')} className="block text-lg font-medium">Restaurant</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('gallery')} className="block text-lg font-medium">Gallery</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('all-services')} className="block text-lg font-medium">Services</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('all-properties')} className="block text-lg font-medium">Properties</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('all-cars')} className="block text-lg font-medium">Cars</Link>
              </li>
              <li className="py-2 border-b">
                <Link href={route('contact')} className="block text-lg font-medium">Contact</Link>
              </li>
            </ul>
            <div className="flex flex-col gap-3 mt-6">
              <Link href={route('login')}
                className="theme-btn btn-style w-full py-3 rounded-[6px] border hover:text-white"
              >
                Sign In
              </Link>
              <Link href={route('register')}
                className="theme-btn btn-style w-full py-3 rounded-[6px] border hover:text-white"
              >
                Sign Up
              </Link>
              <Link href={route('all-properties')}
                className="theme-btn btn-style w-full py-3 fill rounded-[6px] text-center"
              >
                <span>Book Now</span>
              </Link>
            </div>
          </nav>
        </div>
    </>
  )
}

export default Header;