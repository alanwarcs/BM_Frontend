import React, { useState, useEffect } from 'react';
import SelectInput from "../ReusableComponents/SelectInput";
import UserLayout from "../ReusableComponents/UserLayout";
import TextInput from "../ReusableComponents/TextInput";
import { Link, useNavigate } from 'react-router-dom';
import Alert from "../../Alert";
import axios from 'axios';
import ProductTable from "../ReusableComponents/ProductTable";
import PaymentSummary from "../ReusableComponents/PaymentSummary";
import { useUser } from '../../../context/userContext';
import { State } from 'country-state-city';

const CreatePurchaseorder = () => {
    const { user } = useUser();
    const [alert, setAlert] = useState(null);
    const [purchaseOrder, setPurchaseOrder] = useState({
        vendorId: '',
        purchaseOrderNumber: '',
        billNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        billDate: '',
        dueDate: '',
        status: 'Pending',
        paymentStatus: 'UnPaid',
        modeOfPayment: '',
        initialPaymentMethod: '',
        referenceNumber: '',
        billingAddress: '',
        shippingAddress: '',
        sourceState: '',
        deliveryState: '',
        deliveryLocation: '',
        note: '',
        emiDetails: {
            frequency: '',
            interestRate: 0,
            totalWithInterest: '0',
            advancePayment: 0,
            installments: [
                {
                    amount: '0',
                    dueDate: '',
                    status: 'Unpaid',
                    paymentDate: '',
                    paymentMethod: '',
                    paymentReference: '',
                    paymentNote: ''
                }
            ]
        },
        products: [
            {
                productId: '',
                productName: '',
                quantity: 0,
                unit: 'nos',
                rate: '0',
                tax: 0,
                discount: '0',
                cgstAmount: '0',
                sgstAmount: '0',
                igstAmount: '0',
                totalPrice: '0'
            }
        ],
        discount: '0',
        discountType: 'Flat',
        roundOff: false,
        roundOffAmount: '0',
        taxAmount: '0',
        totalAmount: '0',
        paidAmount: '0',
        dueAmount: '0',
        attachments: [
            {
                fileName: '',
                filePath: '',
                uploadedBy: '',
                uploadedAt: '' // optional
            }
        ],
        createdBy: user ? user.id : '',
        updatedBy: user ? user.id : '',
        isDeleted: false
    });

    useEffect(() => {
        const fetchPurchaseOrderData = async () => {
            try {
                const response = await axios.get('/api/purchase-order/generate', { withCredentials: true });
                if (response.status === 200) {
                    const { purchaseOrderId, organization } = response.data;
                    console.log(organization);
                    const addressFormate = organization.address.address + ', ' + organization.address.state + ', ' + organization.address.country + ', ' + organization.address.pincode;
                    console.log(addressFormate);
                    setPurchaseOrder((prevState) => ({
                        ...prevState,
                        purchaseOrderNumber: purchaseOrderId,
                        billingAddress: addressFormate,
                        shippingAddress: addressFormate,
                    }));
                } else {
                    setAlert({ message: 'Failed to fetch purchase order data', type: 'error' });
                }
            } catch (error) {
                console.error('Error fetching purchase order data:', error);
                setAlert({ message: 'Error fetching purchase order data', type: 'error' });
            }
        };

        fetchPurchaseOrderData();
    }
        , [user]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPurchaseOrder((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };
    return (
        <UserLayout>
            <div className="flex flex-col relative h-full w-full text-start overflow-visible">
                <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
                    <p>Purchase Orders</p>
                    <div className="flex items-center">
                        <Link
                            to="/purchaseorder"
                            className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light border border-gray-200 hover:border-gray-400"
                        >
                            Purchase Order List
                        </Link>
                    </div>
                </div>
                <hr />
                <form className="h-full overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-wrap w-full mb-4">
                        <TextInput
                            label="Purchase Order Number"
                            name="purchaseOrderNumber"
                            value={purchaseOrder.purchaseOrderNumber}
                            onChange={handleInputChange}
                            required
                            disabled
                        />
                        <TextInput
                            type="date"
                            label="OrderDate"
                            name="orderDate"
                            value={purchaseOrder.orderDate}
                            onChange={handleInputChange}
                            required
                        />
                        <TextInput
                            type="date"
                            label="Due Date"
                            name="dueDate"
                            value={purchaseOrder.dueDate}
                            onChange={handleInputChange}
                        />
                        <SelectInput
                            label="Order Status"
                            name="status"
                            value={purchaseOrder.status}
                            onChange={handleInputChange}
                            options={[
                                { value: 'Completed', label: 'Completed' },
                                { value: 'Pending', label: 'Pending' },
                                { value: 'Cancel', label: 'Cancel' }
                            ]}
                            required
                        />
                    </div>
                    <div className='flex flex-wrap w-full mb-4'>
                        <textarea
                            className="w-full h-24 p-2 border border-gray-300 rounded-md"
                            name="billingAddress"
                            value={purchaseOrder.billingAddress}
                            onChange={handleInputChange}
                            placeholder="Billing Address"
                            required
                        />
                        <textarea
                            className="w-full h-24 p-2 border border-gray-300 rounded-md"
                            name="shippingAddress"
                            value={purchaseOrder.shippingAddress}
                            onChange={handleInputChange}
                            placeholder="Shipping Address"
                            required
                        />
                    </div>
                </form>
            </div>
            {alert && (
                <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
            )}
        </UserLayout>
    )
}

export default CreatePurchaseorder
