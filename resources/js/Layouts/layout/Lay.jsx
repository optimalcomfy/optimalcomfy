/* eslint-disable react-hooks/exhaustive-deps */
import {
    useEventListener,
    useMountEffect,
    useUnmountEffect,
} from "primereact/hooks";
import React, { useContext, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import AppFooter from "@/Layouts/layout/AppFooter.jsx";
import AppConfig from "@/Layouts/layout/AppConfig.jsx";
import { LayoutContext } from "./context/layoutcontext";
import { PrimeReactContext } from "primereact/api";
import '../../../css/index.scss'

const Lay = ({ children, bg, job }) => {
    const { layoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const { setRipple } = useContext(PrimeReactContext);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);

    console.log(bg);
    
    

    const pathname = route().current();

    useEffect(() => {
        const reloadCSS = () => {
            const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        
            cssLinks.forEach((link) => {
                const newLink = document.createElement("link");
                newLink.rel = "stylesheet";
                newLink.href = link.href.split("?")[0] + "?v=" + new Date().getTime();
                newLink.onload = () => link.remove(); 
        
                document.head.appendChild(newLink);
            });
        };
        

        reloadCSS();
    
    }, [pathname]);

    useEffect(() => {
        hideMenu();
        hideProfileMenu();
    }, [pathname]);

    const [
        bindMenuOutsideClickListener,
        unbindMenuOutsideClickListener,
    ] = useEventListener({
        type: "click",
        listener: (event) => {
            const isOutsideClicked = !(
                sidebarRef.current?.isSameNode(event.target) ||
                sidebarRef.current?.contains(event.target) ||
                topbarRef.current?.menubutton?.isSameNode(event.target) ||
                topbarRef.current?.menubutton?.contains(event.target)
            );

            if (isOutsideClicked) {
                hideMenu();
            }
        },
    });

    const [
        bindProfileMenuOutsideClickListener,
        unbindProfileMenuOutsideClickListener,
    ] = useEventListener({
        type: "click",
        listener: (event) => {
            const isOutsideClicked = !(
                topbarRef.current?.topbarmenu?.isSameNode(event.target) ||
                topbarRef.current?.topbarmenu?.contains(event.target) ||
                topbarRef.current?.topbarmenubutton?.isSameNode(event.target) ||
                topbarRef.current?.topbarmenubutton?.contains(event.target)
            );

            if (isOutsideClicked) {
                hideProfileMenu();
            }
        },
    });

    const hideMenu = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
        }));
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            profileSidebarVisible: false,
        }));
        unbindProfileMenuOutsideClickListener();
    };

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add("blocked-scroll");
        } else {
            document.body.className += " blocked-scroll";
        }
    };

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove("blocked-scroll");
        } else {
            document.body.className = document.body.className.replace(
                new RegExp(
                    "(^|\\b)" + "blocked-scroll".split(" ").join("|") + "(\\b|$)",
                    "gi"
                ),
                " "
            );
        }
    };

    useMountEffect(() => {
        setRipple(layoutConfig.ripple);
    });

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            bindMenuOutsideClickListener();
        }

        layoutState.staticMenuMobileActive && blockBodyScroll();
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    useEffect(() => {
        if (layoutState.profileSidebarVisible) {
            bindProfileMenuOutsideClickListener();
        }
    }, [layoutState.profileSidebarVisible]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
        unbindProfileMenuOutsideClickListener();
    });

    const containerClass = classNames("layout-wrapper", {
        "layout-overlay": layoutConfig.menuMode === "overlay",
        "layout-static": layoutConfig.menuMode === "static",
        "layout-static-inactive":
            layoutState.staticMenuDesktopInactive &&
            layoutConfig.menuMode === "static",
        "layout-overlay-active": layoutState.overlayMenuActive,
        "layout-mobile-active": layoutState.staticMenuMobileActive,
        "p-input-filled": layoutConfig.inputStyle === "filled",
        "p-ripple-disabled": !layoutConfig.ripple,
    });

    return (
        <React.Fragment>
            <div className={`${containerClass}`}>
            <div className='home-layout-wrapper'>
                <div className="banner-agileits" id="home">
                    {/* //Navbar */}
                    <div className="banner-top-w3-agile">
                        <ul>
                        <li>
                            <p>Dubai</p>
                            <span>Work</span>
                        </li>
                        <li>
                            <p>USA</p>
                            <span>Study/Work</span>
                        </li>
                        <li>
                            <p>UK</p>
                            <span>Study/Work</span>
                        </li>
                        <li>
                            <p>Canada</p>
                            <span>Study/Work</span>
                        </li>
                        <li>
                            <p>Finland</p>
                            <span>Work</span>
                        </li>
                        <li>
                            <p>Qatar</p>
                            <span>General</span>
                        </li>
                        </ul>
                    </div>
                    {/* Slider */}
                    <div className="slider w3layouts agileits">
                        <ul className="rslides w3layouts agileits" id="slider">
                        <li>
                            <div className={`bg-cover bg-center min-h-[40vh]`}  style={{ backgroundImage: `url('${bg}')` }}>   

                            <div className="layer w3layouts agileits">
                                <div className="logo-agileits">
                                <a className="navbar-brand" href="index-2.html">
                                    {/*<img src="images/logo.jpg" width="162" height="182">*/}
                                </a>
                                </div>
                                <div className="banner-info-w3layouts">
                                <h3>{job.title}</h3>
                                <p>{job.job_type}</p>
                                <div className="bnr-butn-w3ls">
                                    <p>${job.salary_min} - ${job.salary_max}</p>
                                </div>
                                </div>
                            </div>
                            </div>
                        </li>
                        </ul>
                    </div>
                    {/* //Slider */}
                    </div>

                </div>
                <div className="container mx-auto py-2">
                    <div className="layout-main">{children}</div>
                    <AppFooter />
                </div>
                <AppConfig />
                <div className="layout-mask"></div>
            </div>
        </React.Fragment>
    );
};

export default Lay;
