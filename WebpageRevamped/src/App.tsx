import './App.css';
import Home from './components/home/Home';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';

function App() {
    const trackingId = process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN;
    useGoogleAnalytics(trackingId);
    return (
        <Home/>
    );
}

export default App;
