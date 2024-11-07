import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import SelectPlan from './components/SelectPlan';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard'; // Assuming you have a Dashboard page

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Prevent logged-in users from accessing SignUp and SignIn */}
          <Route
            path="/signup"
            element={<ProtectedRoute component={SignUp} isAuthenticatedPage={true} />}
          />
          <Route
            path="/signin"
            element={<ProtectedRoute component={SignIn} isAuthenticatedPage={true} />}
          />
          
          {/* Protected routes */}
          <Route
            path="/setup"
            element={<ProtectedRoute component={Setup} isAuthenticatedPage={false} />}
          />
          <Route
            path="/select-plan"
            element={<ProtectedRoute component={SelectPlan} isAuthenticatedPage={false} />}
          />
          
          {/* Add your protected dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;