'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function UserPlanStatusClient() {
  const { has } = useAuth()
  const [planStatus, setPlanStatus] = useState<{ loading: boolean; isPro: boolean }>({
    loading: true,
    isPro: false
  })
  
  useEffect(() => {
    async function checkPlan() {
      if (!has) {
        setPlanStatus({ loading: false, isPro: false })
        return
      }
      
      try {
        const hasProPlan = await has({ plan: 'pro' })
        setPlanStatus({ loading: false, isPro: hasProPlan })
      } catch (error) {
        console.error('Error checking plan status:', error)
        setPlanStatus({ loading: false, isPro: false })
      }
    }
    
    checkPlan()
  }, [has])
  
  if (planStatus.loading) {
    return <span className="text-xs text-[#606060]">Loading...</span>
  }
  
  return (
    <div className="flex items-center gap-2">
      {planStatus.isPro ? (
        <>
          <span className="text-xs text-[#4ECDC4]">Pro</span>
          <span className="text-xs text-[#4ECDC4]">✓</span>
        </>
      ) : (
        <>
          <span className="text-xs text-[#606060]">Free</span>
          <Link
            href="/pricing"
            className="text-xs text-[#4ECDC4] hover:text-[#45B7B8] transition-colors"
          >
            Upgrade
          </Link>
        </>
      )}
    </div>
  )
}