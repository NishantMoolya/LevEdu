// src/Quiz.js
"use client"

import React, { useState } from 'react';
import {Button} from '@/components/ui/button';
import useFetch from '../../hooks/useFetch'

const Quiz = ({ quizId,question, option_1, option_2, option_3, option_4, correct_option, explanation, viewNextVideo=()=>{},userId }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const createData = useFetch();

  const handleOptionChange = (option) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async (e) => {
    try {
    e.preventDefault();
    if (!isSubmitted) {
      const payload = {
        stud_id:userId,
        quiz_id:quizId,
        selected_option:selectedOption
      };
      const res = await createData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/submit`, 'POST', payload, 201);
      if (!res) throw new Error("an error in submit");
      else{
        setIsSubmitted(true);
        viewNextVideo();
      }
    }
  } catch (err) {
    console.log("an error in submitting quiz");
  }
  };

  return (
    <div className='w-full h-full snap-start relative rounded overflow-hidden flex flex-col bg-white pt-4' >
    <div className="w-full p-2 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{question}</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          {[option_1, option_2, option_3, option_4].map((option, index) => (
            <label key={index} className={`flex items-center px-2 py-1 border rounded cursor-pointer ${selectedOption === option ? 'bg-blue-200' : 'bg-slate-50'}`}>
              <input
                type="radio"
                name="quiz-option"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleOptionChange(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
        {!isSubmitted && <Button type='submit' className='mt-2'>Submit</Button>}
      </form>

      {isSubmitted && (
        <div className="">
          {selectedOption === correct_option ? (
            <p className="text-green-500">Correct! 🎉</p>
          ) : (
            <p className="text-red-500">Incorrect!</p>
          )}
          <p className='font-semibold underline'>Explanation</p>
          <p className="text-slate-700 ml-2 text-sm">{explanation}</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default Quiz;
