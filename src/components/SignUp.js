import React,{useState} from 'react'
import PhoneCodeSelector from './PhoneCodeSelector'; // Import the PhoneCodeSelector component

const SignUp = () => {
    // State for managing the terms and conditions checkbox
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Toggle the terms and conditions checkbox state
    const handleCheckboxChange = (e) => {
        setTermsAccepted(e.target.checked);
    };
    return (
        <div>
            <div className='relative flex flex-col items-center justify-between w-full min-h-screen p-3'>
                <div className='text-center md:text-left w-full'>
                    <h1 className='text-[38px] mx-5 font-bold'>aab.</h1>
                </div>
                <form className='rounded-xl shadow p-5 text-left'>
                    <h1 className='text-center text-[24px] m-2 font-bold'>Registeration</h1>
                    <p className='text-center'>
                        Enter your Details to Register your business.
                    </p>
                    <div className='flex text-left flex-col mt-5'>
                        <input type="text" name="name" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Full Name' />
                        <input type="text" name="organizationName" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Orgnanization Name' />
                        <input type="email" name="email" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Email' />
                        <PhoneCodeSelector />
                        <div className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus-within:outline-2 focus-within:outline-customSecondary text-gray-700 text-[14px]'>
                            <input type="Password" name="Password" className='w-[80%] md:w-[88%] outline-none' placeholder='Password' />
                            <a href="/" className='text-gray-800 hover:text-gray-500'>Show</a>
                        </div>
                        <input type="text" name="designation" className='w-[300px] md:w-[350px] py-3 px-4 m-2 rounded-lg outline outline-1 outline-customSecondary focus:outline-2 focus:outline-customSecondary text-gray-700 text-[14px]' placeholder='Designation' />
                        <div className='flex items-center m-2 w-fit'>
                            <input type="checkbox" name="terms" id="terms" className='me-2' checked={termsAccepted} onChange={handleCheckboxChange} />
                            <label htmlFor="terms" className='text-[14px]'>
                                I accept the <a href="/terms" className='text-gray-900 font-semibold hover:underline'>Terms and Conditions</a>
                            </label>
                        </div>
                        <button className='rounded-lg bg-customPrimary hover:bg-customPrimaryHover m-2 py-3 px-5 text-white text-[16px]'>
                            Sign Up
                        </button>
                        <span className='my-3 text-center text-[14px]'>
                            <p>Or Sign up with</p>
                        </span>
                        <div className='flex flex-row justify-center'>
                            <button className='flex rounded-lg border border-customSecondary hover:border-2 py-2 px-5 text-black align-center justify-center'>
                                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.76 10.77L19.67 10.42H12.23V13.58H16.68C16.4317 14.5443 15.8672 15.3974 15.0767 16.0029C14.2863 16.6084 13.3156 16.9313 12.32 16.92C11.0208 16.9093 9.77254 16.4135 8.81999 15.53C8.35174 15.0685 7.97912 14.5191 7.72344 13.9134C7.46777 13.3077 7.33407 12.6575 7.33 12C7.34511 10.6795 7.86792 9.41544 8.79 8.47002C9.7291 7.58038 10.9764 7.08932 12.27 7.10002C13.3779 7.10855 14.4446 7.52101 15.27 8.26002L17.47 6.00002C16.02 4.70638 14.1432 3.9941 12.2 4.00002C11.131 3.99367 10.0713 4.19793 9.08127 4.60115C8.09125 5.00436 7.19034 5.59863 6.43 6.35002C4.98369 7.8523 4.16827 9.85182 4.15152 11.9371C4.13478 14.0224 4.918 16.0347 6.34 17.56C7.12784 18.3449 8.06422 18.965 9.09441 19.3839C10.1246 19.8029 11.2279 20.0123 12.34 20C13.3484 20.0075 14.3479 19.8102 15.2779 19.42C16.2078 19.0298 17.0488 18.4549 17.75 17.73C19.1259 16.2171 19.8702 14.2347 19.83 12.19C19.8408 11.7156 19.8174 11.2411 19.76 10.77Z" fill="#000000"></path> </g></svg>
                                <p className='font-semibold'>Google</p>
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
