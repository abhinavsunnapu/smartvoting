import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/EB_logo.svg";
import LoginOptions from "./LoginOptions";
import { useAuth } from "../Context/AuthContext";

const NavBar = ({ onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav
      className="w-full bg-white shadow-sm"
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex justify-between lg:justify-around items-center px-4 sm:px-8 py-2 sm:py-0">
        <Link to={user ? (user.activeSessionRole === 'voter' ? '/voter-dashboard' : '/dashboard') : "/"}>
          <img src={logo} alt="logo" className="h-30 w-40 sm:h-15 sm:w-60 cursor-pointer object-contain" />
        </Link>
        <div className="hidden lg:flex items-center justify-around">
          <div className="px-5 py-6 text-xl text-gray-400 hover:text-gray-700 hover:border-b-black">
            <NavLink to="/elections"> Elections </NavLink>
          </div>
          <div className="hidden px-5 py-6 text-xl text-gray-400 hover:text-gray-700 hover:border-b-black">
            <NavLink to="/meeting-votes"> Meeting Votes </NavLink>
          </div>
          <div className="hidden px-5 py-6 text-xl text-gray-400 hover:text-gray-700 hover:border-b-black">
            <NavLink to="/services"> Services </NavLink>
          </div>
          <div className="hidden px-5 py-6 text-xl text-gray-400 hover:text-gray-700 hover:border-b-black">
            <NavLink to="/pricing"> Pricing </NavLink>
          </div>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-10 ">
          {user ? (
            <button
              onClick={() => onProfileClick?.()}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#00263A] text-white hover:bg-gray-800 transition text-sm sm:text-base"
            >
              👤 <span className="hidden sm:inline">{user.name}</span>
            </button>
          ) : (
            <>
              <div onMouseEnter={() => setIsOpen(true)}>
                <button className="text-[#00263A] text-sm sm:text-xl font-medium sm:font-normal cursor-pointer">
                  Sign In
                </button>
              </div>
              <Link
                onMouseEnter={() => setIsOpen(false)}
                to="/get-started"
                className="get-started-font px-4 py-2 sm:px-6 sm:py-3 border rounded sm:rounded-none bg-[#00263A] text-white text-sm sm:text-lg hover:bg-[#001a28] sm:hover:bg-white sm:hover:text-black transition duration-300"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
      {isOpen && !user && (
        <div onMouseLeave={() => setIsOpen(false)}>
          <LoginOptions></LoginOptions>
        </div>
      )}
    </nav>
  );
};

import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import LoginOptions from './LoginOptions'

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav
            className='w-full bg-white shadow-sm'
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className='flex justify-around items-center'>
                <Link to='/'>
                    <img
                        src={logo}
                        alt="logo"
                        className='h-20 w-60 cursor-pointer'
                    />
                </Link>

                <div className='flex items-center justify-around'>
                    <div className='px-5 py-6 text-xl text-gray-400 hover:text-gray-700'>
                        <NavLink to='/elections'>Elections</NavLink>
                    </div>

                    <div className='px-5 py-6 text-xl text-gray-400 hover:text-gray-700'>
                        <NavLink to='/meeting-votes'>Meeting Votes</NavLink>
                    </div>

                    <div className='px-5 py-6 text-xl text-gray-400 hover:text-gray-700'>
                        <NavLink to='/services'>Services</NavLink>
                    </div>

                    <div className='px-5 py-6 text-xl text-gray-400 hover:text-gray-700'>
                        <NavLink to='/pricing'>Pricing</NavLink>
                    </div>
                </div>

                <div className='flex items-center space-x-10'>
                    <Link
                        onMouseEnter={() => setIsOpen(false)}
                        to='/get-started'
                        className='get-started-font px-6 py-3 border bg-[#00263A] text-white text-lg hover:bg-white hover:text-black transition duration-300'
                    >
                        Get-Started
                    </Link>

                    <div onMouseEnter={() => setIsOpen(true)}>
                        <button className='text-[#00263A] text-xl cursor-pointer'>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div onMouseLeave={() => setIsOpen(false)}>
                    <LoginOptions />
                </div>
            )}
        </nav>
    )
}

export default NavBar