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
    itemName: "",
    itemType: "Product",
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
  });

  const MAX_UNITS = 4;
  const MAX_STORAGE = 4;

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
          units: [...prevData.units, { category: "", value: 0, unit: "", description: "" }],
        };
      } else {
        setAlert({ message: `You can only add up to ${MAX_UNITS} units.`, type: "error" });
        return prevData;
      }
    });
  };

  const removeUnits = (index) => {
    setFormData((prevData) => {
      const updatedUnits = prevData.units.filter((_, i) => i !== index);
      return { ...prevData, units: updatedUnits };
    });
  };

  // Add Storage Location
  const addStorageLocation = () => {
    setFormData((prevData) => {
      const currentLocations = prevData.locationId || [];
      if (currentLocations.length < MAX_STORAGE) {
        return {
          ...prevData,
          locationId: [...currentLocations, { location: "", quantity: 0 }]
        };
      } else {
        setAlert({ message: `You can only add up to ${MAX_STORAGE} storage locations.`, type: "error" });
        return prevData;
      }
    });
  };

  // Remove Storage Location
  const removeStorageLocation = (index) => {
    setFormData((prevData) => {
      // Filter out the location being removed
      const updatedLocations = prevData.locationId.filter((_, i) => i !== index);

      // Recalculate total quantity based on the remaining locations
      const totalQuantity = updatedLocations.reduce(
        (total, location) => total + (parseFloat(location.quantity) || 0),
        0
      );

      // Calculate the stock value based on purchasePrice and totalQuantity
      const purchasePrice = parseFloat(prevData.purchaseInfo.purchasePrice) || 0;
      const stockValue = purchasePrice * totalQuantity;

      // Return updated form data
      return {
        ...prevData,
        locationId: updatedLocations,
        totalQuantity,
        stockValue,
      };
    });
  };

  const handleChange = (path, value) => {
    setFormData((prevData) => {
      const keys = path.split(".");
      const updatedData = { ...prevData };

      let current = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key.endsWith("]")) {
          const [k, index] = key.slice(0, -1).split("[");
          current = current[k][parseInt(index)];
        } else {
          current = current[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

      // Calculate total quantity by summing up all the quantities in the locationId array
      const totalQuantity = updatedData.locationId.reduce(
        (total, location) => total + (parseFloat(location.quantity) || 0),
        0
      );

      // Calculate stock value if purchasePrice and totalQuantity are available
      const purchasePrice = parseFloat(updatedData.purchaseInfo.purchasePrice) || 0;
      const stockValue = purchasePrice * totalQuantity;

      updatedData.totalQuantity = totalQuantity; // Update total quantity in the form data
      updatedData.stockValue = stockValue; // Update stock value in the form data

      return updatedData;
    });
  };

  const validateForm = () => {
    const errors = {};

    // Item Name
    if (!formData.itemName.trim()) {
      setAlert({
        message: 'Item Name is required.',
        type: 'error',
      });
      return false;
    }

    // Sell Info
    if (!formData.sellInfo.price || formData.sellInfo.price <= 0) {
      setAlert({
        message: 'Sell Price must be greater than 0.',
        type: 'error',
      });
      return false;
    }

    // Purchase Info
    if (!formData.purchaseInfo.purchasePrice || formData.purchaseInfo.purchasePrice <= 0) {
      setAlert({
        message: 'Purchase Price must be greater than 0.',
        type: 'error',
      });
      return false;
    }

    // GST Info
    if (!formData.taxPreference) {
      setAlert({
        message: 'Tax Preference is required.',
        type: 'error',
      });
      return false;
    }

    if (formData.taxPreference === "GST Inclusive") {
      if (!formData.gst.intraStateGST) {
        setAlert({
          message: 'IntraState GST is required when Tax Preference is GST.',
          type: 'error',
        });
        return false;
      }
      if (!formData.gst.interStateGST) {
        setAlert({
          message: 'InterState GST is required when Tax Preference is GST.',
          type: 'error',
        });
        return false;
      }
    }

    // Units Validation
    if (formData.units.length === 0) {
      setAlert({
        message: 'At least one unit is required.',
        type: 'error',
      });
      return false;
    } else {
      formData.units.forEach((unit, index) => {
        if (!unit.category) {
          errors[`unitsCategory${index}`] = `Category is required for unit ${index + 1}.`;
          setAlert({
            message: `Category is required for unit ${index + 1}.`,
            type: 'error',
          });
          return false;
        }
        if (!unit.unit) {
          errors[`unitsUnit${index}`] = `Unit is required for unit ${index + 1}.`;
          setAlert({
            message: `Unit is required for unit ${index + 1}.`,
            type: 'error',
          });
          return false;
        }
      });
    }

    // Storage Locations Validation
    if (formData.locationId.length > 1) {
      formData.locationId.forEach((location, index) => {
        if (!location.location.trim()) {
          errors[`location${index}`] = `Location is required for storage.`;
          setAlert({
            message: `Location is required for storage at location ${index + 1}.`,
            type: 'error',
          });
          return false;
        }
        if (!location.quantity || location.quantity <= 0) {
          errors[`quantity${index}`] = `Quantity must be greater than 0 for location ${index + 1}.`;
          setAlert({
            message: `Quantity must be greater than 0 for location ${index + 1}.`,
            type: 'error',
          });
          return false;
        }
      });
    }

    // Stocks and Storage
    if (!formData.stockValue && formData.stockValue !== 0) {
      setAlert({
        message: 'Stock Value is required.',
        type: 'error',
      });
      return false;
    } else if (formData.stockValue < 0) {
      setAlert({
        message: 'Stock Value cannot be negative.',
        type: 'error',
      });
      return false;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setLoadingProgress(0);
      return;
    }

    setLoadingProgress(50);

    try {
      const response = await fetch("/api/item/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setLoadingProgress(100);
        setAlert({ message: "Item added successfully!", type: "success" });
        setFormData({
          itemName: "",
          itemType: "Product",
          locationId: [{ location: "", quantity: 0 }],
          units: [{ category: "", value: 0, unit: "", description: "" }],
          sellInfo: {
            price: 0,
            currency: "INR",
          },
          purchaseInfo: {
            purchasePrice: 0,
            purchaseCurrency: "INR",
            vendorId: "",
          },
          gst: {
            intraStateGST: 0,
            interStateGST: 0,
          },
          taxPreference: "",
          sku: "",
          hsnOrSac: "",
          stockValue: 0,
        });

        setTimeout(() => {
          setLoadingProgress(0);
          setAlert({ message: "Item added successfully!", type: "success" });
        }, 1000);

      } else {
        setAlert({ message: result.message || "Failed to add item!", type: "error" });
        setLoadingProgress(0);
      }
    } catch (error) {
      setAlert({ message: "An error occurred while adding the item.", type: "error" });
      setLoadingProgress(0);
    }
  };

  return (
    <UserLayout>
      {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

      <div className="flex flex-col relative h-full w-full text-start">
        <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
          <p>Add Item</p>
          <div className="flex">
            <Link to="/items" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
              Items List
            </Link>
            <Link to="/location" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">
              + Add New Location
            </Link>
          </div>
        </div>

        <hr />

        <form className="h-full overflow-scroll" onSubmit={handleSubmit}>
          <div className="flex flex-wrap p-4 mb-10">
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
              <div className="flex flex-wrap">
                {formData.units.map((unit, index) => (
                  <div key={index} className="block">
                    {/* Category Select */}
                    <SelectInput
                      id={`category-${index}`}
                      label="Category"
                      value={unit.category || ""}
                      required
                      options={measurementCategories.measurementCategories.map((category) => ({
                        label: category.categoryName,
                        value: category.categoryName.toLowerCase(),
                      }))}
                      onChange={(e) => handleChange(`units[${index}].category`, e.target.value)}
                    />

                    {/* Value Input */}
                    <TextInput
                      label="Value"
                      id={`value-${index}`}
                      type="number"
                      value={unit.value || ""}
                      placeholder="Enter Value"
                      onChange={(e) => handleChange(`units[${index}].value`, e.target.value)}
                    />

                    {/* Unit Select */}
                    {unit.category && (
                      <SelectInput
                        id={`unit-${index}`}
                        label="Unit"
                        value={unit.unit || ""}
                        required
                        options={
                          measurementCategories.measurementCategories
                            .find((category) => category.categoryName.toLowerCase() === unit.category)
                            ?.units.map((u) => ({
                              label: `${u.unitName} (${u.UQC})`,
                              value: u.UQC,
                            })) || []
                        }
                        onChange={(e) => handleChange(`units[${index}].unit`, e.target.value)}
                      />
                    )}

                    {/* Description Input */}
                    <TextInput
                      label="Description"
                      id={`description-${index}`}
                      value={unit.description || ""}
                      placeholder="Enter Description"
                      onChange={(e) => handleChange(`units[${index}].description`, e.target.value)}
                    />

                    {/* Remove Unit Button */}
                    <button
                      type="button"
                      className="text-red-500 text-sm px-2"
                      onClick={() => removeUnits(index)}
                    >
                      Remove Unit
                    </button>
                  </div>
                ))}

                {/* Add Unit Button */}
                {formData.units.length < MAX_UNITS && (
                  <div onClick={addUnits} className="flex justify-center items-center m-10 p-10 border border-dashed border-gray-300 rounded-md text-center text-gray-400 text-sm hover:border-customPrimary cursor-pointer">
                    <p>
                      + Add Another Unit
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stocks and Storage */}
            {activeTab === "Stocks and Storage" && (
              <div className="flex flex-wrap">
                {formData.locationId && formData.locationId.map((locationId, index) => (
                  <div key={index} className="block">
                    <SelectInput
                      id={`storage-${index}-location`}
                      label="Location"
                      value={locationId.location || ""}
                      required={formData.locationId.length > 1} // Add required conditionally
                      onChange={(e) => handleChange(`locationId[${index}].location`, e.target.value)}
                      options={[
                        { label: "warehouse", value: "Warehouse" },
                      ]}
                    />

                    <TextInput
                      id={`storage-${index}-quantity`}
                      type="number"
                      label="Quantity"
                      placeholder="Quantity"
                      value={locationId.quantity}
                      required={formData.locationId.length > 1} // Add required conditionally
                      onChange={(e) => handleChange(`locationId[${index}].quantity`, e.target.value)}
                    />

                    <button
                      type="button"
                      className=" p-1 text-sm text-red-500"
                      onClick={() => removeStorageLocation(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {/* Add Unit Button */}
                {formData.locationId?.length < MAX_UNITS && (
                  <div onClick={addStorageLocation} className="flex justify-center items-center m-10 p-10 border border-dashed border-gray-300 rounded-md text-center text-gray-400 text-sm hover:border-customPrimary cursor-pointer">
                    <p>+ Add Another Unit</p>
                  </div>
                )}
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
      </div >

      {/* Alert */}
      {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
    </UserLayout >
  );
};

export default AddItem