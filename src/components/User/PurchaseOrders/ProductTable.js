import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "../../Alert";
import { useUser } from "../../../context/userContext";
import measurementData from "../../../data/measurementCategories.json";
import gstData from "../../../data/gstRates.json";

const ProductTable = ({ purchaseOrder, handleInputChange, updateTotals }) => {
  const { user } = useUser();
  const [alert, setAlert] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [filteredTaxes, setFilteredTaxes] = useState([]);
  const [itemDropdownVisible, setItemDropdownVisible] = useState({});
  const [taxDropdownVisible, setTaxDropdownVisible] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState({ product: -1, tax: -1 });
  const [duplicateWarnings, setDuplicateWarnings] = useState({});
  const productDropdownRefs = useRef({});
  const taxDropdownRef = useRef();

  const gstRates = gstData.gstRates;
  const gstType = purchaseOrder.sourceState === purchaseOrder.deliveryState ? "intra" : "inter";

  //Fetch Items and Tax List
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/item/getItemList", {
          withCredentials: true,
        });
        if (response.data.success) {
          const fetchedProducts = response.data.data || [];
          setProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          setAlert({
            message: response.data.message || "Failed to fetch products.",
            type: "error",
          });
        }

        const taxResponse = await axios.get("/api/tax/getTax", {
          withCredentials: true,
        });
        if (taxResponse.data.success) {
          setTaxes(taxResponse.data.taxes || []);
        } else {
          setAlert({
            message: taxResponse.data.message || "Failed to fetch taxes.",
            type: "error",
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to retrieve items or taxes. Please try again later.";
        setAlert({ message: errorMessage, type: "error" });
      }
    };

    fetchData();
  }, [user]);

  console.log(products);

  //Handle click outside of custom product and custom tax dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedOutsideAll = true;
      Object.values(productDropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedOutsideAll = false;
        }
      });

      if (clickedOutsideAll) {
        setItemDropdownVisible({});
        setHighlightedIndex((prev) => ({ ...prev, product: -1 }));
      }

      if (taxDropdownRef.current && !taxDropdownRef.current.contains(event.target)) {
        setTaxDropdownVisible({});
        setHighlightedIndex((prev) => ({ ...prev, tax: -1 }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Set GST and Fatched Tax as Filterd tax to select
  useEffect(() => {
    const customGstRates = gstRates.map((rate) => {
      if (gstType === "intra") {
        return {
          label: `GST (${rate.intraState.cgst.rate + rate.intraState.sgst.rate}%)`,
          value: rate.totalRate,
          rate: rate.intraState.cgst.rate + rate.intraState.sgst.rate,
          type: "GST",
        };
      } else {
        return {
          label: `IGST (${rate.interState.igst.rate}%)`,
          value: rate.totalRate,
          rate: rate.interState.igst.rate,
          type: "IGST",
        };
      }
    });

    const formattedTaxes = taxes.map((tax) => ({
      label: `${tax.name} (${tax.rate}${tax.rateType === "Percent" ? "%" : ""})`,
      value: tax.rate,
      rate: tax.rate,
      description: tax.name,
      type: "custom",
    }));

    setFilteredTaxes([...customGstRates, ...formattedTaxes]);
  }, [gstType, gstRates, taxes]);

  //Calculate Totals based on Selected Producr and Set on PO
  const calculateTotals = (products, purchaseOrder) => {
    let totalBaseAmount = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let customTaxTotal = 0;

    products.forEach((product) => {
      const qty = parseFloat(product.quantity) || 0;
      const rate = parseFloat(product.rate) || 0;
      const subtotal = qty * rate;
      totalBaseAmount += subtotal;

      let discountAmount = 0;
      if (purchaseOrder.discountType === "Product") {
        const discountValue = parseFloat(product.inProductDiscount) || 0;
        discountAmount =
          product.inProductDiscountValueType === "Percent"
            ? (subtotal * discountValue) / 100
            : discountValue;
        totalDiscount += discountAmount;
      }
      taxableAmount += subtotal - discountAmount;

      product.taxes.forEach((tax) => {
        const taxAmount = parseFloat(tax.amount || 0);
        if (tax.type === "GST" && tax.subType === "CGST") {
          cgstTotal += taxAmount;
        } else if (tax.type === "GST" && tax.subType === "SGST") {
          sgstTotal += taxAmount;
        } else if (tax.type === "IGST") {
          igstTotal += taxAmount;
        } else if (tax.type === "custom") {
          customTaxTotal += taxAmount;
        }
      });
    });

    if (purchaseOrder.discountType === "Flat") {
      const discountValue = parseFloat(purchaseOrder.discount) || 0;
      if (discountValue > 0) {
        const flatDiscountAmount =
          purchaseOrder.discountValueType === "Percent"
            ? (totalBaseAmount * discountValue) / 100
            : discountValue;
        totalBaseAmount -= flatDiscountAmount;
        totalDiscount += flatDiscountAmount;
      }
    }

    const totalTax = cgstTotal + sgstTotal + igstTotal + customTaxTotal;
    let totalInclTax = taxableAmount + totalTax;
    let roundOffAmount = "0.00";

    if (purchaseOrder.roundOff) {
      const roundedTotal = Math.round(totalInclTax);
      roundOffAmount = (roundedTotal - totalInclTax).toFixed(2);
      totalInclTax = roundedTotal;
    }

    return {
      totalBaseAmount: totalBaseAmount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalInclTax: totalInclTax.toFixed(2),
      cgstTotal: cgstTotal.toFixed(2),
      sgstTotal: sgstTotal.toFixed(2),
      igstTotal: igstTotal.toFixed(2),
      customTaxTotal: customTaxTotal.toFixed(2),
      roundOffAmount,
    };
  };

  //Recalculate totals on Product change
  const recalculateProduct = (product, gstType, tax = null) => {
    const quantity = parseFloat(product.quantity) || 0;
    const rate = parseFloat(product.rate) || 0;
    const discountValue = parseFloat(product.inProductDiscount) || 0;
    const discount =
      product.inProductDiscountValueType === "Percent"
        ? discountValue / 100
        : discountValue;

    let amountBase = quantity * rate;
    const discountAmount =
      product.inProductDiscountValueType === "Percent"
        ? amountBase * discount
        : discount;
    amountBase -= discountAmount;

    let taxes = [];

    if (tax) {
      if (tax.type === "GST" && gstType === "intra") {
        const cgstRate = parseFloat(tax.rate) / 2 || 0;
        const sgstRate = parseFloat(tax.rate) / 2 || 0;
        taxes = [
          {
            type: "GST",
            subType: "CGST",
            rate: cgstRate,
            amount: ((cgstRate / 100) * amountBase).toFixed(2),
          },
          {
            type: "GST",
            subType: "SGST",
            rate: sgstRate,
            amount: ((sgstRate / 100) * amountBase).toFixed(2),
          },
        ];
      } else if (tax.type === "IGST" && gstType === "inter") {
        const igstRate = parseFloat(tax.rate) || 0;
        taxes = [
          {
            type: "IGST",
            subType: "IGST",
            rate: igstRate,
            amount: ((igstRate / 100) * amountBase).toFixed(2),
          },
        ];
      } else if (tax.type === "custom") {
        const customRate = parseFloat(tax.rate) || 0;
        taxes = [
          {
            type: "custom",
            subType: tax.description,
            rate: customRate,
            amount: ((customRate / 100) * amountBase).toFixed(2),
          },
        ];
      }
    } else if (product.taxes && product.taxes.length > 0) {
      taxes = product.taxes.map((t) => ({
        ...t,
        amount: ((t.rate / 100) * amountBase).toFixed(2),
      }));
    } else {
      taxes = gstType === "intra"
        ? [
          { type: "GST", subType: "CGST", rate: 0, amount: "0.00" },
          { type: "GST", subType: "SGST", rate: 0, amount: "0.00" },
        ]
        : [{ type: "IGST", subType: "IGST", rate: 0, amount: "0.00" }];
    }

    const totalTaxAmount = taxes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalPrice = (amountBase + totalTaxAmount).toFixed(2);

    return {
      ...product,
      taxes,
      totalPrice,
    };
  };

  //check duplicate product selected and show merge option
  const checkDuplicates = (updatedProducts) => {
    const newWarnings = {};
    updatedProducts.forEach((product, index) => {
      const existingIndex = updatedProducts.findIndex((p, i) => {
        if (i >= index) return false;
        if (product.productId && p.productId) {
          return product.productId === p.productId;
        }
        return product.productName && p.productName && product.productName.toLowerCase() === p.productName.toLowerCase();
      });
      if (existingIndex !== -1) {
        newWarnings[index] = existingIndex;
      }
    });
    setDuplicateWarnings(newWarnings);
  };

  //handle change in inputs and set it in PO
  const handleInputChangeProduct = (index, field, value) => {
    const updatedProducts = [...purchaseOrder.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };

    if (field === "inProductDiscountValueType") {
      updatedProducts[index] = {
        ...updatedProducts[index],
        inProductDiscount: "0",
        [field]: value,
      };
    }

    if (field === "productName") {
      const searchTerm = value.toLowerCase();
      const filtered = products.filter((product) =>
        product.itemName.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(filtered);
      setItemDropdownVisible((prev) => ({ ...prev, [index]: true }));
      updatedProducts[index].productId = "";
    }

    if (
      [
        "quantity",
        "rate",
        "inProductDiscount",
        "inProductDiscountValueType",
      ].includes(field)
    ) {
      updatedProducts[index] = recalculateProduct(updatedProducts[index], gstType);
    }

    handleInputChange({ target: { name: "products", value: updatedProducts } });
    checkDuplicates(updatedProducts);

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle selection of product and set tax,rates,units etc accordingly
  const handleProductSelect = (index, product) => {
    const updatedProducts = [...purchaseOrder.products];
    const quantity = parseFloat(updatedProducts[index].quantity) || 0;
    const rate = parseFloat(product.rate) || 0;
    const discountValue = parseFloat(updatedProducts[index].inProductDiscount) || 0;
    const discount =
      updatedProducts[index].inProductDiscountValueType === "Percent"
        ? discountValue / 100
        : discountValue;

    let amountBase = quantity * rate;
    const discountAmount =
      updatedProducts[index].inProductDiscountValueType === "Percent"
        ? amountBase * discount
        : discount;
    amountBase -= discountAmount;

    let taxes = [];
    let selectedTax = null;

    if (gstType === "intra" && product.intraStateGST) {
      selectedTax = filteredTaxes.find(
        (tax) => tax.type === "GST" && tax.rate === parseFloat(product.intraStateGST)
      );
    } else if (gstType === "inter" && product.interStateGST) {
      selectedTax = filteredTaxes.find(
        (tax) => tax.type === "IGST" && tax.rate === parseFloat(product.interStateGST)
      );
    }

    if (selectedTax) {
      if (gstType === "intra") {
        const cgstRate = parseFloat(selectedTax.rate) / 2 || 0;
        const sgstRate = parseFloat(selectedTax.rate) / 2 || 0;
        taxes = [
          {
            type: "GST",
            subType: "CGST",
            rate: cgstRate,
            amount: ((cgstRate / 100) * amountBase).toFixed(2),
          },
          {
            type: "GST",
            subType: "SGST",
            rate: sgstRate,
            amount: ((sgstRate / 100) * amountBase).toFixed(2),
          },
        ];
      } else {
        const igstRate = parseFloat(selectedTax.rate) || 0;
        taxes = [
          {
            type: "IGST",
            subType: "IGST",
            rate: igstRate,
            amount: ((igstRate / 100) * amountBase).toFixed(2),
          },
        ];
      }
    } else {
      taxes = gstType === "intra"
        ? [
          { type: "GST", subType: "CGST", rate: 0, amount: "0.00" },
          { type: "GST", subType: "SGST", rate: 0, amount: "0.00" },
        ]
        : [{ type: "IGST", subType: "IGST", rate: 0, amount: "0.00" }];
    }

    const totalTaxAmount = taxes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalPrice = (amountBase + totalTaxAmount).toFixed(2);

    updatedProducts[index] = {
      ...updatedProducts[index],
      productId: product.id,
      productName: product.itemName,
      rate: product.rate || "0",
      unit: product.unit || "nos",
      hsnOrSacCode: product.hsnOrSac,
      taxes,
      totalPrice,
    };

    handleInputChange({ target: { name: "products", value: updatedProducts } });
    setItemDropdownVisible((prev) => ({ ...prev, [index]: false }));
    setHighlightedIndex((prev) => ({ ...prev, product: -1 }));
    setFilteredProducts(products);
    checkDuplicates(updatedProducts);

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle Merge Duplicate peoduct
  const handleMergeDuplicate = (index, existingIndex) => {
    const updatedProducts = [...purchaseOrder.products];
    const existingQuantity = parseFloat(updatedProducts[existingIndex].quantity) || 0;
    const newQuantity = parseFloat(updatedProducts[index].quantity) || 0;
    updatedProducts[existingIndex].quantity = (existingQuantity + newQuantity).toString();
    updatedProducts[existingIndex] = recalculateProduct(updatedProducts[existingIndex], gstType);

    updatedProducts.splice(index, 1);

    handleInputChange({ target: { name: "products", value: updatedProducts } });
    checkDuplicates(updatedProducts);

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle Tax change and set new selectes tax to po and trigger recalculation method
  const handleTaxSelect = (index, tax) => {
    const updatedProducts = [...purchaseOrder.products];
    const product = updatedProducts[index];
    const quantity = parseFloat(product.quantity) || 0;
    const rate = parseFloat(product.rate) || 0;
    const discountValue = parseFloat(product.inProductDiscount) || 0;
    const discount = product.inProductDiscountValueType === "Percent" ? discountValue / 100 : discountValue;

    let amountBase = quantity * rate;
    const discountAmount = product.inProductDiscountValueType === "Percent" ? amountBase * discount : discount;
    amountBase -= discountAmount;

    let taxes = [];

    if (tax.type === "GST" && gstType === "intra") {
      const cgstRate = parseFloat(tax.rate) / 2 || 0;
      const sgstRate = parseFloat(tax.rate) / 2 || 0;
      taxes = [
        {
          type: "GST",
          subType: "CGST",
          rate: cgstRate,
          amount: ((cgstRate / 100) * amountBase).toFixed(2),
        },
        {
          type: "GST",
          subType: "SGST",
          rate: sgstRate,
          amount: ((sgstRate / 100) * amountBase).toFixed(2),
        },
      ];
    } else if (tax.type === "IGST" && gstType === "inter") {
      const igstRate = parseFloat(tax.rate) || 0;
      taxes = [
        {
          type: "IGST",
          subType: "IGST",
          rate: igstRate,
          amount: ((igstRate / 100) * amountBase).toFixed(2),
        },
      ];
    } else if (tax.type === "custom") {
      const customRate = parseFloat(tax.rate) || 0;
      taxes = [
        {
          type: "custom",
          subType: tax.description,
          rate: customRate,
          amount: ((customRate / 100) * amountBase).toFixed(2),
        },
      ];
    }

    const totalTaxAmount = taxes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalPrice = (amountBase + totalTaxAmount).toFixed(2);

    updatedProducts[index] = {
      ...product,
      taxes,
      totalPrice,
    };

    handleInputChange({ target: { name: "products", value: updatedProducts } });
    setTaxDropdownVisible((prev) => ({ ...prev, [index]: false }));
    setHighlightedIndex((prev) => ({ ...prev, tax: -1 }));

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle select Product with key's
  const handleProductKeyDown = (e, index) => {
    if (!itemDropdownVisible[index]) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setItemDropdownVisible((prev) => ({ ...prev, [index]: true }));
        setHighlightedIndex((prev) => ({ ...prev, product: 0 }));
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => ({
        ...prev,
        product: Math.min(prev.product + 1, filteredProducts.length - 1),
      }));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => ({
        ...prev,
        product: Math.max(prev.product - 1, 0),
      }));
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIndex.product >= 0) {
      handleProductSelect(index, filteredProducts[highlightedIndex.product]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setItemDropdownVisible((prev) => ({ ...prev, [index]: false }));
      setHighlightedIndex((prev) => ({ ...prev, product: -1 }));
      setFilteredProducts(products);
      e.preventDefault();
    }
  };

  //Handle select Tax with key's
  const handleTaxKeyDown = (e, index) => {
    if (!taxDropdownVisible[index]) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setTaxDropdownVisible((prev) => ({ ...prev, [index]: true }));
        setHighlightedIndex((prev) => ({ ...prev, tax: 0 }));
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => ({
        ...prev,
        tax: Math.min(prev.tax + 1, filteredTaxes.length - 1),
      }));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => ({
        ...prev,
        tax: Math.max(prev.tax - 1, 0),
      }));
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIndex.tax >= 0) {
      handleTaxSelect(index, filteredTaxes[highlightedIndex.tax]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setTaxDropdownVisible((prev) => ({ ...prev, [index]: false }));
      setHighlightedIndex((prev) => ({ ...prev, tax: -1 }));
      e.preventDefault();
    }
  };

  //Handle add new peoduct to list
  const handleAddProduct = () => {
    const newProduct = {
      productId: "",
      productName: "",
      quantity: "0",
      unit: "nos",
      rate: "0",
      inProductDiscount: "0",
      inProductDiscountValueType: purchaseOrder.discountValueType || "Percent",
      taxes: gstType === "intra"
        ? [
          { type: "GST", subType: "CGST", rate: 0, amount: "0.00" },
          { type: "GST", subType: "SGST", rate: 0, amount: "0.00" },
        ]
        : [{ type: "IGST", subType: "IGST", rate: 0, amount: "0.00" }],
      totalPrice: "0",
    };
    const updatedProducts = [...purchaseOrder.products, newProduct];
    handleInputChange({ target: { name: "products", value: updatedProducts } });
    checkDuplicates(updatedProducts);

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle Remove Peoduct from list
  const handleRemoveProduct = (index) => {
    const updatedProducts = purchaseOrder.products.filter((_, i) => i !== index);
    handleInputChange({ target: { name: "products", value: updatedProducts } });
    checkDuplicates(updatedProducts);

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle Discount type change for InProdct and Flat Discount
  const handleDiscountTypeChange = (value) => {
    const updatedProducts = purchaseOrder.products.map((product) => {
      const resetProduct = {
        ...product,
        inProductDiscount: "0",
        inProductDiscountValueType: "Percent",
      };
      return recalculateProduct(resetProduct, gstType);
    });

    handleInputChange(
      { target: { name: "discountType", value } },
      { target: { name: "discount", value: "0" } },
      { target: { name: "discountValueType", value: "Percent" } },
      { target: { name: "products", value: updatedProducts } }
    );

    const totals = calculateTotals(updatedProducts, purchaseOrder);
    updateTotals(totals);
  };

  //Handle Discount Value type change for amount and precent based discount
  const handleDiscountValueTypeChange = (value) => {
    handleInputChange(
      { target: { name: "discountValueType", value } },
      { target: { name: "discount", value: "0" } }
    );

    const totals = calculateTotals(purchaseOrder.products, {
      ...purchaseOrder,
      discountValueType: value,
      discount: "0",
    });
    updateTotals(totals);
  };

  //Handle Discount change and trigger Calculate Totals
  const handleDiscountChange = (value) => {
    handleInputChange({ target: { name: "discount", value } });

    const totals = calculateTotals(purchaseOrder.products, {
      ...purchaseOrder,
      discount: value,
    });
    updateTotals(totals);
  };

  //Hanlde Round off amout to nearest value
  const handleRoundOffChange = (e) => {
    const roundOff = e.target.checked;
    handleInputChange({ target: { name: "roundOff", value: roundOff } });

    const totals = calculateTotals(purchaseOrder.products, {
      ...purchaseOrder,
      roundOff,
    });
    updateTotals(totals);
  };

  const totals = calculateTotals(purchaseOrder.products, purchaseOrder);
  const hasCustomTax = parseFloat(totals.customTaxTotal) > 0;
  const showTaxBreakdown = parseFloat(totals.cgstTotal) > 0 || parseFloat(totals.sgstTotal) > 0 || parseFloat(totals.igstTotal) > 0;

  return (
    <div className="flex flex-col w-full">
      <div className="overflow-x-visible">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-2 w-[270px]">Product Name</th>
              <th className="p-2 w-[60px] text-right">Quantity</th>
              <th className="p-2 w-[80px] text-right">Unit</th>
              <th className="p-2 w-[60px] text-right">Rate</th>
              {purchaseOrder.discountType === "Product" ? (
                <th className="p-2 w-[70px] text-right">Discount</th>
              ) : null}
              <th className="p-2 w-[70px] text-right">Tax</th>
              <th className="p-2 w-[80px] text-right">Total Price</th>
              <th className="p-2 w-[80px] text-right"></th>
            </tr>
          </thead>
          <tbody className="border-b border-gray-300">
            {purchaseOrder.products.map((product, index) => (
              <tr key={index}>
                <td className="p-2 overflow-x-visible">
                  <div
                    ref={(el) => (productDropdownRefs.current[index] = el)}
                    className="flex relative flex-col overflow-x-visible"
                  >
                    <input
                      type="text"
                      name="productName"
                      id={`productName-${index}`}
                      autoComplete="off"
                      value={product.productName}
                      onClick={() =>
                        setItemDropdownVisible((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      onKeyDown={(e) => handleProductKeyDown(e, index)}
                      onChange={(e) =>
                        handleInputChangeProduct(index, "productName", e.target.value)
                      }
                      placeholder="Select or Search Product"
                      aria-label={`Search products for row ${index + 1}`}
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                    />
                    {itemDropdownVisible[index] && (
                      <div className="absolute top-[30px] z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                        <ul className="max-h-40 overflow-y-auto">
                          {filteredProducts.map((prod, prodIndex) => (
                            <li
                              key={prod.id}
                              className={`p-2 cursor-pointer hover:bg-gray-200 ${highlightedIndex.product === prodIndex ? "bg-gray-200" : ""
                                }`}
                              onClick={() => handleProductSelect(index, prod)}
                              onMouseEnter={() =>
                                setHighlightedIndex((prev) => ({ ...prev, product: prodIndex }))
                              }
                              onMouseLeave={() =>
                                setHighlightedIndex((prev) => ({ ...prev, product: -1 }))
                              }
                            >
                              {prod.itemName}
                            </li>
                          ))}
                        </ul>
                        {filteredProducts.length === 0 && (
                          <div className="p-2 text-gray-500">No products found</div>
                        )}
                      </div>
                    )}
                    {duplicateWarnings[index] !== undefined && (
                      <div className="text-red-500 text-xs mt-1">
                        This product is already added in row {duplicateWarnings[index] + 1}.{" "}
                        <button
                          type="button"
                          className="text-customPrimary hover:underline"
                          onClick={() => handleMergeDuplicate(index, duplicateWarnings[index])}
                          aria-label={`Merge duplicate product in row ${index + 1}`}
                        >
                          Merge
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="quantity"
                    id={`quantity-${index}`}
                    autoComplete="off"
                    min="0"
                    value={product.quantity}
                    onChange={(e) =>
                      handleInputChangeProduct(index, "quantity", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm text-right"
                  />
                </td>
                <td className="p-2">
                  <select
                    name="unit"
                    id={`unit-${index}`}
                    value={product.unit}
                    onChange={(e) =>
                      handleInputChangeProduct(index, "unit", e.target.value)
                    }
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                  >
                    {measurementData.measurementCategories.flatMap((category) =>
                      category.units.map((unit) => (
                        <option
                          key={`${category.categoryName}-${unit.UQC}`}
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
                    id={`rate-${index}`}
                    min="0"
                    autoComplete="off"
                    value={product.rate}
                    onChange={(e) =>
                      handleInputChangeProduct(index, "rate", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm text-right"
                  />
                </td>
                {purchaseOrder.discountType === "Product" ? (
                  <td className="p-2">
                    <div className="flex justify-between px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm">
                      <input
                        type="number"
                        name="inProductDiscount"
                        id={`inProductDiscount-${index}`}
                        min="0"
                        max={product.inProductDiscountValueType === "Percent" ? "100" : undefined}
                        autoComplete="off"
                        value={product.inProductDiscount}
                        onChange={(e) =>
                          handleInputChangeProduct(index, "inProductDiscount", e.target.value)
                        }
                        placeholder="0"
                        className="w-full border-none outline-none text-gray-700 text-sm text-right"
                      />
                      <select
                        name="inProductDiscountValueType"
                        id={`inProductDiscountValueType-${index}`}
                        value={product.inProductDiscountValueType}
                        onChange={(e) =>
                          handleInputChangeProduct(index, "inProductDiscountValueType", e.target.value)
                        }
                        className="outline-none"
                      >
                        <option value="Percent">%</option>
                        <option value="Amount">₹</option>
                      </select>
                    </div>
                  </td>
                ) : null}
                <td className="p-2">
                  <div
                    ref={taxDropdownRef}
                    className="flex relative flex-col overflow-x-visible"
                  >
                    <input
                      type="text"
                      name="tax"
                      id={`tax-${index}`}
                      autoComplete="off"
                      value={
                        product.taxes && product.taxes.length > 0
                          ? product.taxes[0].type === "custom"
                            ? `${product.taxes[0].subType} ${product.taxes[0].rate}%`
                            : gstType === "intra"
                              ? `CGST ${product.taxes[0]?.rate || 0}% + SGST ${product.taxes[1]?.rate || 0}%`
                              : `IGST ${product.taxes[0]?.rate || 0}%`
                          : "Select Tax"
                      }
                      onClick={() =>
                        setTaxDropdownVisible((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      onKeyDown={(e) => handleTaxKeyDown(e, index)}
                      readOnly
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm text-right"
                    />
                    {taxDropdownVisible[index] && (
                      <div className="absolute top-[30px] z-20 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <ul className="max-h-40 overflow-y-auto">
                          {filteredTaxes.map((tax, taxIndex) => (
                            <li
                              key={`${tax.type}-${tax.value}`}
                              className={`p-2 cursor-pointer hover:bg-gray-200 ${highlightedIndex.tax === taxIndex ? "bg-gray-200" : ""
                                }`}
                              onClick={() => handleTaxSelect(index, tax)}
                              onMouseEnter={() =>
                                setHighlightedIndex((prev) => ({ ...prev, tax: taxIndex }))
                              }
                              onMouseLeave={() =>
                                setHighlightedIndex((prev) => ({ ...prev, tax: -1 }))
                              }
                            >
                              {tax.label}
                            </li>
                          ))}
                        </ul>
                        {filteredTaxes.length === 0 && (
                          <div className="p-2 text-gray-500">
                            No taxes found
                            <button
                              type="button"
                              className="text-customPrimary hover:underline"
                              onClick={() => {
                                console.log("Add new tax clicked");
                              }}
                            >
                              +Add New
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    name="totalPrice"
                    id={`totalPrice-${index}`}
                    autoComplete="off"
                    readOnly
                    value={product.totalPrice}
                    placeholder="0.00"
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm text-right"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className={`p-0 focus:outline-none ${purchaseOrder.products.length === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-customPrimary hover:underline"
                      }`}
                    onClick={() => handleRemoveProduct(index)}
                    disabled={purchaseOrder.products.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={purchaseOrder.discountType === "Flat" ? 2 : 3} className="align-top p-2 text-left">
                <button
                  type="button"
                  className="p-0 text-customPrimary focus:outline-none hover:underline"
                  onClick={handleAddProduct}
                >
                  + Add Product
                </button>
              </td>
              <td colSpan={purchaseOrder.discountType === "Flat" ? 4 : 4} className="m-2 p-2">
                <div className="flex flex-col text-gray-700 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold">Subtotal (Excl. Tax & Discount):</span>
                    <span>{totals.totalBaseAmount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold">Discount:</span>
                    <span className="flex items-center">
                      <input
                        type="radio"
                        name="discountType"
                        id="discountTypeFlat"
                        value="Flat"
                        checked={purchaseOrder.discountType === "Flat"}
                        onChange={() => handleDiscountTypeChange("Flat")}
                        className="rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm"
                      />
                      <label htmlFor="discountTypeFlat" className="ms-1">Flat</label>
                      <input
                        type="radio"
                        name="discountType"
                        id="discountTypeProduct"
                        value="Product"
                        checked={purchaseOrder.discountType === "Product"}
                        onChange={() => handleDiscountTypeChange("Product")}
                        className="rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm ms-2"
                      />
                      <label htmlFor="discountTypeProduct" className="ms-1">Product</label>
                      {purchaseOrder.discountType === "Flat" && (
                        <div className="flex w-[100px] justify-between mx-2 py-1 rounded-lg border border-gray-300 focus:outline-customSecondary text-gray-700 text-sm">
                          <input
                            type="number"
                            name="discount"
                            id="discount"
                            min="0"
                            max={purchaseOrder.discountValueType === "Percent" ? "100" : undefined}
                            autoComplete="off"
                            value={purchaseOrder.discount}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            placeholder="0"
                            className="w-full border-none outline-none text-gray-700 text-sm text-right"
                          />
                          <select
                            name="discountValueType"
                            id="discountValueType"
                            value={purchaseOrder.discountValueType}
                            onChange={(e) => handleDiscountValueTypeChange(e.target.value)}
                            className="outline-none"
                          >
                            <option value="Percent">%</option>
                            <option value="Amount">₹</option>
                          </select>
                        </div>
                      )}
                      <span className="ps-2">-{totals.totalDiscount}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold">Taxable Amount:</span>
                    <span>{totals.taxableAmount}</span>
                  </div>
                  {(hasCustomTax || showTaxBreakdown) && (
                    <>
                      {hasCustomTax && (
                        <div className="flex justify-between items-center py-1">
                          <span className="font-semibold">Total Custom Tax:</span>
                          <span>₹{totals.customTaxTotal}</span>
                        </div>
                      )}
                      {showTaxBreakdown && (
                        <>
                          {gstType === "intra" ? (
                            <>
                              <div className="flex justify-between items-center py-1">
                                <span className="font-semibold">Total CGST:</span>
                                <span>{totals.cgstTotal}</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="font-semibold">Total SGST:</span>
                                <span>{totals.sgstTotal}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center py-1">
                              <span className="font-semibold">Total IGST:</span>
                              <span>{totals.igstTotal}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="flex items-center font-semibold">
                      Round Off
                      <input
                        type="checkbox"
                        name="roundOff"
                        id="roundOff"
                        checked={purchaseOrder.roundOff}
                        onChange={handleRoundOffChange}
                        className="ms-2 rounded border-gray-300 focus:ring-customSecondary"
                      />
                    </span>
                    <span>{totals.roundOffAmount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 mt-2 border-t border-gray-300 pt-2">
                    <span className="font-semibold text-base">Total (incl. Tax):</span>
                    <span className="text-base font-semibold">₹{totals.totalInclTax}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          handleClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default ProductTable;