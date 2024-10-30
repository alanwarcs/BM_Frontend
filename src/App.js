import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import Setup from './components/Setup';

function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/setup" element={<Setup />} />
                {/* Add more routes as needed */}
            </Routes>
        </Router>
    </div>
  );
}

export default App;
