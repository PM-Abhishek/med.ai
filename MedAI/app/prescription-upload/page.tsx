'use client'

import { useState } from 'react'
import { Dropbox } from 'dropbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Camera } from 'lucide-react'
import Image from 'next/image'

const DROPBOX_ACCESS_TOKEN = "<token>"

interface MedicineInfo {
  medicine_name: string;
  purpose: string;
  dosage: string;
  route: string;
  frequency: number;
}

export default function PrescriptionUpload() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [apiResponse, setApiResponse] = useState<MedicineInfo[] | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadImageAndProcess = async () => {
    if (!image) return

    setIsUploading(true)
    try {
      const dropbox = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN })
      const fileName = `prescription_${Date.now()}.${image.name.split('.').pop()}`
      
      const fileArrayBuffer = await image.arrayBuffer()
      const uploadResponse = await dropbox.filesUpload({
        path: `/${fileName}`,
        contents: fileArrayBuffer,
      })

      const sharedLinkResponse = await dropbox.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_display,
      })

      const imageUrl = sharedLinkResponse.result.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')

      const apiResponse = await fetch('<buildship-url>', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      })

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        setApiResponse(data.medication_details)
      } else {
        console.error('API request failed')
        setApiResponse(null)
      }
    } catch (error) {
      console.error('Error uploading to Dropbox or sending to API:', error)
      setApiResponse(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prescription Upload</h1>
      <div className="mb-4 flex items-center">
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <Camera size={24} />
          </div>
        </label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <span className="ml-2">
          {image ? image.name : 'No image selected'}
        </span>
      </div>
      {previewUrl && (
        <div className="mb-4">
          <Image src={previewUrl} alt="Preview" width={300} height={300} className="object-contain" />
        </div>
      )}
      <Button onClick={uploadImageAndProcess} disabled={!image || isUploading}>
        {isUploading ? <Spinner className="mr-2" /> : null}
        {isUploading ? 'Processing...' : 'Upload and Process'}
      </Button>
      {apiResponse && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Prescription Details:</h2>
          {apiResponse.map((medicine, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h3 className="font-bold">{medicine.medicine_name}</h3>
              <p><strong>Purpose:</strong> {medicine.purpose}</p>
              <p><strong>Dosage:</strong> {medicine.dosage}</p>
              <p><strong>Route:</strong> {medicine.route}</p>
              <p><strong>Frequency:</strong> Every {medicine.frequency} hours</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

