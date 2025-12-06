'use client'

import { useState } from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function SellerWarning() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FiAlertTriangle className="text-yellow-600 text-2xl flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold text-yellow-900 mb-2">
              ⚠️ IMPORTANT: Read Before Meeting Buyer!
            </h4>
            <div className="text-sm text-yellow-800 space-y-2">
              <p className="font-semibold">
                For CARD PAYMENTS - Follow this process exactly:
              </p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Meet the buyer at agreed location</li>
                <li>Show them the item and let them inspect</li>
                <li><strong className="text-red-700">Ask buyer to CONFIRM RECEIPT in the app (in front of you)</strong></li>
                <li><strong className="text-red-700">Wait for confirmation to complete</strong></li>
                <li><strong className="text-green-700">ONLY THEN hand over the item</strong></li>
              </ol>
              <p className="bg-red-100 border border-red-300 p-2 rounded mt-2 font-medium text-red-800">
                🚫 DO NOT give the item before confirmation! 
                <br />
                You may lose both the item AND the money!
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  )
}





