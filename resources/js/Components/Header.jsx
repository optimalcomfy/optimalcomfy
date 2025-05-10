import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
        <div className="header transition header__function">
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
                            Home
                        </Link>
                        </li>
                        <li className="navigation__menu--item has-child has-arrow  dark:before:!text-white">
                          <Link
                              href={route('all-properties')}
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
                <Link
                    href={route('login')}
                    className="theme-btn btn-style sm-btn rounded-[6px] border hidden lg:flex hover:text-white"
                    id="loginModal"
                >
                    Sign In
                </Link>
                <Link
                    href={route('register')}
                    className="theme-btn btn-style sm-btn rounded-[6px] border hidden lg:flex hover:text-white"
                    id="signupModal"
                >
                    Sign Up
                </Link>
                <Link
                    className="theme-btn btn-style sm-btn fill rounded-[6px]"
                    href={route('all-properties')}
                >
                    <span>Book Now</span>
                </Link>
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
              <Link href={route('about')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">About</a>
              </Link>
              <Link href={route('restaurant')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">Restaurant</a>
              </Link>
              <Link href={route('gallery')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">Gallery</a>
              </Link>
              <Link href={route('all-services')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">Services</a>
              </Link>
              <Link href={route('all-properties')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">Properties</a>
              </Link>
              <Link href={route('all-cars')} className="py-2 border-b">
                <a href="#" className="block text-lg font-medium">Cars</a>
              </Link>
              <Link href={route('contact')} className="py-2 border-b">
                <a href="contact.html" className="block text-lg font-medium">Contact</a>
              </Link>
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