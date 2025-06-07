import React from 'react';

const PreviewModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl w-[90%] max-w-4xl max-h-[80vh] overflow-y-auto shadow-lg'>
        {/* Sticky Header */}
        <div className='sticky top-0 z-10 bg-white flex justify-between items-center border-b p-4'>
          <h2 className='text-xl font-semibold m-0'>Payment Summary</h2>
          <button onClick={onClose} className="hover:text-red-500 text-lg font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
