import React from 'react';

const TextInput = ({ id, label, required, placeholder, value, onChange, type = "text", disabled = false }) => {
  return (
    <div className="flex flex-col m-2">
      <label htmlFor={id} className="block text-gray-700 text-sm mb-2">
        {label}: {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} // Use the 'type' prop (default is 'text')
        id={id}
        className={`w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 ${
          disabled ? "bg-gray-100 cursor-not-allowed outline-customSecondary " : "outline-customSecondary focus:outline-2 focus:outline-customSecondary"
        } text-gray-700 text-[14px]`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled} // Pass the 'disabled' prop
      />
    </div>
  );
}

export default TextInput;