"use client"

import React, { useEffect, useState } from 'react'
import ReelPlayer from "@/components/reels/ReelPlayer";
// import sampleVideo from "@/public/assets/video1.mp4";
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';

const page = () => {
  
  const createData = useFetch();

  const [reelsData,setReelsData] = useState([]);

  const userId = useSelector(state => state.user.userId);

  useEffect(() => {
    try {

      // createData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video`, 'GET', null, 200).then(res => {
      createData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/recommendations/${userId}`, 'GET', null, 200).then(res => {
        if (!res) {
          throw new Error('An error occured while fetching topics');
        } else {
          console.log(res.data);
          setReelsData(res.data);
        }
      })
    } catch (err) {
      console.log("An error occured", err);
    }
  }, [])
  const reelsData1 = [
    {
      videoSrc: "/assets/video1.mp4",
      flashcardContent: "This is the flashcard for Reel 1.",
      quizOptions: ["Option 1", "Option 2", "Option 3", "Option 4"],
    },
    {
      videoSrc: "/assets/video1.mp4",
      flashcardContent: "This is the flashcard for Reel 2.",
      quizOptions: ["Option A", "Option B", "Option C", "Option D"],
    },
  ];

  return (
    <div className='flex items-center justify-center h-screen bg-neutral-900'>
      <ReelPlayer videos={reelsData} />
    </div>
  )
}

export default page