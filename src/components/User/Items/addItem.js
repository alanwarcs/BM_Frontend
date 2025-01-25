import React, { useState, useEffect } from "react";
import measurementCategories from "../../../data/measurementCategories.json"; // Adjust the path as needed
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
  const [vendors, setVendors] = useState([]); // List of vendors
  const [formData, setFormData] = useState({
    locationId: [{ location: "", quantity: 0 }],
    units: [{ category: "", value: 0, unit: "", description: "" }],
    sellInfo: {
      price: 0,
      currency: "INR"
    },
    purchaseInfo: {
      purchasePrice: 0,
      purchaseCurrency: "INR",
      vendorId: ""
    },
    gst: {
      intraStateGST: 0,
      interStateGST: 0
    },
    taxPreference: "",
    sku: "",
    hsnOrSac: "",
    stockValue: 0,
    itemName: "",
    itemType: "Product",
    description: ""
  });

  const MAX_UNITS = 5;
  const MAX_LOCATION = 5;

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

  const addUnits = () => {
    setFormData((prevData) => {
      if (prevData.units.length < MAX_UNITS) {
        return {
          ...prevData,
          customFields: [...prevData.units, { fieldName: '', fieldValue: '' }],
        };
      } else {
        alert(`You can only add up to ${MAX_UNITS} custom fields.`);
        return prevData;
      }
    });
  }

  //Remove Custom detail
  const removeUnits = (index) => {
    setFormData((prevData) => {
      const updatedCustomFields = prevData.units.filter((_, i) => i !== index);
      return { ...prevData, customFields: updatedCustomFields };
    });
  };

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [section, subField] = field.split(".");
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [section]: {
            ...prev[section],
            [subField]: value,
          },
        };

        // Recalculate stockValue if purchasePrice or quantity changes
        if (section === "purchaseInfo" && subField === "purchasePrice") {
          updatedData.stockValue =
            updatedData.locationId[0].quantity * parseFloat(value || 0);
        } else if (section === "locationId" && subField === "quantity") {
          updatedData.stockValue =
            parseFloat(updatedData.purchaseInfo.purchasePrice || 0) * value;
        }

        return updatedData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Validate Form Fields
  const validateForm = () => {
    const errors = {};

    // Item Name
    if (!formData.itemName.trim()) {
      errors.itemName = "Item Name is required.";
    }

    // Sell Info
    if (!formData.sellInfo.price || formData.sellInfo.price <= 0) {
      errors.sellInfoPrice = "Sell Price must be greater than 0.";
    }

    // Purchase Info
    if (!formData.purchaseInfo.purchasePrice || formData.purchaseInfo.purchasePrice <= 0) {
      errors.purchaseInfoPrice = "Purchase Price must be greater than 0.";
    }

    // GST Info
    if (!formData.taxPreference) {
      errors.taxPreference = "Tax Preference is required.";
    }

    if (formData.taxPreference === "GST Inclusive") {
      if (!formData.gst.intraStateGST) {
        errors.intraStateGST = "IntraState GST is required when Tax Preference is GST.";
      }
      if (!formData.gst.interStateGST) {
        errors.interStateGST = "InterState GST is required when Tax Preference is GST.";
      }
    }

    // Units
    if (!formData.units.category) {
      errors.unitsCategory = "Category is required.";
    }
    if (!formData.units.value || formData.units.value <= 0) {
      errors.unitsValue = "Value must be greater than 0.";
    }
    if (!formData.units.unit) {
      errors.unitsUnit = "Unit is required.";
    }

    // Stocks and Storage
    if (!formData.stockValue && formData.stockValue !== 0) {
      errors.stockValue = "Stock Value is required.";
    } else if (formData.stockValue < 0) {
      errors.stockValue = "Stock Value cannot be negative.";
    }
    // Return errors object
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setAlert({ message: "Please fill all required fields.", type: "error" });
      console.log(validationErrors);
      return;
    }

    setLoadingProgress(50);
    console.log(formData);
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
                    checked={formData.itemType === "Services"}
                    onChange={(e) => handleChange("itemType", e.target.value)}
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
                    checked={formData.itemType === "Product"}
                    onChange={(e) => handleChange("itemType", e.target.value)}
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
              value={formData.itemName}
              required
              onChange={(e) => handleChange("itemName", e.target.value)}
            />

            {/* SKU */}
            <TextInput
              label="SKU"
              id="sku"
              value={formData.sku}
              placeholder="Enter SKU"
              onChange={(e) => handleChange("sku", e.target.value)}
            />

            {/* HSN/SAC */}
            <TextInput
              label="HSN/SAC"
              id="hsnOrSac"
              value={formData.hsnOrSac}
              placeholder="Enter HSN/SAC"
              onChange={(e) => handleChange("hsnOrSac", e.target.value)}
            />

            {/* Tabs */}
            <div className="flex space-x-4 border-b w-full overflow-y-scroll scrollbar-hide">
              {["Sell", "Purchase", "GST/Tax", "Units", "Stocks and Storage"].map((tab) => (
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
                  value={formData.sellInfo.price}
                  type="number"
                  placeholder="Enter Sell Price"
                  required
                  onChange={(e) => handleChange("sellInfo.price", e.target.value)}
                />
                <SelectInput
                  id="sellCurrency"
                  label="Sell Currency"
                  value={formData.sellInfo.currency}
                  required
                  options={[{ value: "INR", label: "INR" }]}
                  onChange={(e) => handleChange("sellInfo.currency", e.target.value)}
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
                  value={formData.purchaseInfo.purchasePrice}
                  placeholder="Enter Purchase Price"
                  required
                  onChange={(e) => handleChange("purchaseInfo.purchasePrice", e.target.value)}
                />
                <SelectInput
                  id="purchaseCurrency"
                  label="Purchase Currency"
                  options={[{ value: "INR", label: "INR" }]}
                  onChange={(e) => handleChange("purchaseInfo.purchaseCurrency", e.target.value)}
                  required
                  value={formData.purchaseInfo.purchaseCurrency}
                />
                <SelectInput
                  id="vendorId"
                  label="Preferred Vendor"
                  options={vendors.map((vendor) => ({
                    value: vendor._id,
                    label: vendor.displayName,
                  }))}
                  onChange={(e) => handleChange("purchaseInfo.vendorId", e.target.value)}
                  value={formData.purchaseInfo.vendorId || ""}
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
                  onChange={(e) => handleChange("taxPreference", e.target.value)}
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
                  onChange={(e) => handleChange("gst.intraStateGST", e.target.value)}
                />

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
                  onChange={(e) => handleChange("gst.interStateGST", e.target.value)}
                />
              </div>
            )}

            {/* Units */}
            {activeTab === "Units" && (
              <div className="block">

                <SelectInput
                  id="category"
                  label="Category"
                  value={formData.units.category || ""}
                  required
                  options={measurementCategories.measurementCategories.map(category => ({
                    label: category.categoryName,
                    value: category.categoryName.toLowerCase(),
                  }))}
                  onChange={(e) => handleChange("units.category", e.target.value)}
                />

                <TextInput
                  label="Value"
                  id="value"
                  type="number"
                  value={formData.units.value}
                  placeholder="Enter Value"
                  required
                  onChange={(e) => handleChange("units.value", e.target.value)}
                />

                {/* Show the unit options based on selected category */}
                {formData.units.category && (
                  <SelectInput
                    id="unit"
                    label="Unit"
                    value={formData.units.unit || ""}
                    required
                    options={measurementCategories.measurementCategories
                      .find(category => category.categoryName.toLowerCase() === formData.units.category)
                      ?.units.map(unit => ({
                        label: `${unit.unitName} (${unit.UQC})`, // Fixed the concatenation
                        value: unit.UQC,
                      })) || []}
                    onChange={(e) => handleChange("units.unit", e.target.value)}
                  />
                )}

                <TextInput
                  label="Description"
                  id="description"
                  value={formData.units.description}
                  placeholder="Enter Description"
                  onChange={(e) => handleChange("units.description", e.target.value)}
                />
              </div>
            )}

            {/* Stocks and Storage */}
            {activeTab === "Stocks and Storage" && (
              <div className="block">
                {/* Quantity */}
                <TextInput
                  label="Quantity"
                  id="quantity"
                  value={formData.locationId.quantity}
                  type="number"
                  placeholder="Enter Quantity"
                  required
                  onChange={(e) => handleChange("locationId.quantity", e.target.value)}
                />

                {/* Stock Value */}
                <TextInput
                  label="Stock Value"
                  id="stockValue"
                  type="number"
                  value={formData.stockValue}
                  placeholder="Enter Stock Value"
                  required
                  disabled
                  onChange={(e) => handleChange("stockValue", e.target.value)}
                />

                {/* Location */}
                <SelectInput
                  id="location"
                  label="Location"
                  value={formData.locationId.location}
                  options={[
                    { label: "", value: "" },
                    { label: "New York", value: "new_york" },
                    { label: "Los Angeles", value: "los_angeles" },
                    { label: "Chicago", value: "chicago" },
                  ]}
                  onChange={(e) => handleChange("locationId.location", e.target.value)}
                />
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
