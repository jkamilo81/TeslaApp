export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const registration = await navigator.serviceWorker.ready
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  if (!vapidKey) {
    console.warn('VAPID public key not set')
    return null
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    })
    return subscription
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Whole days between today (in America/Bogota) and a date string.
 * Compares calendar dates only, so a due date "tomorrow" is always 1
 * regardless of the current time or the server/browser timezone.
 */
export function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  // en-CA formats as YYYY-MM-DD
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const target = new Date(dateStr.split('T')[0] + 'T00:00:00Z').getTime()
  const today = new Date(todayStr + 'T00:00:00Z').getTime()
  if (isNaN(target)) return null
  return Math.round((target - today) / 86400000)
}
