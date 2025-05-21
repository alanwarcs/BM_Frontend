import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "../../Alert";
import { useUser } from "../../../context/userContext";
import measurementData from "../../../data/measurementCategories.json";
import gstData from '../../../data/gstRates.json'; // Adjust path

const ProductTable = ({ selectedProducts, onProductSelect, gstType }) => {
  const { user } = useUser();
  const [alert, setAlert] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [itemDropdownVisible, setItemDropdownVisible] = useState(false);
  const [taxDropdownVisible, setTaxDropdownVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const productTableRef = useRef();
  const productNameRef = useRef();
  const productTaxRef = useRef();

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (productTableRef.current && !productTableRef.current.contains(event.target)) {
        setItemDropdownVisible(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch product list
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/item/getItemList", { withCredentials: true });
        if (response.data.success) {
          const fetchedProducts = response.data.data || [];
          setProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
          setHighlightedIndex(fetchedProducts.length > 0 ? 0 : -1);
        } else {
          setAlert({ message: response.data.message || "Failed to fetch products.", type: "error" });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to retrieve items. Please try again later.";
        setAlert({ message: errorMessage, type: "error" });
      }
    };

    fetchData();
  }, [user]);

  // Handle product search
  const handleProductSearch = (value) => {
    const searchTerm = value.toLowerCase().trim();
    const filtered = searchTerm
      ? products.filter(
        (product) =>
          product &&
          (product.itemName || product.name || "").toLowerCase().includes(searchTerm)
      )
      : products;
    setFilteredProducts(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
    setItemDropdownVisible(true);

    // Update parent with partial selection
    if (onProductSelect) {
      onProductSelect({
        productId: "",
        productName: value,
        rate: "0",
        tax: 0,
        unit: "nos",
      });
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    if (!product || !onProductSelect) {
      setAlert({ message: "Invalid product selected.", type: "error" });
      return;
    }

    const productId = product._id || product.id || "";
    if (!productId) {
      setAlert({ message: "Selected product has no valid ID.", type: "error" });
      return;
    }

    onProductSelect({
      productId,
      productName: product.itemName || product.name || "Unknown Product",
      rate: product.rate ? String(product.rate) : "0",
      tax: product.intraStateGST || product.interStateGST || 0,
      unit: product.unit || "nos",
    });

    setItemDropdownVisible(false);
    setHighlightedIndex(-1);
    if (productNameRef.current) {
      productNameRef.current.value = product.itemName || product.name || "";
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!itemDropdownVisible) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev <= 0) return filteredProducts.length - 1;
          return prev - 1;
        });
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev >= filteredProducts.length - 1) return 0;
          return prev + 1;
        });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
          const selectedProduct = filteredProducts[highlightedIndex];
          if (!selectedProduct || (!selectedProduct._id && !selectedProduct.id)) {
            setAlert({ message: "Selected product is invalid.", type: "error" });
            return;
          }
          handleProductSelect(selectedProduct);
        } else {
          setItemDropdownVisible(false);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        setItemDropdownVisible(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={productTableRef} className="flex flex-col w-full mb-96">
      <h2 className="text-md font-semibold m-2">Product/Service Details</h2>
      {alert && <Alert message={alert.message} type={alert.type} />}
      <div className="overflow-x-visible">
        <table className="min-w-[1000px] w-full table-auto overflow-x-visible border-1 border-bottom border-gray-300 text-sm p-3">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-2 w-[50px]">Sr No.</th>
              <th className="p-2 w-[270px]">Product Name</th>
              <th className="p-2 w-[80px]">Quantity</th>
              <th className="p-2 w-[80px]">Unit</th>
              <th className="p-2 w-[80px]">Rate</th>
              <th className="p-2 w-[80px]">Discount (%)</th>
              <th className="p-2 w-[80px]">Tax (%)</th>
              <th className="p-2 w-[100px]">Total Price</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-2">
                <input
                  type="number"
                  value={1}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                  disabled
                />
              </td>
              <td className="p-2 overflow-x-visible">
                <div className="flex relative flex-col overflow-x-visible">
                  <input
                    type="text"
                    name="productName"
                    id="productName"
                    autoComplete="off"
                    ref={productNameRef}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => {
                      setFilteredProducts(products);
                      setItemDropdownVisible(true);
                      setHighlightedIndex(products.length > 0 ? 0 : -1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Select or Search Product"
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                  />
                  {itemDropdownVisible && (
                    <ul className="absolute z-50 top-[30px] w-[350px] bg-white border border-gray-200 rounded-md max-h-52 overflow-y-auto shadow-md">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <li
                            key={
                              product._id
                                ? `product-${product._id}`
                                : product.id
                                  ? `product-${product.id}`
                                  : `product-${index}`
                            }
                            className={`px-3 py-2 cursor-pointer ${index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                              }`}
                            onClick={() => product && handleProductSelect(product)}
                          >
                            <span className="font-medium">
                              {product.itemName || product.name || "Unnamed Product"}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li
                          className={`px-3 py-2 text-customPrimary cursor-pointer ${highlightedIndex === -1 ? "bg-gray-200" : "hover:bg-gray-100"
                            }`}
                          onClick={() => {
                            setItemDropdownVisible(false);
                            setHighlightedIndex(-1);
                          }}
                        >
                          <a href="/add-item">+ Add New Item</a>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  autoComplete="off"
                  min="0"
                  value={selectedProducts[0]?.quantity || "0"}
                  onChange={(e) =>
                    onProductSelect({
                      ...selectedProducts[0],
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                />
              </td>
              <td className="p-2">
                <select
                  name="unit"
                  id="unit"
                  value={selectedProducts[0]?.unit || ""}
                  onChange={(e) =>
                    onProductSelect({
                      ...selectedProducts[0],
                      unit: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                >
                  {measurementData.measurementCategories.flatMap((category) =>
                    category.units.map((unit) => (
                      <option
                        key={`${category.categoryName}-${unit.UQC}`} // composite unique key
                        value={unit.UQC}
                      >
                        {unit.unitName} ({unit.UQC})
                      </option>
                    ))
                  )}
                </select>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  name="rate"
                  id="rate"
                  min="0"
                  autoComplete="off"
                  value={selectedProducts[0]?.rate || "0"}
                  onChange={(e) =>
                    onProductSelect({
                      ...selectedProducts[0],
                      rate: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  name="discount"
                  id="discount"
                  min="0"
                  max="100"
                  autoComplete="off"
                  value={selectedProducts[0]?.discount || "0"}
                  onChange={(e) =>
                    onProductSelect({
                      ...selectedProducts[0],
                      discount: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                />
              </td>
              <td className="p-2">
                <div className="flex relative flex-col overflow-x-visible">
                  <input
                    type="text"
                    name="tax"
                    id="tax"
                    autoComplete="off"
                    ref={productTaxRef}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => {
                      setFilteredProducts(products);
                      setTaxDropdownVisible(true);
                      setHighlightedIndex(products.length > 0 ? 0 : -1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Select or Search Product"
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                  />
                  {taxDropdownVisible && (
                    <ul className="absolute z-50 top-[30px] whitespace-nowrap w-fit bg-white border border-gray-200 rounded-md max-h-52 overflow-y-auto shadow-md">
                        <li
                          className={`px-3 py-2 text-black cursor-pointer ${highlightedIndex === -1 ? "bg-gray-200" : "hover:bg-gray-100"
                            }`}
                          onClick={() => {
                            setTaxDropdownVisible(false);
                            setHighlightedIndex(-1);
                          }}
                        >
                          <p>No Tax Available</p>
                        </li>
                    </ul>
                  )}
                </div>
              </td>
              <td className="p-2">
                <input
                  type="text"
                  name="totalPrice"
                  id="totalPrice"
                  autoComplete="off"
                  value={
                    (
                      (parseFloat(selectedProducts[0]?.rate) || 0) *
                      (parseFloat(selectedProducts[0]?.quantity) || 0) *
                      (1 - (parseFloat(selectedProducts[0]?.discount) || 0) / 100) *
                      (1 + (parseFloat(selectedProducts[0]?.tax) || 0) / 100)
                    ).toFixed(2) || "0.00"
                  }
                  readOnly
                  placeholder="0.00"
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;