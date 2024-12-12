import VoiceRecorder from '@/components/FeatureList'
import { FeatureList } from '@/components/VoiceRecorder'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <h1 className="text-4xl font-bold mb-4 text-center">MedAI: AI at your Emergency!</h1>
      <h2 className="text-2xl font-semibold mb-8 text-center text-gray-600">Revolutionizing Emergency and Healthcare Services</h2>
      <div className="w-full max-w-4xl mb-12">
        <FeatureList />
      </div>
      <VoiceRecorder />
      <Link href="/medication-insights" className="mt-4 text-blue-500 hover:underline">
        Medication Insights
      </Link>
      <Link href="/prescription-upload" className="mt-8 text-blue-500 hover:underline">
        Upload Prescription
      </Link>
    </main>
  )
}

