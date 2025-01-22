import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../ReusableComponents/TextInput'
import SelectInput from '../ReusableComponents/SelectInput'
import UserLayout from '../ReusableComponents/UserLayout';
import LoadingBar from '../../LoadingBar';
import Alert from '../../Alert';

const AddItem = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  return (
    <UserLayout>
      {loadingProgress > 0 && <LoadingBar progress={loadingProgress} />}

      <div className="flex flex-col relative h-full w-full text-start">
        <div className="flex flex-row items-center justify-between px-3 text-2xl text-start py-2">
          <p>Add item</p>
          <Link to="/items" className="p-2 m-1 bg-gray-100 rounded-md text-sm font-light outline outline-gray-200 hover:outline-gray-400">Items List</Link>
        </div>

        <hr />

        <form className='h-full overflow-scroll'>

          <div className='flex flex-wrap p-4'>

            {/* Item Type */}
            <div className='text-gray-700 text-sm h-fit m-2'>
              <div className='flex mb-2'>
                <p>Type:</p>
                <span className="text-red-500">*</span>
              </div>
              <div className='flex h-[35px] items-center ms-4'>
                <div className="flex items-center mx-2">
                  <input type="radio" id="services" name="itemType" value="Services" className="mr-2" />
                  <label htmlFor="services">Services</label>
                </div>
                <div className="flex items-center mx-2">
                  <input type="radio" id="product" name="itemType" value="Product" className="mr-2" />
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
            />

            {/* Item Unit */}
            <SelectInput
              id="unit"
              label="Unit"
              options={[
                { value: 'INR', label: 'INR' },
              ]}
              required
            />

            {/* Item Stock keeping Unit */}
            <TextInput
              label="SKU"
              id="sku"
              placeholder="Enter hsn/sac"
            />


            {/* Item hsn/sac */}
            <TextInput
              label="HSN/SAC"
              id="hsnOrSac"
              placeholder="Enter hsn/sac"
            />

            {/* Item Stock keeping Unit */}
            <TextInput
              label="Available Quantity"
              id="availableQuantity"
              placeholder="Enter Available Quantity"
            />
            {/* Item Discription */}
            <div className="flex flex-col m-2">
              <label htmlFor="description" className="block text-gray-700 text-sm mb-2">
                Description:
              </label>
              <textarea
                id="description"
                className="w-[250px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                rows="4"
                placeholder="Enter any information/description"
              ></textarea>
            </div>
          </div>

          <div className='absolute w-full bottom-0 bg-white border-t'>
            <button type="submit" className="rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-2 px-2 text-white text-[16px]">
              Submit
            </button>
          </div>
        </form>
      </div>

      {alert && (
        <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
      )}
    </UserLayout>
  );
};

export default AddItem;