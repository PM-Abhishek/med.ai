'use client'

import { useRef, useState } from 'react'
import { Mic, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Dropbox } from 'dropbox'
import { AmbulanceAnimation } from './AmbulanceAnimation'
import { useRouter } from 'next/navigation'

const DROPBOX_ACCESS_TOKEN = 'sl.u.AFYpx4XJ8Dzdn4M_DBdV1YxGbGxdMVnHyv7K0jlr2F6IHPxVu-YNfwjHpg_5BC5iBkumlHL7ZG6tEPx6th6EY6lSbM9gu9MgNxCZAgwY0L1jrkdfzqjjX363_aTgyqDZMhDVNfplHoJVsi7Hri2z9r7ih6KmFWtRFS2psTGZzuLsCbRURNwYDQPjFupKj1Mw0OeAfe1Em_eMlGjWRc6XlHxQ8L2vfwk_-1VFAimH9o5d4BT43AGNFin2oMVKiCz1FAZDQ5ofcbjoDnNIMksmYrhKZvHvWKdwMZrz3j7PByLszLET5wsHHbq8HbT5HCo1J_uzRi21MO0kRhoaKNha9BSetPe7WSchUk8EASdNpYSDd8n4JOQ4UQ_rEZ7vUIWgPOvG3YV8CpcrETuNUjfKroOW8lt1VYDpB-JHt2HZ9n2fxKaO3L-f-lOsxQxqu9xKnVXxMZRlb4ufXAISlj5d9yOVEifRQ7Pfdk70HYTRXE8iYsEoalZWHKLr74yMEwQuNzYjE90CGjeCILSD5p7c1rE9xEJSKUCChMnsB8IArJD13OUg5GkA9QRZ6-DjFSn_rC7ZAPBSvhduWPuYyAtb7tOXieT1xJ5K3k4t2rDUuItzJU2QxypsLoDrhNhXHH9cWoqbIh33jxYBfxiTo1CxIjrAt549GyyyD9BbDdtsXS3Awfsa6ITw0S34Sr6eznr0Md58e9opqHc6sCmbUhX5Pyb5BNQPlkvG8w1yCS_kZlEKr6uXOFj09hg1Jxo7Y7rFiPU2y9MolFK3JbK7gYnMdM_cO_HUzA9PEiZdmbuyv_vIpeRaDwcL7mqiGJZZQJ_gNysgSHhuc7K2G_kx1npRBWuUIrGuw-2UyDj3jD2--KzmRU0ok3Onan-TdeCPx1Sr2gNWAX3HsdNd0PvzwRx58wEYDGejAVhMFmTil7cHhCJ83nKS1VoFWGA4mHd8ym_xH4gojmpXoasPMIV4SvhDyXfO2OGw--gE7xm0eOIiJUAh-k8wDA9ACoajXQxIr2ZphOZWqrF6f6zBlbnKdUJqcoPt7qw-InLyKbvFAYRUflK1ed-EbOyRxaiXP8pFvFEzZEnhhGXqJJWXxfAddeBsacEj3zNY5rHBrUXyg4yln-jIKb8zLbzj_Wz_whH7j2MEoCa47nW7gZA6Dfn3CRfQI52q9AK3P5fh1o9fJU5ieiYiolSOtKwmWn4Edfa41Sd3MrPMsmaN8mJUlf_oYvZFQWVfZSOCdZbi8WG0lVKoVjiLfTPxmG7RmosVvNKpV0xq8sLB7Q389EUHY4L85Et_woqsR2dQVXKRguTA5Bc_SlUxHcUohXCTgEPgoFcChFtX2-uFJrHke9HbDOqYDqT1bd5KXQIahUGXe11A1lEclGLWT-i_LUaegPBeGbSDfH68WRQBZMb05xG9hPJBVmKPezStcFO1aCSMlNiRvCrgj-kFsA'

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

      const apiResponse = await fetch('https://r1bgmn.buildship.run/test', {
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

