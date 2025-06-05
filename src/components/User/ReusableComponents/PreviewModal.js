import React from 'react'

const PreviewModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Sticky Header */}
        <div className="flex sticky top-0 z-10 justify-between items-center w-full bg-white p-4 border-b">
          <h2 className="text-xl font-semibold">Preview</h2>
          <button onClick={onClose} className="hover:text-red-500">
            X
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default PreviewModal;
