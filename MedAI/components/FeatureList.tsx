'use client'

import { useRef, useState } from 'react'
import { Mic, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Dropbox } from 'dropbox'
import { AmbulanceAnimation } from './AmbulanceAnimation'
import { useRouter } from 'next/navigation'

const DROPBOX_ACCESS_TOKEN = "<token>"

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        uploadToDropboxAndSendToAPI(audioBlob)
      })

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const uploadToDropboxAndSendToAPI = async (audioBlob: Blob) => {
    setIsUploading(true)
    try {
      const dropbox = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN })
      const fileName = `recording_${Date.now()}.wav`
      const uploadResponse = await dropbox.filesUpload({
        path: `/${fileName}`,
        contents: audioBlob,
      })

      const sharedLinkResponse = await dropbox.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_display,
      })

      const audioUrl = sharedLinkResponse.result.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')

      setIsUploading(false)
      setIsProcessing(true)

      const apiResponse = await fetch('<buildship-url>', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl,audiourl: audioUrl}),
      })

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        setApiResponse(data.result)
        if (data.result === 'Ambulance Dispatched!') {
          setTimeout(() => {
            router.push('/ambulance-tracker')
          }, 3000) // Navigate after 3 seconds to show the animation
        }
      } else {
        console.error('API request failed')
        setApiResponse('Error: Unable to process audio')
      }
    } catch (error) {
      console.error('Error uploading to Dropbox or sending to API:', error)
      setApiResponse('Error: Unable to upload audio or send to API')
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const getStatusMessage = () => {
    if (isRecording) return 'Recording...'
    if (isUploading) return 'Uploading to Dropbox...'
    if (isProcessing) return 'Processing audio...'
    return 'Click to start recording'
  }

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6">Speak Your Need, We'll Act Fast!</h3>
      <Button
        onClick={handleButtonClick}
        disabled={isUploading || isProcessing}
        className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center mb-4"
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <StopCircle className="w-12 h-12 text-white" />
        ) : isUploading || isProcessing ? (
          <Spinner className="w-12 h-12 text-white" />
        ) : (
          <Mic className="w-12 h-12 text-white" />
        )}
      </Button>
      <p className="text-lg mb-4" aria-live="polite">
        {getStatusMessage()}
      </p>
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full max-w-md">
          <h4 className="text-xl font-semibold mb-2">Medical Assistance Update:</h4>
          <p>{apiResponse}</p>
        </div>
      )}
      {apiResponse === 'Ambulance Dispatched!' && (
        <div className="mt-4 w-full">
          <AmbulanceAnimation />
        </div>
      )}
    </div>
  )
}

