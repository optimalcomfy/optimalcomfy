import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Percent, DollarSign, Loader2 } from 'lucide-react';

const AddMarkupModal = ({ isOpen, onClose, item, itemType }) => {
    const [form, setForm] = useState({
        markup_value: '',
        is_percentage: true
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await router.post(route('markup.add'), {
                item_id: item.id,
                item_type: itemType,
                markup_value: parseFloat(form.markup_value),
                is_percentage: form.is_percentage
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
        if (!form.markup_value) return item.amount;

        const basePrice = parseFloat(item.amount);
        const markupValue = parseFloat(form.markup_value);

        if (form.is_percentage) {
            return basePrice * (1 + (markupValue / 100));
        } else {
            return basePrice + markupValue;
        }
    };

    const calculateProfit = () => {
        const finalPrice = calculateFinalPrice();
        return finalPrice - parseFloat(item.amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z1500">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Add Markup</h2>

                    <div>
                        <h3 className="font-medium text-gray-900">
                            {item.name || item.property_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Base Price: KES {new Intl.NumberFormat('en-KE').format(item.amount)}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Markup Type Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Markup Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, is_percentage: true })}
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
                                onClick={() => setForm({ ...form, is_percentage: false })}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={form.is_percentage ? 'Enter percentage...' : 'Enter amount...'}
                                min="0"
                                step={form.is_percentage ? "0.1" : "1"}
                                required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                                    <span className="text-gray-600">Base Price:</span>
                                    <span>KES {new Intl.NumberFormat('en-KE').format(item.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Markup:</span>
                                    <span>
                                        {form.is_percentage ? `${form.markup_value}%` : `KES ${new Intl.NumberFormat('en-KE').format(parseFloat(form.markup_value))}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-gray-900">Your Price:</span>
                                    <span className="text-blue-600">
                                        KES {new Intl.NumberFormat('en-KE').format(calculateFinalPrice())}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Your Profit:</span>
                                    <span className="text-green-600">
                                        KES {new Intl.NumberFormat('en-KE').format(calculateProfit())}
                                    </span>
                                </div>
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
