import React from 'react'

const ElectionMsg = ({ SerialNo, heading, headingInfo }) => {
    return (
        <div className='flex gap-8 items-start px-4 py-6'>
            <div className='shrink-0 flex items-center justify-center w-22 h-22 bg-white rounded-full shadow-[0_4px_24px_-6px_rgba(0,0,0,0.1)]'>
                <span className='text-[40px] arial-font font-bold text-[#F28A36]'>
                    {SerialNo}
                </span>
            </div>
            <div className='flex flex-col gap-2 mt-2'>
                <h1 className='inter-font text-[#00263A] text-2xl font-semibold tracking-tight'>{heading}</h1>
                <p className='text-[18px] leading-relaxed max-w-200 inter-font text-gray-500'>{headingInfo}</p>
            </div>
        </div>
    )
}

export default ElectionMsg
