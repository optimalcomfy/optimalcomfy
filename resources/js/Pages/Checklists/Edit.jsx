import React, { useState, useEffect } from 'react';
import { useForm, Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

const Edit = () => {
    const { template } = usePage().props;
    
    // Template form
    const { data: templateData, setData: setTemplateData, put: updateTemplate, errors: templateErrors, processing: templateProcessing } = useForm({
        name: template.name,
        type: template.type,
        is_active: template.is_active,
    });

    // Item form
    const { data: itemData, setData: setItemData, post: addItem, reset: resetItemForm, errors: itemErrors } = useForm({
        item_name: '',
        description: '',
        category: '',
        is_required: false,
    });

    const [editingItem, setEditingItem] = useState(null);
    const [categories, setCategories] = useState([]);

    // Extract unique categories from existing items
    useEffect(() => {
        if (template.items) {
            const uniqueCategories = [...new Set(template.items
                .filter(item => item.category)
                .map(item => item.category)
            )];
            setCategories(uniqueCategories);
        }
    }, [template.items]);

    const handleTemplateSubmit = (e) => {
        e.preventDefault();
        updateTemplate(route('checklists.update', template.id));
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        addItem(route('checklists.items.store', template.id), {
            onSuccess: () => {
                resetItemForm();
                router.reload({ only: ['template'] });
            }
        });
    };

    const handleUpdateItem = (itemId, data) => {
        router.put(route('checklist-items.update', itemId), data, {
            onSuccess: () => {
                setEditingItem(null);
                router.reload({ only: ['template'] });
            }
        });
    };

    const handleDeleteItem = (itemId) => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(route('checklist-items.destroy', itemId), {
                onSuccess: () => {
                    router.reload({ only: ['template'] });
                }
            });
        }
    };

    const handleReorder = (category, itemId, direction) => {
        const items = template.items.filter(item => item.category === category);
        const currentIndex = items.findIndex(item => item.id === itemId);
        
        if (direction === 'up' && currentIndex > 0) {
            const tempOrder = items[currentIndex].order;
            items[currentIndex].order = items[currentIndex - 1].order;
            items[currentIndex - 1].order = tempOrder;
        } else if (direction === 'down' && currentIndex < items.length - 1) {
            const tempOrder = items[currentIndex].order;
            items[currentIndex].order = items[currentIndex + 1].order;
            items[currentIndex + 1].order = tempOrder;
        }

        // Update orders
        items.forEach(item => {
            handleUpdateItem(item.id, { order: item.order });
        });
    };

    const itemsByCategory = template.items?.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Sort items within each category by order
    Object.keys(itemsByCategory || {}).forEach(category => {
        itemsByCategory[category].sort((a, b) => a.order - b.order);
    });

    return (
        <Layout>
            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link
                                href={route('checklists.index')}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <ArrowLeft className="h-4 mr-1" />
                                Back to Templates
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Checklist Template</h1>
                            <p className="text-gray-600 mt-2">Update template details and manage checklist items.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Template Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h2>
                            
                            <form onSubmit={handleTemplateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={templateData.name}
                                        onChange={(e) => setTemplateData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {templateErrors.name && <p className="mt-1 text-sm text-red-600">{templateErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Checklist Type *
                                    </label>
                                    <select
                                        value={templateData.type}
                                        onChange={(e) => setTemplateData('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="property">Property Checklist</option>
                                        <option value="car">Car Checklist</option>
                                        <option value="general">General Checklist</option>
                                    </select>
                                    {templateErrors.type && <p className="mt-1 text-sm text-red-600">{templateErrors.type}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={templateData.is_active}
                                            onChange={(e) => setTemplateData('is_active', e.target.checked)}
                                            className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>
                                    {templateErrors.is_active && <p className="mt-1 text-sm text-red-600">{templateErrors.is_active}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={templateProcessing}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <Save className="h-4 mr-2" />
                                    {templateProcessing ? 'Saving...' : 'Save Template'}
                                </button>
                            </form>
                        </div>

                        {/* Add New Item Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h2>
                            
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={itemData.item_name}
                                        onChange={(e) => setItemData('item_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Check all locks"
                                    />
                                    {itemErrors.item_name && <p className="mt-1 text-sm text-red-600">{itemErrors.item_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={itemData.description}
                                        onChange={(e) => setItemData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        placeholder="Optional description..."
                                    />
                                    {itemErrors.description && <p className="mt-1 text-sm text-red-600">{itemErrors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={itemData.category}
                                            onChange={(e) => setItemData('category', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Kitchen, Living Room"
                                            list="category-options"
                                        />
                                        <datalist id="category-options">
                                            {categories.map((category, index) => (
                                                <option key={index} value={category} />
                                            ))}
                                        </datalist>
                                    </div>
                                    {itemErrors.category && <p className="mt-1 text-sm text-red-600">{itemErrors.category}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_required"
                                            checked={itemData.is_required}
                                            onChange={(e) => setItemData('is_required', e.target.checked)}
                                            className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_required" className="ml-2 block text-sm text-gray-900">
                                            Required Item
                                        </label>
                                    </div>
                                    {itemErrors.is_required && <p className="mt-1 text-sm text-red-600">{itemErrors.is_required}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <Plus className="h-4 mr-2" />
                                    Add Item
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Items List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Checklist Items</h2>
                                <span className="text-sm text-gray-500">
                                    {template.items?.length || 0} items total
                                </span>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(itemsByCategory || {}).map(([category, items]) => (
                                    <div key={category} className="border border-gray-200 rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {category} ({items.length} items)
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                                                    {editingItem === item.id ? (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between">
                                                                <h4 className="text-sm font-medium text-gray-900">Editing Item</h4>
                                                                <button
                                                                    onClick={() => setEditingItem(null)}
                                                                    className="text-sm text-gray-500 hover:text-gray-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    defaultValue={item.item_name}
                                                                    onBlur={(e) => handleUpdateItem(item.id, { item_name: e.target.value })}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                                <textarea
                                                                    defaultValue={item.description}
                                                                    onBlur={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    rows="2"
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        defaultChecked={item.is_required}
                                                                        onChange={(e) => handleUpdateItem(item.id, { is_required: e.target.checked })}
                                                                        className="h-3"
                                                                    />
                                                                    <span className="text-xs text-gray-600">Required</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center">
                                                                    <span className="text-sm text-gray-500 mr-3">
                                                                        {index + 1}.
                                                                    </span>
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-900">
                                                                            {item.item_name}
                                                                        </h4>
                                                                        {item.description && (
                                                                            <p className="mt-1 text-sm text-gray-600">
                                                                                {item.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 flex items-center gap-2">
                                                                {item.is_required && (
                                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        onClick={() => handleReorder(category, item.id, 'up')}
                                                                        disabled={index === 0}
                                                                        className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                                                        title="Move up"
                                                                    >
                                                                        ↑
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReorder(category, item.id, 'down')}
                                                                        disabled={index === items.length - 1}
                                                                        className={`p-1 rounded ${index === items.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                                                        title="Move down"
                                                                    >
                                                                        ↓
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => setEditingItem(item.id)}
                                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                                    title="Edit"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="text-red-600 hover:text-red-900 p-1"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {(!template.items || template.items.length === 0) && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No items added yet.</p>
                                    <p className="text-sm text-gray-400">Add items using the form on the left.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Edit;