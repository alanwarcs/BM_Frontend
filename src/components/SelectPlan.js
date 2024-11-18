import React, { useState } from 'react';
import { usePlans } from '../context/plansContext';
import SignOutButton from './SignOutButton';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import axios from 'axios'; // Add axios for making API requests

const SelectPlan = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [planValidity, setPlanValidity] = useState('monthly');
  const { user, isLoading } = useUser();
  const { plans, isPlansLoading } = usePlans();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle radio button change
  const handleChange = (event) => {
    setPlanValidity(event.target.value);
  };

  const handleSelectPlan = async (plan) => {
    try {
      // Send a POST request to create an order
      const response = await axios.post('/api/payment/create-order', { planId: plan._id });

      // Check if the response is successful
      if (response.data.success) {

        localStorage.setItem('orderDetails', JSON.stringify(response.data));
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
  
        navigate('/checkout')
      } else {
        // Show error alert if something went wrong
        alert('Failed to create order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while creating the order.', error.message);
    }
  };

  if (isLoading || isPlansLoading) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Optionally show a loading indicator
  };

  return (
    <div className='relative flex flex-col items-center w-full min-h-screen max-h-screen p-1'>
      {/* Header */}
      <div className='flex text-center md:text-left items-center justify-between w-full my-2'>
        <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
        <div className='flex items-center underline mx-1' onClick={toggleDropdown} tabIndex={0} role="button" aria-expanded={isDropdownOpen} onKeyDown={(e) => { if (e.key === 'Enter') setIsDropdownOpen(!isDropdownOpen); }}>
          <p className='m-1'>{user?.name}</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {isDropdownOpen && (
          <div className='absolute right-0 top-16 max-h-60 m-1 bg-white rounded-lg shadow z-10 text-center overflow-hidden py-1'>
            <ul className="max-h-48 overflow-y-auto w-[120px]">
              <li className="p-3 hover:bg-gray-100">
                <SignOutButton />
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Form */}
      <form className='flex flex-col rounded-xl w-full text-left'>
        <div className='flex flex-col items-center md:justify-between w-full px-4'>
          <div className='text-center m-2'>
            <h3 className='text-[18px] font-semibold'>Grow smarter, choose the plan that fits your goals</h3>
            <p className='text-gray-400'>Flexible options tailored to your needs, helping you grow every step of the way.</p>
          </div>
          <div className='flex flex-row w-100 border border-customPrimary border-1 rounded-full p-[2px] m-2 max-h-[50px]'>
            <label className={`flex w-[100px] p-2 text-center items-center justify-center cursor-pointer rounded-full ${planValidity === "monthly" ? "bg-customPrimary text-white" : "bg-transparent text-black"}  transition-all duration-300`}>
              <p>Monthly</p>
              <input type="radio" name="planValidity" value="monthly" checked={planValidity === 'monthly'} onChange={handleChange} className="hidden" />
            </label>
            <label className={`flex w-[100px] p-2 text-center items-center justify-center cursor-pointer rounded-full ${planValidity === "yearly" ? "bg-customPrimary text-white" : "bg-transparent text-black"} transition-all duration-300`}>
              <input type="radio" name="planValidity" value="yearly" checked={planValidity === 'yearly'} onChange={handleChange} className="hidden" />
              <p>Yearly</p>
            </label>
            <input type="checkbox" name="planValidity" id="planValidity" hidden />
          </div>
        </div>

        {/* Plans Display */}
        <div className='flex flex-row md:flex-col justify-center'>
          {planValidity === "monthly" ? (
            <div className='flex justify-center m-3 flex-wrap'>
              {plans.filter((plan) => plan.durationDays === 30).length > 0 ? (
                plans
                  .filter((plan) => plan.durationDays === 30)
                  .map((plan, index) => (
                    <div key={index} className='flex flex-col justify-between max-w-[340px] p-8 m-3 border border-customSecondary bg-customPrimary text-white rounded-3xl shadow-md'>
                      <div>
                        <h4 className='text-[18px] font-semibold'>{plan.planName}</h4>
                        <span className='flex items-end'>
                          <h2 className='text-[42px] my-2'>₹{plan.price}/mo</h2>
                        </span>
                        <p className='whitespace-normal my-2'>Choose the perfect plan to accelerate your growth!</p>
                        <ul className='py-5 px-2'>
                          {plan.features.split(', ').map((feature, featureIndex) => (
                            <li key={featureIndex} className='flex items-center m-1'>
                              <svg xmlns="http://www.w3.org/2000/svg" className='me-2' width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                              <span className='ms-1 whitespace-pre'>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button type="button" onClick={() => handleSelectPlan(plan)} className='py-3 px-4 m-5 bg-white rounded-lg outline outline-1 outline-customSecondary hover:outline-2 focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]'>Choose One</button>
                    </div>
                  ))
              ) : (
                <p className='text-center text-gray-500 text-sm m-5'>No plans available for this duration.</p>
              )}
            </div>
          ) : (
            <div className='flex justify-center m-3 flex-wrap'>
              {plans.filter((plan) => plan.durationDays === 365).length > 0 ? (
                plans
                  .filter((plan) => plan.durationDays === 365)
                  .map((plan, index) => (
                    <div key={index} className='flex flex-col justify-between max-w-[340px] p-8 m-3 border border-customSecondary bg-customPrimary text-white rounded-3xl shadow-md'>
                      <div>
                        <h4 className='text-[18px] font-semibold'>{plan.planName}</h4>
                        <span className='flex items-end'>
                          <h2 className='text-[42px] my-2'>₹{plan.price}/yr</h2>
                        </span>
                        <p className='whitespace-normal my-2'>Choose the perfect plan to accelerate your growth!</p>
                        <ul className='py-5 px-2'>
                          {plan.features.split(', ').map((feature, featureIndex) => (
                            <li key={featureIndex} className='flex items-center m-1'>
                              <svg xmlns="http://www.w3.org/2000/svg" className='me-2' width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                              <span className='ms-1 whitespace-pre'>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button type="button" onClick={() => handleSelectPlan(plan)} className='py-3 px-4 m-5 bg-white rounded-lg outline outline-1 outline-customSecondary hover:outline-2 focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]'>Choose One</button>
                    </div>
                  ))
              ) : (
                <p className='text-center text-gray-500 text-sm m-5'>No plans available for this duration.</p>
              )}
            </div>
          )}
        </div>
      </form>
      <footer className='py-4 items-center'>
        <p className='text-sm font-thin text-center text-gray-500'>
          Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
        </p>
      </footer>
    </div>
  );
};

export default SelectPlan;