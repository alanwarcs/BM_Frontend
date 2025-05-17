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

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const { user, isLoading } = useUser();
    const [availableStorage, setAvailableStorage] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [alert, setAlert] = useState(null);
    const [states, setStates] = useState([]);
    const [isIntraState, setIsIntraState] = useState(true); // New state for GST type

    const [purchaseOrder, setPurchaseOrder] = useState({
        vendorId: '',
        businessId: '',
        purchaseOrderNumber: '',
        billNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        billDate: '',
        dueDate: '',
        status: 'Pending',
        paymentStatus: 'UnPaid',
        modeOfPayment: '',
        initialPaymentMethod: '',
        type: 'Final',
        referenceNumber: '',
        billingAddress: '',
        shippingAddress: '',
        sourceState: '',
        deliveryState: '',
        deliveryLocation: '',
        note: '',
        buyerGstin: '',
        products: [{
            productId: '',
            productName: '',
            quantity: '0',
            unit: 'nos',
            rate: '0',
            tax: '0',
            totalPrice: '0',
            taxPreference: 'GST Exclusive',
            discount: '0',
            cgstAmount: '0', // Added for tax breakdown
            sgstAmount: '0',
            igstAmount: '0'
        }],
        taxAmount: '0',
        totalAmount: '0',
        paidAmount: '0',
        dueAmount: '0',
        emiDetails: {
            frequency: '',
            interestRate: 0,
            totalWithInterest: '0',
            installments: []
        },
        attachments: [],
        createdBy: user ? { id: user.id, name: user.name } : { id: '', name: '' },
        updatedBy: user ? { id: user.id, name: user.name } : { id: '', name: '' },
        isDeleted: false
    });

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            setAlert({ message: "You must be logged in to create a purchase order.", type: "error" });
            setTimeout(() => navigate('/signin'), 2000);
            return;
        }

        setPurchaseOrder(prev => ({
            ...prev,
            createdBy: { id: user.id, name: user.name },
            updatedBy: { id: user.id, name: user.name }
        }));

        const fetchVendors = async () => {
            try {
                const response = await axios.get('/api/vendor/vendors/list');
                const vendorList = response.data.data || [];
                const uniqueVendors = Array.from(
                    new Map(vendorList.map(vendor => [vendor.id, vendor])).values()
                );
                setVendors(uniqueVendors);
                if (vendorList.length !== uniqueVendors.length) {
                    setAlert({
                        message: "Duplicate vendors detected. Showing unique vendors only.",
                        type: "warning"
                    });
                }
            } catch (error) {
                setAlert({ message: "Failed to load vendors.", type: "error" });
            }
        };

        const fetchStorage = async () => {
            try {
                const response = await axios.get('/api/storage/getList');
                setAvailableStorage(response.data.data.storage);
            } catch (error) {
                setAlert({ message: "Failed to load storage.", type: "error" });
            }
        };

        const fetchStates = () => {
            try {
                const allStates = State.getStatesOfCountry('IN');
                setStates(allStates);
            } catch (error) {
                setAlert({ message: "Failed to load states.", type: "error" });
            }
        };

        const fetchPurchaseOrderNumber = async () => {
            try {
                const response = await axios.get('/api/purchaseorder/generate-number');
                setPurchaseOrder(prev => ({
                    ...prev,
                    purchaseOrderNumber: response.data.purchaseOrderNumber
                }));
            } catch (error) {
                setAlert({ message: "Failed to generate PO number.", type: "error" });
            }
        };

        const fetchAddressAndGstin = async () => {
            try {
                const response = await axios.get(`/api/business/summary`);
                const userAddress = response.data.summary.address;
                const formatAddress = `${userAddress.address}, ${userAddress.region}, ${userAddress.country}, ${userAddress.pincode}.`;
                setPurchaseOrder(prevState => ({
                    ...prevState,
                    billingAddress: formatAddress,
                    shippingAddress: formatAddress,
                    deliveryState: userAddress.region
                }));
                
                const buyerGstin = response.data.summary.gstin;
                setPurchaseOrder(prevState => ({
                    ...prevState,
                    buyerGstin
                }));
            } catch (error) {
                setAlert({ message: "Failed to fetch user's address or GSTIN.", type: "error" });
            }
        };

        fetchVendors();
        fetchStorage();
        fetchStates();
        fetchAddressAndGstin();
        fetchPurchaseOrderNumber();

    }, [user, isLoading, navigate]);

    // Update isIntraState whenever sourceState or deliveryState changes
    useEffect(() => {
        setIsIntraState(purchaseOrder.sourceState === purchaseOrder.deliveryState);
    }, [purchaseOrder.sourceState, purchaseOrder.deliveryState]);

    const handleVendorChange = async (e) => {
        const vendorId = e.target.value;
        setPurchaseOrder(prevState => ({
            ...prevState,
            vendorId
        }));

        if (vendorId) {
            try {
                const response = await axios.get(`/api/vendor/getVendorDetails/${vendorId}`);
                const vendorData = response.data.vendorDetails;

                let sourceState = vendorData?.taxDetails?.sourceState;
                
                console.log("Source state set to: ", sourceState);
                
                if (sourceState) {
                    const stateExists = states.find(state => state.name === sourceState);
                    if (stateExists) {
                        setPurchaseOrder(prevState => ({
                            ...prevState,
                            sourceState: stateExists.name
                        }));
                    } else {
                        setAlert({
                            message: `Vendor's source state "${sourceState}" is not valid. Please select a state manually.`,
                            type: "warning"
                        });
                    }
                } else {
                    setAlert({
                        message: "Vendor has no source state or valid GSTIN. Please select a state manually.",
                        type: "warning"
                    });
                }
            } catch (error) {
                setAlert({
                    message: "Failed to fetch vendor details. Please select source state manually.",
                    type: "error"
                });
            }
        }
    };

    const handleInputChange = async (field, value) => {
        if (field === 'deliveryLocation') {
            try {
                setPurchaseOrder(prevState => ({
                    ...prevState,
                    deliveryLocation: value
                }));

                if (value) {
                    const response = await axios.get(`/api/storage/getStorageDetails/${value}`);
                    const storageState = response.data.storage.storageState || '';
                    setPurchaseOrder(prevState => ({
                        ...prevState,
                        deliveryState: storageState
                    }));
                }
            } catch (error) {
                setAlert({ message: "Failed to fetch storage details.", type: "error" });
            }
        } else {
            setPurchaseOrder(prevState => ({
                ...prevState,
                [field]: value
            }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024;
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (files.length + purchaseOrder.attachments.length > maxFiles) {
            setAlert({ message: `Maximum ${maxFiles} files allowed.`, type: 'error' });
            return;
        }

        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                setAlert({ message: `Invalid file type for ${file.name}. Allowed: PDF, PNG, JPG, DOC, DOCX.`, type: 'error' });
                return false;
            }
            if (file.size > maxSize) {
                setAlert({ message: `${file.name} exceeds 5MB limit.`, type: 'error' });
                return false;
            }
            return true;
        });

        setPurchaseOrder(prevState => ({
            ...prevState,
            attachments: [
                ...prevState.attachments,
                ...validFiles.map(file => ({
                    file,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                }))
            ]
        }));
    };

    const handleRemoveFile = (index) => {
        setPurchaseOrder(prevState => ({
            ...prevState,
            attachments: prevState.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user) {
                setAlert({ message: "You must be logged in to create a purchase order.", type: "error" });
                return;
            }

            if (!purchaseOrder.vendorId || !purchaseOrder.orderDate || !purchaseOrder.billingAddress || !purchaseOrder.shippingAddress || !purchaseOrder.sourceState || !purchaseOrder.deliveryState) {
                setAlert({ message: "Please fill all required fields, including Source State and Delivery State.", type: "error" });
                return;
            }
            if (parseFloat(purchaseOrder.paidAmount) > 0 && !purchaseOrder.initialPaymentMethod) {
                setAlert({ message: "Please select a payment method for the initial payment.", type: "error" });
                return;
            }
            if (purchaseOrder.modeOfPayment === 'EMI') {
                if (!purchaseOrder.emiDetails?.frequency || !purchaseOrder.emiDetails?.installments?.length) {
                    setAlert({ message: "Please complete all EMI details (frequency and installments).", type: "error" });
                    return;
                }
                const installmentTotal = purchaseOrder.emiDetails.installments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
                const expectedTotal = parseFloat(purchaseOrder.emiDetails.totalWithInterest);
                if (Math.abs(installmentTotal - expectedTotal) > 0.01) {
                    setAlert({ message: "Installment total does not match total with interest.", type: "error" });
                    return;
                }
            }

            const invalidDiscount = purchaseOrder.products.some(p => {
                const subtotal = (parseFloat(p.quantity) || 0) * (parseFloat(p.rate) || 0);
                return parseFloat(p.discount) > subtotal;
            });
            if (invalidDiscount) {
                setAlert({ message: "Discount cannot exceed subtotal (quantity * rate).", type: "error" });
                return;
            }

            const formData = new FormData();
            const poData = {
                ...purchaseOrder,
                createdBy: { id: user.id, name: user.name },
                updatedBy: { id: user.id, name: user.name },
                attachments: purchaseOrder.attachments.map(({ fileName, fileType, fileSize }) => ({
                    fileName,
                    fileType,
                    fileSize
                }))
            };
            formData.append('purchaseOrder', JSON.stringify(poData));
            purchaseOrder.attachments.forEach(({ file }, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await axios.post('/api/purchaseorder/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAlert({ message: "Purchase order created successfully!", type: "success" });
            setPurchaseOrder({
                vendorId: '',
                businessId: '',
                purchaseOrderNumber: '',
                billNumber: '',
                orderDate: new Date().toISOString().split('T')[0],
                billDate: '',
                dueDate: '',
                status: 'Pending',
                paymentStatus: 'UnPaid',
                modeOfPayment: '',
                initialPaymentMethod: '',
                type: 'Final',
                referenceNumber: '',
                billingAddress: '',
                shippingAddress: '',
                sourceState: '',
                deliveryState: '',
                deliveryLocation: '',
                note: '',
                buyerGstin: '',
                products: [{
                    productId: '',
                    productName: '',
                    quantity: '0',
                    unit: 'nos',
                    rate: '0',
                    tax: '0',
                    totalPrice: '0',
                    taxPreference: 'GST Exclusive',
                    discount: '0',
                    cgstAmount: '0',
                    sgstAmount: '0',
                    igstAmount: '0'
                }],
                taxAmount: '0',
                totalAmount: '0',
                paidAmount: '0',
                dueAmount: '0',
                emiDetails: {
                    frequency: '',
                    interestRate: 0,
                    totalWithInterest: '0',
                    installments: []
                },
                attachments: [],
                createdBy: user ? { id: user.id, name: user.name } : { id: '', name: '' },
                updatedBy: user ? { id: user.id, name: user.name } : { id: '', name: '' },
                isDeleted: false
            });
            setTimeout(() => navigate('/purchaseorder'), 2000);
        } catch (error) {
            setAlert({ message: error.response?.data?.error || "Failed to create purchase order.", type: "error" });
        }
    };

    if (isLoading) {
        return <div className='flex h-screen items-center justify-center'>Loading...</div>;
    }

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
                <form className="h-full overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap p-4 mb-10">
                        <div className="flex flex-wrap w-full mb-4">
                            <div className="flex flex-wrap w-full">
                                <TextInput
                                    label="Purchase Order Number"
                                    id="purchaseOrderNumber"
                                    placeholder="PO-0001"
                                    value={purchaseOrder.purchaseOrderNumber || ''}
                                    onChange={(e) => handleInputChange('purchaseOrderNumber', e.target.value)}
                                    required
                                    disabled
                                />
                                <TextInput
                                    label="Order Date"
                                    id="orderDate"
                                    type="date"
                                    min="1990-01-01"
                                    value={purchaseOrder.orderDate || ''}
                                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                                    required
                                />
                                <TextInput
                                    label="Due Date"
                                    id="dueDate"
                                    type="date"
                                    min="1990-01-01"
                                    value={purchaseOrder.dueDate || ''}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                />
                                <SelectInput
                                    id="status"
                                    label="Order Status"
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Cancel', label: 'Cancel' },
                                    ]}
                                    value={purchaseOrder.status || ''}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-wrap w-full">
                                <SelectInput
                                    id="vendorId"
                                    label="Vendor"
                                    options={vendors.map((vendor) => ({
                                        key: vendor.id,
                                        value: vendor.id,
                                        label: vendor.displayName,
                                    }))}
                                    value={purchaseOrder.vendorId || ''}
                                    onChange={handleVendorChange}
                                    required
                                    className="w-[250px]"
                                />
                                <TextInput
                                    label="Reference Number"
                                    id="referenceNumber"
                                    placeholder="Enter Reference Number"
                                    value={purchaseOrder.referenceNumber || ''}
                                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                                />
                                <SelectInput
                                    id="sourceState"
                                    name="sourceState"
                                    label="Source State"
                                    value={purchaseOrder.sourceState || ''}
                                    onChange={(e) => handleInputChange('sourceState', e.target.value)}
                                    options={states.map(state => ({
                                        value: state.name,
                                        label: state.name,
                                    }))}
                                    required
                                    className="w-[250px]"
                                />
                                <SelectInput
                                    id="deliveryState"
                                    name="deliveryState"
                                    label="Delivery State"
                                    value={purchaseOrder.deliveryState || ''}
                                    onChange={(e) => handleInputChange('deliveryState', e.target.value)}
                                    options={states.map(state => ({
                                        value: state.name,
                                        label: state.name,
                                    }))}
                                    required
                                    className="w-[250px]"
                                />
                                <SelectInput
                                    id="deliveryLocation"
                                    label="Delivery Location"
                                    options={availableStorage.map((storage) => ({
                                        value: storage._id,
                                        label: storage.storageName,
                                    }))}
                                    value={purchaseOrder.deliveryLocation || ''}
                                    onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                                    className="w-[250px]"
                                />
                                <SelectInput
                                    id="type"
                                    label="Order Type"
                                    options={[
                                        { value: 'Advance', label: 'Advance' },
                                        { value: 'Final', label: 'Final' },
                                        { value: 'Milestone', label: 'Milestone' },
                                    ]}
                                    value={purchaseOrder.type || ''}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                />
                                <div className="flex flex-col m-2">
                                    <label htmlFor="billingAddress" className="block text-gray-700 text-sm mb-2">
                                        Billing Address
                                    </label>
                                    <textarea
                                        id="billingAddress"
                                        className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                                        rows="4"
                                        placeholder="Enter Billing Address"
                                        value={purchaseOrder.billingAddress || ''}
                                        onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex flex-col m-2">
                                    <label htmlFor="shippingAddress" className="block text-gray-700 text-sm mb-2">
                                        Shipping Address
                                    </label>
                                    <textarea
                                        id="shippingAddress"
                                        className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                                        rows="4"
                                        placeholder="Enter Shipping Address"
                                        value={purchaseOrder.shippingAddress || ''}
                                        onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="w-full mt-4">
                                <ProductTable
                                    products={purchaseOrder.products}
                                    setPurchaseOrder={setPurchaseOrder}
                                    purchaseOrder={purchaseOrder}
                                    priceField="purchaseInfo.purchasePrice"
                                    isIntraState={isIntraState} // Pass isIntraState
                                />
                                <PaymentSummary
                                    purchaseOrder={purchaseOrder}
                                    setPurchaseOrder={setPurchaseOrder}
                                    isIntraState={isIntraState} // Pass isIntraState
                                />
                            </div>
                            <div className='flex flex-wrap w-full'>
                                <div className="flex flex-col m-2">
                                    <label htmlFor="note" className="block text-gray-700 text-sm mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        id="note"
                                        className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                                        rows="4"
                                        placeholder="Enter any additional notes or information"
                                        value={purchaseOrder.note || ''}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        maxLength={500}
                                    ></textarea>
                                    <div className='w-full text-end'>
                                        <p className='text-[12px] text-gray-500'>Max 500 Character</p>
                                    </div>
                                </div>
                                <div className='flex flex-col m-2'>
                                    <label htmlFor="attachments" className="block text-gray-700 text-sm mb-2">
                                        Attachments
                                    </label>
                                    <input
                                        id="attachments"
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                        className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                                        onChange={handleFileChange}
                                    />
                                    <div className="mt-2">
                                        {purchaseOrder.attachments.map((attachment, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm text-gray-700">
                                                <span>{attachment.fileName} ({(attachment.fileSize / 1024).toFixed(2)} KB)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='w-full text-end'>
                                        <p className='text-[12px] text-gray-500'>Max 5 files, 5MB each (PDF, PNG, JPG, DOC, DOCX)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed w-full bottom-0 bg-white border-t p-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover text-white text-[16px] py-2 px-4"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    );
};

export default CreatePurchaseOrder;