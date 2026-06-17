import React from 'react'
import ElectionMsg from '../components/ElectionMsg'
import { Link, NavLink } from 'react-router-dom'

const MeetingVotes = () => {
    return (
        <div className='flex flex-col gap-10'>
            <div className='flex flex-col items-center w-full'>
                <h1 className='varela-font text-5xl pt-6 pb-4 font-extrabold'>3 Steps to Marvelous Meeting Votes</h1>
                <p className='text-orange-400 text-xl font-semibold  pb-4 inter-font'>How Meetings Work in ElectionBuddy</p>
            </div>
            <div className='flex flex-row justify-between max-w-[60%]'>
                <div className='flex flex-col'>
                    <ElectionMsg SerialNo="1" heading="Prepare the perfect meeting in minutes" headingInfo="Create a registration, test ballot and all the meeting items being voted on including motion approvals and candidate elections. Add voter lists and send meeting notice by email, text and mail, or add voting to a mobile app. And just prior to meeting, a quick test gets voters ready to meet and vote."></ElectionMsg>
                    <ElectionMsg SerialNo="2" heading="Voting is fast and smooth" headingInfo="Voters vote in-person, virtually or both using their iphone, Android Phone, tablet or laptop for all meeting items. ElectionBuddy easily works with Zoom, Google Meet, Microsoft Teams or any video conference. And create amendments with a click."></ElectionMsg>
                    <ElectionMsg SerialNo="3" heading="Immediate high-integrity results" headingInfo="After closing the vote, results are instantly tallied and available for review or shared in the video conference, on the voter device, or certified and shared after the meeting. All while keeping voter's choices secret and ensuring observability."></ElectionMsg>
                </div>
                <div className='border'>
                    <img src="" alt="" />
                </div>
            </div>
            <div className='flex flex-col mb-20'>
                <p className='ml-30 inter-font text-xl text-gray-500 py-4'>Next Step</p>
                <NavLink className='inter-font font-bold text-xxl ml-30 bg-orange-400 text-white rounded-sm w-60 px-4 py-3 hover:bg-[#22063A]'>Explore Service Options</NavLink>
            </div>
        </div>
    )
}

export default MeetingVotes
