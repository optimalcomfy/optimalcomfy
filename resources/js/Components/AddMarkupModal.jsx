import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Percent, DollarSign, Loader2, Info } from 'lucide-react';

const AddMarkupModal = ({ isOpen, onClose, item, itemType }) => {
    const [form, setForm] = useState({
        markup_value: '',
        is_percentage: true
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    // Get platform price - this is the base for markup calculations
    const platformPrice = item.platform_price || item.amount;
    const basePrice = item.base_price || item.amount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await router.post(route('markup.add'), {
                item_id: item.id,
                item_type: itemType,
                markup_value: parseFloat(form.markup_value),
                is_percentage: form.is_percentage,
                base_price: platformPrice, // Use platform price as base
                base_price_type: 'platform_price'
            }, {
                onSuccess: () => {
                    onClose();
                    // You might want to trigger a refresh of the parent component
                    if (window.refreshMarkups) {
                        window.refreshMarkups();
                    }
                },
                onError: (errors) => {
                    setErrors(errors);
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Error adding markup:', error);
            setLoading(false);
        }
    };

    const calculateFinalPrice = () => {
        if (!form.markup_value) return platformPrice;

        const markupValue = parseFloat(form.markup_value);

        if (form.is_percentage) {
            return platformPrice * (1 + (markupValue / 100));
        } else {
            return platformPrice + markupValue;
        }
    };

    const calculateProfit = () => {
        const finalPrice = calculateFinalPrice();
        return finalPrice - platformPrice;
    };

    const getMarkupAmount = () => {
        if (!form.markup_value) return 0;

        const markupValue = parseFloat(form.markup_value);
        if (form.is_percentage) {
            return (platformPrice * markupValue) / 100;
        } else {
            return markupValue;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z1500">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Add Markup</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5" />
                    </button>
                </div>

                {/* Property Info */}
                <div className="p-2 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2 text-md">
                        {item.name || item.property_name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span className="text-green-600 font-medium">Platform Price:</span>
                            <span className="text-green-600 font-medium">
                                KES {new Intl.NumberFormat('en-KE').format(platformPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-2">
                    {/* Markup Type Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Markup Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, is_percentage: true, markup_value: '' })}
                                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                                    form.is_percentage
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Percent className="w-4 h-4 mr-2" />
                                Percentage
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, is_percentage: false, markup_value: '' })}
                                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                                    !form.is_percentage
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Fixed Amount
                            </button>
                        </div>
                    </div>

                    {/* Markup Value */}
                    <div className="mb-6">
                        <label htmlFor="markup_value" className="block text-sm font-medium text-gray-700 mb-2">
                            {form.is_percentage ? 'Markup Percentage' : 'Markup Amount'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="markup_value"
                                value={form.markup_value}
                                onChange={(e) => setForm({ ...form, markup_value: e.target.value })}
                                className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={form.is_percentage ? 'Enter percentage...' : 'Enter amount...'}
                                min="0"
                                step={form.is_percentage ? "0.1" : "1"}
                                required
                            />
                            <div className="absolute inset-y-0 left-8 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">
                                    {form.is_percentage ? '%' : 'KES'}
                                </span>
                            </div>
                        </div>
                        {errors.markup_value && (
                            <p className="mt-1 text-sm text-red-600">{errors.markup_value}</p>
                        )}
                    </div>

                    {/* Preview */}
                    {form.markup_value && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Price Preview</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Platform Price:</span>
                                    <span className="font-medium">
                                        KES {new Intl.NumberFormat('en-KE').format(platformPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Markup:</span>
                                    <span className="text-blue-600">
                                        {form.is_percentage ?
                                            `${form.markup_value}% (KES ${new Intl.NumberFormat('en-KE').format(getMarkupAmount())})` :
                                            `KES ${new Intl.NumberFormat('en-KE').format(parseFloat(form.markup_value))}`
                                        }
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-gray-900">Your Price:</span>
                                        <span className="text-green-600">
                                            KES {new Intl.NumberFormat('en-KE').format(calculateFinalPrice())}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between bg-green-50 -mx-2 -mb-2 p-2 rounded-b-lg">
                                    <span className="text-green-700 font-medium">Your Profit:</span>
                                    <span className="text-green-700 font-medium">
                                        KES {new Intl.NumberFormat('en-KE').format(calculateProfit())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Example for The Boulevard Villa */}
                    {!form.markup_value && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2 text-sm">Example Calculation</h4>
                            <div className="text-xs text-yellow-700 space-y-1">
                                <div>Platform Price: KES 18,000</div>
                                <div>Markup: KES 1,000 (Fixed Amount)</div>
                                <div className="font-medium">Your Price: KES 19,000</div>
                                <div className="font-medium">Your Profit: KES 1,000</div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.markup_value}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Add Markup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMarkupModal;
