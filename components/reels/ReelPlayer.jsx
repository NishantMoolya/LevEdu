"use client"

import React, { useEffect, useRef, useState } from 'react'
import Video from '../reels/Video'
import Quiz from '../reels/Quiz'
import { useSelector } from 'react-redux'
import useFetch from '../../hooks/useFetch'

const ReelPlayer = ({ videos = [] }) => {
  const videoContainerRef = useRef();
  const [activeVideo, setActiveVideo] = useState(0);
  const [videosList, setVideosList] = useState([...videos]);
  const [videoIds, setVideoIds] = useState([]);
  const [videosLikedList, setVideosLikedList] = useState([]);

  const createData = useFetch();

  const handleScroll = (e) => {
    //simple logic - just detect how far the present video is from the center of viewport
    const videos = videoContainerRef.current.children;
    let newActiveIndex = activeVideo;
    let closestDis = Infinity;
    for (let index = 0; index < videos.length; index++) {
      const rect = videos[index].getBoundingClientRect();
      const disFromCenter = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
      if (disFromCenter < closestDis) {
        closestDis = disFromCenter;
        newActiveIndex = index;
      }
    }
    if (newActiveIndex !== activeVideo) {
      setActiveVideo(newActiveIndex);
    }
  }

  useEffect(() => {
    const container = videoContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeVideo]);

  const user = useSelector(state => state.user);

  const [allowNextVideo, setAllowNextVideo] = useState(2);

  const viewNextVideo = () => setAllowNextVideo(p => p + 2);

  const saveToWatchList = async (vidId, status, len, liked) => {
    try {
      console.log(`User with ID ${user.userId} has ${status} the video with ID ${vidId}. Video length: ${len} seconds. Liked: ${liked}`);
      if (false) {
        const payload = {
          stud_id: user.userId,
          vid_id: vidId,
          time_spend: len,
          completion_status: status,
          is_liked: liked
        }
        const res = await createData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/history`, 'POST', payload, 201);
        if (!res) throw new Error("an error");
      }
    } catch (err) {
      console.log("an error occurred in sending user data");
    }
  }

  return (
    <div ref={videoContainerRef} className='reelplayer_frame shadow h-[560px] overflow-scroll snap-y snap-mandatory scroll-smooth bg-neutral-900 ' style={{ aspectRatio: "9/16" }}>
      {
        videos.map(item => [item, item]).flat().slice(0, allowNextVideo).map((video, ind) => {
          if (ind % 2 === 0) return <Video key={ind} videoid={video?.vid_id} video={video} userId={user.userId} likes={video?.likes_count} username={video?.edu_name} videosLikedList={[]} active={activeVideo === ind} saveToWatchList={saveToWatchList} />
          else return <Quiz key={ind} quizId={video.quiz_id} userId={user.userId} question={video.question} explanation={video.explanation} option_1={video.option_1} option_2={video.option_2} option_3={video.option_3} option_4={video.option_4} correct_option={video.correct_option} viewNextVideo={viewNextVideo} />
        }
        )
      }
    </div>
  )
}

export default ReelPlayer