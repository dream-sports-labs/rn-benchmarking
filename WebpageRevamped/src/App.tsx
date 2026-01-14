import './styles/design-system.css';
import './App.css';
import Home from './components/home/Home';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';
import { trackingId } from './RnBenchmarkingWebPage.constant';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  useGoogleAnalytics(trackingId);
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

export default App;
