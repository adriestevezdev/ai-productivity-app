import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type
  
  if (eventType === 'user.subscription.created' || 
      eventType === 'user.subscription.updated' ||
      eventType === 'user.subscription.deleted') {
    
    const { object } = evt.data
    
    // Extract user ID and plan information
    const userId = object.user_id
    const planName = object.plan?.name || 'free'
    const status = object.status
    
    try {
      // Call backend API to update user subscription in database
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
        },
        body: JSON.stringify({
          plan_name: planName,
          status: status,
          subscription_id: object.id,
          subscription_metadata: object
        })
      })
      
      if (!response.ok) {
        console.error('Failed to update subscription in backend:', await response.text())
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  return new Response('', { status: 200 })
}