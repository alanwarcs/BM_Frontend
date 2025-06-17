import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectInput from "../ReusableComponents/SelectInput";
import UserLayout from "../ReusableComponents/UserLayout";
import TextInput from "../ReusableComponents/TextInput";
import { Link } from "react-router-dom";
import Alert from "../../Alert";
import axios from "axios";
import { useUser } from "../../../context/userContext";
import VendorDropdown from "../ReusableComponents/VendorDropdown";
import { State } from "country-state-city";
import ProductTable from "./ProductTable";
import PreviewModal from "../ReusableComponents/PreviewModal";
import PurchaseOrderPreview from "../PurchaseOrders/PurchaseOrderPreview";
import gstRatesData from '../../../data/gstRates.json'; // Adjust path as needed

const today = new Date();
const nextYear = new Date();
nextYear.setFullYear(today.getFullYear() + 1);

const formatDate = (date) => date.toISOString().split("T")[0];

const CreatePurchaseorder = () => {
  const { user } = useUser();
  const [alert, setAlert] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [states, setStates] = useState([]);
  const [availableStorage, setAvailableStorage] = useState([]);
  const [userAddress, setUserAddress] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [taxes, setTaxes] = useState([]);

  const [purchaseOrder, setPurchaseOrder] = useState({
    business: {
      id: user ? user.organization.businessId : "",
      name: "",
      gstinStatus: "",
      gstin: "",
      state: "",
      address: "",
      phone: "",
      email: "",
    },
    vendor: {
      id: "",
      name: "",
      gstin: "",
      gstStatus: "",
      state: "",
      address: "",
      phone: "",
    },
    poNumber: "",
    orderDate: formatDate(today),
    isBillGenerated: false,
    dueDate: "",
    status: "Pending",
    paymentStatus: "UnPaid",
    paymentType: "",
    referenceNumber: "",
    note: "",
    address: {
      billing: "",
      shipping: "",
      sourceState: "",
      deliveryState: "",
      deliveryLocation: "",
    },
    products: [
      {
        productId: "",
        productName: "",
        hsnOrSacCode: "",
        quantity: "0",
        unit: "nos",
        rate: "0",
        inProductDiscount: "0",
        inProductDiscountValueType: "Percent",
        taxes: [],
        totalPrice: "0",
      },
    ],
    emiDetails: {
      frequency: "",
      interestRate: 0,
      totalWithInterest: "0",
      advancePayment: "0",
      installments: [],
    },
    discount: "0",
    discountType: "Flat",
    discountValueType: "Percent",
    totalAmountOfDiscount: "0",
    subtotal: "0",
    totalBeforeDiscount: "0",
    roundOff: false,
    roundOffAmount: "0",
    taxAmount: "0",
    grandAmount: "0",
    paidAmount: "0",
    dueAmount: "0",
    deliveryTerms: "-",
    termsAndConditions:
      "Payment is due within 30 days of receipt of goods. Please reference the purchase order number on all invoices. Goods must be delivered to the specified shipping address. Any discrepancies must be reported within 7 days of receipt.",
    attachments: [],
    createdBy: user ? user.id : "",
    updatedBy: user ? user.id : "",
    isDeleted: false,
  });

  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const poRes = await axios.get("/api/purchase-order/generate", {
          withCredentials: true,
          signal: controller.signal,
        });
        if (poRes.status === 200 && poRes.data?.organization?.address) {
          const { purchaseOrderId, organization } = poRes.data;
          const address = organization.address;
          const formattedAddress =
            address.address && address.state && address.country && address.pincode
              ? `${address.address}, ${address.state}, ${address.country}, ${address.pincode}`
              : "";
          const userAddressOption = {
            value: formattedAddress,
            label: formattedAddress ? `${user?.name || "User"}, ${address.state}` : "Default Address",
            state: address.state || "",
          };
          setUserAddress(userAddressOption);
          setPurchaseOrder((prev) => ({
            ...prev,
            poNumber: purchaseOrderId || `PO-${Date.now()}`,
            business: {
              id: user.organization.businessId,
              name: organization.name || "",
              gstinStatus: organization.gstStatus || "",
              gstin: organization.gstNumber || "",
              state: address.state || "",
              address: formattedAddress,
              phone: organization.phone || "",
              email: organization.email || "",
            },
            address: {
              ...prev.address,
              deliveryState: address.state || "",
              billing: formattedAddress,
              shipping: formattedAddress,
              deliveryLocation: formattedAddress,
            },
          }));
        } else {
          setAlert({ message: "Invalid organization address data", type: "error" });
        }

        const vendorRes = await axios.get("/api/vendor/vendors/list", {
          signal: controller.signal,
        });
        if (vendorRes.status === 200 && vendorRes.data?.data) {
          setVendors(vendorRes.data.data);
        } else {
          setAlert({ message: "No vendors found", type: "error" });
        }

        const storageRes = await axios.get("/api/storage/getList", {
          signal: controller.signal,
        });
        setAvailableStorage(storageRes.data?.data?.storage || []);

        const taxRes = await axios.get("/api/tax/getTax", {
          withCredentials: true,
          signal: controller.signal,
        });
        if (taxRes.data.success) {
          setTaxes(taxRes.data.taxes || []);
        } else {
          setAlert({ message: "Failed to fetch taxes", type: "error" });
        }

        const allStates = State.getStatesOfCountry("IN") || [];
        setStates(allStates);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setAlert({ message: err.response?.data?.message || "Error fetching initial data", type: "error" });
      }
    };
    fetchData();
    return () => controller.abort();
  }, [user?.organization?.businessId, user?.name, user?.id]);

  // Handle Attachment Selection
  const handleAttachmentChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAlert({ message: "No files selected", type: "error" });
      return;
    }

    const files = Array.from(e.target.files);
    const maxAttachments = 2;
    const maxFileSize = 3 * 1024 * 1024; // 3 MB
    const allowedTypes = ["application/pdf", "image/jpeg"];

    if (attachmentFiles.length + files.length > maxAttachments) {
      setAlert({ message: `You can only upload up to ${maxAttachments} attachments.`, type: "error" });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.name) {
        setAlert({ message: "Invalid file: missing name.", type: "error" });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          message: `File ${file.name} is not a valid type. Only PDF and JPG/JPEG files are allowed.`,
          type: "error",
        });
        return false;
      }
      if (file.size > maxFileSize) {
        setAlert({ message: `File ${file.name} exceeds 3 MB limit.`, type: "error" });
        return false;
      }
      if (file.size === 0) {
        setAlert({ message: `File ${file.name} is empty.`, type: "error" });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setAlert({ message: "No valid files selected", type: "error" });
      return;
    }

    // Save actual files for FormData
    setAttachmentFiles((prev) => [...prev, ...validFiles]);

    // Save metadata in purchaseOrder.attachments
    setPurchaseOrder((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        ...validFiles.map((file) => ({
          fileName: file.name,
          filePath: `/Uploads/${file.name}`,
          uploadedBy: user.id,
          uploadedAt: new Date(),
        })),
      ],
    }));
  };

  // Remove Selected Attachment
  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    setPurchaseOrder((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Drag and Drop Methods for Attachment
  const handleDragOver = (e) => {
    e.preventDefault();
    if (attachmentFiles.length < 2) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (attachmentFiles.length < 2) {
      const files = Array.from(e.dataTransfer.files);
      handleAttachmentChange({ target: { files } });
    }
  };

  // Update Totals
  const updateTotals = (totals) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      totalAmountOfDiscount: totals.totalDiscount,
      taxAmount: totals.totalTax,
      subtotal: totals.totalBaseAmount,
      totalBeforeDiscount: totals.taxableAmount,
      grandAmount: totals.totalInclTax,
      dueAmount: (parseFloat(totals.totalInclTax) - parseFloat(prev.paidAmount)).toFixed(2),
      roundOffAmount: totals.roundOffAmount,
    }));
  };

  // Generate filtered taxes based on gstType
  const getFilteredTaxes = (gstType) => {
    const gstRates = gstRatesData.gstRates;

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

    return [...customGstRates, ...formattedTaxes];
  };

  // Handle input changes
  const handleInputChange = async (...events) => {
    let updatedPurchaseOrder = { ...purchaseOrder };
    for (const event of events) {
      if (!event || !event.target || typeof event.target !== "object") {
        setAlert({ message: "Invalid input event", type: "error" });
        continue;
      }

      const { name, value } = event.target;

      // Handle nested fields
      const setNestedValue = (obj, path, val) => {
        const keys = path.split(".");
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;
      };

      if (name.includes(".")) {
        setNestedValue(updatedPurchaseOrder, name, value);
      } else if (name === "dueDate" && value && updatedPurchaseOrder.orderDate) {
        const dueDate = new Date(value);
        const orderDate = new Date(updatedPurchaseOrder.orderDate);
        if (dueDate < orderDate) {
          setAlert({ message: "Due date cannot be before order date", type: "error" });
          return;
        }
        updatedPurchaseOrder.dueDate = value;
      } else if (name === "products") {
        updatedPurchaseOrder.products = value;
      } else {
        updatedPurchaseOrder[name] = name === "roundOff" ? value === "true" || value === true : value;
      }

      if (name === "address.deliveryLocation" && value) {
        let storageState = "";
        let storageAddress = "";
        if (userAddress && value === userAddress.value) {
          storageState = userAddress.state || "";
          storageAddress = userAddress.value;
        } else {
          try {
            const response = await axios.get(`/api/storage/getStorageDetails/${value}`);
            storageState = response.data?.storage?.storageState || "";
            storageAddress = response.data?.storage?.storageAddress || "";
          } catch (error) {
            setAlert({ message: error.response?.data?.message || "Failed to fetch storage details.", type: "error" });
            continue;
          }
        }

        const gstType = updatedPurchaseOrder.address.sourceState === storageState ? "intra" : "inter";
        const filteredTaxes = getFilteredTaxes(gstType);
        const updatedProducts = recalculateProductTaxes(
          updatedPurchaseOrder.products,
          updatedPurchaseOrder.address.sourceState,
          storageState,
          filteredTaxes
        );

        updatedPurchaseOrder.address = {
          ...updatedPurchaseOrder.address,
          deliveryState: storageState,
          shipping: storageAddress,
          deliveryLocation: value,
        };
        updatedPurchaseOrder.products = updatedProducts;
      } else if (name === "address.deliveryState") {
        const gstType = updatedPurchaseOrder.address.sourceState === value ? "intra" : "inter";
        const filteredTaxes = getFilteredTaxes(gstType);
        const updatedProducts = recalculateProductTaxes(
          updatedPurchaseOrder.products,
          updatedPurchaseOrder.address.sourceState,
          value,
          filteredTaxes
        );

        updatedPurchaseOrder.address = {
          ...updatedPurchaseOrder.address,
          deliveryState: value,
        };
        updatedPurchaseOrder.products = updatedProducts;
      }
    }

    setPurchaseOrder(updatedPurchaseOrder);

    // Recalculate totals
    const totals = calculateTotals(updatedPurchaseOrder.products, updatedPurchaseOrder);
    updateTotals(totals);
  };

  // Re-Calculate Product Tax
  const recalculateProductTaxes = (products, sourceState, deliveryState, filteredTaxes) => {
    const gstType = sourceState === deliveryState ? "intra" : "inter";
    return products.map((product) => {
      const quantity = parseFloat(product.quantity) || 0;
      const rate = parseFloat(product.rate) || 0;
      const discountValue = parseFloat(product.inProductDiscount) || 0;
      const discount = product.inProductDiscountValueType === "Percent" ? discountValue / 100 : discountValue;

      let amountBase = quantity * rate;
      const discountAmount = product.inProductDiscountValueType === "Percent" ? amountBase * discount : discount;
      amountBase -= discountAmount;

      const currentTaxRate = product.taxes && product.taxes.length > 0
        ? product.taxes.reduce((sum, t) => sum + parseFloat(t.rate || 0), 0)
        : 0;

      let taxes = [];
      let matchingTax = null;

      if (currentTaxRate > 0) {
        matchingTax = filteredTaxes.find(
          (tax) =>
            tax.rate === currentTaxRate &&
            (
              (gstType === "intra" && tax.type === "GST") ||
              (gstType === "inter" && tax.type === "IGST") ||
              tax.type === "custom"
            )
        );

        if (!matchingTax) {
          matchingTax = filteredTaxes.find(
            (tax) =>
              tax.rate === currentTaxRate &&
              (tax.type === "GST" || tax.type === "IGST" || tax.type === "custom")
          );
        }
      }

      if (!matchingTax) {
        matchingTax = filteredTaxes.find(
          (tax) =>
            (gstType === "intra" && tax.type === "GST") ||
            (gstType === "inter" && tax.type === "IGST") ||
            tax.type === "custom"
        );
      }

      if (matchingTax) {
        if (gstType === "intra" && matchingTax.type === "GST") {
          const cgstRate = parseFloat(matchingTax.rate) / 2 || 0;
          const sgstRate = parseFloat(matchingTax.rate) / 2 || 0;
          taxes = [
            {
              type: "GST",
              subType: "CGST",
              rate: cgstRate,
              amount: ((cgstRate / 100) * amountBase).toFixed(2).toString(),
            },
            {
              type: "GST",
              subType: "SGST",
              rate: sgstRate,
              amount: ((sgstRate / 100) * amountBase).toFixed(2).toString(),
            },
          ];
        } else if (gstType === "inter" && matchingTax.type === "IGST") {
          const igstRate = parseFloat(matchingTax.rate) || 0;
          taxes = [
            {
              type: "IGST",
              subType: "IGST",
              rate: igstRate,
              amount: ((igstRate / 100) * amountBase).toFixed(2).toString(),
            },
          ];
        } else if (matchingTax.type === "custom") {
          const customRate = parseFloat(matchingTax.rate) || 0;
          taxes = [
            {
              type: "custom",
              subType: matchingTax.description || "Custom Tax",
              rate: customRate,
              amount: ((customRate / 100) * amountBase).toFixed(2).toString(),
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
        setAlert({ message: "No matching tax found, defaulting to zero tax rate", type: "warning" });
      }

      const totalTaxAmount = taxes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const totalPrice = (amountBase + totalTaxAmount).toFixed(2).toString();

      return {
        ...product,
        taxes,
        totalPrice,
      };
    });
  };

  // Calculate Totals
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
        totalDiscount += flatDiscountAmount;
        taxableAmount -= flatDiscountAmount; // Apply flat discount to taxable amount
      }
    }

    const totalTax = cgstTotal + sgstTotal + igstTotal + customTaxTotal;
    let totalInclTax = taxableAmount + totalTax;
    let roundOffAmount = "0.00";

    if (purchaseOrder.roundOff) {
      const roundedTotal = Math.round(totalInclTax);
      roundOffAmount = (roundedTotal - totalInclTax).toFixed(2).toString();
      totalInclTax = roundedTotal;
    }

    return {
      totalBaseAmount: totalBaseAmount.toFixed(2).toString(),
      totalDiscount: totalDiscount.toFixed(2).toString(),
      taxableAmount: taxableAmount.toFixed(2).toString(), // Corrected: taxableAmount before tax
      totalTax: totalTax.toFixed(2).toString(),
      totalInclTax: totalInclTax.toFixed(2).toString(),
      cgstTotal: cgstTotal.toFixed(2).toString(),
      sgstTotal: sgstTotal.toFixed(2).toString(),
      igstTotal: igstTotal.toFixed(2).toString(),
      customTaxTotal: customTaxTotal.toFixed(2).toString(),
      roundOffAmount,
    };
  };

  // Handle selected vendor
  const handleVendorSelect = async ({ vendorId, vendorName }) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      vendor: { ...prev.vendor, id: vendorId, name: vendorName },
    }));

    if (!vendorId) {
      setPurchaseOrder((prev) => ({
        ...prev,
        address: { ...prev.address, sourceState: "" },
      }));
      return;
    }

    try {
      const response = await axios.get(`/api/vendor/getVendorDetails/${vendorId}`);
      const vendorDetails = response?.data?.vendorDetails;
      const vendorAddress = vendorDetails.billingAddress.addressLine1 && vendorDetails.billingAddress.city && vendorDetails.billingAddress.state && vendorDetails.billingAddress.country && vendorDetails.billingAddress.postalCode
        ? `${vendorDetails.billingAddress.addressLine1}, ${vendorDetails.billingAddress.city}, ${vendorDetails.billingAddress.state}, ${vendorDetails.billingAddress.country}, ${vendorDetails.billingAddress.postalCode}`
        : "";

      if (vendorDetails) {
        const gstType = vendorDetails.taxDetails?.sourceState === purchaseOrder.address.deliveryState ? "intra" : "inter";
        const filteredTaxes = getFilteredTaxes(gstType);
        const updatedProducts = recalculateProductTaxes(
          purchaseOrder.products,
          vendorDetails.taxDetails?.sourceState,
          purchaseOrder.address.deliveryState,
          filteredTaxes
        );

        setPurchaseOrder((prev) => ({
          ...prev,
          vendor: {
            id: vendorId,
            name: vendorName,
            gstin: vendorDetails.taxDetails?.gstin || "",
            gstStatus: vendorDetails.taxDetails?.taxStatus || "",
            state: vendorDetails.taxDetails?.sourceState || "",
            address: vendorAddress || "",
            phone: vendorDetails.phone || "",
          },
          address: {
            ...prev.address,
            sourceState: vendorDetails.taxDetails?.sourceState || "",
          },
          products: updatedProducts,
        }));

        const totals = calculateTotals(updatedProducts, purchaseOrder);
        updateTotals(totals);
      } else {
        setAlert({ message: "Vendor details not found.", type: "error" });
      }
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Failed to fetch selected vendor's details.", type: "error" });
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    let errorMessage = "";

    if (!purchaseOrder.business.id) {
      errorMessage = "You must be logged in to create a purchase order.";
      isValid = false;
    } else if (!purchaseOrder.vendor.id) {
      errorMessage = "Please select a vendor for the purchase order.";
      isValid = false;
    } else if (!purchaseOrder.poNumber || purchaseOrder.poNumber.trim() === "") {
      errorMessage = "Purchase order number is required.";
      isValid = false;
    } else if (!purchaseOrder.orderDate) {
      errorMessage = "Order date is required.";
      isValid = false;
    } else if (purchaseOrder.dueDate) {
      const dueDate = new Date(purchaseOrder.dueDate);
      const orderDate = new Date(purchaseOrder.orderDate);
      if (dueDate < orderDate) {
        errorMessage = "Due date cannot be before the order date.";
        isValid = false;
      }
    } else if (!purchaseOrder.address.billing || purchaseOrder.address.billing.trim() === "") {
      errorMessage = "Billing address is required.";
      isValid = false;
    } else if (!purchaseOrder.address.shipping || purchaseOrder.address.shipping.trim() === "") {
      errorMessage = "Shipping address is required.";
      isValid = false;
    } else if (!purchaseOrder.address.deliveryLocation) {
      errorMessage = "Delivery location is required.";
      isValid = false;
    } else if (!purchaseOrder.address.deliveryState) {
      errorMessage = "Delivery state (Place of Supply) is required.";
      isValid = false;
    } else if (!purchaseOrder.address.sourceState) {
      errorMessage = "Source state is required.";
      isValid = false;
    } else if (!purchaseOrder.products || purchaseOrder.products.length === 0) {
      errorMessage = "At least one product is required for the purchase order.";
      isValid = false;
    } else {
      for (let i = 0; i < purchaseOrder.products.length; i++) {
        const product = purchaseOrder.products[i];
        if (!product.productName || product.productName.trim() === "") {
          errorMessage = `Product name is required for product ${i + 1}.`;
          isValid = false;
          break;
        }
        if (!product.quantity || parseFloat(product.quantity) <= 0) {
          errorMessage = `Quantity must be a positive number for product ${i + 1}.`;
          isValid = false;
          break;
        }
        if (!product.rate || parseFloat(product.rate) <= 0) {
          errorMessage = `Rate must be a positive number for product ${i + 1}.`;
          isValid = false;
          break;
        }
        if (!product.unit || product.unit.trim() === "") {
          errorMessage = `Unit is required for product ${i + 1}.`;
          isValid = false;
          break;
        }
      }
    }

    if (isValid && purchaseOrder.discount && parseFloat(purchaseOrder.discount) < 0) {
      errorMessage = "Discount cannot be negative.";
      isValid = false;
    }

    if (isValid && purchaseOrder.paidAmount && parseFloat(purchaseOrder.paidAmount) < 0) {
      errorMessage = "Paid amount cannot be negative.";
      isValid = false;
    }

    if (!isValid) {
      setAlert({ message: errorMessage, type: "error" });
    }

    return isValid;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();

    // Add JSON string
    formData.append("purchaseOrder", JSON.stringify(purchaseOrder));

    // Append actual File objects
    attachmentFiles.forEach((file) => {
      formData.append("attachments", file); // must match multer field name
    });

    try {
      const response = await fetch("/api/purchase-order/create", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ message: "Purchase order created successfully!", type: "success" });
        setTimeout(() => navigate("/purchaseorder"), 1000);
      } else {
        setAlert({ message: result.message || "Failed to create purchase order!", type: "error" });
      }
    } catch (error) {
      setAlert({ message: "Failed to create purchase order", type: "error" });
    }
  };


  // Set options for storage (Delivery Location)
  const deliveryLocationOptions = [
    userAddress || { value: "", label: "Loading user address..." },
    ...(Array.isArray(availableStorage)
      ? availableStorage.map((storage) => ({
        value: storage.address || storage.name || storage._id,
        label: `${storage.storageName}`,
      }))
      : []),
  ];

  // Set file icon for attachments
  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
      return '📎'; // Default icon for invalid or missing file names
    }
    const extension = fileName.split('.').pop().toLowerCase();
    return extension === 'pdf' ? '📄' : '🖼️';
  };

  return (
    <UserLayout>
      <div className="flex flex-col relative h-full w-full text-start overflow-visible">
        <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
          <p>Purchase Orders</p>
          <Link
            to="/purchaseorder"
            className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light border border-gray-200 hover:border-gray-400"
          >
            Purchase Order List
          </Link>
        </div>
        <hr />
        <form className="h-full overflow-y-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap w-full">
            <TextInput
              label="Purchase Order Number"
              name="poNumber"
              value={purchaseOrder.poNumber}
              onChange={(e) => handleInputChange({ target: { name: "poNumber", value: e.target.value } })}
              required
              disabled
            />
            <TextInput
              type="date"
              label="Order Date"
              name="orderDate"
              value={purchaseOrder.orderDate}
              onChange={(e) => handleInputChange({ target: { name: "orderDate", value: e.target.value } })}
              max={formatDate(nextYear)}
              required
            />
            <TextInput
              type="date"
              label="Due Date"
              name="dueDate"
              value={purchaseOrder.dueDate}
              onChange={(e) => handleInputChange({ target: { name: "dueDate", value: e.target.value } })}
              max={formatDate(nextYear)}
            />
            <SelectInput
              label="Order Status"
              name="status"
              value={purchaseOrder.status}
              onChange={(e) => handleInputChange({ target: { name: "status", value: e.target.value } })}
              options={[
                { value: "Completed", label: "Completed" },
                { value: "Pending", label: "Pending" },
                { value: "Cancel", label: "Cancel" },
              ]}
              required
            />
            <VendorDropdown
              vendors={vendors}
              onSelectVendor={handleVendorSelect}
              initialVendorName={purchaseOrder.vendor.name}
            />
            <TextInput
              label="Reference Number"
              name="referenceNumber"
              value={purchaseOrder.referenceNumber}
              onChange={(e) => handleInputChange({ target: { name: "referenceNumber", value: e.target.value } })}
              placeholder="Reference Number"
            />
            <SelectInput
              label="Delivery Location"
              name="address.deliveryLocation"
              id="deliveryLocation"
              value={purchaseOrder.address.deliveryLocation}
              onChange={(e) =>
                handleInputChange({ target: { name: "address.deliveryLocation", value: e.target.value } })
              }
              options={deliveryLocationOptions}
              required
            />
            <SelectInput
              label="Delivery State (Place Of Supply)"
              name="address.deliveryState"
              value={purchaseOrder.address.deliveryState}
              onChange={(e) =>
                handleInputChange({ target: { name: "address.deliveryState", value: e.target.value } })
              }
              options={
                states.length > 0
                  ? states.map((state) => ({
                    value: state.name,
                    label: state.name,
                  }))
                  : []
              }
              required
            />
            <div className="flex flex-wrap text-sm">
              <div className="m-2">
                <label className="mb-2 block">
                  Billing Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address.billing"
                  rows={5}
                  value={purchaseOrder.address.billing}
                  onChange={(e) =>
                    handleInputChange({ target: { name: "address.billing", value: e.target.value } })
                  }
                  className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  required
                />
              </div>
              <div className="m-2">
                <label className="mb-2 block">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address.shipping"
                  rows={5}
                  value={purchaseOrder.address.shipping}
                  onChange={(e) =>
                    handleInputChange({ target: { name: "address.shipping", value: e.target.value } })
                  }
                  className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  required
                />
              </div>
            </div>
            {purchaseOrder.paymentType === "EMI" && (
              <div className="flex flex-wrap text-sm w-full">
                <SelectInput
                  label="EMI Frequency"
                  name="emiDetails.frequency"
                  value={purchaseOrder.emiDetails.frequency}
                  onChange={(e) =>
                    handleInputChange({ target: { name: "emiDetails.frequency", value: e.target.value } })
                  }
                  options={[
                    { value: "", label: "Select Frequency" },
                    { value: "Monthly", label: "Monthly" },
                    { value: "Quarterly", label: "Quarterly" },
                    { value: "Half-Yearly", label: "Half-Yearly" },
                    { value: "Yearly", label: "Yearly" },
                  ]}
                />
                <TextInput
                  type="number"
                  label="Interest Rate (%)"
                  name="emiDetails.interestRate"
                  value={purchaseOrder.emiDetails.interestRate}
                  onChange={(e) =>
                    handleInputChange({ target: { name: "emiDetails.interestRate", value: e.target.value } })
                  }
                  placeholder="0"
                />
                <TextInput
                  type="number"
                  label="Advance Payment"
                  name="emiDetails.advancePayment"
                  value={purchaseOrder.emiDetails.advancePayment}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "emiDetails.advancePayment", value: e.target.value },
                    })
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>
          <hr />
          <ProductTable
            purchaseOrder={purchaseOrder}
            handleInputChange={handleInputChange}
            updateTotals={updateTotals}
            taxes={taxes}
          />
          <div className="flex flex-wrap text-sm w-full">
            <div className="m-2">
              <label className="mb-2 block">Note</label>
              <textarea
                name="note"
                placeholder="Add any additional notes or instructions here"
                rows={4}
                value={purchaseOrder.note}
                onChange={(e) => handleInputChange({ target: { name: "note", value: e.target.value } })}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="m-2">
              <label className="mb-2 block">Delivery Terms</label>
              <textarea
                name="deliveryTerms"
                placeholder="Specify delivery terms"
                rows={4}
                value={purchaseOrder.deliveryTerms}
                onChange={(e) =>
                  handleInputChange({ target: { name: "deliveryTerms", value: e.target.value } })
                }
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="m-2">
              <label className="mb-2 block">Terms and Conditions</label>
              <textarea
                name="termsAndConditions"
                placeholder="Specify terms and conditions"
                rows={4}
                value={purchaseOrder.termsAndConditions}
                onChange={(e) =>
                  handleInputChange({ target: { name: "termsAndConditions", value: e.target.value } })
                }
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
          </div>
          <hr />
          <div className="flex flex-wrap w-full text-sm mb-16">
            <div className="m-2 w-fit">
              <label className="mb-2 block font-medium text-gray-700">Attachments</label>
              <div
                className={[
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 bg-gray-50",
                  isDragging && attachmentFiles.length < 2 ? "border-customPrimary bg-customPrimary/10" : "border-gray-300",
                  attachmentFiles.length >= 2 ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400",
                ].join(" ")}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="region"
                aria-label="File upload area"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleAttachmentChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={attachmentFiles.length >= 2}
                  aria-describedby="attachment-instructions"
                />
                <div className="flex flex-col items-center">
                  <p className="text-gray-600 text-sm">
                    {attachmentFiles.length >= 2
                      ? "Maximum 2 attachments reached"
                      : "Drag and drop PDF or JPG/JPEG files here, or click to select"}
                  </p>
                  <p id="attachment-instructions" className="text-xs text-gray-400 mt-1">
                    Max 2 files, 3MB each. Only PDF and JPG/JPEG allowed.
                  </p>
                </div>
              </div>
            </div>
            <div className="m-2 w-fit">
              {attachmentFiles.length > 0 && (
                <div className="ms-1 w-fit">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Attachments:</p>
                  <div className="space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.name)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm ms-2 font-medium"
                          aria-label={`Remove ${file.name || 'attachment'}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute w-full bottom-0 bg-white border-t">
            <button
              type="submit"
              className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="rounded-lg bg-gray-200 hover:bg-gray-300 m-2 py-2 px-2 text-gray-700 text-[16px]"
            >
              Preview
            </button>
          </div>
        </form>
      </div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          handleClose={() => setAlert(null)}
        />
      )}
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <PurchaseOrderPreview data={purchaseOrder} />
      </PreviewModal>
    </UserLayout>
  );
};

export default CreatePurchaseorder;