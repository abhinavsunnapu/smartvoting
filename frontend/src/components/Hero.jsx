import React from 'react'
import { NavLink } from 'react-router-dom'
import home_cover from '../assets/home-cover.jpg'
import ulu from '../assets/users-love-us.png'
import GetStarted from '../pages/GetStarted'

const Hero = () => {
    return (
        <div className='bg-white flex flex-col lg:flex-row items-center justify-between mx-4 sm:mx-8 my-7 gap-8 lg:gap-4'>
            <div className='px-4 sm:px-6 py-5 w-full max-w-150 text-center lg:text-left flex flex-col items-center lg:items-start'>
                <p className='text-orange-400 font-semibold text-3xl py-3 popin-font'>
                    Loved in 100+ Organisations
                </p>

                <h1 className='varela-font text-4xl md:text-5xl lg:text-6xl py-4 font-extrabold'>
                    Easy Online Election
                </h1>

                <h1 className='varela-font text-6xl font-extrabold'>
                    Excellence
                </h1>

                <p className='w-full text-gray-600 text-lg py-4'>
                    Smart Voting guarantees election integrity,
                    <br />
                    boosts voter engagement and saves serious hours.
                    <br />
                    It's free to test and free for up to 20 voters.
                </p>

                <div className='my-8'>
                    <NavLink
                        to='get-started'
                        className='px-6 py-6 bg-orange-400 transition duration-300 text-2xl text-white font-bold rounded-xl hover:bg-orange-500'
                    >
                        Start A Free Election
                    </NavLink>
                </div>

                <div className='flex flex-row gap-3 mt-15 items-center'>
                    <img src={ulu} className='h-24 w-18 mr-7' alt="Users love us" />

                    <p className='text-gray-400 text-sm italic max-w-md'>
                        "Smart Voting is easy to use and intuitive at a great price!"
                        <br />
                        — Executive Director
                    </p>
                </div>
            </div>

            <div className='w-full lg:w-1/2 flex justify-center'>
                <img
                    className='w-full max-w-lg lg:max-w-none lg:h-160 lg:w-200 object-contain'
                    src={home_cover}
                    alt="Home Cover"
                />
            </div>
        </div>
    )
}

export default Hero