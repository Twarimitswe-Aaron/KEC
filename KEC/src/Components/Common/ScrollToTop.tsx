import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Disable browser's default scroll restoration to avoid conflicts
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }

        // On mount (refresh) or navigation, we want to ensure we're at the top.
        // For refresh, 'instant' is usually preferred to avoid "scrolling up" animation.
        // For navigation, 'smooth' is nice.
        // However, checking if it's a refresh vs navigation is tricky without refs.
        // A simple approach: use 'smooth' generally, but if we are already at the top, it does nothing.
        // If we are at the bottom (due to browser restoration before JS ran), we want to go up.
        // The user issue "show footer instead" implies browser restoration put them there.
        // Let's force 'instant' scroll on mount to fix the "refresh logic".

        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
