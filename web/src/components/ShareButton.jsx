import React, { useState } from 'react';
import { Share2, MessageCircle, Send, Facebook, Twitter, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
        return `${data.name}${data.address || data.city ? `\n📍 ${[data.address, data.city].filter(Boolean).join(', ')}` : ''}`;
      case 'daija':
        return `${data.title || ''}. ${data.name || ''}`.trim();
      default:
        return `${data.title}\n📅 ${new Date(data.date).toLocaleDateString('sr-RS')} u ${data.time}\n📍 ${data.address}, ${data.city}`;
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
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Podijeli
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {profileType === 'organization' ? 'Podijeli udruženje' : profileType === 'daija' ? 'Podijeli daiju' : 'Podijeli predavanje'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.name}
              onClick={() => handleShare(option.url)}
              className="cursor-pointer"
            >
              <Icon className={`mr-2 h-4 w-4 ${option.color}`} />
              <span>{option.name}</span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {typeof navigator !== 'undefined' && navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
            <MoreHorizontal className="mr-2 h-4 w-4" />
            <span>Više opcija</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>{copied ? 'Kopirano!' : 'Kopiraj link'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;