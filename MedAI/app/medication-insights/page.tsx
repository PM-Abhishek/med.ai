'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface Drug {
  name: string;
  type: string;
  tags: string[];
  price: number | null;
  id: string;
  image: string;
}

interface ApiResponse {
  data: {
    term: string;
    scroll_id: string;
    previous_scroll_id: string | null;
    result_found: boolean;
    search_results: any[]; // We'll use 'any' here as we're not using all properties
  };
}

function extractTopSearchResults({ result }) {
  const data = result.data;

  if (!data || !Array.isArray(data.search_results)) {
    return {
      bestsellerDrugs: [],
      otcMedicines: [],
      data
    };
  }

  let bestsellerDrugs: Drug[] = [];
  let otcMedicines: Drug[] = [];

  for (const item of data.search_results) {
    if (bestsellerDrugs.length < 2 && item.tag?.text === "Bestseller" && item.type === "drug") {
      bestsellerDrugs.push({
        name: item.name,
        type: item.type,
        tags: [item.tag.text],
        price: item.prices?.discounted_price || null,
        id: item.id,
        image: item.image
      });
    }

    if (otcMedicines.length < 2 && item.tag?.text === "Bestseller" && item.type === "otc") {
      otcMedicines.push({
        name: item.name,
        type: item.type,
        tags: [item.tag.text],
        price: item.prices?.discounted_price || null,
        id: item.id,
        image: item.image
      });
    }

    if (bestsellerDrugs.length === 2 && otcMedicines.length === 2) {
      break;
    }
  }

  if (bestsellerDrugs.length === 0) {
    bestsellerDrugs = data.search_results
      .filter(item => item.type === "drug")
      .slice(0, 2)
      .map(item => ({
        name: item.name,
        type: item.type,
        tags: item.tag ? [item.tag.text] : [],
        price: item.prices?.discounted_price || null,
        id: item.id,
        image: item.image
      }));
  }
  
  if (otcMedicines.length === 0) {
    otcMedicines = data.search_results
      .filter(item => item.type === "otc")
      .slice(0, 2)
      .map(item => ({
        name: item.name,
        type: item.type,
        tags: item.tag ? [item.tag.text] : [],
        price: item.prices?.discounted_price || null,
        id: item.id,
        image: item.image
      }));
  }

  return {
    bestsellerDrugs,
    otcMedicines
  };
}

export default function MedicationInsights() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{ bestsellerDrugs: Drug[], otcMedicines: Drug[] } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('https://r1bgmn.buildship.run/medicationInsight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: searchTerm }),
      })

      if (response.ok) {
        const data = await response.json()
        const processedResults = extractTopSearchResults({ result: data })
        setResults(processedResults)
      } else {
        console.error('API request failed')
        setResults(null)
      }
    } catch (error) {
      console.error('Error fetching medication insights:', error)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Medication Insights</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a symptom or condition"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : null}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results for "{searchTerm}"</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bestseller Drugs</h3>
              {results.bestsellerDrugs.map((drug) => (
                <div key={drug.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex">
                  <div className="w-24 h-24 mr-4 flex-shrink-0">
                    <Image
                      src={drug.image || '/placeholder.svg'}
                      alt={drug.name}
                      width={96}
                      height={96}
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{drug.name}</h4>
                    <p>Type: {drug.type}</p>
                    <p>Tags: {drug.tags.join(', ')}</p>
                    <p>Price: {drug.price ? `₹${drug.price}` : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">OTC Medicines</h3>
              {results.otcMedicines.map((medicine) => (
                <div key={medicine.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex">
                  <div className="w-24 h-24 mr-4 flex-shrink-0">
                    <Image
                      src={medicine.image || '/placeholder.svg'}
                      alt={medicine.name}
                      width={96}
                      height={96}
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{medicine.name}</h4>
                    <p>Type: {medicine.type}</p>
                    <p>Tags: {medicine.tags.join(', ')}</p>
                    <p>Price: {medicine.price ? `₹${medicine.price}` : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

