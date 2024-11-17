import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import SelectPlan from './components/SelectPlan';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import CheckoutCart from './components/CheckoutCart';
import { UserProvider } from './context/userContext';
import { PlansProvider } from './context/plansContext';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <PlansProvider>
          <Router>
            <Routes>
              {/* Public routes for SignUp and SignIn */}
              <Route path="/signup" element={<ProtectedRoute component={SignUp} isAuthenticatedPage={true} />} />
              <Route path="/signin" element={<ProtectedRoute component={SignIn} isAuthenticatedPage={true} />} />

              {/* Protected onboarding routes */}
              <Route path="/setup" element={<ProtectedRoute component={Setup} isAuthenticatedPage={false} />} />
              <Route path="/select-plan" element={<ProtectedRoute component={SelectPlan} isAuthenticatedPage={false} />} />
              <Route path="/checkout" element={<ProtectedRoute component={CheckoutCart} isAuthenticatedPage={false} />} />
              
              {/* Protected dashboard route */}
              <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} isAuthenticatedPage={false} />} />

              {/* Redirect to dashboard for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </PlansProvider>
      </UserProvider>
    </div>
  );
}

export default App;
