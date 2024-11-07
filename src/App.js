import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import SelectPlan from './components/SelectPlan';
import Setup from './components/Setup';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/signup" element={<ProtectedRoute component={SignUp} isAuthenticatedPage={true} />}/>
          <Route path="/signin" element={<ProtectedRoute component={SignIn} isAuthenticatedPage={true} />}/>

          <Route path="/setup" element={<ProtectedRoute component={Setup} />} />
          <Route path="/select-plan" element={<ProtectedRoute component={SelectPlan} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
