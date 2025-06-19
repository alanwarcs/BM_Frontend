import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserLayout from '../ReusableComponents/UserLayout';
import Pagination from '../ReusableComponents/Pagination';
import LoadingBar from '../../LoadingBar';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../Alert';
import axios from 'axios';

const PurchaseOrder = () => {
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [appliedFilter, setAppliedFilter] = useState({});
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [minGrandAmount, setMinGrandAmount] = useState(0);
    const [maxGrandAmount, setMaxGrandAmount] = useState(1000);
    const [alert, setAlert] = useState(null);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [filter, setFilter] = useState({
        search: '',
        minAmount: 0,
        maxAmount: 1000,
        status: [],
        paymentStatus: [],
    });

    const navigate = useNavigate();

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);
    const editorRef = useRef(null);
    const editorButtonRef = useRef(null);

    // Fetch purchase orders with filters and pagination
    const fetchPurchaseOrders = useCallback(async (page = 1) => {
        try {
            setLoadingProgress(30);
            const params = { page, limit: 13, ...appliedFilter };

            const response = await axios.get('/api/purchase-order/', { params });
            setLoadingProgress(70);

            if (response.data.success) {
                const fetchedPurchaseOrders = response.data.data.purchaseOrders || [];
                setPurchaseOrders(fetchedPurchaseOrders);
                setCurrentPage(page);
                setTotalPages(response.data.data.pagination?.totalPages || 1);

                // Set min/max grand amount dynamically
                setMinGrandAmount(response.data.data.minGrandAmount || 0);
                setMaxGrandAmount(response.data.data.maxGrandAmount || 1000);

                setFilter(prev => ({
                    ...prev,
                    minAmount: response.data.data.minGrandAmount || 0,
                    maxAmount: response.data.data.maxGrandAmount || 1000,
                }));
            }
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error fetching purchase orders. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    }, [appliedFilter]);

    // Handle click outside for dropdowns
    const handleClickOutside = (event) => {
        if (
            filterRef.current &&
            !filterRef.current.contains(event.target) &&
            filterButtonRef.current &&
            !filterButtonRef.current.contains(event.target)
        ) {
            setOpenFilterDropdown(false);
        }
        if (
            editorRef.current &&
            !editorRef.current.contains(event.target) &&
            editorButtonRef.current &&
            !editorButtonRef.current.contains(event.target)
        ) {
            setOpenDropdown(null);
        }
    };

    // Add event listener for click outside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch data on mount and when filters or page change
    useEffect(() => {
        fetchPurchaseOrders(currentPage);
    }, [fetchPurchaseOrders, currentPage]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handle input changes for filters
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    // Handle checkbox selection for status and paymentStatus
    const handleCheckboxChange = (e, field) => {
        const { value, checked } = e.target;
        setFilter((prev) => {
            const updatedValues = checked
                ? [...prev[field], value]
                : prev[field].filter((val) => val !== value);
            return { ...prev, [field]: updatedValues };
        });
    };

    // Apply filters
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setAppliedFilter(filter);
        setCurrentPage(1);
    };

    // Delete a single purchase order
    const deletePurchaseOrder = async (poId) => {
        try {
            setLoadingProgress(30);
            const response = await axios.delete(`/api/purchaseorder/${poId}`);
            setLoadingProgress(70);

            if (response.data.success) {
                setAlert({ message: 'Purchase order deleted successfully!', type: 'success' });
                fetchPurchaseOrders(currentPage);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error deleting purchase order. Please try again.', type: 'error' });
        }
    };

    // Delete selected purchase orders
    const deleteSelectedPurchaseOrders = async () => {
        try {
            const selectedIds = Object.keys(selectedPurchaseOrder).filter(
                (poId) => selectedPurchaseOrder[poId]
            );

            if (selectedIds.length === 0) {
                setAlert({ message: 'No purchase orders selected for deletion.', type: 'warning' });
                return;
            }

            const isConfirmed = window.confirm("Are you sure you want to delete the selected purchase orders?");
            if (!isConfirmed) {
                return;
            }

            setLoadingProgress(30);

            const deletePromises = selectedIds.map((poId) =>
                axios.delete(`/api/purchaseorder/${poId}`)
            );

            await Promise.all(deletePromises);

            setAlert({ message: 'Selected purchase orders deleted successfully!', type: 'success' });
            fetchPurchaseOrders(currentPage);
        } catch (error) {
            setLoadingProgress(100);
            setAlert({
                message: error.response?.data?.message || 'Error deleting selected purchase orders. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    };

    // Print selected purchase orders
    const printSelectedPurchaseOrders = async (selectedPurchaseOrder) => {
        try {
            const response = await axios.post('/api/purchaseorder/printList', {
                selectedPurchaseOrders: selectedPurchaseOrder,
            });

            const printWindow = window.open('', '', 'width=800,height=600');
            printWindow.document.write(response.data);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error printing purchase orders. Please try again.', type: 'error' });
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}

            <div className="flex flex-col relative h-full w-full text-start">
                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Purchase Orders</p>
                    <div className='flex items-center'>
                        <Link to="/createpurchaseorder" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Create New
                        </Link>

                        <div className='relative p-2 m-1 bg-gray-100 rounded-md text-sm font-light hover:outline-none hover:bg-gray-200 transition'>
                            <button className='flex items-center' onClick={() => setOpenFilterDropdown((prevState) => !prevState)} ref={filterButtonRef}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </button>

                            {openFilterDropdown && (
                                <form
                                    className="absolute top-12 right-0 z-20 w-[300px] p-4 bg-white border border-gray-200 shadow-lg rounded-lg"
                                    onSubmit={handleApplyFilters}
                                    ref={filterRef}
                                >
                                    {/* Search Input */}
                                    <div className="flex flex-col mb-4">
                                        <label htmlFor="Search" className="text-gray-700 text-sm font-medium mb-1">Search</label>
                                        <input
                                            type="text"
                                            id="Search"
                                            name="search"
                                            value={filter.search}
                                            onChange={handleInputChange}
                                            className="w-full h-10 py-2 px-3 border border-gray-300 rounded-lg outline-gray-200"
                                            placeholder="Search by PO Number or Vendor"
                                        />
                                    </div>

                                    {/* Grand Amount */}
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 text-sm font-medium mb-1">Grand Amount</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                id="minAmount"
                                                name="minAmount"
                                                value={filter.minAmount}
                                                onChange={handleInputChange}
                                                min={minGrandAmount}
                                                max={maxGrandAmount}
                                                className="w-1/2 h-10 py-2 px-3 border border-gray-300 rounded-lg outline-gray-200"
                                                placeholder="Min"
                                            />
                                            <span className="mx-2">to</span>
                                            <input
                                                type="number"
                                                id="maxAmount"
                                                name="maxAmount"
                                                value={filter.maxAmount}
                                                onChange={handleInputChange}
                                                min={minGrandAmount}
                                                max={maxGrandAmount}
                                                className="w-1/2 h-10 py-2 px-3 border border-gray-300 rounded-lg outline-gray-200"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 text-sm font-medium mb-1">Status</label>
                                        <div className="flex flex-wrap">
                                            {["Completed", "Pending", "Cancel"].map((status) => (
                                                <div className="flex items-center m-1" key={status}>
                                                    <input
                                                        type="checkbox"
                                                        id={`status-${status}`}
                                                        value={status}
                                                        checked={filter.status.includes(status)}
                                                        onChange={(e) => handleCheckboxChange(e, 'status')}
                                                        className="hidden peer"
                                                    />
                                                    <label
                                                        htmlFor={`status-${status}`}
                                                        className="cursor-pointer whitespace-nowrap p-2 text-[14px] rounded-lg bg-gray-100 hover:bg-gray-200 peer-checked:bg-customPrimary peer-checked:text-white"
                                                    >
                                                        {status}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 text-sm font-medium mb-1">Payment Status</label>
                                        <div className="flex flex-wrap">
                                            {["Paid", "UnPaid", "Partially Paid"].map((paymentStatus) => (
                                                <div className="flex items-center m-1" key={paymentStatus}>
                                                    <input
                                                        type="checkbox"
                                                        id={`paymentStatus-${paymentStatus}`}
                                                        value={paymentStatus}
                                                        checked={filter.paymentStatus.includes(paymentStatus)}
                                                        onChange={(e) => handleCheckboxChange(e, 'paymentStatus')}
                                                        className="hidden peer"
                                                    />
                                                    <label
                                                        htmlFor={`paymentStatus-${paymentStatus}`}
                                                        className="cursor-pointer whitespace-nowrap p-2 text-[14px] rounded-lg bg-gray-100 hover:bg-gray-200 peer-checked:bg-customPrimary peer-checked:text-white"
                                                    >
                                                        {paymentStatus}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Apply Button */}
                                    <button
                                        type="submit"
                                        className="w-full h-10 mt-2 rounded-lg bg-customPrimary hover:bg-customPrimaryHover text-white text-sm font-medium"
                                    >
                                        Apply Filters
                                    </button>
                                </form>
                            )}
                        </div>

                        {selectedPurchaseOrder && (
                            <div className="flex flex-cols items-center">
                                {Object.values(selectedPurchaseOrder).some((isSelected) => isSelected) && (
                                    <div className='flex flex-cols items-center'>
                                        <button onClick={() => printSelectedPurchaseOrders(selectedPurchaseOrder)} className='flex items-center relative m-1 p-2 bg-gray-100 rounded-md text-sm font-light hover:outline-none transition'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer">
                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                                <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                                                <rect x="6" y="14" width="12" height="8" rx="1" />
                                            </svg>
                                        </button>

                                        <button onClick={deleteSelectedPurchaseOrders} className='flex items-center relative m-1 rounded-md text-red-500 text-sm font-light hover:outline-none transition'>
                                            <div className='flex items-center p-2'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    <line x1="10" x2="10" y1="11" y2="17" />
                                                    <line x1="14" x2="14" y1="11" y2="17" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr />

                <div className="text-center h-full w-full overflow-auto">
                    {purchaseOrders.length > 0 ? (
                        <div className="relative w-full h-full overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right capitalize border border-gray-200">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const allSelected = purchaseOrders.reduce((acc, po) => {
                                                        acc[po._id] = checked;
                                                        return acc;
                                                    }, {});
                                                    setSelectedPurchaseOrder(allSelected);
                                                }}
                                                checked={purchaseOrders.every((po) => selectedPurchaseOrder[po._id])}
                                            />
                                        </th>
                                        <th className="px-6 py-2">PO Number</th>
                                        <th className="px-6 py-2">Order Date</th>
                                        <th className="px-6 py-2">Due Date</th>
                                        <th className="px-6 py-2">Vendor Name</th>
                                        <th className="px-6 py-2">Grand Amount</th>
                                        <th className="px-6 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {purchaseOrders.map((po) => (
                                        <tr key={po._id} className="bg-white border-b hover:bg-gray-100 transition">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setSelectedPurchaseOrder((prev) => ({
                                                        ...prev,
                                                        [po._id]: !prev[po._id],
                                                    }))}
                                                    checked={!!selectedPurchaseOrder[po._id]}
                                                />
                                            </td>
                                            <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {po.poNumber || '-'}
                                            </td>
                                            <td className="px-6 py-2">{po.orderDate || '-'}</td>
                                            <td className="px-6 py-2">{po.dueDate || '-'}</td>
                                            <td className="px-6 py-2">{po.vendorName || '-'}</td>
                                            <td className="px-6 py-2">{po.grandAmount || '-'}</td>
                                            <td className="relative px-6 py-2">
                                                <button
                                                    ref={editorButtonRef}
                                                    className="text-gray-600 focus:outline-none"
                                                    onClick={() => setOpenDropdown((prev) => (prev === po._id ? null : po._id))}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                                                        <circle cx="12" cy="12" r="1" />
                                                        <circle cx="12" cy="5" r="1" />
                                                        <circle cx="12" cy="19" r="1" />
                                                    </svg>
                                                </button>
                                                {openDropdown === po._id && (
                                                    <div ref={editorRef} className="absolute right-5 top-0 z-20 mt-2 bg-white border border-gray-300 rounded shadow-lg w-24 overflow-hidden">
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/editPurchaseOrder/${po._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/viewpurchaseorder/${po._id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100 text-red-500"
                                                            onClick={() => deletePurchaseOrder(po._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <p className="m-2 text-gray-400">No purchase orders found for this business.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    );
};

export default PurchaseOrder;