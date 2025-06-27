'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ProFeatureGateClientProps {
  children: React.ReactNode
  feature?: string
  fallback?: React.ReactNode
}

export function ProFeatureGateClient({ 
  children, 
  feature,
  fallback 
}: ProFeatureGateClientProps) {
  const { has } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  
  useEffect(() => {
    async function checkAccess() {
      if (!has) return
      
      // Check if user has Pro plan
      const hasProPlan = await has({ plan: 'pro' })
      
      // If feature is specified, check for specific feature access
      const hasFeatureAccess = feature ? await has({ feature }) : hasProPlan
      
      setHasAccess(hasFeatureAccess)
    }
    
    checkAccess()
  }, [has, feature])
  
  // Loading state
  if (hasAccess === null) {
    return <div className="animate-pulse bg-gray-200 rounded h-32"></div>
  }
  
  if (!hasAccess) {
    return fallback || (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pro Feature
        </h3>
        <p className="text-gray-600 mb-4">
          This feature is available for Pro subscribers only.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Upgrade to Pro
        </Link>
      </div>
    )
  }
  
  return <>{children}</>
}