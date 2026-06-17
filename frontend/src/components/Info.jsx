import React from 'react'
import SubInfo from './SubInfo'

const Info = () => {
    return (
        <div className='flex gap-5 flex-col text-5xl m-5'>
            <h1 className='text-center varela-font font-bold pb-10'>Take Your Votes to the Next Level</h1>
            <div className='grid grid-cols-3 grid-rows-2 gap-20 '>
                <SubInfo heading={'Boost Engagement'} headingInfo={'Notify voters using email, mail, text message or with your own systems. Receive undeliverable notice alerts and send reminders. Voters vote by phone, computer, mail or in person.'}></SubInfo>
                <SubInfo heading={'High-integrity Voting'} headingInfo={'Voters can only vote once and voting choices remain anonymous. Each ballot has one, secure voting key and the vote is auditable, verifiable and can be independently observed.'}></SubInfo>
                <SubInfo heading={'Flexible Ballots'} headingInfo={'Vote on executive officers, board positions, contract ratifications, bylaw amendments, budget approvals, acclamations and motions. Or run polls and survey.'}></SubInfo>
                <SubInfo heading={'Automated and Simple'} headingInfo={'Setup your Election or Meeting Votes in 3 steps - spend your time monitoring, not counting. Or engage our experts for dedicated assistance or independent election oversight.'}></SubInfo>
                <SubInfo heading={'Real-time Results'} headingInfo={'Winners are immediately calculated using first past the post, cumulative voting, preferential ballot, STV Single transferable vote or approval voting. You can tabulate results yourself too!'}></SubInfo>
                <SubInfo heading={'Secure and Private'} headingInfo={'256-bit encryption used to safeguard your vote — the same security as major banks. And we don’t share or use voter data — your elections stay private.'}></SubInfo>
            </div>
        </div>
    )
}

export default Info
