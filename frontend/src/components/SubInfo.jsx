import React from 'react'

const SubInfo = ({ heading, headingInfo }) => {
    return (
        <div className='flex flex-col gap-3  px-6 py-3 '>
            <h1 className='inter-font font-semibold text-4xl text-gray-800 pb-1.5'>{heading}</h1>
            <p className='text-xl leading-relaxed text-gray-500'>{headingInfo}</p>
        </div>
    )
}

export default SubInfo
