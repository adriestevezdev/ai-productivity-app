import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

interface ProFeatureGateProps {
  children: React.ReactNode
  feature?: string
  fallback?: React.ReactNode
}

export async function ProFeatureGate({ 
  children, 
  feature,
  fallback 
}: ProFeatureGateProps) {
  const { has } = await auth()
  
  // Check if user has Pro plan
  const hasProPlan = await has({ plan: 'pro' })
  
  // If feature is specified, check for specific feature access
  const hasFeatureAccess = feature ? await has({ feature }) : hasProPlan
  
  if (!hasFeatureAccess) {
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