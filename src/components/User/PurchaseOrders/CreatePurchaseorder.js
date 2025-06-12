import React, { useState, useEffect } from "react";
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
import PurchaseOrderPreview from "../ReusableComponents/PurchaseOrderPreview";

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

  const [purchaseOrder, setPurchaseOrder] = useState({
    businessId: user ? user.businessId : "",
    vendorId: "",
    vendorName: "",
    purchaseOrderNumber: "",
    billNumber: "",
    orderDate: formatDate(today),
    billDate: "",
    dueDate: "",
    referenceNumber: "",
    billingAddress: "",
    shippingAddress: "",
    sourceState: "",
    deliveryState: "",
    deliveryLocation: "",
    note: "",
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
    discount: "0",
    discountType: "Flat",
    discountValueType: "Percent",
    totalAmountOfDiscount: "0",
    roundOff: false,
    roundOffAmount: "0",
    taxAmount: "0",
    totalAmount: "0",
    paidAmount: "0",
    dueAmount: "0",
    deliveryTerms: "-",
    paymentTerms: "Net 30 days from the date of invoice.",
    termsAndConditions: "Payment is due within 30 days of receipt of goods. Please reference the purchase order number on all invoices. Goods must be delivered to the specified shipping address. Any discrepancies must be reported within 7 days of receipt.",
    attachments: [],
    createdBy: user ? user.id : "",
    updatedBy: user ? user.id : "",
    isDeleted: false,
  });

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
          const formattedAddress = address.address && address.state && address.country && address.pincode
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
            purchaseOrderNumber: purchaseOrderId || `PO-${Date.now()}`,
            deliveryState: address.state || "",
            billingAddress: formattedAddress,
            shippingAddress: formattedAddress,
            deliveryLocation: formattedAddress,
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

        const response = await axios.get("/api/storage/getList", {
          signal: controller.signal,
        });
        setAvailableStorage(response.data?.data?.storage || []);

        const allStates = State.getStatesOfCountry("IN") || [];
        setStates(allStates);
      } catch (err) {
        if (err.name === "AbortError") return;
        setAlert({ message: err.response?.data?.message || "Error fetching initial data", type: "error" });
      }
    };
    fetchData();
    return () => controller.abort();
  }, [user?.businessId, user?.name, user?.id]);

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
      if (!allowedTypes.includes(file.type)) {
        setAlert({ message: `File ${file.name} is not a valid type. Only PDF and JPG/JPEG files are allowed.`, type: "error" });
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

    setAttachmentFiles((prev) => [...prev, ...validFiles]);
    setPurchaseOrder((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles.map((file) => ({ name: file.name, size: file.size }))],
    }));
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    setPurchaseOrder((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

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

  const updateTotals = (totals) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      totalAmountOfDiscount: totals.totalDiscount,
      taxAmount: totals.totalTax,
      totalAmount: totals.totalInclTax,
      dueAmount: (parseFloat(totals.totalInclTax) - parseFloat(prev.paidAmount)).toFixed(2),
      roundOffAmount: totals.roundOffAmount,
    }));
  };

  const handleInputChange = async (...events) => {
    for (const event of events) {
      if (!event || !event.target || typeof event.target !== "object") {
        setAlert({ message: "Invalid input event", type: "error" });
        continue;
      }

      const { name, value } = event.target;

      if (name === "dueDate" && value && purchaseOrder.orderDate) {
        const dueDate = new Date(value);
        const orderDate = new Date(purchaseOrder.orderDate);
        if (dueDate < orderDate) {
          setAlert({ message: "Due date cannot be before order date", type: "error" });
          return;
        }
      }

      if (name === "products") {
        setPurchaseOrder((prev) => ({
          ...prev,
          products: value,
        }));
      } else if (name === "deliveryLocation" && value) {
        if (userAddress && value === userAddress.value) {
          setPurchaseOrder((prev) => ({
            ...prev,
            deliveryState: userAddress.state || "",
            shippingAddress: userAddress.value,
            deliveryLocation: value,
          }));
        } else {
          try {
            const response = await axios.get(`/api/storage/getStorageDetails/${value}`);
            const storageState = response.data?.storage?.storageState || "";
            const storageAddress = response.data?.storage?.storageAddress || "";
            setPurchaseOrder((prev) => ({
              ...prev,
              deliveryState: storageState,
              shippingAddress: storageAddress,
              deliveryLocation: value,
            }));
          } catch (error) {
            setAlert({ message: error.response?.data?.message || "Failed to fetch storage details.", type: "error" });
          }
        }
      } else {
        setPurchaseOrder((prev) => ({
          ...prev,
          [name]: name === "roundOff" ? value === "true" || value === true : value,
        }));
      }
    }
  };

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
              amount: ((cgstRate / 100) * amountBase).toFixed(2),
            },
            {
              type: "GST",
              subType: "SGST",
              rate: sgstRate,
              amount: ((sgstRate / 100) * amountBase).toFixed(2),
            },
          ];
        } else if (gstType === "inter" && matchingTax.type === "IGST") {
          const igstRate = parseFloat(matchingTax.rate) || 0;
          taxes = [
            {
              type: "IGST",
              subType: "IGST",
              rate: igstRate,
              amount: ((igstRate / 100) * amountBase).toFixed(2),
            },
          ];
        } else if (matchingTax.type === "custom") {
          const customRate = parseFloat(matchingTax.rate) || 0;
          taxes = [
            {
              type: "custom",
              subType: matchingTax.description || "Custom Tax",
              rate: customRate,
              amount: ((customRate / 100) * amountBase).toFixed(2),
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
      const totalPrice = (amountBase + totalTaxAmount).toFixed(2);

      return {
        ...product,
        taxes,
        totalPrice,
      };
    });
  };

  const handleVendorSelect = async ({ vendorId, vendorName }) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      vendorId,
      vendorName,
    }));

    if (!vendorId) {
      setPurchaseOrder((prev) => ({
        ...prev,
        sourceState: "",
      }));
      return;
    }

    try {
      const response = await axios.get(`/api/vendor/getVendorDetails/${vendorId}`);
      const vendorDetails = response?.data?.vendorDetails;

      if (vendorDetails && vendorDetails.taxDetails?.sourceState) {
        const taxResponse = await axios.get("/api/tax/getTax", { withCredentials: true });
        const taxes = taxResponse.data.success ? taxResponse.data.taxes || [] : [];
        const gstRates = [
          { totalRate: 5, intraState: { cgst: { rate: 2.5 }, sgst: { rate: 2.5 } }, interState: { igst: { rate: 5 } } },
          { totalRate: 12, intraState: { cgst: { rate: 6 }, sgst: { rate: 6 } }, interState: { igst: { rate: 12 } } },
          { totalRate: 18, intraState: { cgst: { rate: 9 }, sgst: { rate: 9 } }, interState: { igst: { rate: 18 } } },
          { totalRate: 28, intraState: { cgst: { rate: 14 }, sgst: { rate: 14 } }, interState: { igst: { rate: 28 } } },
        ];
        const gstType = vendorDetails.taxDetails.sourceState === purchaseOrder.deliveryState ? "intra" : "inter";
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
        const filteredTaxes = [...customGstRates, ...formattedTaxes];

        setPurchaseOrder((prev) => {
          const updatedProducts = recalculateProductTaxes(
            prev.products,
            vendorDetails.taxDetails.sourceState,
            prev.deliveryState,
            filteredTaxes
          );
          return {
            ...prev,
            sourceState: vendorDetails.taxDetails.sourceState,
            products: updatedProducts,
          };
        });
      } else {
        setAlert({ message: "Vendor details or tax information not found.", type: "error" });
      }
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Failed to fetch selected vendor's details.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!purchaseOrder.vendorId) {
      setAlert({ message: "Please select a vendor", type: "error" });
      return;
    }

    if (!purchaseOrder.purchaseOrderNumber) {
      setAlert({ message: "Purchase order number is required", type: "error" });
      return;
    }

    if (!purchaseOrder.orderDate) {
      setAlert({ message: "Order date is required", type: "error" });
      return;
    }

    if (purchaseOrder.products.length === 0 || purchaseOrder.products.some(p => !p.productId)) {
      setAlert({ message: "Please add at least one valid product", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      const uploadedAttachments = [];

      for (const file of attachmentFiles) {
        formData.append("file", file);

        try {
          const uploadResponse = await axios.post("/api/upload/attachment", formData, {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (uploadResponse.status === 200 && uploadResponse.data?.url) {
            uploadedAttachments.push({
              fileName: file.name,
              filePath: uploadResponse.data.url,
              uploadedBy: user.id,
              uploadedAt: new Date(),
            });
          } else {
            setAlert({ message: `Failed to upload file ${file.name}`, type: "error" });
          }
        } catch (error) {
          setAlert({ message: `Error uploading file ${file.name}: ${error.response?.data?.message || "Upload failed"}`, type: "error" });
        }

        formData.delete("file");
      }

      const validatedProducts = purchaseOrder.products.map(product => ({
        ...product,
        quantity: parseFloat(product.quantity) || 0,
        rate: parseFloat(product.rate) || 0,
        inProductDiscount: parseFloat(product.inProductDiscount) || 0,
        totalPrice: parseFloat(product.totalPrice) || 0,
        taxes: product.taxes.map(tax => ({
          ...tax,
          rate: parseFloat(tax.rate) || 0,
          amount: parseFloat(tax.amount) || 0,
        })),
      }));

      const purchaseOrderData = {
        ...purchaseOrder,
        businessId: user.businessId,
        attachments: uploadedAttachments,
        products: validatedProducts,
        discount: parseFloat(purchaseOrder.discount) || 0,
        totalAmountOfDiscount: parseFloat(purchaseOrder.totalAmountOfDiscount) || 0,
        taxAmount: parseFloat(purchaseOrder.taxAmount) || 0,
        totalAmount: parseFloat(purchaseOrder.totalAmount) || 0,
        paidAmount: parseFloat(purchaseOrder.paidAmount) || 0,
        dueAmount: parseFloat(purchaseOrder.dueAmount) || 0,
        roundOffAmount: parseFloat(purchaseOrder.roundOffAmount) || 0,
        orderDate: new Date(purchaseOrder.orderDate),
        dueDate: purchaseOrder.dueDate ? new Date(purchaseOrder.dueDate) : null,
        billDate: purchaseOrder.billDate ? new Date(purchaseOrder.billDate) : null,
        status: purchaseOrder.status || "Pending",
        paymentStatus: purchaseOrder.paidAmount > 0
          ? parseFloat(purchaseOrder.paidAmount) >= parseFloat(purchaseOrder.totalAmount)
            ? "Paid"
            : "Partially Paid"
          : "UnPaid",
      };

      const response = await axios.post("/api/purchase-order/create", purchaseOrderData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setAlert({
          message: "Purchase order created successfully!",
          type: "success",
        });

        setPurchaseOrder({
          ...purchaseOrder,
          vendorId: "",
          vendorName: "",
          billNumber: "",
          dueDate: "",
          referenceNumber: "",
          note: "",
          products: [{
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
          }],
          discount: "0",
          discountType: "Flat",
          discountValueType: "Percent",
          totalAmountOfDiscount: "0",
          roundOff: false,
          roundOffAmount: "0",
          taxAmount: "0",
          totalAmount: "0",
          paidAmount: "0",
          dueAmount: "0",
          attachments: [],
        });
        setAttachmentFiles([]);
      }
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Failed to create purchase order",
        type: "error",
      });
    }
  };

  const deliveryLocationOptions = [
    userAddress || { value: "", label: "Loading user address..." },
    ...(Array.isArray(availableStorage)
      ? availableStorage.map((storage) => ({
          value: storage.address || storage.name || storage._id,
          label: `${storage.storageName}`,
        }))
      : []),
  ];

  const getFileIcon = (fileName) => {
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
              name="purchaseOrderNumber"
              value={purchaseOrder.purchaseOrderNumber}
              onChange={handleInputChange}
              required
              disabled
            />
            <TextInput
              type="date"
              label="Order Date"
              name="orderDate"
              value={purchaseOrder.orderDate}
              onChange={handleInputChange}
              max={formatDate(nextYear)}
              required
            />
            <TextInput
              type="date"
              label="Due Date"
              name="dueDate"
              value={purchaseOrder.dueDate}
              onChange={handleInputChange}
              max={formatDate(nextYear)}
            />
            <SelectInput
              label="Order Status"
              name="status"
              value={purchaseOrder.status}
              onChange={handleInputChange}
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
              initialVendorName={purchaseOrder.vendorName}
            />
            <TextInput
              label="Reference Number"
              name="referenceNumber"
              value={purchaseOrder.referenceNumber}
              onChange={handleInputChange}
              placeholder="Reference Number"
              required
            />
            <SelectInput
              label="Delivery Location"
              name="deliveryLocation"
              id="deliveryLocation"
              value={purchaseOrder.deliveryLocation}
              onChange={handleInputChange}
              options={deliveryLocationOptions}
              required
            />
            <SelectInput
              label="Delivery State (Place Of Supply)"
              name="deliveryState"
              value={purchaseOrder.deliveryState}
              onChange={handleInputChange}
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
                  name="billingAddress"
                  rows={5}
                  value={purchaseOrder.billingAddress}
                  onChange={handleInputChange}
                  className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  required
                />
              </div>
              <div className="m-2">
                <label className="mb-2 block">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shippingAddress"
                  rows={5}
                  value={purchaseOrder.shippingAddress}
                  onChange={handleInputChange}
                  className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                  required
                />
              </div>
            </div>
          </div>
          <hr />
          <ProductTable
            purchaseOrder={purchaseOrder}
            handleInputChange={handleInputChange}
            updateTotals={updateTotals}
          />
          <div className="flex flex-wrap text-sm w-full">
            <div className="m-2">
              <label className="mb-2 block">
                Note
              </label>
              <textarea
                name="note"
                placeholder="Add any additional notes or instructions here"
                rows={4}
                value={purchaseOrder.note}
                onChange={handleInputChange}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="m-2">
              <label className="mb-2 block">
                Delivery Terms
              </label>
              <textarea
                name="deliveryTerms"
                placeholder="Specify delivery terms"
                rows={4}
                value={purchaseOrder.deliveryTerms}
                onChange={handleInputChange}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="m-2">
              <label className="mb-2 block">
                Payment Terms
              </label>
              <textarea
                name="paymentTerms"
                placeholder="Specify payment terms"
                rows={4}
                value={purchaseOrder.paymentTerms}
                onChange={handleInputChange}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="m-2">
              <label className="mb-2 block">
                Terms and Conditions
              </label>
              <textarea
                name="termsAndConditions"
                placeholder="Specify terms and conditions"
                rows={4}
                value={purchaseOrder.termsAndConditions}
                onChange={handleInputChange}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
          </div>
          <hr />
          <div className="flex flex-wrap w-full text-sm mb-16">
            <div className="m-2 w-fit">
              <label className="mb-2 block font-medium text-gray-700">
                Attachments
              </label>
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
                          aria-label={`Remove ${file.name}`}
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