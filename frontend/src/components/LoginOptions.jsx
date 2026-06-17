import voter from '../assets/EB_startMenu_voter-1-final.png'
import admin from '../assets/EB_startMenu_vlogin-final.png'
import admin1 from '../assets/EB_startMenu_createAccount-final.png'
import { NavLink } from 'react-router-dom'

const LoginOptions = () => {
    return (
        <div className="flex justify-between items-center min-h-50 bg-gray-50 p-4">
            <NavLink to='/voter-login' className="w-full max-w-115 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex gap-5 transition-shadow hover:shadow-md cursor-pointer">
                <img src={voter} alt="Voter Icon" className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                <div className="flex flex-col justify-between w-full py-1">
                    <h3 className="text-3xl font-black italic text-slate-800 leading-none">
                        I’m A Voter!
                    </h3>
                    <div className="flex justify-end mt-auto">
                        <span className="text-gray-400 font-medium text-[15px] hover:text-slate-600 transition-colors">
                            Cast My Ballot Now
                        </span>
                    </div>

                </div>
            </NavLink>
            <NavLink to='/get-started' className="w-full max-w-115 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex gap-5 transition-shadow hover:shadow-md cursor-pointer">
                <img src={admin1} alt="Admin Icon" className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                <div className="flex flex-col justify-between w-full py-1">
                    <h3 className="text-3xl font-black italic text-slate-800 leading-none">
                        New Administrator!
                    </h3>
                    <div className="flex justify-end mt-auto">
                        <span className="text-gray-400 font-medium text-[15px] hover:text-slate-600 transition-colors">
                            Start Free Election
                        </span>
                    </div>

                </div>
            </NavLink>
            <NavLink to='/login' className="w-full max-w-115 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex gap-5 transition-shadow hover:shadow-md cursor-pointer">
                <img src={admin} alt="Login Icon" className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                <div className="flex flex-col justify-between w-full py-1">
                    <h3 className="text-3xl font-black italic text-slate-800 leading-none">
                        Returning Administrator!
                    </h3>
                    <div className="flex justify-end mt-auto">
                        <span className="text-gray-400 font-medium text-[15px] hover:text-slate-600 transition-colors">
                            Login to Account
                        </span>
                    </div>

                </div>
            </NavLink>
        </div>
    )
}

export default LoginOptions
