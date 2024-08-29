import './App.css';
import Home from "./components/home/Home";
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import { useEffect } from "react";
import ReactGA from 'react-ga4';

function App() {
  const trackingId = process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN;

  useEffect(() => {
    if (trackingId) {
      // Initialize Google Analytics using the tracking ID from environment variables
      ReactGA.initialize(trackingId);

      // Track the initial page load
      ReactGA.send('pageview');
    } else {
      console.warn('Google Analytics tracking ID is not set.');
    }
  }, []); // The empty dependency array ensures this runs once on mount

  return (
      <Router>
        <Home />
      </Router>
  );
}

export default App;
