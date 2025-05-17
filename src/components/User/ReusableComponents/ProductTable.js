import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import measurementCategories from "../../../data/measurementCategories.json";
import gstRates from "../../../data/gstRates.json";

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj) || 0;
};

const ProductTable = ({ products, setPurchaseOrder, purchaseOrder, priceField, isIntraState }) => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdownIndex, setShowDropdownIndex] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [duplicateWarnings, setDuplicateWarnings] = useState({});
  const dropdownRef = useRef(null);
  const quantityRefs = useRef([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/item/');
        const itemsArray = response.data.data.items || [];
        if (!itemsArray.length) {
          console.warn('No items fetched from API');
          itemsArray.push({ itemName: 'No items available' });
        }
        setAllItems(itemsArray);
        setFilteredItems(itemsArray);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    };
    fetchItems();
  }, []);

  const handleAddProduct = () => {
    setPurchaseOrder(prevState => ({
      ...prevState,
      products: [...prevState.products, {
        productId: '',
        productName: '',
        quantity: '0',
        unit: 'pcs',
        rate: '0',
        tax: '0',
        cgstAmount: '0',
        sgstAmount: '0',
        igstAmount: '0',
        totalPrice: '0',
        taxPreference: 'GST Exclusive'
      }]
    }));
  };

  const handleRemoveProduct = (index) => {
    if (products.length === 1) return;
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    recalculateAllProducts(updatedProducts);
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[index];
      return newWarnings;
    });
    setDuplicateWarnings(prev => {
      const newDupWarnings = { ...prev };
      delete newDupWarnings[index];
      return newDupWarnings;
    });
  };

  const handleInternalProductChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = [...products];

    if ((name === 'quantity' || name === 'rate') && parseFloat(value) < 0) {
      updatedProducts[index][name] = '0';
    } else {
      updatedProducts[index][name] = value;
    }

    if (name === 'productName') {
      const filtered = allItems.filter(item =>
        item.itemName?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowDropdownIndex(index);

      if (filtered.length === 1 && filtered[0].taxPreference === 'GST Inclusive' && getNestedValue(filtered[0], priceField)) {
        handleSelectItem(index, filtered[0]);
      } else {
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: '',
          quantity: '0',
          unit: 'pcs',
          rate: '0',
          tax: '0',
          cgstAmount: '0',
          sgstAmount: '0',
          igstAmount: '0',
          totalPrice: '0',
          taxPreference: 'GST Exclusive'
        };
        setWarnings(prev => ({
          ...prev,
          [index]: null
        }));
        setDuplicateWarnings(prev => ({
          ...prev,
          [index]: null
        }));
      }
    } else if (name === 'taxPreference') {
      const item = allItems.find(i => i._id === updatedProducts[index].productId);
      if (item) {
        const price = getNestedValue(item, priceField);
        const taxRate = parseFloat(updatedProducts[index].tax) || 0;
        if (value === 'GST Inclusive' && price && taxRate) {
          updatedProducts[index].rate = (parseFloat(price) / (1 + taxRate / 100)).toFixed(2);
        } else {
          updatedProducts[index].rate = price.toString();
        }
      }
    }

    recalculateAllProducts(updatedProducts);
  };

  const handleSelectItem = (index, item, forceAdd = false) => {
    const updatedProducts = [...products];
    const existingIndex = products.findIndex(p => p.productId === item._id && !forceAdd);

    if (existingIndex !== -1 && existingIndex !== index) {
      setDuplicateWarnings(prev => ({
        ...prev,
        [index]: { existingIndex, itemName: item.itemName }
      }));
      setShowDropdownIndex(null);
      return;
    }

    let rate = '0';
    let tax = '0';
    let warning = null;
    let taxPreference = item.taxPreference || 'GST Exclusive';

    const price = getNestedValue(item, priceField);
    if (taxPreference === 'GST Inclusive' && price && item.gst) {
      const taxRate = item.gst.intraStateGST || item.gst.interStateGST || 0;
      rate = (parseFloat(price) / (1 + taxRate / 100)).toFixed(2);
      tax = taxRate.toString();
      if (price < 200 && taxRate > 0) {
        warning = `Price (${price}) seems low for GST-inclusive with ${taxRate}% tax. Consider setting to GST Exclusive.`;
      }
    } else if (price) {
      rate = price.toString();
      if (price > 5000 && (!item.gst || (!item.gst.intraStateGST && !item.gst.interStateGST))) {
        warning = `Price (${price}) seems high for GST-exclusive. Verify if GST is included.`;
      }
    }

    updatedProducts[index] = {
      productId: item._id || '',
      productName: item.itemName || '',
      quantity: '0',
      unit: 'pcs',
      rate,
      tax,
      cgstAmount: '0',
      sgstAmount: '0',
      igstAmount: '0',
      totalPrice: '0',
      taxPreference
    };
    setWarnings(prev => ({
      ...prev,
      [index]: warning
    }));
    setDuplicateWarnings(prev => ({
      ...prev,
      [index]: null
    }));
    recalculateAllProducts(updatedProducts);
    setShowDropdownIndex(null);
  };

  const handleUpdateExisting = (index, existingIndex) => {
    if (quantityRefs.current[existingIndex]) {
      quantityRefs.current[existingIndex].focus();
    }
    const updatedProducts = [...products];
    updatedProducts[index] = {
      productId: '',
      productName: '',
      quantity: '0',
      unit: 'pcs',
      rate: '0',
      tax: '0',
      cgstAmount: '0',
      sgstAmount: '0',
      igstAmount: '0',
      totalPrice: '0',
      taxPreference: 'GST Exclusive'
    };
    setDuplicateWarnings(prev => ({
      ...prev,
      [index]: null
    }));
    recalculateAllProducts(updatedProducts);
  };

  const handleAddDuplicate = (index, item) => {
    handleSelectItem(index, item, true);
  };

  const recalculateAllProducts = (updatedProducts) => {
    const recalculatedProducts = updatedProducts.map(product => {
      const quantity = parseFloat(product.quantity) || 0;
      const rate = parseFloat(product.rate) || 0;
      const taxRate = parseFloat(product.tax) || 0;
      const discount = parseFloat(product.discount) || 0;
      const subtotal = quantity * rate - discount;
      let taxAmount = 0;
      let totalPrice = 0;
      let cgstAmount = '0';
      let sgstAmount = '0';
      let igstAmount = '0';

      if (product.taxPreference === 'GST Inclusive') {
        const basePrice = subtotal / (1 + taxRate / 100);
        taxAmount = subtotal - basePrice;
        totalPrice = subtotal;
      } else {
        taxAmount = (subtotal * taxRate) / 100;
        totalPrice = subtotal + taxAmount;
      }

      if (taxRate > 0 && gstRates.gstRates) {
        const gst = gstRates.gstRates.find(g => g.totalRate === taxRate);
        if (gst) {
          if (isIntraState) {
            cgstAmount = (subtotal * (gst.intraState.cgst.rate / 100)).toFixed(2);
            sgstAmount = (subtotal * (gst.intraState.sgst.rate / 100)).toFixed(2);
            igstAmount = '0.00';
          } else {
            cgstAmount = '0.00';
            sgstAmount = '0.00';
            igstAmount = (subtotal * (gst.interState.igst.rate / 100)).toFixed(2);
          }
        }
      }

      return {
        ...product,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalPrice: Math.max(0, totalPrice).toFixed(2)
      };
    });

    setPurchaseOrder(prevState => ({
      ...prevState,
      products: recalculatedProducts,
      taxAmount: recalculatedProducts.reduce((acc, p) => {
        return acc + parseFloat(p.cgstAmount || 0) + parseFloat(p.sgstAmount || 0) + parseFloat(p.igstAmount || 0);
      }, 0).toFixed(2),
      totalAmount: Math.max(0, recalculatedProducts.reduce((acc, p) => acc + parseFloat(p.totalPrice || 0), 0)).toFixed(2),
      dueAmount: Math.max(0, (recalculatedProducts.reduce((acc, p) => acc + parseFloat(p.totalPrice || 0), 0) - parseFloat(prevState.paidAmount || 0))).toFixed(2)
    }));
  };

  const calculateTotalAmount = () => {
    return Math.max(0, products.reduce((acc, product) => {
      return acc + parseFloat(product.totalPrice || 0);
    }, 0)).toFixed(2);
  };

  const getTaxOptions = () => {
    return [
      { value: '0', label: '0%' },
      ...gstRates.gstRates.map(rate => ({
        value: rate.totalRate.toString(),
        label: rate.description
      }))
    ];
  };

  return (
    <div className="w-full border-t mt-6 pt-4 relative z-0 overflow-visible">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Product/Service Details</h2>
      <div className="overflow-x-visible overflow-y-visible">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Sr No.</th>
              <th className="p-2">Product/Service Name</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Unit</th>
              <th></th>
              <th className="p-2">Rate</th>
              <th></th>
              <th className="p-2">Tax</th>
              <th></th>
              <th className="p-2">Total Price</th>
              <th className="p-2">Tax Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b relative">
                <td className="w-5 p-1 text-center">
                  <input
                    type="text"
                    value={index + 1}
                    disabled
                    className="w-full px-1 py-1 text-center rounded-md bg-gray-100 border border-gray-300 text-gray-600"
                  />
                </td>
                <td className="w-[400px] p-1 relative">
                  <input
                    id={`product-input-${index}`}
                    type="text"
                    name="productName"
                    value={product.productName}
                    onChange={e => handleInternalProductChange(index, e)}
                    onFocus={() => {
                      const searchTerm = product.productName.toLowerCase();
                      const filtered = searchTerm
                        ? allItems.filter(item =>
                            item.itemName?.toLowerCase().includes(searchTerm)
                          )
                        : allItems;
                      setFilteredItems(filtered);
                      setShowDropdownIndex(index);
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        if (!dropdownRef.current?.contains(document.activeElement)) {
                          setShowDropdownIndex(null);
                        }
                      }, 200);
                    }}
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  />
                  {showDropdownIndex === index && (
                    <ul
                      ref={dropdownRef}
                      className="absolute z-[2000] bg-white border border-gray-300 w-full mt-1 rounded-lg shadow-lg text-sm max-h-40 overflow-y-auto top-full"
                    >
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleSelectItem(index, item)}
                          >
                            {item.itemName}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-500">No matches found</li>
                      )}
                    </ul>
                  )}
                  {warnings[index] && (
                    <div className="text-red-500 text-xs mt-1">{warnings[index]}</div>
                  )}
                  {duplicateWarnings[index] && (
                    <div className="text-orange-500 text-xs mt-1">
                      {`${duplicateWarnings[index].itemName} already added in row ${duplicateWarnings[index].existingIndex + 1}. `}
                      <button
                        type="button"
                        className="text-customPrimary underline hover:text-customPrimaryHover"
                        onClick={() => handleUpdateExisting(index, duplicateWarnings[index].existingIndex)}
                      >
                        Update Row {duplicateWarnings[index].existingIndex + 1}
                      </button>
                      {' or '}
                      <button
                        type="button"
                        className="text-customPrimary underline hover:text-customPrimaryHover"
                        onClick={() => handleAddDuplicate(index, allItems.find(i => i.itemName === duplicateWarnings[index].itemName))}
                      >
                        Add New
                      </button>
                    </div>
                  )}
                </td>
                <td className="w-1/12 p-1">
                  <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={event => handleInternalProductChange(index, event)}
                    min="0"
                    ref={el => (quantityRefs.current[index] = el)}
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  />
                </td>
                <td className="w-20 p-1">
                  <select
                    name="unit"
                    value={product.unit}
                    onChange={event => handleInternalProductChange(index, event)}
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  >
                    <option value="">Select Unit</option>
                    {measurementCategories.measurementCategories.flatMap(category =>
                      category.units.map(u => (
                        <option key={u.UQC} value={u.UQC}>
                          {`${u.unitName} (${u.UQC})`}
                        </option>
                      ))
                    )}
                  </select>
                </td>
                <td className="w-[2px] text-center">
                  <span>x</span>
                </td>
                <td className="w-1/12 p-1">
                  <input
                    type="number"
                    name="rate"
                    value={product.rate}
                    onChange={event => handleInternalProductChange(index, event)}
                  min="0"
                  className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                />
                </td>
                <td className="w-[2px] text-center">
                  <span>+</span>
                </td>
                <td className="w-1/12 p-1">
                  <select
                    name="tax"
                    value={product.tax}
                    onChange={event => handleInternalProductChange(index, event)}
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  >
                    {getTaxOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="w-[2px] text-center">
                  <span>=</span>
                </td>
                <td className="w-[100px] p-1">
                  <input
                    type="text"
                    value={product.totalPrice}
                    disabled
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  />
                </td>
                <td className="w-[100px] p-1">
                  <select
                    name="taxPreference"
                    value={product.taxPreference}
 scarcar                    onChange={event => handleInternalProductChange(index, event)}
                    className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  >
                    <option value="GST Inclusive">Incl. GST</option>
                    <option value="GST Exclusive">Excl. GST</option>
                  </select>
                </td>
                <td className="p-1 text-left">
                  <button
                    type="button"
                    className={`text-red-600 text-sm rounded-lg px-2 py-1 ${products.length === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
                    onClick={() => handleRemoveProduct(index)}
                    disabled={products.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="relative z-0">
            <tr>
              <td colSpan="2" className="w-20 p-1 text-left">
                <button
                  type="button"
                  className="text-customPrimary hover:underline text-sm"
                  onClick={handleAddProduct}
                >
                  + Add More
                </button>
              </td>
              <td colSpan="5" className="p-1 text-right font-bold">Total Amount:</td>
              <td className="w-[100px] p-1">
                <input
                  type="text"
                  value={calculateTotalAmount()}
                  disabled
                  className="w-full py-1 px-1 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                />
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;