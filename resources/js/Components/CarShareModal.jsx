// @/Components/CarShareModal.jsx
import { useState } from 'react';
import {
  X,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Share2,
  Link,
  ExternalLink,
  Copy,
  Check,
  Car
} from 'lucide-react';

export default function CarShareModal({ car, visible, onHide }) {
  const [copied, setCopied] = useState(false);

  const carData = {
    name: `${car?.brand} ${car?.model} ${car?.year}` || "Car",
    type: car?.category?.name || "",
    location: car?.location_address || "",
    price: car?.platform_price ? `KSh ${car.platform_price}/day` : "",
    url: window.location.href,
  };

  // For platforms that support custom text, use this
  const getShareText = () => {
    return `Check out "${carData.name}" on Ristay - ${carData.type} in ${carData.location} for ${carData.price}`;
  };

  // Share just the URL - platforms will fetch OG tags automatically
  const shareToWhatsApp = () => {
    // WhatsApp needs the URL to be separate from the text for proper link detection
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(carData.url);
    window.open(`https://wa.me/?text=${text}%0A%0A${url}`, '_blank');
  };

  const shareToFacebook = () => {
    // Facebook will automatically fetch OG tags from the URL
    const url = encodeURIComponent(carData.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToInstagram = () => {
    // Copy just the URL - when pasted, Instagram will show rich preview
    navigator.clipboard.writeText(carData.url).then(() => {
      alert('Link copied! Paste this link in your Instagram bio, story, or post. The car image and details will appear automatically.');
    });
  };

  const shareToTwitter = () => {
    // Twitter works best with text + URL format
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(carData.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(`Check out: ${carData.name}`);
    const body = encodeURIComponent(`${getShareText()}\n\nView details and book: ${carData.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareWithNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: carData.name,
          text: getShareText(),
          url: carData.url,
        });
      } catch (error) {
        console.log('Native share cancelled:', error);
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(carData.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyLinkWithPreview = () => {
    const text = `${getShareText()}\n\n${carData.url}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!visible) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onHide}
    >
      <div
        className="modal bg-white rounded-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex justify-between items-center mb-6">
          <div>
            <h2 className="modal-title text-xl font-semibold text-gray-900">Share Car</h2>
          </div>
          <button
            className="close-btn p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            onClick={onHide}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sharing Options */}
        <div className="sharing-options mb-6">
          <div className="grid grid-cols-3 gap-3">
            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              onClick={shareToWhatsApp}
            >
              <div className="social-icon p-2 bg-green-500 rounded-lg text-white">
                <MessageCircle size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">WhatsApp</span>
            </button>

            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
              onClick={shareToFacebook}
            >
              <div className="social-icon p-2 bg-blue-600 rounded-lg text-white">
                <Facebook size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">Facebook</span>
            </button>

            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
              onClick={shareToInstagram}
            >
              <div className="social-icon p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
                <Instagram size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">Instagram</span>
            </button>

            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={shareToTwitter}
            >
              <div className="social-icon p-2 bg-blue-400 rounded-lg text-white">
                <Twitter size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">Twitter</span>
            </button>

            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-gray-600 hover:bg-gray-50 transition-colors"
              onClick={shareToEmail}
            >
              <div className="social-icon p-2 bg-gray-600 rounded-lg text-white">
                <Mail size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">Email</span>
            </button>

            <button
              className="social-btn flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              onClick={shareWithNative}
            >
              <div className="social-icon p-2 bg-purple-500 rounded-lg text-white">
                <Share2 size={20} />
              </div>
              <span className="social-name text-xs font-medium text-gray-700">Share</span>
            </button>
          </div>
        </div>

        {/* Link Section */}
        <div className="link-section border-t border-gray-200 pt-4">
          <div className="space-y-3">
            <div className="link-display flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="link-input w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer"
                  value={carData.url}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <Link size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                className={`copy-btn px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 min-w-[80px] justify-center ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
                onClick={copyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div className="action-buttons flex gap-2">
              <a
                href={carData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={16} />
                Open
              </a>
              <button
                onClick={copyLinkWithPreview}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Copy size={16} />
                Copy All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
