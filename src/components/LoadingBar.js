import React from 'react'

const LoadingBar = ({progress}) => {
    return (
        <div className="fixed top-0 bg-gray-300 left-0 w-full h-1 z-50">
            <div
                style={{ width: `${progress}%` }}
                className={`h-full bg-customPrimary transition-all duration-500 ease-out`}
            ></div>
        </div>
    )
}

export default LoadingBar
