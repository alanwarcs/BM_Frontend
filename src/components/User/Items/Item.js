import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserLayout from '../ReusableComponents/UserLayout';
import Pagination from '../ReusableComponents/Pagination';
import LoadingBar from '../../LoadingBar';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../Alert';
import axios from 'axios';

const Item = () => {
    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [appliedFilter, setAppliedFilter] = useState({});
    const [selectedItem, setSelectedItem] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [maxStock, setMaxStock] = useState(100);
    const [minStock, setMinStock] = useState(0);
    const [alert, setAlert] = useState(null);
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState({
        search: '',
        minValue: 0,
        maxValue: 100,
        taxPreference: [],
    });

    const navigate = useNavigate();

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);
    const editorRef = useRef(null);
    const editorButtonRef = useRef(null);

    // Fetch all items or filter/search based on query
    const fetchItems = useCallback(async (page = 1) => {
        try {
            setLoadingProgress(30);
            const params = { page, limit: 13, ...appliedFilter };

            const response = await axios.get('/api/item/', { params });
            setLoadingProgress(70);

            if (response.data.success) {
                const fetchedItems = response.data.data.items || [];
                setItems(fetchedItems);
                setCurrentPage(page);
                setTotalPages(response.data.data.pagination?.totalPages || 1);

                //Set min/max stock values dynamically
                setMinStock(response.data.data.minStockValue);
                setMaxStock(response.data.data.maxStockValue);

                setFilter(prev => ({
                    ...prev,
                    maxValue: response.data.data.maxStockValue,
                }));
            }
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error fetching items. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    }, [appliedFilter]);

    //Handle Click Outside Ref
    const handleClickOutside = (event) => {
        // Close filter dropdown if clicking outside
        if (
            filterRef.current &&
            !filterRef.current.contains(event.target) &&
            filterButtonRef.current &&
            !filterButtonRef.current.contains(event.target)
        ) {
            setOpenFilterDropdown(false);
        }
        // Close edit dropdown if clicking outside
        if (
            editorRef.current &&
            !editorRef.current.contains(event.target) &&
            editorButtonRef.current &&
            !editorButtonRef.current.contains(event.target)
        ) {
            setOpenDropdown(null);  // Corrected usage of setter function
        }
    };

    //Handle Click Outside Ref (Effect)
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch data on component mount and when filters or currentPage change
    useEffect(() => {
        fetchItems(currentPage);
    }, [fetchItems, currentPage]);

    //Handle page change in Pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Checkbox Selection
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFilter((prev) => {
            const updatedPreferences = checked
                ? [...prev.taxPreference, value]
                : prev.taxPreference.filter((pref) => pref !== value);
            return { ...prev, taxPreference: updatedPreferences };
        });
    };

    // Apply Filters
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setAppliedFilter(filter);
        setCurrentPage(1);
    };

    // Function to delete all items
    const deleteItem = async (itemsId) => {
        try {
            setLoadingProgress(30);
            const response = await axios.delete(`/api/item/items/${itemsId}`);
            setLoadingProgress(70);

            if (response.data.success) {
                setAlert({ message: 'Item deleted successfully!', type: 'success' });
                fetchItems(currentPage);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        } catch (error) {
            setLoadingProgress(100);
            setAlert({ message: 'Error deleting item. Please try again.', type: 'error' });
        }
    };

    // Function to delete selected items
    const deleteSelectedItems = async () => {
        try {
            const selectedIds = Object.keys(selectedItem).filter(
                (itemsId) => selectedItem[itemsId]
            );

            if (selectedIds.length === 0) {
                setAlert({ message: 'No items selected for deletion.', type: 'warning' });
                return;
            }

            const isConfirmed = window.confirm("Are you sure you want to delete the selected items?");
            if (!isConfirmed) {
                return;
            }

            setLoadingProgress(30);

            const deletePromises = selectedIds.map((itemsId) =>
                axios.delete(`/api/item/items/${itemsId}`)
            );

            await Promise.all(deletePromises);

            setAlert({ message: 'Selected items deleted successfully!', type: 'success' });
            fetchItems(currentPage);
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Error deleting selected items. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 1000);
        }
    };

    // Print selected items
    const printSelectedItems = async (selectedItem) => {
        try {
            const response = await axios.post('/api/item/printList', {
                selectedItems: selectedItem,
            });

            const printWindow = window.open('', '', 'width=800,height=600');

            printWindow.document.write(response.data);
            printWindow.document.close();

            printWindow.print();

        } catch (error) {
            setLoadingProgress(100);
            console.log(error);
            setAlert({ message: 'Error printing item. Please try again.', type: 'error' });
        }
    };

    return (
        <UserLayout>
            {loadingProgress > 0 && loadingProgress < 100 && <LoadingBar progress={loadingProgress} />}

            <div className="flex flex-col relative h-full w-full text-start">

                <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
                    <p>Items</p>
                    <div className='flex items-center'>
                        <Link to="/additem" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-1 p-2 text-white text-sm">
                            + Add New
                        </Link>

                        <div className='relative p-2 m-1 bg-gray-100 rounded-md text-sm font-light hover:outline-none hover:bg-gray-200 transition'>
                            <button className='flex items-center' onClick={() => setOpenFilterDropdown((prevState) => !prevState)} ref={filterButtonRef} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
                                            placeholder="Search"
                                        />
                                    </div>

                                    {/* Stock Value */}
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 text-sm font-medium mb-1">Stock Value</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                id="minValue"
                                                name="minValue"
                                                value={filter.minValue}
                                                onChange={handleInputChange}
                                                min={minStock}
                                                max={maxStock}
                                                className="w-1/2 h-10 py-2 px-3 border border-gray-300 rounded-lg outline-gray-200"
                                                placeholder="Min"
                                            />
                                            <span className="mx-2">to</span>
                                            <input
                                                type="number"
                                                id="maxValue"
                                                name="maxValue"
                                                value={filter.maxValue}
                                                onChange={handleInputChange}
                                                min={minStock}
                                                max={maxStock}
                                                className="w-1/2 h-10 py-2 px-3 border border-gray-300 rounded-lg outline-gray-200"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>

                                    {/* Tax Preference */}
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 text-sm font-medium mb-1">Tax Preference</label>
                                        <div className="flex flex-wrap">
                                            {["GST Inclusive", "GST Exclusive", "No GST"].map((tax) => (
                                                <div className="flex items-center m-1" key={tax}>
                                                    <input
                                                        type="checkbox"
                                                        id={tax}
                                                        value={tax}
                                                        checked={filter.taxPreference.includes(tax)}
                                                        onChange={handleCheckboxChange}
                                                        className="hidden peer"
                                                    />
                                                    <label
                                                        htmlFor={tax}
                                                        className="cursor-pointer whitespace-nowrap p-2 text-[14px] rounded-lg bg-gray-100 hover:bg-gray-200 peer-checked:bg-customPrimary peer-checked:text-white"
                                                    >
                                                        {tax}
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

                        {selectedItem && (
                            <div className="flex flex-cols items-center">
                                {Object.values(selectedItem).some((isSelected) => isSelected) && (
                                    <div className='flex flex-cols items-center'>
                                        <button onClick={() => printSelectedItems(selectedItem)} className='flex items-center relative m-1 p-2 bg-gray-100 rounded-md text-sm font-light hover:outline-none transition'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>
                                        </button>

                                        <button onClick={deleteSelectedItems} className='flex items-center relative m-1 rounded-md text-red-500 text-sm font-light hover:outline-none transition'>
                                            <div className='flex items-center p-2'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
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
                    {items.length > 0 ? (
                        <div className="relative w-full h-full overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right capitalize border border-gray-200">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const allSelected = items.reduce((acc, item) => {
                                                        acc[item._id] = checked;
                                                        return acc;
                                                    }, {});
                                                    setSelectedItem(allSelected);
                                                }}
                                                checked={items.every((item) => selectedItem[item._id])}
                                            />
                                        </th>
                                        <th className="px-6 py-2">Item Name</th>
                                        <th className="px-6 py-2">Type</th>
                                        <th className="px-6 py-2">Selling Price</th>
                                        <th className="px-6 py-2">Purchase Price</th>
                                        <th className="px-6 py-2">Tax Preference</th>
                                        <th className="px-6 py-2">Available Qty</th>
                                        <th className="px-6 py-2">Stock Value</th>
                                        <th className="px-6 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item) => (
                                        <tr key={item._id} className="bg-white border-b hover:bg-gray-100 transition">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setSelectedItem((prev) => ({
                                                        ...prev,
                                                        [item._id]: !prev[item._id],
                                                    }))}
                                                    checked={!!selectedItem[item._id]}
                                                />
                                            </td>
                                            <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {item.itemName || '-'}
                                            </td>
                                            <td className="px-6 py-2">{item.itemType || '-'}</td>
                                            <td className="px-6 py-2">
                                                {item.sellInfo?.price ? `${item.sellInfo.price} ${item.sellInfo.currency}` : '-'}
                                            </td>
                                            <td className="px-6 py-2">
                                                {item.purchaseInfo?.purchasePrice
                                                    ? `${item.purchaseInfo.purchasePrice} ${item.purchaseInfo.purchaseCurrency}`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-2">{item.taxPreference || '-'}</td>
                                            <td className="px-6 py-2">
                                                {item.storage ? item.storage.reduce((total, storage) => total + (storage.quantity || 0), 0) : 0}
                                            </td>
                                            <td className="px-6 py-2">
                                                {item.stockValue ? `${item.stockValue} Units` : '-'}
                                            </td>
                                            <td className="relative px-6 py-2">
                                                <button
                                                    ref={editorButtonRef}
                                                    className="text-gray-600 focus:outline-none"
                                                    onClick={() => setOpenDropdown((prev) => (prev === item._id ? null : item._id))}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                                                        <circle cx="12" cy="12" r="1" />
                                                        <circle cx="12" cy="5" r="1" />
                                                        <circle cx="12" cy="19" r="1" />
                                                    </svg>
                                                </button>
                                                {openDropdown === item._id && (
                                                    <div ref={editorRef} className="absolute right-5 top-0 z-20 mt-2 bg-white border border-gray-300 rounded shadow-lg w-24 overflow-hidden">
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/edititem/${item._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button  
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100"
                                                            onClick={() => navigate(`/viewitem/${item._id}`)}
                                                        >
                                                           View
                                                        </button>
                                                        <button
                                                            className="block w-full px-4 py-2 text-start text-sm hover:bg-gray-100 text-red-500"
                                                            onClick={() => deleteItem(item._id)}
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
                            <p className="m-2 text-gray-400">No items found for this business.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
        </UserLayout>
    )
}

export default Item
