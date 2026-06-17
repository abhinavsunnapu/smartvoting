import React from 'react'
import ServicesHome from '../components/ServicesHome'
import webserviceimage from '../assets/web-servicesdiss.png'

const Services = () => {
    return (
        <div className='flex flex-col'>
            <ServicesHome></ServicesHome>
            <div className='flex flex-row  justify-between mt-20 mb-10'>
                <div className=' ml-20 px-8 max-w-[35%] py-10'>
                    <p className='text-orange-400 text-2xl inter-font py-2 font-semibold '>Run-It-Yourself, With Our Help</p>
                    <p className='inter-font text-[#00263A] text-4xl font-semibold pb-4'>Setup Consultation</p>
                    <p className='text-[18px]  leading-relaxed font-light max-w-175 inter-font w-137 text-gray-500 pb-5 py-2'>You’d like to do most of the setup, but you want to be sure it’s perfect. An ElectionBuddy Expert meets with you online to discuss your needs, answers questions, provides guidance and reviews your setup to ensure your election or meeting runs great. Add "on-call" email support for the duration of your vote for extra peace of mind.</p>
                    <button className='bg-white mt-15 text-gray-600 border-3 w-80 px-6 py-4 text-xl  font-semibold inter-font hover:bg-orange-400 hover:text-white cursor-pointer transition duration-300'>Start a Conversation</button>
                </div>
                <div className='w-180 mr-10'>
                    <img src={webserviceimage} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Services
