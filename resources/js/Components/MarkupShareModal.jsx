// Components/MarkupShareModal.jsx
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Copy, Share2, Facebook, Twitter, Mail, X } from 'lucide-react';
import { toast } from 'react-toastify';

const MarkupShareModal = ({ markup, visible, onHide }) => {
    const shareUrl = markup?.markup_link || '';
    const shareTitle = `Check out ${markup?.item?.name} with special pricing`;
    const shareText = `I found this great ${markup?.type === 'App\\Models\\Car' ? 'car' : 'property'} with exclusive pricing: ${markup?.item?.name}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success('Link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareViaEmail = () => {
        const subject = `Check out ${markup?.item?.name}`;
        const body = `${shareText}\n\n${shareUrl}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const shareOnWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header="Share This Listing"
            className="w-11/12 md:w-1/2 lg:w-1/3"
            dismissableMask
            closable
        >
            <div className="p-4">
                {/* Item Preview */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <img
                        src={markup?.item?.image || '/images/placeholder.jpg'}
                        alt={markup?.item?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                            {markup?.item?.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Your Price:</span>{' '}
                                KES {new Intl.NumberFormat('en-KE').format(markup?.final_amount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share URL */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share this link
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Copy className="h-4" />
                            Copy
                        </button>
                    </div>
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={shareOnFacebook}
                        className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Facebook className="h-6 mb-2" />
                        <span className="text-sm">Facebook</span>
                    </button>

                    <button
                        onClick={shareOnTwitter}
                        className="flex flex-col items-center justify-center p-4 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                        <Twitter className="h-6 mb-2" />
                        <span className="text-sm">Twitter</span>
                    </button>

                    <button
                        onClick={shareOnWhatsApp}
                        className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <svg className="h-6 mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.447"/>
                        </svg>
                        <span className="text-sm">WhatsApp</span>
                    </button>

                    <button
                        onClick={shareViaEmail}
                        className="flex flex-col items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Mail className="h-6 mb-2" />
                        <span className="text-sm">Email</span>
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Your Exclusive Offer</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-blue-700">Base Price:</span>
                            <div className="font-semibold text-blue-900">
                                KES {new Intl.NumberFormat('en-KE').format(markup?.item?.original_amount)}
                            </div>
                        </div>
                        <div>
                            <span className="text-blue-700">Your Price:</span>
                            <div className="font-semibold text-blue-900">
                                KES {new Intl.NumberFormat('en-KE').format(markup?.final_amount)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default MarkupShareModal;
