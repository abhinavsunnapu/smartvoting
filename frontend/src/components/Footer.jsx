import React from 'react'
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
const Footer = () => {
    return (
        <div className='flex items-center justify-around border-t border-gray-300 h-50'>
            <div className='text-[14px] text-black inter-font'>© Smart Voting, Inc. All Rights Reserved</div>
            <ul className='flex gap-5 items-center justify-between text-sm px-5'>
                <li className='px-5'>Privacy Policy</li>
                <li className='px-5'>Terms of Service</li>
                <li className='px-5'>Security</li>
                <li className='px-5'>SiteMap</li>
            </ul>
            <div className='flex gap-5 items-center justify-between text-sm text-gray-600 cursor-pointer transition duration-300'>
                <p className='px-7 hover:text-black hover:scale-3d'><FaFacebookF></FaFacebookF></p>
                <p className='px-7 hover:text-black hover:scale-3d'><FaInstagram></FaInstagram></p>
                <p className='px-7 hover:text-black hover:scale-3d'><FaTwitter></FaTwitter></p>
            </div>

        </div>
    )
}

export default Footer
