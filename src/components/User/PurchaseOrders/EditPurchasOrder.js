import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import gstRatesData from '../../../data/gstRates.json';

// Utility to format dates for input fields (YYYY-MM-DD)
const formatDate = (date) => date.toISOString().split("T")[0];

// Initialize default dates
const today = new Date();
const nextYear = new Date();
nextYear.setFullYear(today.getFullYear() + 1);

const EditPurchaseOrder = () => {
  // Hooks for navigation and URL parameters
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();
  const { user } = useUser();

  // State management
  const [alert, setAlert] = useState(null); // Alerts for user feedback
  const [vendors, setVendors] = useState([]); // List of available vendors
  const [states, setStates] = useState([]); // Indian states for dropdown
  const [availableStorage, setAvailableStorage] = useState([]); // Storage locations
  const [userAddress, setUserAddress] = useState(null); // User's business address
  const [attachmentFiles, setAttachmentFiles] = useState([]); // New files to upload
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Preview modal state
  const [taxes, setTaxes] = useState([]); // Available tax rates
  const [isLoading, setIsLoading] = useState(false);
  // Initial purchase order state
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

  // Fetch initial data on component mount
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        // Fetch purchase order details
        const purchaseOrderRes = await axios.get(`/api/purchase-order/${purchaseOrderId}`, {
          withCredentials: true,
          signal: controller.signal,
        });

        if (purchaseOrderRes.status === 200 && purchaseOrderRes.data?.success && purchaseOrderRes.data?.data) {
          const poData = purchaseOrderRes.data.data;
          setPurchaseOrder((prev) => ({
            ...prev,
            poNumber: poData.poNumber || prev.poNumber,
            orderDate: poData.orderDate ? formatDate(new Date(poData.orderDate)) : prev.orderDate,
            dueDate: poData.dueDate ? formatDate(new Date(poData.dueDate)) : "",
            status: poData.status || prev.status,
            paymentStatus: poData.paymentStatus || prev.paymentStatus,
            paymentType: poData.paymentType || "",
            referenceNumber: poData.referenceNumber || "",
            note: poData.note || "",
            deliveryTerms: poData.deliveryTerms || prev.deliveryTerms,
            termsAndConditions: poData.termsAndConditions || prev.termsAndConditions,
            createdBy: poData.createdBy || prev.createdBy,
            updatedBy: poData.updatedBy || prev.updatedBy,
            isDeleted: poData.isDeleted || prev.isDeleted,
            isBillGenerated: poData.isBillGenerated || prev.isBillGenerated,
            business: { ...prev.business, ...poData.business },
            vendor: { ...prev.vendor, ...poData.vendor },
            address: { ...prev.address, ...poData.address },
            products: poData.products.map((product) => ({
              ...product,
              quantity: product.quantity.toString(),
              rate: product.rate?.$numberDecimal?.toString() || product.rate || "0",
              inProductDiscount: product.inProductDiscount?.$numberDecimal?.toString() || "0",
              totalPrice: product.totalPrice?.$numberDecimal?.toString() || "0",
              taxes: product.taxes.map((tax) => ({
                ...tax,
                amount: tax.amount?.$numberDecimal?.toString() || tax.amount || "0",
              })),
            })),
            emiDetails: {
              ...prev.emiDetails,
              frequency: poData.emiDetails?.frequency || "",
              interestRate: poData.emiDetails?.interestRate?.toString() || "0",
              advancePayment: poData.emiDetails?.advancePayment?.$numberDecimal?.toString() || "0",
              totalWithInterest: poData.emiDetails?.totalWithInterest?.$numberDecimal?.toString() || "0",
              installments: poData.emiDetails?.installments || [],
            },
            discount: poData.discount?.$numberDecimal?.toString() || "0",
            totalAmountOfDiscount: poData.totalAmountOfDiscount?.$numberDecimal?.toString() || "0",
            subtotal: poData.subtotal?.$numberDecimal?.toString() || "0",
            totalBeforeDiscount: poData.totalBeforeDiscount?.$numberDecimal?.toString() || "0",
            roundOff: poData.roundOff || false,
            roundOffAmount: poData.roundOffAmount?.$numberDecimal?.toString() || "0",
            taxAmount: poData.taxAmount?.$numberDecimal?.toString() || "0",
            grandAmount: poData.grandAmount?.$numberDecimal?.toString() || "0",
            paidAmount: poData.paidAmount?.$numberDecimal?.toString() || "0",
            dueAmount: poData.dueAmount?.$numberDecimal?.toString() || "0",
            attachments: poData.attachments.map((attachment) => ({
              ...attachment,
              isNew: false, // Mark existing attachments
            })) || [],
            discountType: poData.discountType || prev.discountType,
            discountValueType: poData.discountValueType || prev.discountValueType,
          }));
        } else {
          setAlert({ message: "Purchase order not found", type: "error" });
          return;
        }

        // Fetch organization details and PO number if needed
        const poRes = await axios.get("/api/purchase-order/generate", {
          withCredentials: true,
          signal: controller.signal,
        });
        if (poRes.status === 200 && poRes.data?.organization?.address) {
          const { organization } = poRes.data;
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
            business: {
              ...prev.business,
              id: user.organization.businessId,
              name: prev.business.name || organization.name || "",
              gstinStatus: prev.business.gstinStatus || organization.gstStatus || "",
              gstin: prev.business.gstin || organization.gstNumber || "",
              state: prev.business.state || address.state || "",
              address: prev.business.address || formattedAddress,
              phone: prev.business.phone || organization.phone || "",
              email: prev.business.email || organization.email || "",
            },
            address: {
              ...prev.address,
              deliveryState: prev.address.deliveryState || address.state || "",
              billing: prev.address.billing || formattedAddress,
              shipping: prev.address.shipping || formattedAddress,
              deliveryLocation: prev.address.deliveryLocation || formattedAddress,
            },
          }));
        } else {
          setAlert({ message: "Invalid organization address data", type: "error" });
        }

        // Fetch vendors
        const vendorRes = await axios.get("/api/vendor/vendors/list", {
          signal: controller.signal,
        });
        if (vendorRes.status === 200 && vendorRes.data?.data) {
          setVendors(vendorRes.data.data);
        } else {
          setAlert({ message: "No vendors found", type: "error" });
        }

        // Fetch storage locations
        const storageRes = await axios.get("/api/storage/getList", {
          signal: controller.signal,
        });
        setAvailableStorage(storageRes.data?.data?.storage || []);

        // Fetch tax rates
        const taxRes = await axios.get("/api/tax/getTax", {
          withCredentials: true,
          signal: controller.signal,
        });
        if (taxRes.data.success) {
          setTaxes(taxRes.data.taxes || []);
        } else {
          setAlert({ message: "Failed to fetch taxes", type: "error" });
        }

        // Load Indian states
        const allStates = State.getStatesOfCountry("IN") || [];
        setStates(allStates);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setAlert({
          message: err.response?.data?.message || "Error fetching initial data",
          type: "error",
        });
      }
    };

    fetchData();
    return () => controller.abort();
  }, [user?.organization?.businessId, user?.name, user?.id, purchaseOrderId]);

  // Handle file input for attachments
  const handleAttachmentChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAlert({ message: "No files selected", type: "error" });
      return;
    }

    const files = Array.from(e.target.files);
    const maxAttachments = 2;
    const maxFileSize = 3 * 1024 * 1024; // 3 MB
    const allowedTypes = ["application/pdf", "image/jpeg"];

    if (purchaseOrder.attachments.length + files.length > maxAttachments) {
      setAlert({ message: `Maximum ${maxAttachments} attachments allowed`, type: "error" });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.name) {
        setAlert({ message: "Invalid file: missing name", type: "error" });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          message: `File ${file.name} is not a valid type. Only PDF and JPG/JPEG allowed`,
          type: "error",
        });
        return false;
      }
      if (file.size > maxFileSize) {
        setAlert({ message: `File ${file.name} exceeds 3 MB limit`, type: "error" });
        return false;
      }
      if (file.size === 0) {
        setAlert({ message: `File ${file.name} is empty`, type: "error" });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setAlert({ message: "No valid files selected", type: "error" });
      return;
    }

    setAttachmentFiles((prev) => [...prev, ...validFiles]);
    setPurchaseOrder((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        ...validFiles.map((file) => ({
          fileName: file.name,
          filePath: `Uploads/purchase-orders/${file.name}`, // Temporary path, updated by backend
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          isNew: true,
        })),
      ],
    }));
  };

  // Remove an attachment
  const removeAttachment = (index, isExisting = false) => {
    if (isExisting) {
      setPurchaseOrder((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }));
    } else {
      const newFileIndex = index - purchaseOrder.attachments.filter((a) => !a.isNew).length;
      setAttachmentFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
      setPurchaseOrder((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }));
    }
  };

  // View an existing attachment
  const viewAttachment = async (attachment) => {
    try {
      const response = await axios.get(
        `/api/purchase-order/ViewAttachment/${purchaseOrderId}/${attachment._id}`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const fileType = attachment.fileName.split(".").pop().toLowerCase();
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Delay cleanup to allow browser to handle the file
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Failed to view attachment",
        type: "error",
      });
    }
  };

  // Download an existing attachment
  const downloadAttachment = async (attachment) => {
    try {
      const response = await axios.get(
        `/api/purchase-order/ViewAttachment/${purchaseOrderId}/${attachment._id}?download=true`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const fileType = attachment.fileName.split(".").pop().toLowerCase();
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Failed to download attachment. Please check your internet connection.",
        type: "error",
      });
    }
  };

  const downloadPurchaseOrder = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching PO PDF with ID:', purchaseOrderId);
      const response = await axios.get(`/api/purchase-order/download/${purchaseOrderId}`, {
        withCredentials: true,
        responseType: 'blob',
      });
      if (response.headers['content-type'] !== 'application/pdf') {
        const text = await response.data.text();
        console.error('Unexpected response:', text);
        throw new Error(`Server did not return a PDF: ${text}`);
      }
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      // Optionally revoke the URL after a delay to free memory
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Fetch PDF error:', error.message, await error.response?.data?.text?.() || error);
      setAlert({
        message: error.message || 'Failed to fetch purchase order PDF',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (purchaseOrder.attachments.length < 2) {
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
    if (purchaseOrder.attachments.length < 2) {
      const files = Array.from(e.dataTransfer.files);
      handleAttachmentChange({ target: { files } });
    }
  };

  // Update totals based on products and discounts
  const updateTotals = (totals) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      totalAmountOfDiscount: totals.totalDiscount,
      taxAmount: totals.totalTax,
      subtotal: totals.totalBaseAmount,
      totalBeforeDiscount: totals.totalBeforeDiscount,
      grandAmount: totals.totalInclTax,
      dueAmount: (parseFloat(totals.totalInclTax) - parseFloat(prev.paidAmount || 0)).toFixed(2).toString(),
      roundOffAmount: totals.roundOffAmount,
    }));
  };

  // Generate filtered tax options based on GST type (intra/inter)
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
      }
      return {
        label: `IGST (${rate.interState.igst.rate}%)`,
        value: rate.totalRate,
        rate: rate.interState.igst.rate,
        type: "IGST",
      };
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

  // Handle input changes for form fields
  const handleInputChange = async (...events) => {
    let updatedPurchaseOrder = { ...purchaseOrder };
    for (const event of events) {
      if (!event || !event.target || typeof event.target !== "object") {
        setAlert({ message: "Invalid input event", type: "error" });
        continue;
      }

      const { name, value } = event.target;

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
            setAlert({ message: error.response?.data?.message || "Failed to fetch storage details", type: "error" });
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
    const totals = calculateTotals(updatedPurchaseOrder.products, updatedPurchaseOrder);
    updateTotals(totals);
  };

  // Recalculate taxes for products based on GST type
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

      const currentTaxRate = product.taxes?.length > 0
        ? product.taxes.reduce((sum, t) => sum + parseFloat(t.rate || 0), 0)
        : 0;

      let taxes = [];
      let matchingTax = null;

      if (currentTaxRate > 0) {
        matchingTax = filteredTaxes.find(
          (tax) =>
            tax.rate === currentTaxRate &&
            ((gstType === "intra" && tax.type === "GST") || (gstType === "inter" && tax.type === "IGST") || tax.type === "custom")
        ) || filteredTaxes.find(
          (tax) => tax.rate === currentTaxRate && (tax.type === "GST" || tax.type === "IGST" || tax.type === "custom")
        );
      }

      if (!matchingTax) {
        matchingTax = filteredTaxes.find(
          (tax) => (gstType === "intra" && tax.type === "GST") || (gstType === "inter" && tax.type === "IGST") || tax.type === "custom"
        );
      }

      if (matchingTax) {
        if (gstType === "intra" && matchingTax.type === "GST") {
          const cgstRate = parseFloat(matchingTax.rate) / 2 || 0;
          const sgstRate = parseFloat(matchingTax.rate) / 2 || 0;
          taxes = [
            { type: "GST", subType: "CGST", rate: cgstRate, amount: ((cgstRate / 100) * amountBase).toFixed(2).toString() },
            { type: "GST", subType: "SGST", rate: sgstRate, amount: ((sgstRate / 100) * amountBase).toFixed(2).toString() },
          ];
        } else if (gstType === "inter" && matchingTax.type === "IGST") {
          const igstRate = parseFloat(matchingTax.rate) || 0;
          taxes = [
            { type: "IGST", subType: "IGST", rate: igstRate, amount: ((igstRate / 100) * amountBase).toFixed(2).toString() },
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

      return { ...product, taxes, totalPrice };
    });
  };

  // Calculate totals for products and discounts
  const calculateTotals = (products, purchaseOrder) => {
    let totalBaseAmount = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let customTaxTotal = 0;
    let totalTax = 0;
    let totalBeforeDiscount = 0;

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

      let productTaxAmount = 0;
      product.taxes?.forEach((tax) => {
        const taxAmount = parseFloat(tax.amount?.$numberDecimal || tax.amount || 0);
        productTaxAmount += taxAmount;
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
      totalTax += productTaxAmount;
      totalBeforeDiscount += subtotal + productTaxAmount;
    });

    if (purchaseOrder.discountType === "Flat") {
      const discountValue = parseFloat(purchaseOrder.discount) || 0;
      if (discountValue > 0) {
        const flatDiscountAmount =
          purchaseOrder.discountValueType === "Percent"
            ? (totalBaseAmount * discountValue) / 100
            : discountValue;
        totalDiscount += flatDiscountAmount;
        taxableAmount -= flatDiscountAmount;
      }
    }

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
      taxableAmount: taxableAmount.toFixed(2).toString(),
      totalTax: totalTax.toFixed(2).toString(),
      totalInclTax: totalInclTax.toFixed(2).toString(),
      cgstTotal: cgstTotal.toFixed(2).toString(),
      sgstTotal: sgstTotal.toFixed(2).toString(),
      igstTotal: igstTotal.toFixed(2).toString(),
      customTaxTotal: customTaxTotal.toFixed(2).toString(),
      roundOffAmount,
      totalBeforeDiscount: totalBeforeDiscount.toFixed(2).toString(),
    };
  };

  // Handle vendor selection
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
      const vendorAddress = vendorDetails.billingAddress?.addressLine1 && vendorDetails.billingAddress?.city && vendorDetails.billingAddress?.state && vendorDetails.billingAddress?.country && vendorDetails.billingAddress?.postalCode
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
        setAlert({ message: "Vendor details not found", type: "error" });
      }
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Failed to fetch vendor details", type: "error" });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!purchaseOrder.business.id) {
      setAlert({ message: "You must be logged in to update a purchase order", type: "error" });
      return false;
    }
    if (!purchaseOrder.vendor.id) {
      setAlert({ message: "Please select a vendor", type: "error" });
      return false;
    }
    if (!purchaseOrder.poNumber || purchaseOrder.poNumber.trim() === "") {
      setAlert({ message: "Purchase order number is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.orderDate) {
      setAlert({ message: "Order date is required", type: "error" });
      return false;
    }
    if (purchaseOrder.dueDate) {
      const dueDate = new Date(purchaseOrder.dueDate);
      const orderDate = new Date(purchaseOrder.orderDate);
      if (dueDate < orderDate) {
        setAlert({ message: "Due date cannot be before order date", type: "error" });
        return false;
      }
    }
    if (!purchaseOrder.address.billing || purchaseOrder.address.billing.trim() === "") {
      setAlert({ message: "Billing address is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.address.shipping || purchaseOrder.address.shipping.trim() === "") {
      setAlert({ message: "Shipping address is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.address.deliveryLocation) {
      setAlert({ message: "Delivery location is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.address.deliveryState) {
      setAlert({ message: "Delivery state (Place of Supply) is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.address.sourceState) {
      setAlert({ message: "Source state is required", type: "error" });
      return false;
    }
    if (!purchaseOrder.products || purchaseOrder.products.length === 0) {
      setAlert({ message: "At least one product is required", type: "error" });
      return false;
    }
    for (let i = 0; i < purchaseOrder.products.length; i++) {
      const product = purchaseOrder.products[i];
      if (!product.productName || product.productName.trim() === "") {
        setAlert({ message: `Product name is required for product ${i + 1}`, type: "error" });
        return false;
      }
      if (!product.quantity || parseFloat(product.quantity) <= 0) {
        setAlert({ message: `Quantity must be a positive number for product ${i + 1}`, type: "error" });
        return false;
      }
      if (!product.rate || parseFloat(product.rate) <= 0) {
        setAlert({ message: `Rate must be a positive number for product ${i + 1}`, type: "error" });
        return false;
      }
      if (!product.unit || product.unit.trim() === "") {
        setAlert({ message: `Unit is required for product ${i + 1}`, type: "error" });
        return false;
      }
    }
    if (purchaseOrder.discount && parseFloat(purchaseOrder.discount) < 0) {
      setAlert({ message: "Discount cannot be negative", type: "error" });
      return false;
    }
    if (purchaseOrder.paidAmount && parseFloat(purchaseOrder.paidAmount) < 0) {
      setAlert({ message: "Paid amount cannot be negative", type: "error" });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("purchaseOrder", JSON.stringify({
      ...purchaseOrder,
      attachments: purchaseOrder.attachments.map(({ isNew, ...rest }) => rest),
    }));
    attachmentFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const response = await fetch(`/api/purchase-order/${purchaseOrderId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setAlert({ message: "Purchase order updated successfully!", type: "success" });
        setTimeout(() => navigate("/purchaseorder"), 1000);
      } else {
        setAlert({ message: result.message || "Failed to update purchase order", type: "error" });
      }
    } catch (error) {
      setAlert({ message: `Failed to update purchase order: ${error.message}`, type: "error" });
    }
  };

  // Delivery location options for dropdown
  const deliveryLocationOptions = [
    userAddress || { value: "", label: "Loading user address..." },
    ...(Array.isArray(availableStorage)
      ? availableStorage.map((storage) => ({
        value: storage.address || storage.name || storage._id,
        label: `${storage.storageName}`,
      }))
      : []),
  ];

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== "string") return "📎";
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension === "pdf" ? "📄" : extension === "jpg" || extension === "jpeg" ? "🖼️" : "📎";
  };

  // Get file size for display
  const getFileSize = (attachment, index) => {
    if (attachment.isNew) {
      const fileIndex = index - purchaseOrder.attachments.filter((a) => !a.isNew).length;
      return attachmentFiles[fileIndex]?.size
        ? (attachmentFiles[fileIndex].size / (1024 * 1024)).toFixed(2) + " MB"
        : "N/A";
    }
    return "N/A"; // Backend should store file size for existing attachments
  };

  return (
    <UserLayout>
      <div className="flex flex-col relative h-full w-full text-start overflow-visible">
        {/* Header Section */}
        <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
          <p>Edit Purchase Order</p>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPurchaseOrder}
              className="p-2 m-1 bg-transparent rounded-md text-sm font-light border border-gray-200 hover:border-gray-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Downloading...</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-down"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
              )}
            </button>
            <Link
              to="/purchaseorder"
              className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light border border-gray-200 hover:border-gray-400"
            >
              Purchase Order List
            </Link>
          </div>
        </div>
        <hr />
        {/* Form Section */}
        <form className="h-full overflow-y-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap w-full">
            {/* Purchase Order Details */}
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
              onChange={(e) => handleInputChange({ target: { name: "address.deliveryLocation", value: e.target.value } })}
              options={deliveryLocationOptions}
              required
            />
            <SelectInput
              label="Delivery State (Place of Supply)"
              name="address.deliveryState"
              value={purchaseOrder.address.deliveryState}
              onChange={(e) => handleInputChange({ target: { name: "address.deliveryState", value: e.target.value } })}
              options={states.map((state) => ({ value: state.name, label: state.name }))}
              required
            />
            {/* Address Fields */}
            <div className="flex flex-wrap text-sm">
              <div className="m-2">
                <label className="mb-2 block">
                  Billing Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address.billing"
                  rows={5}
                  value={purchaseOrder.address.billing}
                  onChange={(e) => handleInputChange({ target: { name: "address.billing", value: e.target.value } })}
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
                  onChange={(e) => handleInputChange({ target: { name: "address.shipping", value: e.target.value } })}
                  className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  required
                />
              </div>
            </div>
            {/* EMI Details (Conditional) */}
            {purchaseOrder.paymentType === "EMI" && (
              <div className="flex flex-wrap text-sm w-full">
                <SelectInput
                  label="EMI Frequency"
                  name="emiDetails.frequency"
                  value={purchaseOrder.emiDetails.frequency}
                  onChange={(e) => handleInputChange({ target: { name: "emiDetails.frequency", value: e.target.value } })}
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
                  onChange={(e) => handleInputChange({ target: { name: "emiDetails.interestRate", value: e.target.value } })}
                  placeholder="0"
                />
                <TextInput
                  type="number"
                  label="Advance Payment"
                  name="emiDetails.advancePayment"
                  value={purchaseOrder.emiDetails.advancePayment}
                  onChange={(e) => handleInputChange({ target: { name: "emiDetails.advancePayment", value: e.target.value } })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
          <hr />
          {/* Product Table */}
          <ProductTable
            purchaseOrder={purchaseOrder}
            handleInputChange={handleInputChange}
            updateTotals={updateTotals}
            taxes={taxes}
          />
          {/* Notes and Terms */}
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
                onChange={(e) => handleInputChange({ target: { name: "deliveryTerms", value: e.target.value } })}
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
                onChange={(e) => handleInputChange({ target: { name: "termsAndConditions", value: e.target.value } })}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
          </div>
          <hr />
          {/* Attachments Section */}
          <div className="flex flex-wrap w-full text-sm mb-16">
            <div className="m-2 w-fit">
              <label className="mb-2 block font-medium text-gray-700">Attachments</label>
              <div
                className={[
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 bg-gray-50",
                  isDragging && purchaseOrder.attachments.length < 2 ? "border-customPrimary bg-customPrimary/10" : "border-gray-300",
                  purchaseOrder.attachments.length >= 2 ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400",
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
                  disabled={purchaseOrder.attachments.length >= 2}
                  aria-describedby="attachment-instructions"
                />
                <div className="flex flex-col items-center">
                  <p className="text-gray-600 text-sm">
                    {purchaseOrder.attachments.length >= 2
                      ? "Maximum 2 attachments reached"
                      : "Drag and drop PDF or JPG/JPEG files here, or click to select"}
                  </p>
                  <p id="attachment-instructions" className="text-xs text-gray-400 mt-1">
                    Max 2 files, 3MB each. Only PDF and JPG/JPEG allowed.
                  </p>
                </div>
              </div>
            </div>
            {purchaseOrder.attachments.length > 0 && (
              <div className="m-2 w-fit">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                <div className="space-y-2">
                  {purchaseOrder.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(attachment.fileName)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">{getFileSize(attachment, index)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 m-2">
                        {!attachment.isNew && (
                          <>
                            <button
                              type="button"
                              onClick={() => viewAttachment(attachment)}
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                              aria-label={`View ${attachment.fileName || "attachment"}`}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAttachment(attachment)}
                              className="text-green-500 hover:text-green-700 text-sm font-medium"
                              aria-label={`Download ${attachment.fileName || "attachment"}`}
                            >
                              Download
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index, !attachment.isNew)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                          aria-label={`Remove ${attachment.fileName || "attachment"}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Form Actions */}
          <div className="absolute w-full bottom-0 bg-white border-t">
            <button
              type="submit"
              className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]"
            >
              Update
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
      {/* Alert and Preview Modal */}
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

export default EditPurchaseOrder;