'use client'

import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Menu, Send, Download, X, Play, Clipboard, CheckCircle, Upload } from 'lucide-react'

type HistoryItem = {
  prompt: string
  videoUrl: string | null
  fileUrl?: string
}

export default function ManimVideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isVideoAreaVisible, setIsVideoAreaVisible] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [downloadFileUrl, setDownloadFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      // Handle file upload generation
      setError('')
      setIsVideoAreaVisible(false)
      setIsLoading(true)
      setDownloadFileUrl(null)

      const formData = new FormData()
      formData.append('file', selectedFile)

      try {
        const response = await axios.post('http://localhost:8000/generate-from-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        })

        const fileUrl = window.URL.createObjectURL(new Blob([response.data]))
        setDownloadFileUrl(fileUrl)
        setHistory([{ prompt: `File: ${selectedFile.name}`, videoUrl: null, fileUrl }, ...history])
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(`Failed to process file: ${err.response.data.error || 'Unknown error'}`)
        } else {
          setError('Failed to process file. Please try again.')
        }
      } finally {
        setIsLoading(false)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } else if (prompt.trim()) {
      // Handle text prompt generation
      setError('')
      setIsVideoAreaVisible(false)
      setIsLoading(true)
      setDownloadFileUrl(null)
      try {
        const response = await axios.post('http://localhost:8000/generate', { prompt })
        if (response.data.video) {
          setVideoUrl(response.data.video)
          setIsVideoAreaVisible(true)
          setHistory([{ prompt, videoUrl: response.data.video }, ...history])
        } else if (response.data.error) {
          setError(response.data.error)
        }
      } catch (err) {
        setError('Failed to generate video. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col p-4 font-sans relative overflow-hidden">
      {/* SVG Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${encodeURI('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/svgviewer-output-tXOgea96fcJoUaVYkkvyAp4SJjYg4K.svg')})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent pointer-events-none" />

      <header className="flex justify-end items-center mb-8 px-4 relative z-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-300 hover:text-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative z-10">
        <h1 className="text-4xl font-bold font-mono mb-2 text-center">Manimator</h1>
        <p className="text-xl font-serif italic mb-8 text-center opacity-80" style={{ fontFamily: 'Doto' }}>
          Manimating your vision, frame by frame
        </p>
        <div className="w-full max-w-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                placeholder="Describe the animation you want..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md p-4 focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
                style={{
                  height: '120px',
                  minHeight: '120px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  lineHeight: '1.5',
                  paddingTop: '40px',
                  paddingBottom: '40px',
                }}
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-2 transition-colors duration-200"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
              {selectedFile && (
                <div className="absolute left-2 top-2 bg-gray-700 rounded-md px-3 py-1.5 text-sm flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="text-gray-400 hover:text-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-md p-4 flex items-center justify-center transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Generate
                </>
              )}
            </button>
          </form>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {downloadFileUrl && (
            <div className="bg-gray-800/80 border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">File Processed</h2>
              <a
                href={downloadFileUrl}
                download={selectedFile?.name || 'processed_file'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Processed File
              </a>
            </div>
          )}
          {isVideoAreaVisible && (
            <div className="bg-gray-800/80 border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm">
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-100">Generated Animation</h2>
                <a
                  href={videoUrl}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors duration-200"
                  title="Download Animation"
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download Animation</span>
                </a>
              </div>
              <div className="p-6 pt-0 relative">
                <video width="1280" height="720" controls className="w-full rounded-lg">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>
      </main>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800/90 text-gray-100 w-64 h-full p-4 ml-auto backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Past Prompts</h2>
            <ul className="space-y-2 mb-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {history.map((item, index) => (
                <li key={index} className="bg-gray-700/80 p-2 rounded-md flex justify-between items-center">
                  <span className="truncate mr-2">{item.prompt}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.prompt)
                        setCopiedIndex(index)
                        setTimeout(() => setCopiedIndex(null), 2000)
                      }}
                      className="text-gray-400 hover:text-gray-100 transition-colors duration-200"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clipboard className="h-5 w-5" />
                      )}
                    </button>
                    {item.videoUrl ? (
                      <button
                        onClick={() => item.videoUrl && window.open(item.videoUrl, '_blank')}
                        className="text-gray-400 hover:text-gray-100 transition-colors duration-200"
                        title="Play video"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    ) : item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        download
                        className="text-gray-400 hover:text-gray-100 transition-colors duration-200"
                        title="Download file"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-md p-2 flex items-center justify-center transition-colors duration-200"
            >
              <X className="h-5 w-5 mr-2" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}