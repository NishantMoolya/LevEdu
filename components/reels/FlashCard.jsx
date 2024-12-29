"use client"

import React from 'react'
import { Badge } from "@/components/ui/badge"


const FlashCard = ({ description, rsrc_url,topic,prerequisites,tags }) => {
  return (
    <div className='flex flex-col gap-2 px-2 py-3 items-start bg-white rounded shadow'>
      <Badge variant="secondary">{topic}</Badge>
      <div className='flex flex-col gap-1 items-start'>
        <p className='font-semibold text-sm text-slate-600'>Prerequisites</p>
        <div className='flex items-center gap-2 ml-1'>
          {
            prerequisites.split(' ').map((item, ind) => <Badge key={ind} variant="secondary">{item}</Badge>)
          }
        </div>
      </div>
      <div className='flex flex-col gap-1 items-start'>
        <p className='font-semibold text-sm text-slate-600'>Tags</p>
        <div className='flex items-center gap-2 mt-1'>
          {
            tags.split(' ').map((item, ind) => <Badge key={ind} variant="secondary">{item}</Badge>)
          }
        </div>
      </div>
      <p className='first-letter:capitalize text-slate-700 font-semibold'>{description}</p>
      <a href={rsrc_url} target="_blank" rel="noopener noreferrer" className='underline text-blue-500 text-sm'>Resource</a>
    </div>
  )
}

export default FlashCard