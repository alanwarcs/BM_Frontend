import React from 'react';
import UserLayout from "../ReusableComponents/UserLayout";
import { Link } from 'react-router-dom';

const PurchaseOrder = () => {
    return (
        <UserLayout>
            <div className="flex flex-col relative h-full w-full text-start">
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Purchase Orders</p>
                    <div className='flex items-center'>
                        <Link to="/createpurchaseorder" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Create New
                        </Link>
                    </div>
                </div>
                <hr />
                <div className="text-center h-full w-full overflow-scroll">

                </div>
            </div>
        </UserLayout>
    )
}

export default PurchaseOrder
