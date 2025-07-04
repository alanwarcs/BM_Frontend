import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import SelectPlan from './components/SelectPlan';
import Setup from './components/Setup';
import Dashboard from './components/User/Dashboard';
import CheckoutCart from './components/CheckoutCart';
import { UserProvider } from './context/userContext';
import AddVendor from './components/User/Vendors/AddVendor';
import Vendor from './components/User/Vendors/Vendor';
import EditVendor from './components/User/Vendors/EditVendor';
import ViewVendor from './components/User/Vendors/ViewVendor';
import AddItem from './components/User/Items/AddItem';
import Storage from './components/User/Storage/Storage';
import AddStorage from './components/User/Storage/addStorage';
import Items from './components/User/Items/Item';
import EditItem from './components/User/Items/EditItem';
import ViewItem from './components/User/Items/ViewItem';
import Inventory from './components/User/Inventory/Inventory';
import PurchaseOrder from './components/User/PurchaseOrders/PurchaseOrder';
import CreatePurchaseorder from './components/User/PurchaseOrders/CreatePurchaseorder';
import EditPurchaseOrder from './components/User/PurchaseOrders/EditPurchasOrder';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/signup"
              element={<ProtectedRoute component={SignUp} isAuthenticatedPage={false} />}
            />
            <Route
              path="/signin"
              element={<ProtectedRoute component={SignIn} isAuthenticatedPage={false} />}
            />

            {/* Protected onboarding routes */}
            <Route
              path="/setup"
              element={<ProtectedRoute component={Setup} isAuthenticatedPage={true} />}
            />
            <Route
              path="/select-plan"
              element={<ProtectedRoute component={SelectPlan} isAuthenticatedPage={true} />}
            />

            <Route path="/checkout" element={<CheckoutCart />} />

            {/* Protected dashboard route */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute component={Dashboard} isAuthenticatedPage={true} />}
            />
            <Route
              path="/Vendor"
              element={<ProtectedRoute component={Vendor} isAuthenticatedPage={true} />}
            />
            <Route
              path="/addvendor"
              element={<ProtectedRoute component={AddVendor} isAuthenticatedPage={true} />}
            />
            <Route
              path="/editvendor/:id"
              element={<ProtectedRoute component={EditVendor} isAuthenticatedPage={true} />}
            />
            <Route
              path="/vendor/:id"
              element={<ProtectedRoute component={ViewVendor} isAuthenticatedPage={true} />}
            />

            <Route
              path="/additem"
              element={<ProtectedRoute component={AddItem} isAuthenticatedPage={true} />}
            />

            <Route
              path="/items"
              element={<ProtectedRoute component={Items} isAuthenticatedPage={true} />}
            />

            <Route
              path="/edititem/:id"
              element={<ProtectedRoute component={EditItem} isAuthenticatedPage={true} />}
            />


            <Route
              path="/viewitem/:id"
              element={<ProtectedRoute component={ViewItem} isAuthenticatedPage={true} />}
            />

            <Route
              path="/storage"
              element={<ProtectedRoute component={Storage} isAuthenticatedPage={true} />}
            />

            <Route
              path="/addstorage"
              element={<ProtectedRoute component={AddStorage} isAuthenticatedPage={true} />}
            />

            <Route
              path="/inventory"
              element={<ProtectedRoute component={Inventory} isAuthenticatedPage={true} />}
            />

            <Route
              path='/purchaseorder'
              element={<ProtectedRoute component={PurchaseOrder} isAuthenticatedPage={true} />} 
            />

            <Route 
              path='/createpurchaseorder'
              element={<ProtectedRoute component={CreatePurchaseorder} isAuthenticatedPage={true} />}
            />

            <Route
              path='/editPurchaseOrder/:purchaseOrderId'
              element={<ProtectedRoute component={EditPurchaseOrder} isAuthenticatedPage={true}/>}
            />

            {/* Redirect to dashboard for unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;