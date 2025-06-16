import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Typography, Divider } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const ShareButton = ({ lecture }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/lecture/${lecture._id}` : '';
  const shareText = `${lecture.title}\n📅 ${new Date(lecture.date).toLocaleDateString('sr-RS')} u ${lecture.time}\n📍 ${lecture.address}, ${lecture.city}`;
  const imageUrl = typeof window !== 'undefined' ? `${window.location.origin}${lecture.image}` : '';

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageIcon,
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: 'Viber',
      icon: MessageIcon,
      color: '#665CAC',
      url: `viber://forward?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: SendIcon,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400');
    handleClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleClose();
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Pokušaj da uključiš sliku ako je Web Share API podržava
        const shareData = {
          title: lecture.title,
          text: shareText,
          url: shareUrl
        };

        // Dodaj sliku ako browser podržava dijeljenje slika
        if (navigator.canShare && imageUrl && lecture.image) {
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
              handleClose();
              return;
            }
          } catch (imageError) {
            console.log('Could not share with image, falling back to text only:', imageError);
          }
        }
        
        // Fallback na obično dijeljenje bez slike
        await navigator.share(shareData);
        handleClose();
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={handleClick}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: 'white',
          borderRadius: 3,
          px: 3,
          py: 1.5,
          fontSize: '0.95rem',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        Podijeli
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 250,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Podijeli predavanje
          </Typography>
        </Box>
        
        <Divider sx={{ mx: 1, mb: 1 }} />
        
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <MenuItem
              key={option.name}
              onClick={() => handleShare(option.url)}
              sx={{ gap: 2 }}
            >
              <Icon sx={{ fontSize: 20, color: option.color }} />
              <Typography variant="body2">{option.name}</Typography>
            </MenuItem>
          );
        })}

        <Divider sx={{ mx: 1, my: 1 }} />

        {typeof navigator !== 'undefined' && navigator.share && (
          <MenuItem onClick={handleNativeShare} sx={{ gap: 2 }}>
            <MoreHorizIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">Više opcija</Typography>
          </MenuItem>
        )}

        <MenuItem onClick={handleCopyLink} sx={{ gap: 2 }}>
          <ContentCopyIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2">
            {copied ? 'Kopirano!' : 'Kopiraj link'}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ShareButton;