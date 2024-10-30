import React, { useState } from 'react'

const SelectPlan = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [planValidity, setPlanValidity] = useState('monthly');

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle radio button change
  const handleChange = (event) => {
    setPlanValidity(event.target.value);
  };

  const plans = [
    // Monthly Plans
    { name: "Basic", price: 10, duration: "30", features: ["Basic Feature", "Invoice Generation", "Customer Management", "Vendor Management"] },
    { name: "Standard", price: 20, duration: "30", features: ["Advance Feature", "Invoice Generation", "CRM Management", "Live SMS/Email Management"] },
    { name: "Premium", price: 50, duration: "30", features: ["Advance Feature", "CRM Management ", "Customer SMS/Email Reminder", "Live SMS/Email Management"] },

    // Yearly Plans
    { name: "Basic", price: 100, duration: "365", features: ["Basic Feature", "Invoice Generation", "Customer Management", "Vendor Management"] },
    { name: "Standard", price: 200, duration: "365", features: ["Advance Feature", "Invoice Generation", "CRM Management", "Live SMS/Email Management"] },
    { name: "Premium", price: 500, duration: "365", features: ["Advance Feature", "CRM Management ", "Customer SMS/Email Reminder", "Live SMS/Email Management"] },
  ];

  return (
    <div className='relative flex flex-col items-center w-full min-h-screen max-h-screen p-1'>
      <div className='flex text-center md:text-left items-center justify-between w-full my-2'>
        <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
        <div className='flex items-center underline mx-1' onClick={toggleDropdown} tabIndex={0} role="button" aria-expanded={isDropdownOpen} onKeyDown={(e) => { if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen); }}>
          <p className='m-1'>Murtaza Patel</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {isDropdownOpen && (
          <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
            <ul className="max-h-48 overflow-y-auto w-[120px]">
              <li className="p-3 hover:bg-gray-100">
                <a href="/">Logout</a>
              </li>
            </ul>
          </div>
        )}
      </div>
      <form className='flex flex-col rounded-xl w-full p-5 text-left'>
        <div className='flex flex-col md:flex-row items-center md:justify-between w-full'>
          <div className='text-center md:text-left'>
            <h3 className='text-[18px] font-semibold'>Grow smarter, choose the plan that fits your goals</h3>
            <p className='text-gray-400'>Flexible options tailored to your needs, helping you grow every step of the way.</p>
          </div>
          <div className='flex flex-row w-100 border border-customPrimary border-1 rounded-full p-[2px] max-h-[50px]'>
            <label className={`flex w-[100px] p-2 text-center items-center justify-center cursor-pointer rounded-full ${planValidity === "monthly" ? "bg-customPrimary text-white" : "bg-transparent text-black"} transition-all duration-500`}>
              <p>Monthly</p>
              <input
                type="radio"
                name="planValidity"
                value="monthly"
                checked={planValidity === 'monthly'}
                onChange={handleChange}
                className="hidden"
              />
            </label>
            <label className={`flex w-[100px] p-2 text-center items-center justify-center cursor-pointer rounded-full ${planValidity === "yearly" ? "bg-customPrimary text-white" : "bg-transparent text-black"} transition-all duration-500`}>
              <input
                type="radio"
                name="planValidity"
                value="yearly"
                checked={planValidity === 'yearly'}
                onChange={handleChange}
                className="hidden"
              />
              <p>Yearly</p>
            </label>
            <input type="checkbox" name="planValidity" id="planValidity" hidden />
          </div>
        </div>
        <div className='flex flex-row md:flex-col justify-center md:py-20'>
          {planValidity === "monthly" ? (
            <div className='flex flex-col md:flex-row justify-evenly m-3'>
              {plans
                .filter((plan) => plan.duration === "30")
                .map((plan, index) => (
                  <div key={index} className='flex flex-col justify-between max-w-[340px] p-8 m-2 bg-transparent border border-customSecondary hover:bg-customPrimary text-black hover:text-white rounded-3xl shadow-md'>
                    <h4 className='text-[18px] text-gray-400 font-semibold'>{plan.name}</h4>
                    <span className='flex items-end'>
                      <h2 className='text-[32px] my-5'>₹{plan.price}/yr</h2>
                    </span>
                    <p className='whitespace-normal my-5'>Choose the perfect plan to accelerate your growth!</p>
                    <ul className='text-gray-400 py-5'>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className='flex items-center m-1'>
                          <svg xmlns="http://www.w3.org/2000/svg" className='me-2' width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                          <span className='ms-1 whitespace-pre'>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className='py-3 px-4 m-5 bg-white rounded-lg outline outline-1 outline-customSecondary hover:outline-2 focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]'>Choose One</button>
                  </div>
                ))

              }
            </div>
          ) : (
            <div className='flex flex-col md:flex-row justify-evenly m-3'>
              {plans
                .filter((plan) => plan.duration === "365")
                .map((plan, index) => (
                  <div key={index} className='flex flex-col justify-between max-w-[340px] p-8 m-2 bg-transparent border border-customSecondary hover:bg-customPrimary text-black hover:text-white rounded-3xl shadow-md'>
                    <h4 className='text-[18px] text-gray-400 font-semibold'>{plan.name}</h4>
                    <span className='flex items-end'>
                      <h2 className='text-[32px] my-5'>₹{plan.price}/yr</h2>
                    </span>
                    <p className='whitespace-normal my-5'>Choose the perfect plan to accelerate your growth!</p>
                    <ul className='text-gray-400 py-5'>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className='flex items-center m-1'>
                          <svg xmlns="http://www.w3.org/2000/svg" className='me-2' width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                          <span className='ms-1 whitespace-pre'>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className='py-3 px-4 m-5 bg-white rounded-lg outline outline-1 outline-customSecondary hover:outline-2 focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]'>Choose One</button>
                  </div>
                ))

              }
            </div>
          )}
        </div>
      </form>
      <footer className='absolute bottom-0 py-4 items-center'>
        <p className='text-sm font-thin text-center text-gray-500'>
          Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
        </p>
      </footer>
    </div>
  )
}

export default SelectPlan
