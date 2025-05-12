import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import Loader from '../Loader';
import { getItemById, deleteItem as apiDeleteItem, getFileUrl } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useModals } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';


const ItemDetailModal = ({ onItemDeleted }) => {
  const { itemDetailModalOpen, itemDetailModalData, closeModal } = useModals();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth(); // To check if current user is owner

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemDetailModalOpen && itemDetailModalData) { // itemDetailModalData now holds itemId
      const fetchItem = async () => {
        setLoading(true);
        setItem(null); // Clear previous item
        try {
          const fetchedItem = await getItemById(itemDetailModalData); // itemDetailModalData is itemId
          setItem(fetchedItem);
        } catch (error) {
          showNotification(error.message || 'Failed to fetch item details.', 'error');
          closeModal('itemDetailModal');
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [itemDetailModalOpen, itemDetailModalData, showNotification, closeModal]);

  const handleDeleteItem = async () => {
    if (!item || !item.id) {
      showNotification("Cannot delete item: Item ID is missing.", "error");
      return;
    }
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone and will remove associated images.")) {
      try {
        await apiDeleteItem(item.id);
        showNotification('Item deleted successfully!', 'success');
        closeModal('itemDetailModal');
        if (onItemDeleted) onItemDeleted(item.id); // Callback to update list
      } catch (error) {
        showNotification(error.message || `Failed to delete item ${item.id}.`, 'error');
      }
    }
  };

  if (!itemDetailModalOpen) return null;

  const isOwner = item && currentUser && item.owner_email === currentUser.email;

  return (
    <Modal isOpen={itemDetailModalOpen} onClose={() => closeModal('itemDetailModal')}>
      {loading && <Loader />}
      {!loading && item && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{item.name}</h2>
          <div className="mb-4 max-h-80 overflow-y-auto pr-2">
            {item.image_ids && item.image_ids.length > 0 ? (
              item.image_ids.map(id => (
                <img
                  key={id}
                  src={getFileUrl(id)}
                  alt={`${item.name} image`}
                  className="w-full h-auto rounded-md mb-2 max-h-60 object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=Image+Error'; }}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No images available.</p>
            )}
          </div>
          <p className="text-gray-700 mb-2">
            <strong className="font-semibold">Description:</strong> {item.description || 'N/A'}
          </p>
          <p className="text-2xl font-bold text-indigo-600 mb-2">
            ${parseFloat(item.price).toFixed(2)}
          </p>
          <p className="text-gray-600 mb-1">
            <strong className="font-semibold">Quantity:</strong> {item.quantity}
          </p>
          <p className="text-gray-600 text-sm">
            <strong className="font-semibold">Item ID:</strong> {item.id}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            <strong className="font-semibold">Owner:</strong> {item.owner_email}
          </p>
          {isOwner && (
            <button
              onClick={handleDeleteItem}
              className="btn-danger w-full py-2.5 rounded-md font-semibold mt-4"
            >
              Delete This Item
            </button>
          )}
        </>
      )}
      {!loading && !item && !itemDetailModalData && ( // Handles case where modal opens without data yet
         <p className="text-gray-600">Loading item details...</p>
      )}
    </Modal>
  );
};

export default ItemDetailModal;