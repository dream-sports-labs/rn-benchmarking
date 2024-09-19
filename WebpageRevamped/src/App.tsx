import './App.css';
import Home from './components/home/Home';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';
import {trackingId} from './RnBenchmarkingWebPage.constant';

function App() {
    useGoogleAnalytics(trackingId);
    return (
        <Home/>
    );
}

export default App;
