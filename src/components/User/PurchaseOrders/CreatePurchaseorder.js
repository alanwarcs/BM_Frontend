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
import ProductTable from "../ReusableComponents/ProductTable";

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

  const [purchaseOrder, setPurchaseOrder] = useState({
    vendorId: "",
    vendorName: "",
    purchaseOrderNumber: "",
    billNumber: "",
    orderDate: formatDate(today),
    billDate: "",
    dueDate: "",
    status: "Pending",
    paymentStatus: "UnPaid",
    modeOfPayment: "",
    initialPaymentMethod: "",
    referenceNumber: "",
    billingAddress: "",
    shippingAddress: "",
    sourceState: "",
    deliveryState: "",
    deliveryLocation: "",
    note: "",
    emiDetails: {
      frequency: "",
      interestRate: 0,
      totalWithInterest: "0",
      advancePayment: 0,
      installments: [
        {
          amount: "0",
          dueDate: "",
          status: "Unpaid",
          paymentDate: "",
          paymentMethod: "",
          paymentReference: "",
          paymentNote: "",
        },
      ],
    },
    products: [
      {
        productId: "",
        productName: "",
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
    attachments: [],
    createdBy: user ? user.id : "",
    updatedBy: user ? user.id : "",
    isDeleted: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poRes = await axios.get("/api/purchase-order/generate", {
          withCredentials: true,
        });
        if (poRes.status === 200) {
          const { purchaseOrderId, organization } = poRes.data;
          const address = organization.address;
          const formattedAddress = `${address.address}, ${address.state}, ${address.country}, ${address.pincode}`;
          const userAddressOption = {
            value: formattedAddress,
            label: `${user?.name || "User"}, ${address.state}`,
          };
          setUserAddress(userAddressOption);
          setPurchaseOrder((prev) => ({
            ...prev,
            purchaseOrderNumber: purchaseOrderId,
            deliveryState: address.state,
            billingAddress: formattedAddress,
            shippingAddress: formattedAddress,
            deliveryLocation: formattedAddress,
          }));
        }

        const vendorRes = await axios.get("/api/vendor/vendors/list");
        if (vendorRes.status === 200) {
          setVendors(vendorRes.data.data);
        }

        const response = await axios.get("/api/storage/getList");
        setAvailableStorage(response.data.data.storage || []);

        const allStates = State.getStatesOfCountry("IN");
        setStates(allStates || []);
      } catch (err) {
        setAlert({ message: "Error fetching initial data", type: "error" });
      }
    };
    fetchData();
  }, [user]);

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

      if (name === "products") {
        setPurchaseOrder((prev) => ({
          ...prev,
          products: value,
        }));
      } else if (name === "deliveryLocation" && value) {
        try {
          const response = await axios.get(`/api/storage/getStorageDetails/${value}`);
          const storageState = response.data.storage.storageState || "";
          const storageAddress = response.data.storage.storageAddress || "";
          setPurchaseOrder((prev) => ({
            ...prev,
            deliveryState: storageState,
            shippingAddress: storageAddress,
            deliveryLocation: value,
          }));
        } catch (error) {
          setAlert({ message: "Failed to fetch storage details.", type: "error" });
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
              subType: matchingTax.description,
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

      if (vendorDetails) {
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
      }
    } catch (error) {
      setAlert({ message: "Failed to fetch selected vendor's details.", type: "error" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Purchase Order State on Submit:", purchaseOrder);
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

  console.log("purchase order:", purchaseOrder);

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
          <div className="absolute w-full bottom-0 bg-white border-t">
            <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]">
              Submit
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
    </UserLayout>
  );
};

export default CreatePurchaseorder;