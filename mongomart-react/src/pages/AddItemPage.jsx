import React, { useState, useEffect } from 'react';
import { createItem } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';


const AddItemPage = ({ onNavigate }) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModals();

  useEffect(() => {
    if (!isAuthenticated) {
      showNotification('Please login to add items.', 'error');
      openModal('loginModal');
      onNavigate('all-items'); // Navigate to a default page
    }
  }, [isAuthenticated, showNotification, openModal, onNavigate]);


  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // Convert FileList to array
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification('Please login to add items.', 'error');
      openModal('loginModal');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('quantity', parseInt(quantity, 10));

    if (files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      await createItem(formData);
      showNotification('Item added successfully!', 'success');
      // Reset form
      setItemName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setFiles([]);
      document.getElementById('add-item-form').reset(); // Also reset file input visually
      onNavigate('my-items'); // Navigate to my items page
    } catch (error) {
      showNotification(error.message || 'Failed to add item.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    // Render nothing or a placeholder while redirecting or modal is shown
    return null;
  }


  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Add New Item</h2>
      <form id="add-item-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            type="text"
            id="item-name"
            name="name"
            required
            className="form-input w-full mt-1"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="item-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="item-description"
            name="description"
            rows="3"
            className="form-input w-full mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="item-price" className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              id="item-price"
              name="price"
              required
              step="0.01"
              min="0"
              className="form-input w-full mt-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="item-quantity"
              name="quantity"
              required
              min="0"
              className="form-input w-full mt-1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <label htmlFor="item-images" className="block text-sm font-medium text-gray-700">Item Images (select one or more)</label>
          <input
            type="file"
            id="item-images"
            name="files"
            multiple
            accept="image/*"
            className="form-input w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
        </div>
        <button
            type="submit"
            className="btn-primary w-full py-3 rounded-md font-semibold text-lg"
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Item...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;