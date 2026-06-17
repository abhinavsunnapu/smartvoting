import React from 'react'
import serviceimage from '../assets/Web-groupServices.jpg'


const ServicesHome = () => {
    return (
        <div className='flex flex-row items-center justify-between mt-10'>
            <div className='flex flex-col  max-w-[45%] px-15 py-8'>
                <h1 className='varela-font  text-5xl  font-extrabold leading-relaxed'>From Support to Setup <br />to Full Service.</h1>
                <p className='text-[18px]  leading-relaxed font-light max-w-175 inter-font text-gray-500 pb-5'>Not every organization can run their election or meeting votes themselves due to their own bylaws or external statutes. That’s why we offer consultation, expert setup and voter management services so you and your voters are confident in the voting results. Learn how ElectionBuddy can meet your needs.</p>
                <button className='bg-white mt-12 text-gray-600 border-2 w-60 px-6 py-4 text-xl  font-semibold inter-font hover:bg-orange-400 hover:text-white cursor-pointer transition duration-300' >Talk to an Expert</button>
            </div>
            <div className='mr-22'>
                <img className='w-150' src={serviceimage} alt="" />
            </div>
        </div>
    )
}

export default ServicesHome
