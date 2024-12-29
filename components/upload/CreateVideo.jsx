"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/fileInput';
import { Textarea } from "@/components/ui/textarea"
import useFetch from '../../hooks/useFetch';
import OptionSelector from '../../components/ui/OptionSelector';
import useUpload from '@/firebase/api/useUpload';
import { useSelector } from 'react-redux';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebaseConfig";

const CreateVideo = ({ quiz_id, flashcard_id }) => {
  const initFormData = {
    edu_id: '1',
    flashcard_id: flashcard_id,
    quiz_id: quiz_id,
    top_id: '',
    vid_url: '',
    thumbnail_url: '',
    tags: '',
    prerequisites: '',
    description: '',
    vid_len: '',
  }

  const [formData, setFormData] = useState(initFormData);

  const [loading, setLoading] = useState(false);

  const createData = useFetch();
  const { handleUpload, url } = useUpload();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const video = document.createElement("video");
      video.preload = "metadata";
      let durationInSeconds = 1;
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src); // Free up memory
        durationInSeconds = Math.round(video.duration); // Get video duration
        // console.log(`Video Duration: ${durationInSeconds} seconds`);
        setFormData({
          ...formData,
          [name]: files[0],
          vid_len:durationInSeconds
        });
      };
      video.src = URL.createObjectURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const userId = useSelector(state => state.user.userId);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log(formData);
      setLoading(true);

      // Create an array of promises for both uploads
      const uploadPromises = [];

      // Upload thumbnail
      const storageRef = ref(storage, `files/${formData.thumbnail_url.name}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, formData.thumbnail_url);

      const thumbnailUploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Thumbnail upload is ${progress}% done`);
          },
          (error) => {
            console.error("Thumbnail upload failed:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log("Thumbnail available at:", downloadURL);
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      });

      uploadPromises.push(thumbnailUploadPromise);

      // Upload video
      const vidstorageRef = ref(storage, `files/${formData.vid_url.name}`);
      const uploadVidTask = uploadBytesResumable(vidstorageRef, formData.vid_url);

      const videoUploadPromise = new Promise((resolve, reject) => {
        uploadVidTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Video upload is ${progress}% done`);
          },
          (error) => {
            console.error("Video upload failed:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadVidTask.snapshot.ref).then((downloadURL) => {
              console.log("Video available at:", downloadURL);
              resolve(downloadURL);
            }).catch(reject);
          }
        );
      });

      uploadPromises.push(videoUploadPromise);

      // Wait for both uploads to complete
      const [thumbnailUrl, videoUrl] = await Promise.all(uploadPromises);

      // Update formData with the retrieved URLs
      setFormData({
        ...formData,
        thumbnail_url: thumbnailUrl,
        vid_url: videoUrl,
      });

      // Check if URLs are valid
      if (!thumbnailUrl || !videoUrl) {
        throw new Error('An error occurred while uploading video or thumbnail');
      }

      // Prepare payload for API request
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payload = {
        edu_id: userId,
        flashcard_id: parseInt(formData.flashcard_id),
        quiz_id: parseInt(formData.quiz_id),
        top_id: parseInt(formData.top_id),
        vid_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        tags: formData.tags,
        prerequisites: formData.prerequisites,
        description: formData.description,
        vid_len: formData.vid_len,
      };

      // Send data to backend
      const res = await createData(baseUrl + '/video', 'POST', payload, 201);

      console.log(res);

      if (!res) {
        throw new Error('An error occurred while creating quiz');
      }
    } catch (err) {
      console.log("An error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  const [topics, setTopics] = useState([]);

  useEffect(() => {
    try {

      createData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/topics`, 'GET', null, 200).then(res => {
        if (!res) {
          throw new Error('An error occured while fetching topics');
        } else {
          setTopics(res.data);
        }
      })
    } catch (err) {
      console.log("An error occured", err);
    }
  }, [])

  const handleSelectTopic = (selectedOption) => {
    const { top_id } = selectedOption;
    setFormData(p => ({ ...p, top_id: top_id }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FileInput label="Add Video" accept="video/*" name="vid_url" onChange={handleChange} required={true} />
        <FileInput label="Add Thumbnail" accept="image/*" name="thumbnail_url" onChange={handleChange} required={true} />
        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</Label>
          <Textarea type="text" name="description" value={formData.description} onChange={handleChange} required={true} />
        </div>
        <div>
          <Label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</Label>
          <Textarea type="text" name="tags" value={formData.tags} onChange={handleChange} required={true} />
        </div>
        <div>
          <Label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700">Prerequisites</Label>
          <Input type="text" name="prerequisites" value={formData.prerequisites} onChange={handleChange} required={true} />
        </div>
        <div>
          <Label htmlFor="topics" className="block text-sm font-medium text-gray-700">Select Topic</Label>
          <OptionSelector options={topics} onSelect={handleSelectTopic} />
        </div>
        <div>
          <Label htmlFor="quiz_id" className="block text-sm font-medium text-gray-700">Quiz ID</Label>
          <Input type="text" name="quiz_id" value={formData.quiz_id} onChange={handleChange} required={true} disabled={true} />
        </div>
        <div>
          <Label htmlFor="flashcard_id" className="block text-sm font-medium text-gray-700">Flashcard ID</Label>
          <Input type="text" name="flashcard_id" value={formData.flashcard_id} onChange={handleChange} required={true} disabled={true} />
        </div>
        <Button type="submit" disabled={loading} >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  );
};

export default CreateVideo;