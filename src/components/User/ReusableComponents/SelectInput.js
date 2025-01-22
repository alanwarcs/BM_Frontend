import React from 'react'

const SelectInput = ({ id, label, required, value, onChange, options }) => {
    return (
        <div className="flex flex-col m-2">
            <label htmlFor={id} className="block text-gray-700 text-sm mb-2">
                {label}: {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={id}
                className="w-[250px] h-[35px] py-2 px-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]"
                value={value}
                onChange={onChange}
            >
                <option value="" disabled>
                    Select {label}
                </option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SelectInput
