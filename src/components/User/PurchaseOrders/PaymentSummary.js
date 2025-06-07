import React from 'react'

const PaymentSummary = ({ purchaseOrder, handleInputChange, updateTotals, addPaymentDetails, onClose }) => {
  if (!addPaymentDetails) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Payment Summary</h2>
          <button onClick={onClose} className="hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div>

        </div>
      </div>
    </div>
  )
}

export default PaymentSummary
