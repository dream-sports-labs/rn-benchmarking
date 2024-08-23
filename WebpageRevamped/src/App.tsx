import './App.css';
import Home from "./components/home/Home";
import {useEffect} from "react";
import ReactGA from 'react-ga4';

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-JCMS7CG87C'); // Replace 'G-XXXXXXXXXX' with your actual Measurement ID

    // Track the initial page load
    ReactGA.send('pageview');
  }, []);  // The empty dependency array ensures this runs once on mount
  return (
    <Home/>
  );
}

export default App;
