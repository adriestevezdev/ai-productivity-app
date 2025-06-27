import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export async function UserPlanStatus() {
  const { has } = await auth()
  const hasProPlan = await has({ plan: 'pro' })
  
  return (
    <div className="flex items-center gap-2">
      {hasProPlan ? (
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