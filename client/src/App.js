import Login from './components/Login';
import LandingPage from './Pages/LandingPage';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} />
    </Routes>
  );
}
export default App;
