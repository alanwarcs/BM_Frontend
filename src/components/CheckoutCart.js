import React,{useState} from 'react'

const CheckoutCart = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
        <div className='relative flex flex-col items-center justify-between w-full min-h-screen max-h-screen p-1'>
            <div className='flex text-center md:text-left items-center justify-between w-full'>
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
            <form>

            </form>
            <footer className='my-4 items-center'>
                <p className='text-sm font-thin text-center text-gray-500'>
                    Copyright &copy; by All-In-One & Agile Business Management Software {new Date().getFullYear()}.
                </p>
            </footer>
        </div>
    )
}

export default CheckoutCart
