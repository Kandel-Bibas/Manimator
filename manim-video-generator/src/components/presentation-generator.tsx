'use client'

import { Download, Loader2, Upload, AlertCircle } from 'lucide-react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import Layout from './layout'

export default function PresentationGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [slideUrl, setSlideUrl] = useState<string | null>(null)
  const [slideName, setSlideName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((file: File) => {
    setFile(file)
    setSlideName(file.name.replace(/\.[^/.]+$/, ""))
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      handleFile(acceptedFiles[0])
    }
  }, [handleFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 200 * 1024 * 1024, // 200MB
    multiple: false
  })

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleGenerate = async () => {
    if (!file) {
      setError('Please upload a PDF file first.')
      setIsShaking(true)
      return
    }
    if (!slideName.trim()) {
      setError('Please enter a name for the slide.')
      return
    }
    setError(null)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', slideName)

    try {
      const response = await axios.post('http://localhost:8000/generate-slides', formData)
      setSlideUrl(response.data.slideUrl)
    } catch (error) {
      console.error('Error generating slides:', error)
      setError('An error occurred while generating the slides. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 820)
      return () => clearTimeout(timer)
    }
  }, [isShaking])

  return (
    <Layout>
      <h1 className="text-5xl font-bold mb-16">Test Presentation Generator</h1>

      <div className="w-full space-y-8">
        <h2 className="text-xl mb-4">Upload Lesson Plan PDF:</h2>

        <div
          {...getRootProps()}
          ref={dropzoneRef}
          className={`
            border-2 border-dashed rounded-xl p-12
            bg-gray-800/50 backdrop-blur-sm
            transition-all duration-200 cursor-pointer
            text-center
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            ${isShaking ? 'animate-shake' : ''}
          `}
        >
          <input {...getInputProps()} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="application/pdf"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            {isLoading ? (
              <Loader2 className="w-16 h-16 mb-4 text-blue-500 animate-spin" />
            ) : slideUrl ? (
              <Download className="w-16 h-16 mb-4 text-green-500 cursor-pointer" onClick={handleIconClick} />
            ) : (
              <Upload
                className="w-16 h-16 mb-4 text-gray-400 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                onClick={handleIconClick}
              />
            )}

            <p className="text-xl">
              {isLoading ? 'Generating presentation...' :
               slideUrl ? 'Presentation ready!' :
               isDragActive ? 'Drop PDF here' : 'Drag and drop PDF here'}
            </p>

            {!isLoading && !slideUrl && (
              <p className="text-gray-400 mt-2">Limit 200MB per file</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="slideName" className="block text-sm font-medium text-gray-300 mb-2">
              Slide Name
            </label>
            <input
              type="text"
              id="slideName"
              value={slideName}
              onChange={(e) => setSlideName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter slide name"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Presentation'
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {file && !isLoading && !slideUrl && (
          <div className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm">
            <p className="text-lg">Selected file: {file.name}</p>
            <p className="text-sm text-gray-400">
              Size: {(file.size / (1024 * 1024)).toFixed(2)}MB
            </p>
          </div>
        )}

        {slideUrl && (
          <div className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm">
            <p className="text-lg mb-4">Your presentation is ready!</p>
            <a
              href={slideUrl}
              download
              className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Presentation
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}