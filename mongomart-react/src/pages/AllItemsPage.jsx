import React, { useState, useEffect } from 'react';
import { getAllItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import { useNotification } from '../contexts/NotificationContext';

const AllItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (error) {
      showNotification(error.message || 'Failed to load items.', 'error');
      setItems([]); // Ensure items is an array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); 

  if (loading) {
    return (
      <>
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">All Items</h1>
        <Loader />
      </>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">All Items</h1>
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard key={item.id || item._id} item={item} isOwnerItem={false} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">No items found.</p>
      )}
    </div>
  );
};

export default AllItemsPage;