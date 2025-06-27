'use client'

import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface UpgradePromptProps {
  title?: string
  description?: string
  onClose?: () => void
  className?: string
}

export function UpgradePrompt({ 
  title = "Upgrade to Pro",
  description = "Unlock AI-powered features, unlimited projects, and advanced analytics.",
  onClose,
  className = ""
}: UpgradePromptProps) {
  return (
    <div className={`bg-gradient-to-r from-[#4ECDC4]/10 to-[#8B5CF6]/10 border border-[#4ECDC4]/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{title}</h3>
          <p className="text-[#A0A0A0] text-sm mb-3">{description}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 bg-[#4ECDC4] text-black text-sm font-medium rounded-lg hover:bg-[#45B7B8] transition-all"
          >
            View Plans
          </Link>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-[#606060] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}