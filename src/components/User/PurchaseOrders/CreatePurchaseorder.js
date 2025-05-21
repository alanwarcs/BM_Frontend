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
        quantity: 0,
        unit: "nos",
        rate: "0",
        tax: 0,
        discount: "0",
        cgstAmount: "0",
        sgstAmount: "0",
        igstAmount: "0",
        totalPrice: "0",
      },
    ],
    discount: "0",
    discountType: "Flat",
    roundOff: false,
    roundOffAmount: "0",
    taxAmount: "0",
    totalAmount: "0",
    paidAmount: "0",
    dueAmount: "0",
    attachments: [
      {
        fileName: "",
        filePath: "",
        uploadedBy: "",
        uploadedAt: "",
      },
    ],
    createdBy: user ? user.id : "",
    updatedBy: user ? user.id : "",
    isDeleted: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch PurchaseOrder and Business Details
        const poRes = await axios.get("/api/purchase-order/generate", { withCredentials: true });
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

        // Fetch VendorList
        const vendorRes = await axios.get("/api/vendor/vendors/list");
        if (vendorRes.status === 200) {
          setVendors(vendorRes.data.data);
        }

        // Fetch Storage List
        const response = await axios.get("/api/storage/getList");
        setAvailableStorage(response.data.data.storage || []);

        // Fetch all States within India
        const allStates = State.getStatesOfCountry("IN");
        setStates(allStates || []);
      } catch (err) {
        setAlert({ message: "Error fetching initial data", type: "error" });
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "deliveryLocation") {
      try {
        if (value) {
          const response = await axios.get(`/api/storage/getStorageDetails/${value}`);
          const storageState = response.data.storage.storageState || "";
          const storageAddress = response.data.storage.storageAddress || "";
          setPurchaseOrder((prevState) => ({
            ...prevState,
            deliveryState: storageState,
            shippingAddress: storageAddress,
            deliveryLocation: value,
          }));
        }
      } catch (error) {
        setAlert({ message: "Failed to fetch storage details.", type: "error" });
      }
    } else {
      setPurchaseOrder((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVendorSelect = ({ vendorId, vendorName }) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      vendorId,
      vendorName,
    }));
  };

const handleProductSelect = (product) => {
  if (!product) {
    setAlert({ message: "Invalid product selected.", type: "error" });
    return;
  }

  setPurchaseOrder((prev) => {
    const updatedProducts = [...prev.products];
    updatedProducts[0] = {
      ...updatedProducts[0],
      productId: product.productId || "",
      productName: product.productName || "Unknown Product",
      quantity: product.quantity ?? updatedProducts[0].quantity, // Preserve or update quantity
      rate: product.rate || "0",
      tax: product.tax || 0,
      unit: product.unit || "nos",
      discount: product.discount ?? updatedProducts[0].discount, // Preserve or update discount
    };
    return {
      ...prev,
      products: updatedProducts,
    };
  });
};

  const deliveryLocationOptions = [
    userAddress || { value: "", label: "Loading user address..." },
    ...(Array.isArray(availableStorage)
      ? availableStorage.map((storage) => ({
          value: storage.address || storage.name || storage._id,
          label: `${storage.storageName || "Storage"}`,
        }))
      : []),
  ];

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
        <form className="h-full overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
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
          <ProductTable selectedProducts={purchaseOrder.products} onProductSelect={handleProductSelect} />
        </form>
      </div>
      {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
    </UserLayout>
  );
};

export default CreatePurchaseorder;