import './App.css';
import Home from "./components/home/Home";
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import useGoogleAnalytics from './hooks/useGoogleAnalytics';
import {trackingId} from './RnBenchmarkingWebPage.constant';

function App() {
    useGoogleAnalytics(trackingId);
  return (
      <Router>
        <Home />
      </Router>
  );
}

export default App;
