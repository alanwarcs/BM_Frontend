import React, { useState, useEffect } from "react";
// Assuming you're using Axios for API calls
import axios from "axios";
import { Link } from "react-router-dom";
import TextInput from "../ReusableComponents/TextInput";
import SelectInput from "../ReusableComponents/SelectInput";
import UserLayout from "../ReusableComponents/UserLayout";
import LoadingBar from "../../LoadingBar";
import Alert from "../../Alert";

const AddItem = () => {
  const [activeTab, setActiveTab] = useState("Sell");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    businessId: "",
    locationId: [],
    units: [{ category: "", value: 0, unit: "", description: "", customAttributes: {} }],
    sellInfo: { price: 0, currency: "INR" },
    purchaseInfo: { purchasePrice: 0, purchaseCurrency: "INR", vendorId: "" },
    gst: { intraStateGST: 0, interStateGST: 0 },
    taxPreference: "",
    sku: "",
    hsnOrSac: "",
    availableQuantity: 0,
    stockValue: 0,
  });
  const [vendors, setVendors] = useState([]); // List of vendors

  // Fetch vendors from backend
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('/api/vendor/vendors'); // Replace with your actual endpoint
        setVendors(response.data.data.vendors);
      } catch (error) {
        setAlert({ message: "Failed to load vendors.", type: "error" });
      }
    };

    fetchVendors();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = (field, nestedField, value) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [nestedField]: value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingProgress(50);

    // Simulate submission
    setTimeout(() => {
      setLoadingProgress(100);
      setAlert({ message: "Item added successfully!", type: "success" });
    }, 2000);
  };

  return (
    <UserLayout>
      {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

      <div className="flex flex-col relative h-full w-full text-start">
        <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
          <p>Add Item</p>
          <Link to="/items" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
            Items List
          </Link>
        </div>

        <hr />

        <form className="h-full overflow-scroll" onSubmit={handleSubmit}>
          <div className="flex flex-wrap p-4">
            {/* Item Type */}
            <div className="text-gray-700 text-sm h-fit m-2">
              <div className="flex mb-2">
                <p>Type:</p>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex h-[35px] items-center ms-4">
                <div className="flex items-center mx-2">
                  <input
                    type="radio"
                    id="services"
                    name="itemType"
                    value="Services"
                    className="mr-2"
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  />
                  <label htmlFor="services">Services</label>
                </div>
                <div className="flex items-center mx-2">
                  <input
                    type="radio"
                    id="product"
                    name="itemType"
                    value="Product"
                    className="mr-2"
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  />
                  <label htmlFor="product">Product</label>
                </div>
              </div>
            </div>

            {/* Item Name */}
            <TextInput
              label="Item Name"
              id="itemName"
              placeholder="Enter Item name"
              required
              onChange={(e) => handleInputChange("itemName", e.target.value)}
            />

            {/* SKU */}
            <TextInput
              label="SKU"
              id="sku"
              placeholder="Enter SKU"
              onChange={(e) => handleInputChange("sku", e.target.value)}
            />

            {/* HSN/SAC */}
            <TextInput
              label="HSN/SAC"
              id="hsnOrSac"
              placeholder="Enter HSN/SAC"
              onChange={(e) => handleInputChange("hsnOrSac", e.target.value)}
            />

            {/* Tabs */}
            <div className="flex space-x-4 border-b w-full overflow-y-scroll scrollbar-hide">
              {["Sell", "Purchase", "GST/Tax", "Units", "Stocks and Storage", "Other"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-customPrimary" : "text-gray-600"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sell Tab */}
            {activeTab === "Sell" && (
              <div className="block">
                <TextInput
                  label="Sell Price"
                  id="sellPrice"
                  type="number"
                  placeholder="Enter Sell Price"
                  required
                  onChange={(e) => handleNestedChange("sellInfo", "price", e.target.value)}
                />
                <SelectInput
                  id="sellCurrency"
                  label="Sell Currency"
                  options={[{ value: "INR", label: "INR" }, { value: "USD", label: "USD" }]} // Add more currencies as needed
                  onChange={(e) => handleNestedChange("sellInfo", "currency", e.target.value)}
                />
              </div>
            )}

            {/* Purchase Tab */}
            {activeTab === "Purchase" && (
              <div className="block">
                <TextInput
                  label="Purchase Price"
                  id="purchasePrice"
                  type="number"
                  placeholder="Enter Purchase Price"
                  required
                  onChange={(e) => handleNestedChange("purchaseInfo", "purchasePrice", e.target.value)}
                />
                <SelectInput
                  id="purchaseCurrency"
                  label="Purchase Currency"
                  options={[{ value: "INR", label: "INR" }]}
                  onChange={(e) => handleNestedChange("purchaseInfo", "purchaseCurrency", e.target.value)}
                  value={formData.purchaseInfo.purchaseCurrency} // Ensure the value reflects the current state
                />

                {/* Preferred Vendor */}
                <SelectInput
                  id="vendorId"
                  label="Preferred Vendor"
                  options={vendors.map((vendor) => ({
                    value: vendor._id,
                    label: vendor.displayName, // Ensure the correct field is used for display
                  }))}
                  onChange={(e) => handleNestedChange("purchaseInfo", "vendorId", e.target.value)}
                  value={formData.purchaseInfo.vendorId || ""} // Set to empty if no vendor is selected
                />
              </div>
            )}

            {/* GST Tab */}
            {activeTab === "GST/Tax" && (
              <div className="block">
                <SelectInput
                  id="taxPreference"
                  label="Tax Preference"
                  value={formData.taxPreference}
                  required
                  options={[
                    { label: "GST Inclusive", value: "GST Inclusive" },
                    { label: "GST Exclusive", value: "GST Exclusive" },
                    { label: "No GST", value: "No GST" }
                  ]}
                />


                <SelectInput
                  id="intraStateGST"
                  label="IntraState GST"
                  value={formData.gst.intraStateGST}
                  options={[
                    { label: "0%", value: "0" },
                    { label: "5%", value: "5" },
                    { label: "12%", value: "12" },
                    { label: "18%", value: "18" },
                    { label: "28%", value: "28" }
                  ]}
                />

                {/* InterState GST */}
                <SelectInput
                  id="interStateGST"
                  label="InterState GST"
                  value={formData.gst.interStateGST}
                  options={[
                    { label: "0%", value: "0" },
                    { label: "5%", value: "5" },
                    { label: "12%", value: "12" },
                    { label: "18%", value: "18" },
                    { label: "28%", value: "28" }
                  ]}
                />
              </div>
            )}

            {/*Units */}
            {activeTab === "Units" && (
              <div className="block">
                {/* Category */}
                <SelectInput
                  id="category"
                  label="Category"
                  value={formData.units.category}
                  options={[
                    { label: "Quantity", value: "Quantity" },
                  ]}
                />

                {/* Unit */}
                <SelectInput
                  id="unit"
                  label="Unit"
                  value={formData.units.unit}
                  options={[
                    { label: "nos", value: "nos" },
                  ]}
                />
              </div>
            )}

            {/* Stocks and Units */}
            {activeTab === "Stocks and Storage" && (
              <div className="block">

              </div>
            )}

            {/* Other */}
            {activeTab === "Other" && (
              <div className="block">

              </div>
            )}

          </div>

          {/* Submit Button */}
          <div className="absolute w-full bottom-0 bg-white border-t">
            <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]">
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Alert */}
      {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
    </UserLayout>
  );
};

export default AddItem;
