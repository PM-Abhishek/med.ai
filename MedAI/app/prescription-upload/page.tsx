'use client'

import { useState } from 'react'
import { Dropbox } from 'dropbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Camera } from 'lucide-react'
import Image from 'next/image'

const DROPBOX_ACCESS_TOKEN = 'sl.u.AFYpx4XJ8Dzdn4M_DBdV1YxGbGxdMVnHyv7K0jlr2F6IHPxVu-YNfwjHpg_5BC5iBkumlHL7ZG6tEPx6th6EY6lSbM9gu9MgNxCZAgwY0L1jrkdfzqjjX363_aTgyqDZMhDVNfplHoJVsi7Hri2z9r7ih6KmFWtRFS2psTGZzuLsCbRURNwYDQPjFupKj1Mw0OeAfe1Em_eMlGjWRc6XlHxQ8L2vfwk_-1VFAimH9o5d4BT43AGNFin2oMVKiCz1FAZDQ5ofcbjoDnNIMksmYrhKZvHvWKdwMZrz3j7PByLszLET5wsHHbq8HbT5HCo1J_uzRi21MO0kRhoaKNha9BSetPe7WSchUk8EASdNpYSDd8n4JOQ4UQ_rEZ7vUIWgPOvG3YV8CpcrETuNUjfKroOW8lt1VYDpB-JHt2HZ9n2fxKaO3L-f-lOsxQxqu9xKnVXxMZRlb4ufXAISlj5d9yOVEifRQ7Pfdk70HYTRXE8iYsEoalZWHKLr74yMEwQuNzYjE90CGjeCILSD5p7c1rE9xEJSKUCChMnsB8IArJD13OUg5GkA9QRZ6-DjFSn_rC7ZAPBSvhduWPuYyAtb7tOXieT1xJ5K3k4t2rDUuItzJU2QxypsLoDrhNhXHH9cWoqbIh33jxYBfxiTo1CxIjrAt549GyyyD9BbDdtsXS3Awfsa6ITw0S34Sr6eznr0Md58e9opqHc6sCmbUhX5Pyb5BNQPlkvG8w1yCS_kZlEKr6uXOFj09hg1Jxo7Y7rFiPU2y9MolFK3JbK7gYnMdM_cO_HUzA9PEiZdmbuyv_vIpeRaDwcL7mqiGJZZQJ_gNysgSHhuc7K2G_kx1npRBWuUIrGuw-2UyDj3jD2--KzmRU0ok3Onan-TdeCPx1Sr2gNWAX3HsdNd0PvzwRx58wEYDGejAVhMFmTil7cHhCJ83nKS1VoFWGA4mHd8ym_xH4gojmpXoasPMIV4SvhDyXfO2OGw--gE7xm0eOIiJUAh-k8wDA9ACoajXQxIr2ZphOZWqrF6f6zBlbnKdUJqcoPt7qw-InLyKbvFAYRUflK1ed-EbOyRxaiXP8pFvFEzZEnhhGXqJJWXxfAddeBsacEj3zNY5rHBrUXyg4yln-jIKb8zLbzj_Wz_whH7j2MEoCa47nW7gZA6Dfn3CRfQI52q9AK3P5fh1o9fJU5ieiYiolSOtKwmWn4Edfa41Sd3MrPMsmaN8mJUlf_oYvZFQWVfZSOCdZbi8WG0lVKoVjiLfTPxmG7RmosVvNKpV0xq8sLB7Q389EUHY4L85Et_woqsR2dQVXKRguTA5Bc_SlUxHcUohXCTgEPgoFcChFtX2-uFJrHke9HbDOqYDqT1bd5KXQIahUGXe11A1lEclGLWT-i_LUaegPBeGbSDfH68WRQBZMb05xG9hPJBVmKPezStcFO1aCSMlNiRvCrgj-kFsA'

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

      const apiResponse = await fetch('https://istrdp.buildship.run/prescription-upload', {
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

