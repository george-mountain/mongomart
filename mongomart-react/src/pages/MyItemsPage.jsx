import React, { useState, useEffect, useCallback } from 'react';
import { getUserItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';


const MyItemsPage = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModals();

  const fetchUserItems = useCallback(async () => {
    if (!isAuthenticated) {
        showNotification('Please log in to view your items.', 'error');
        openModal('loginModal');
        
        onNavigate('all-items'); 
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const data = await getUserItems();
      setItems(data);
    } catch (error) {
      showNotification(error.message || 'Failed to load your items.', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification, openModal, onNavigate]);

  useEffect(() => {
    fetchUserItems();
  }, [fetchUserItems]);

  const handleItemDeleted = (deletedItemId) => {
    console.log("Item deleted:", deletedItemId);
    setItems(prevItems => prevItems.filter(item => item.id !== deletedItemId));
 
  };


  if (loading) {
    return (
      <>
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Items</h1>
        <Loader />
      </>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Items</h1>
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard key={item.id || item._id} item={item} isOwnerItem={true} onDelete={handleItemDeleted} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">You haven't added any items yet.</p>
      )}
    </div>
  );
};

export default MyItemsPage;