import { useEffect } from "react";
import ReactGA from "react-ga4";

const useGoogleAnalytics = (trackingId?: string) => {
    useEffect(() => {
        if (trackingId) {
            // Initialize Google Analytics using the tracking ID from environment variables
            ReactGA.initialize(trackingId);

            // Track the initial page load
            ReactGA.send("pageview");
        } else {
            console.warn("Google Analytics tracking ID is not set.");
        }
    }, [trackingId]); // Dependency array includes trackingId
};

export default useGoogleAnalytics;
