import React, { useState } from "react";
import TextInput from "../ReusableComponents/TextInput";
import SelectInput from "../ReusableComponents/SelectInput";
import UserLayout from "../ReusableComponents/UserLayout";
import LoadingBar from "../../LoadingBar";
import { Link } from "react-router-dom";
import Alert from "../../Alert";
import axios from "axios";

const AddStorage = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    storageType: "",
    storageName: "",
    storageAddress: "",
    capacity: "",
    capacityUnit: "",
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    // Update form data
    let updatedFormData = { ...formData, [id]: value };

    // Clear capacityUnit if capacity is empty or 0
    if (id === "capacity" && (!value || value <= 0)) {
      updatedFormData = { ...updatedFormData, capacityUnit: null };
    }

    // Update the form data state
    setFormData(updatedFormData);
  };

  // Validate Form Fields
  const validateForm = () => {
    if (!formData.storageType?.trim()) {
      setAlert({
        message: 'Storage Type is required.',
        type: 'error',
      });
      return false;
    }

    if (!formData.storageName?.trim()) {
      setAlert({
        message: 'Storage Name is required.',
        type: 'error',
      });
      return false;
    }

    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity <= 0)) {
      setAlert({
        message: 'Capacity must be a positive number.',
        type: 'error',
      });
      return false;
    }

    if (formData.capacity?.trim() && !formData.capacityUnit?.trim()) {
      setAlert({
        message: 'Capacity Unit is required if capacity is provided.',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoadingProgress(30);

    if (!validateForm()) {
      setLoadingProgress(0);
      return;
    }

    setLoadingProgress(50);

    try {
      // Send data to the backend
      const response = await axios.post("/api/storage/addstorage", formData);
      setLoadingProgress(100);

      if (response.data.success) {
        setAlert({ message: "Storage added successfully!", type: "success" });
        // Reset form
        setFormData({
          storageName: "",
          capacity: "",
          storageAddress: "",
          capacityUnit: "",
          storageType: "",
        });

        setTimeout(() => {
          setLoadingProgress(0);
        }, 1000);
      } else {
        setAlert({ message: response.data.message || "Failed to add storage.", type: "error" });
      }
    } catch (error) {
      setLoadingProgress(0);
      setAlert({ message: "An error occurred. Please try again.", type: "error" });
    } finally {
      setLoadingProgress(0);
    }
  };

  return (
    <UserLayout>
      {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

      <div className="flex flex-col relative h-full w-full text-start">
        {/* Header */}
        <div className="flex flex-row items-center justify-between px-3 text-2xl py-2">
          <p>Add Storage</p>
          <div className="flex">
            <Link
              to="/storage"
              className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400"
            >
              Storage List
            </Link>
          </div>
        </div>

        <hr />

        {/* Form */}
        <form className="h-full overflow-scroll" onSubmit={handleSubmit}>
          <div className="flex flex-wrap p-4 mb-10">

            {/* Storage Type */}
            <SelectInput
              id="storageType"
              label="Storage Type"
              required
              value={formData.storageType || ""}
              onChange={handleChange}
              options={[
                { value: "warehouse", label: "Warehouse" },
                { value: "cold storage", label: "Cold Storage" },
                { value: "retail store", label: "Retail Store" },
                { value: "distribution center", label: "Distribution Center" },
                { value: "other", label: "Other" },
              ]}
            />

            {/* Storage Name */}
            <TextInput
              label="Storage Name"
              id="storageName"
              placeholder="Enter storage name"
              value={formData.storageName}
              onChange={handleChange}
              required
            />

            {/* Capacity */}
            <TextInput
              label="Capacity"
              id="capacity"
              placeholder="Enter capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
            />

            {/* Capacity Unit */}
            <SelectInput
              id="capacityUnit"
              label="Capacity Unit"
              required={!!formData.capacity}  // Conditionally required
              value={formData.capacityUnit || ""}
              onChange={handleChange}
              disabled={!formData.capacity}  // Disable if capacity is empty or 0
              options={[
                { value: "units", label: "Units" },
                { value: "kg", label: "Kilograms" },
                { value: "liters", label: "Liters" },
                { value: "cubic meters", label: "Cubic Meters" },
              ]}
            />

            {/* Address */}
            <div className="flex flex-col m-2">
              <label htmlFor="storageAddress" className="block text-gray-700 text-sm mb-2">
                Address
              </label>
              <textarea
                id="storageAddress"
                value={formData.storageAddress}
                onChange={handleChange}
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                rows="4"
                placeholder="Enter storage address"
              ></textarea>
            </div>
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

export default AddStorage;
