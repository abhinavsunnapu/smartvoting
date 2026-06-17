import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AddCandidates = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const electionData = location.state?.electionData;
    
    // Safety redirect
    if (!electionData) {
        navigate('/create-election');
        return null;
    }

    const isPoll = electionData.type === 'poll';
    
    // Default 2 options for polls, or 1 candidate for elections
    const [candidates, setCandidates] = useState(
        electionData.candidates?.length > 0 ? electionData.candidates : 
        (isPoll ? [{ name: '', party: '' }, { name: '', party: '' }] : [{ name: '', party: '' }])
    );
    const [error, setError] = useState('');

    const handleCandidateChange = (index, field, value) => {
        const newCands = [...candidates];
        newCands[index][field] = value;
        setCandidates(newCands);
        setError('');
    };

    const addCandidate = () => {
        setCandidates([...candidates, { name: '', party: '' }]);
    };

    const removeCandidate = (index) => {
        if (candidates.length <= 1) return;
        setCandidates(candidates.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        // Validation: all candidates must have a name
        const isValid = candidates.every(c => c.name.trim() !== '');
        if (!isValid) {
            setError(`Please fill in all ${isPoll ? 'option' : 'candidate'} names, or remove empty ones.`);
            return;
        }

        if (candidates.length < 2) {
            setError(`You must provide at least 2 ${isPoll ? 'options' : 'candidates'}.`);
            return;
        }

        navigate('/create-election/voters', { 
            state: { 
                electionData: { ...electionData, candidates } 
            } 
        });
    };

    return (
        <div className='flex items-start justify-center px-4 py-6 sm:py-10 bg-[#FAFAFA] min-h-[80vh]'>
            <div className='w-full max-w-2xl bg-white border border-gray-200 px-6 sm:px-10 py-8'>
                <div className='mb-6'>
                    <h1 className='inter-font text-[32px] font-semibold text-[#262D34] mb-1'>
                        {isPoll ? 'Add Poll Options' : 'Add Candidates'}
                    </h1>
                    <p className='text-[16px] text-gray-500'>
                        Step 2: {isPoll ? 'List the options voters can choose from.' : 'List the individuals running in this election.'}
                    </p>
                </div>

                {error && (
                    <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 inter-font mb-6'>
                        {error}
                    </div>
                )}

                <div className='flex flex-col gap-4 mb-6'>
                    {candidates.map((candidate, index) => (
                        <div key={index} className='p-4 border border-gray-100 bg-gray-50 rounded-lg flex items-start gap-4 transition-all'>
                            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-[#00263A] text-white font-bold flex-shrink-0 mt-1'>
                                {index + 1}
                            </div>
                            <div className='flex-1 flex flex-col gap-3'>
                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-semibold text-gray-700'>
                                        {isPoll ? 'Option Text' : 'Candidate Name'} <span className='text-[#F28A36]'>*</span>
                                    </label>
                                    <input 
                                        type='text'
                                        value={candidate.name}
                                        onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                                        placeholder={isPoll ? 'e.g. Yes / No / Maybe' : 'e.g. Jane Doe'}
                                        className='w-full px-4 py-2 bg-white border border-gray-200 rounded outline-none focus:border-[#00263A]'
                                    />
                                </div>
                                {!isPoll && (
                                    <div className='flex flex-col gap-1'>
                                        <label className='text-sm text-gray-600'>
                                            Affiliation / Party <span className='italic text-gray-400 font-normal'>(Optional)</span>
                                        </label>
                                        <input 
                                            type='text'
                                            value={candidate.party}
                                            onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                                            placeholder='e.g. Science Dept, Independent, Green Party'
                                            className='w-full px-4 py-2 bg-white border border-gray-200 rounded outline-none focus:border-[#00263A]'
                                        />
                                    </div>
                                )}
                            </div>
                            {candidates.length > 1 && (
                                <button
                                    onClick={() => removeCandidate(index)}
                                    className='text-red-400 hover:text-red-600 mt-1 font-bold text-xl'
                                    title='Remove'
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={addCandidate}
                    className='w-full py-3 border-2 border-dashed border-[#00263A]/30 text-[#00263A] font-semibold rounded-lg hover:bg-[#00263A]/5 transition mb-8'
                >
                    + Add Another {isPoll ? 'Option' : 'Candidate'}
                </button>

                <div className='flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100'>
                    <button
                        onClick={() => navigate('/create-election', { state: { prevData: electionData } })}
                        className='w-full sm:w-1/3 px-7 py-3 text-[#262D3A] bg-gray-200 font-semibold text-md inter-font rounded-md hover:bg-gray-300 transition'>
                        ← Back
                    </button>
                    <button
                        onClick={handleNext}
                        className='w-full sm:w-2/3 px-7 py-3 text-white font-semibold text-md inter-font rounded-md bg-[#00263A] hover:bg-[#001a28] transition shadow-sm'>
                        Next ➔
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddCandidates;
