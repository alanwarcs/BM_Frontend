import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from './UserLayout'
import LoadingBar from '../LoadingBar'; // Import the LoadingBar component
import Alert from '../Alert';
import axios from 'axios';

const Vendor = () => {
    const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
    const [alert, setAlert] = useState(null);

    return (
        <UserLayout>
            {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}
            <div className="flex flex-col relative h-full w-full text-start">
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start font-semibold py-2">
                    <p>Vendors</p>
                    <Link to="/addVendor" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">+ Add New</Link>
                </div>
                <hr />
            </div>
            {alert && (
                <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
            )}
        </UserLayout>
    )
}

export default Vendor
