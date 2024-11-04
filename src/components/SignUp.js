import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import PhoneCodeSelector from './PhoneCodeSelector'; // Import the PhoneCodeSelector component
import axios from 'axios';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        organizationName: '',
        email: '',
        phone: '',
        password: '',
        designation: '',
        termsAccepted: false,
    });

    const navigate = useNavigate(); // Initialize the navigate function

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Toggle the terms and conditions checkbox state
    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, termsAccepted: e.target.checked });
    };

    // Toggle password visibility
    const togglePasswordVisibility = (e) => {
        e.preventDefault(); // Prevent default link behavior
        setShowPassword(!showPassword); // Toggle password visibility
    };

    const handlePhoneChange = (fullPhoneNumber) => {
        setFormData((prevData) => ({
            ...prevData,
            phone: fullPhoneNumber,
        }));
    };

    // Validate form data before submission
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+\d+$/; // Phone must start with '+' followed by numbers

        if (!formData.name) {
            newErrors.name = "Name is required.";
        }
        if (!formData.organizationName) {
            newErrors.organizationName = "Organization/Business Name is required.";
        }
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!formData.phone) {
            newErrors.phone = "Phone is required.";
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Phone must have numbers only.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 8 ||
            !/[A-Z]/.test(formData.password) ||
            !/[a-z]/.test(formData.password) ||
            !/[0-9]/.test(formData.password) ||
            !/[!@#$%^&*]/.test(formData.password)) {
            newErrors.password = "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.";
        }
        if (!formData.designation) {
            newErrors.designation = "Designation is required.";
        }
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must agree to the terms and conditions.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Only submit if validation passes

        try {
            const response = await axios.post('/api/auth/signup', formData);

            // Store token in local storage
            localStorage.setItem('token', response.data.token); // Assuming the response contains the token

            // Redirect to setup page
            navigate('/setup'); // Adjust the path based on your routing setup

        } catch (error) {
            alert(error.response?.data?.message || '500 - Internal server error.'); // Show error message from the server in an alert
        }
    };

    return (
        <div>
            <div className='relative flex flex-col items-center justify-between w-full min-h-screen p-3'>
                <div className='text-center md:text-left w-full'>
                    <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                </div>
                <form className='rounded-xl shadow p-5 text-left' onSubmit={handleSubmit} >
                    <h1 className='text-center text-[24px] m-2 font-bold'>Registeration</h1>
                    <p className='text-center'>
                        Enter your Details to Register your business.
                    </p>
                    <div className='flex text-left flex-col mt-5'>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Full Name' />
                        {errors.name && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.name}</span>}

                        <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Organization Name' />
                        {errors.organizationName && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.organizationName}</span>}

                        <input type="email" name="email" value={formData.email} onChange={handleChange} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Email' />
                        {errors.email && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.email}</span>}

                        <PhoneCodeSelector onPhoneChange={handlePhoneChange} />
                        {errors.phone && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.phone}</span>}

                        <div className='w-[250px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus-within:outline-2 focus-within:outline-customSecondary text-gray-700 text-[14px]'>
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className='w-[80%] md:w-[88%] outline-none' placeholder='Password' />
                            <a href="/" onClick={togglePasswordVisibility} className='text-gray-800 hover:text-gray-500'>
                                {showPassword ? 'Hide' : 'Show'}
                            </a>
                        </div>
                        {errors.password && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.password}</span>}

                        <input type="text" name="designation" value={formData.designation} onChange={handleChange} className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Designation' />
                        {errors.designation && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.designation}</span>}

                        <div className='flex items-center m-2 w-fit'>
                            <input type="checkbox" name="termsAccepted" id="termsAccepted" className='me-2' checked={formData.termsAccepted} onChange={handleCheckboxChange} />
                            <label htmlFor="terms" className='text-[14px]'>
                                I accept the <a href="/terms" className='text-gray-900 font-semibold hover:underline'>Terms and Conditions</a>
                            </label>
                        </div>
                        {errors.termsAccepted && <span className='flex max-w-[350px] text-red-500 text-[14px] mx-2'>{errors.termsAccepted}</span>}

                        {errors.server && <span className='flex max-w-[350px] text-red-500 justify-center text-[14px] mx-2'>{errors.server}</span>} {/* Display server error here */}

                        <button type="submit" className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'>
                            Sign Up
                        </button>
                        <span className='my-3 text-center text-[14px]'>
                            <p>Or Sign up with</p>
                        </span>
                        <div className='flex flex-row justify-center'>
                            <button className='flex rounded-lg border border-customSecondary hover:border-2 py-2 px-5 text-black align-center justify-center'>
                                <img src="/images/g.png" className='w-5' alt="" />
                            </button>
                        </div>
                        <span className='mt-5 text-center text-[14px]'>
                            <p>Already have account? <a href="/" className='font-semibold hover:underline'>Login Now</a></p>
                        </span>
                    </div>
                </form>
                <footer className='my-4 items-center'>
                    <p className='text-sm font-thin text-center text-gray-500'>
                        Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
                    </p>
                </footer>
            </div>
        </div>
    )
}

export default SignUp
