import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Share message generation
export type ShareContext = 'toVenue' | 'fromVenue' | 'generic'

export interface ShareOptions {
  patternUrl: string
  venueName?: string
  customMessage?: string
  context?: ShareContext
}

export function generateShareMessage(options: ShareOptions): string {
  const { patternUrl, venueName, customMessage, context = 'generic' } = options
  
  if (customMessage) {
    return customMessage.replace(/\[link\]/g, patternUrl)
  }
  
  const templates = {
    toVenue: "Click this and hold your phone up so I can find you: [link]",
    fromVenue: "Look for this pattern - I'm holding my phone up: [link]",
    generic: "Find me with this flashing pattern: [link]"
  }
  
  let message = templates[context]
  
  // Add venue name if provided
  if (venueName && context !== 'generic') {
    const venuePrefix = `At ${venueName} - `
    message = venuePrefix + message.toLowerCase()
  }
  
  return message.replace(/\[link\]/g, patternUrl)
}

export function createShareUrl(patternName: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/p/${patternName}`
}

export function detectShareContext(): ShareContext {
  if (typeof window === 'undefined') return 'generic'
  
  const pathname = window.location.pathname
  
  // If we're on the create page, user is likely creating to share with someone at venue
  if (pathname === '/create') {
    return 'toVenue'
  }
  
  // If we're on a pattern display page, user might be at venue sharing their pattern
  if (pathname.startsWith('/p/')) {
    return 'fromVenue'
  }
  
  return 'generic'
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false))
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        resolve(success)
      } catch {
        resolve(false)
      }
    }
  })
}

// Web Share API integration
export interface ShareData {
  title?: string
  text?: string
  url?: string
}

export interface ShareResult {
  success: boolean
  method: 'native' | 'fallback' | 'error'
  error?: string
}

export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

export async function shareWithNativeAPI(data: ShareData): Promise<ShareResult> {
  if (!canUseWebShare()) {
    return { success: false, method: 'error', error: 'Web Share API not supported' }
  }
  
  try {
    await navigator.share(data)
    return { success: true, method: 'native' }
  } catch (error) {
    // User cancelled the share or there was an error
    const errorMessage = error instanceof Error ? error.message : 'Share cancelled'
    return { success: false, method: 'error', error: errorMessage }
  }
}

export async function sharePattern(options: ShareOptions): Promise<ShareResult> {
  const message = generateShareMessage(options)
  
  // Try native Web Share API first
  if (canUseWebShare()) {
    const shareData: ShareData = {
      title: 'Concert Finder Pattern',
      text: message,
      url: options.patternUrl
    }
    
    const result = await shareWithNativeAPI(shareData)
    if (result.success || result.error !== 'Web Share API not supported') {
      return result
    }
  }
  
  // Fallback to clipboard copy
  const fullMessage = `${message}`
  const success = await copyToClipboard(fullMessage)
  
  return {
    success,
    method: 'fallback',
    error: success ? undefined : 'Failed to copy to clipboard'
  }
}

// Share URL generators for specific platforms
export function createSMSUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `sms:?body=${encodedMessage}`
}

export function createEmailUrl(message: string, subject = 'Find me at the concert!'): string {
  const encodedSubject = encodeURIComponent(subject)
  const encodedMessage = encodeURIComponent(message)
  return `mailto:?subject=${encodedSubject}&body=${encodedMessage}`
}

export function createWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/?text=${encodedMessage}`
}

export function createTwitterUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://twitter.com/intent/tweet?text=${encodedMessage}`
}
