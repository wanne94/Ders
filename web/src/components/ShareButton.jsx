import React, { useState } from 'react';
import { MessageCircle, Send, Facebook, Twitter, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { formatDateWithDay } from '@/utils/dataHelpers';

const ShareButton = ({ lecture, profileData, type }) => {
  const [copied, setCopied] = useState(false);

  // Use lecture prop for backward compatibility, or profileData for new implementation
  const data = lecture || profileData;
  const profileType = type || 'lecture';
  
  // Generate appropriate URL based on profile type
  const getProfileUrl = () => {
    if (typeof window === 'undefined') return '';
    switch (profileType) {
      case 'organization':
        return `${window.location.origin}/profile/organization/${data._id}`;
      case 'daija':
        return `${window.location.origin}/profile/daija/${data._id}`;
      default:
        return `${window.location.origin}/profile/lecture/${data._id}`;
    }
  };

  // Generate appropriate share text based on profile type
  const getShareText = () => {
    switch (profileType) {
      case 'organization':
        return `🕌 ${data.name}${data.address || data.city ? `\n📍 ${[data.address, data.city].filter(Boolean).join(', ')}` : ''}${data.phone ? `\n☎️ ${data.phone}` : ''}`;
      case 'daija':
        return `👤 ${data.title || ''}. ${data.name || ''}${data.organization ? `\n🕌 ${data.organization}` : ''}`.trim();
      default:
        // For lectures - more detailed info
        const formattedDate = formatDateWithDay(data.date);
        
        // Check if it's a seminar
        if (data.isSeminar) {
          let shareText = `🌟 SEMINAR: ${data.title}\n`;
          shareText += `📅 ${formattedDate}`;
          if (data.endDate) {
            shareText += ` - ${formatDateWithDay(data.endDate)}`;
          }
          if (data.totalDays && data.totalDays > 1) {
            shareText += ` (${data.totalDays} dana)`;
          }
          shareText += `\n`;
          shareText += `⏰ ${data.time}\n`;
          shareText += `📍 ${data.address}, ${data.city}\n`;
          
          if (data.daijaName) {
            shareText += `👤 Predavač: ${data.daijaTitle ? `${data.daijaTitle} ` : ''}${data.daijaName}\n`;
          }
          
          if (data.organizationName) {
            shareText += `🕌 Organizator: ${data.organizationName}\n`;
          }
          
          shareText += `\n🔗 Više informacija:`;
          
          return shareText;
        } else {
          // Regular lecture
          let shareText = `📚 ${data.title}\n`;
          shareText += `📅 ${formattedDate} u ${data.time}\n`;
          shareText += `📍 ${data.address}, ${data.city}\n`;
          
          if (data.daijaName) {
            shareText += `👤 Predavač: ${data.daijaTitle ? `${data.daijaTitle} ` : ''}${data.daijaName}\n`;
          }
          
          if (data.organizationName) {
            shareText += `🕌 Organizator: ${data.organizationName}\n`;
          }
          
          shareText += `\n🔗 Više informacija:`;
          
          return shareText;
        }
    }
  };

  const shareUrl = getProfileUrl();
  const shareText = getShareText();
  const imageUrl = typeof window !== 'undefined' ? `${window.location.origin}${data.image}` : '';

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: 'Viber',
      icon: MessageCircle,
      color: 'text-purple-500',
      url: `viber://forward?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'text-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  const handleShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Pokušaj da uključiš sliku ako je Web Share API podržava
        const shareData = {
          title: profileType === 'organization' ? data.name : profileType === 'daija' ? `${data.title || ''}. ${data.name || ''}`.trim() : data.title,
          text: shareText,
          url: shareUrl
        };

        // Dodaj sliku ako browser podržava dijeljenje slika
        if (navigator.canShare && imageUrl && data.image) {
          try {
            // Preuzmi sliku kao blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'predavanje.jpg', { type: blob.type });
            
            const shareDataWithImage = {
              ...shareData,
              files: [file]
            };
            
            // Provjeri da li može da dijeli fajlove
            if (navigator.canShare(shareDataWithImage)) {
              await navigator.share(shareDataWithImage);
              return;
            }
          } catch (imageError) {
            console.log('Could not share with image, falling back to text only:', imageError);
          }
        }
        
        // Fallback na obično dijeljenje bez slike
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Share platform buttons */}
      {shareOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.name}
            onClick={() => handleShare(option.url)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
            aria-label={`Podijeli na ${option.name}`}
          >
            <Icon className={`h-4 w-4`} />
            <span className="text-sm font-medium">{option.name}</span>
          </button>
        );
      })}
      
      {/* Copy link button */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
        aria-label="Kopiraj link"
      >
        <Copy className={`h-4 w-4 ${copied ? 'text-green-300' : ''}`} />
        <span className="text-sm font-medium">{copied ? 'Kopirano!' : 'Kopiraj link'}</span>
      </button>
      
      {/* More options (native share) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
          aria-label="Više opcija dijeljenja"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Više opcija</span>
        </button>
      )}
    </div>
  );
};

export default ShareButton;