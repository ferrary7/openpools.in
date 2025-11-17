'use client'

import { useState } from 'react'
import JournalForm from '@/components/journal/JournalForm'
import JournalList from '@/components/journal/JournalList'

export default function JournalPage() {
  const [refresh, setRefresh] = useState(0)

  const handleSuccess = (data) => {
    setRefresh((prev) => prev + 1)

    if (data.extractedKeywords && data.extractedKeywords.length > 0) {
      alert(
        `✅ Journal saved! Extracted ${data.extractedKeywords.length} keywords and updated your profile.`
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
        <p className="text-gray-600 mt-2">
          Your space to record progress and evolve your signals
        </p>
      </div>

      <div className="space-y-8">
        <JournalForm onSuccess={handleSuccess} />

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Entries
          </h2>
          <JournalList refresh={refresh} />
        </div>
      </div>
    </div>
  )
}
