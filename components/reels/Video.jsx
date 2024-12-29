"use client"

import React, { useEffect, useState } from 'react'
import './styles/video.css'
import useVideo from '@/hooks/useVideo';
import FlashCard from '@/components/reels/FlashCard';

const Video = ({ video, active, videoid, userId, likes, username, videosLikedList, saveToWatchList=()=>{} }) => {

    const userAvatar = "/assets/person1.jpg";

    const { videoRef, previewRef, timeLineRef, previewTimestamp, playVideo, handleTimeLineProgress, handleMouseSeek, handleClickSeek, handleTimeLinePreview } = useVideo();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);

    useEffect(() => {
        if (video?.vid_url.startsWith("https")) {
            const reel = videoRef.current;
            if (active) {
                reel.currentTime = 0;
                reel.play().catch((error) => {
                    console.log('Play failed:', error);
                });
            } else {
                if (reel) reel.pause();
            }
        }
    }, [active]);

    useEffect(() => {
        if (videosLikedList.includes(videoid)) {
            setLiked(true);
        } else {
            setLiked(false);
        }
    }, [videosLikedList]);

    const [openDropDown, setOpenDropDown] = useState(false);
    const handleDropDown = () => {
        setOpenDropDown(prev => !prev);
    }

    const handleLikes = async () => {
        liked ? setLikeCount(prev => prev - 1) : setLikeCount(prev => prev + 1);
        !liked ? saveToWatchList(videoid,isVideoWatched?true:false,video?.vid_len,!liked) : null;
        setLiked(prev => !prev);
    }

    // Swipe detection
    const [showFlashCard, setShowFlashCard] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);

    const minSwipeDistance = 50; // Minimum distance for a swipe to register

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
        // console.log("touch start", e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.touches[0].clientX);
        // console.log("touch move", e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        // console.log("ended");
        if (touchStartX !== 0 && touchEndX !== 0) {
            if (touchStartX - touchEndX < -minSwipeDistance) {
                // Detected left swipe - Replay video
                setShowFlashCard(false);
            }
            if (touchEndX - touchStartX < -minSwipeDistance) {
                // Detected right swipe
                setShowFlashCard(true);
            }
        }
    };

    const [isVideoWatched, setIsVideoWatched] = useState(false);

    const handleVideoPause = () => {
        const currentTime = videoRef.current.currentTime;
        // console.log(`User ${userid} paused video ${videoid} at ${Math.round(currentTime)} seconds.`,active);
        !active ? saveToWatchList(videoid,true,Math.round(currentTime),liked) : null;
    };

    const handleVideoEnd = () => {
        if (!isVideoWatched) {  
            saveToWatchList(videoid,true,video?.vid_len,liked);
            // Make an API call or update the state to record that the student has watched the full video
            // console.log(`User ${userid} has watched video ${videoid} fully.`);
            setIsVideoWatched(true);
        }
        // Restart the video playback
        videoRef.current.currentTime = 0;
        videoRef.current.play();
    };

    return (
        <div className='w-full h-full snap-start relative rounded overflow-hidden' onDoubleClick={handleLikes} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {showFlashCard ? <div className="bg-white h-full py-4 px-2">
                <FlashCard description={video.description} rsrc_url={video.rsrc_url} topic={"hello"} prerequisites={video?.prerequisites} tags={video?.tags} />
            </div>
                : <>
                    {/* video */}
                    {video?.vid_url.startsWith("https") ? <video ref={videoRef} onClick={playVideo} onPause={handleVideoPause} onEnded={handleVideoEnd} className='w-full h-full object-fill z-10 relative' src={video?.vid_url} onTimeUpdate={handleTimeLineProgress}></video>
                        : <div className='w-full h-full object-fill z-10 relative text-white text-center font-semibold flex items-center justify-center'>Video source url is not proper</div>}
                    {/* video elements container */}
                    <div className='absolute top-0 bottom-0 right-0 left-0 bg-transparent text-white'>
                        {/* dropdown box */}
                        <span className='absolute right-4 top-4 z-20 flex flex-col' onClick={handleDropDown}>
                            {openDropDown ? <i className="fa-solid fa-xmark text-2xl self-end"></i> : <i className="fa-solid fa-ellipsis-vertical text-2xl self-end"></i>}
                            {false && <ul className='flex flex-col gap-2 py-2 px-4 bg-white shadow rounded-sm text-neutral-500 capitalize divide-y-2'>
                                {/* <li onClick={() => setShowFlashCard(true)}>Flashcard</li> */}
                                {/* links */}
                            </ul>}
                        </span>
                        <span className={`text-2xl absolute right-3 top-1/2 flex flex-col items-center z-20 ${liked ? 'text-red-500' : null}`} onClick={handleLikes}>{liked ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}<p className='text-base font-semibold text-white'>{likeCount < 1000 ? likeCount : `${likeCount / 1000}k`}</p></span>
                        <div className='absolute z-20 bottom-12 left-4 flex items-center gap-2'>
                            <img src={userAvatar} alt="user avatar" className='h-10 w-10 rounded-full object-cover' />
                            <p className='capitalize text-base font-semibold line-clamp-1'>{username}</p>
                        </div>
                        <div className='absolute z-20 bottom-6 left-4 flex items-center gap-2'>
                            <p className='first-letter:capitalize text-sm line-clamp-1 px-1'>{video?.description}</p>
                        </div>
                        <div className='video_timeline' ref={timeLineRef} onClick={handleClickSeek} onMouseMove={handleTimeLinePreview} onMouseLeave={handleMouseSeek}>
                            <div ref={previewRef} className='preview_container'><p className='text-center font-semibold text-lg'>{previewTimestamp}</p></div>
                            <span className='preview_pointer'></span>
                        </div>
                    </div>
                </>}
        </div>
    )
}

export default Video