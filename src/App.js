import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import SelectPlan from './components/SelectPlan';
import Setup from './components/Setup';

function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/signup" element={<SignUp/>} />
                <Route path="/signin" element={<SignIn/>} />
                <Route path="/setup" element={<Setup/>} />
                <Route path="/Select-plan" element={<SelectPlan/>} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
