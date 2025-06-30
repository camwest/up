"use client";

import { useState } from "react";
import { 
  ShareOptions, 
  sharePattern, 
  canUseWebShare, 
  generateShareMessage,
  createSMSUrl,
  createEmailUrl,
  createWhatsAppUrl,
  copyToClipboard,
  detectShareContext
} from "@/lib/utils";

interface ShareModalProps {
  patternUrl: string;
  patternName: string;
  isOpen: boolean;
  onClose: () => void;
  venueName?: string;
}

export function ShareModal({ patternUrl, patternName, isOpen, onClose, venueName }: ShareModalProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  if (!isOpen) return null;

  const context = detectShareContext();
  const shareOptions: ShareOptions = {
    patternUrl,
    venueName,
    customMessage: customMessage || undefined,
    context
  };

  const defaultMessage = generateShareMessage(shareOptions);
  const displayMessage = customMessage || defaultMessage;

  const handleNativeShare = async () => {
    setSharing(true);
    try {
      const result = await sharePattern(shareOptions);
      if (result.success) {
        if (result.method === 'fallback') {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        if (result.method === 'native') {
          onClose();
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
    setSharing(false);
  };

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(displayMessage);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(patternUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlatformShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-background border border-primary/30 rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto shadow-neon">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold text-primary">
                Share {patternName}
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Message Preview */}
            <div className="space-y-3">
              <label className="text-sm font-headline font-medium text-foreground">
                Share Message
              </label>
              <div className="bg-muted/30 border border-border rounded-sm p-3">
                <p className="text-sm text-foreground">
                  {displayMessage}
                </p>
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-headline font-medium text-foreground">
                Custom Message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your own message (use [link] for the URL)"
                className="w-full p-3 bg-background border border-border rounded-sm text-sm resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Use [link] in your message to insert the pattern URL
              </p>
            </div>

            {/* Quick Share Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-headline font-medium text-foreground">
                Share Options
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Native Share (if available) */}
                {canUseWebShare() && (
                  <button
                    onClick={handleNativeShare}
                    disabled={sharing}
                    className="flex items-center gap-3 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg">📱</span>
                    <span className="font-medium">
                      {sharing ? "Sharing..." : "Share via Apps"}
                    </span>
                  </button>
                )}

                {/* Platform-specific shares */}
                <button
                  onClick={() => handlePlatformShare(createSMSUrl(displayMessage))}
                  className="flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 text-foreground rounded-sm transition-colors"
                >
                  <span className="text-lg">💬</span>
                  <span className="font-medium">Text Message</span>
                </button>

                <button
                  onClick={() => handlePlatformShare(createWhatsAppUrl(displayMessage))}
                  className="flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 text-foreground rounded-sm transition-colors"
                >
                  <span className="text-lg">📱</span>
                  <span className="font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={() => handlePlatformShare(createEmailUrl(displayMessage))}
                  className="flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 text-foreground rounded-sm transition-colors"
                >
                  <span className="text-lg">✉️</span>
                  <span className="font-medium">Email</span>
                </button>
              </div>
            </div>

            {/* Copy Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                Or Copy to Share Manually
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 text-foreground rounded-sm transition-colors text-left"
                >
                  <span className="font-medium">Copy Full Message</span>
                  <span className="text-xs text-muted-foreground">
                    {copied ? "Copied!" : "📋"}
                  </span>
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 text-foreground rounded-sm transition-colors text-left"
                >
                  <span className="font-medium">Copy URL Only</span>
                  <span className="text-xs text-muted-foreground">
                    {copied ? "Copied!" : "🔗"}
                  </span>
                </button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-xs text-muted-foreground bg-muted/20 rounded-sm p-3">
              <p className="font-medium mb-1">💡 Pro tip:</p>
              <p>
                Send the link to friends who need to find you, or share your pattern 
                when you&apos;re already at the venue holding your phone up high.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ShareButtonProps {
  patternUrl: string;
  patternName: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  venueName?: string;
}

export function ShareButton({ 
  patternUrl, 
  patternName, 
  className = "", 
  variant = 'primary',
  venueName 
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonStyles = variant === 'primary' 
    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
    : "bg-muted hover:bg-muted/80 text-foreground border border-border";

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 font-medium rounded-sm transition-all duration-200 hover:scale-105 active:scale-95 ${buttonStyles} ${className}`}
      >
        <span>📤</span>
        <span>Share Pattern</span>
      </button>

      <ShareModal
        patternUrl={patternUrl}
        patternName={patternName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venueName={venueName}
      />
    </>
  );
}