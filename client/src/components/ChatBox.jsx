import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat,theme,user , axios, token, setUser} = useAppContext()

  const [messages,setMessages] = useState([])
  const [loading,setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode,setMode] = useState('text')
  const [isPublished,setIsPublished] = useState(false)

  // PDFs attached to the current chat (used as context for text answers)
  const fileInputRef = useRef(null)
  const [documents,setDocuments] = useState([])
  const [uploading,setUploading] = useState(false)

  const fetchDocuments = async () => {
    if(!selectedChat || !token) return setDocuments([])
    try {
      const {data} = await axios.get(`/api/document/list?chatId=${selectedChat._id}`,{headers:{Authorization: token}})
      setDocuments(data.success ? data.documents : [])
    } catch {
      setDocuments([])
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if(!file) return
    if(!user) return toast('Login to upload a PDF')
    if(file.type !== 'application/pdf') return toast.error('Only PDF files are supported')

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('chatId', selectedChat._id) // text fields before the file
      formData.append('file', file)
      const {data} = await axios.post('/api/document/upload', formData, {headers:{Authorization: token}})
      if(data.success){
        setDocuments(prev => [...prev, data.document])
        toast.success(`${data.document.fileName} is ready`)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = async (documentId) => {
    try {
      const {data} = await axios.post('/api/document/delete',{documentId},{headers:{Authorization: token}})
      if(data.success){
        setDocuments(prev => prev.filter(d => d._id !== documentId))
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmit = async (e) => {
    try {
    e.preventDefault()
    if(!user) return toast('Login to send message')
      setLoading(true)
      const promptCopy = prompt
      setPrompt('')
      setMessages(prev => [...prev,{role:'user',content:prompt, timestamp:Date.now(), isImage: false}])

      const {data} = await axios.post(`/api/message/${mode}`,{chatId:selectedChat._id, prompt, isPublished},{headers:{Authorization: token}})

      if(data.success){
        setMessages(prev => [...prev, data.reply])

        if(mode === 'image'){
          setUser(prev => ({...prev,credits:prev.credits -2}))
        }else{
          setUser(prev => ({...prev,credits:prev.credits -1}))
        }
      }else{
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    
    } catch (error) {
       toast.error(error.message)
    }finally{
      setPrompt('')
      setLoading(false)
    }
  }
  
  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
    fetchDocuments()
  },[selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top:containerRef.current.scrollHeight,
        behavior:"smooth"
      })
    }
  },[messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 l:mx-30 max-md:mt-14 2xl:pr-40'>
      {/* {chat messages} */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} className='w-full max-w-56 sm:max-w-68' alt="" />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>Ask me anything.</p>
            </div>
        )}

        {messages.map((message,index)=> <Message key={index} message={message} /> )}

        {/* {three dot loading} */}
        {loading && (
  <div className='loader flex items-center gap-1.5'>
    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
  </div>
)}

      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
  <p className='text-xs'>Publish Generated Image to Community</p>
  <input
    type="checkbox"
    className='cursor-pointer'
    checked={isPublished}
    onChange={(e) => setIsPublished(e.target.checked)}
  />
</label>

      )}

      {/* {attached pdfs} */}
      {(documents.length > 0 || uploading) && (
        <div className='flex flex-wrap justify-center gap-2 mb-3 max-w-2xl mx-auto'>
          {documents.map(doc => (
            <span key={doc._id} title={`${doc.pages} pages`} className='inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30'>
              <span className='max-w-40 truncate'>{doc.fileName}</span>
              <button type='button' onClick={()=>removeDocument(doc._id)} aria-label={`Remove ${doc.fileName}`} className='cursor-pointer text-gray-500 dark:text-gray-300'>✕</button>
            </span>
          ))}
          {uploading && <span className='text-xs text-gray-500 dark:text-gray-300 px-3 py-1'>Reading PDF…</span>}
        </div>
      )}

      {/* {promp input box} */}
      <form onSubmit={onSubmit}
  className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className='text-sm pl-3 outline-none' id="">
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>
        {mode === 'text' && (
          <>
            <input ref={fileInputRef} type="file" accept="application/pdf" className='hidden' onChange={onFileChange} />
            <button type='button' disabled={uploading || !selectedChat} onClick={()=>fileInputRef.current?.click()} title='Attach a PDF' aria-label='Attach a PDF' className='cursor-pointer text-lg disabled:opacity-50'>📎</button>
          </>
        )}
        <input type="text" placeholder='Type your prompt here...' className='flex-1 w-full text-sm outline-none' onChange={(e)=>setPrompt(e.target.value)} value={prompt} required />
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
