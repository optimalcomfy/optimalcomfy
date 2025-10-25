// resources/js/Components/BackButton.jsx
import { useState, useEffect } from "react";
import { usePage } from '@inertiajs/react';
import "./BackButton.css";

export default function BackButton() {
    const [isVisible, setIsVisible] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        let scrollTimer;

        const handleScroll = () => {
            setIsVisible(false);
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                setIsVisible(true);
            }, 150);
        };

        // Check if we're NOT on landing page
        const showButton = !['/', '/home', '/welcome'].includes(url);
        setIsVisible(showButton);

        if (showButton) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
        };
    }, [url]);

    const handleBack = () => {
        // Use browser's native back functionality
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, go to home page
            window.location.href = '/';
        }
    };

    // Don't render on landing pages
    if (['/', '/home', '/welcome'].includes(url)) {
        return null;
    }

    return (
        <button
            className={`back-button ${isVisible ? 'visible' : 'hidden'}`}
            onClick={handleBack}
            aria-label="Go back"
            type="button"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
        </button>
    );
}
