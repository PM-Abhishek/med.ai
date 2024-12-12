import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: "Emergency Response Simplified",
    items: [
      "Analyze emergencies with AI-powered tools.",
      "Pinpoint locations using Google Maps.",
      "Automate ambulance requests instantly."
    ],
    url: "/emergency-response"
  },
  {
    title: "Medication Insights",
    items: [
      "Access a dynamic database of symptoms and medication details.",
      "Analyze data with precision for better healthcare decisions."
    ],
    url: "/medication-insights"
  },
  {
    title: "Quick First Aid Guidance",
    items: [
      "Get instant first aid suggestions from a smart knowledge base."
    ],
    url: "/first-aid-guidance"
  },
  {
    title: "Smart Prescription Management",
    items: [
      "Upload and process prescriptions with OCR.",
      "Schedule automated reminders for medication."
    ],
    url: "/prescription-upload"
  }
]

export function FeatureList() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {features.map((feature, index) => (
        <Link href={feature.url} key={index} className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
            <ul className="space-y-2">
              {feature.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Link>
      ))}
    </div>
  )
}

