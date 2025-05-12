
import { getFileUrl, deleteItem as apiDeleteItem } from '../services/api';
import { useModals } from '../contexts/ModalContext';
import { useNotification } from '../contexts/NotificationContext';

const ItemCard = ({ item, isOwnerItem, onDelete }) => {
  const { openModal } = useModals();
  const { showNotification } = useNotification();

  const firstImageId = item.image_ids && item.image_ids.length > 0 ? item.image_ids[0] : null;
  const imageUrl = firstImageId
    ? getFileUrl(firstImageId)
    : 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=No+Image';

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click if delete button is on card
    if (window.confirm('Are you sure you want to delete this item? This will also delete associated images.')) {
      try {
        await apiDeleteItem(item._id);
        showNotification('Item deleted successfully.', 'success');
        if (onDelete) onDelete(item._id); // Callback to update list in parent
      } catch (error) {
        showNotification(error.message || 'Failed to delete item.', 'error');
      }
    }
  };

  return (
    <div className="card flex flex-col cursor-pointer" onClick={() => openModal('itemDetailModal', item.id)}>
      <img
        src={imageUrl}
        alt={item.name}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=Image+Error'; }}
      />
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-1 truncate" title={item.description || ''}>
          {item.description || 'No description available.'}
        </p>
        <p className="text-lg font-bold text-indigo-600 mb-3">${parseFloat(item.price).toFixed(2)}</p>
        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          type="button" // Important for buttons not submitting forms
          className="view-details-btn btn-secondary text-sm w-full py-2 rounded-md"
          // onClick handled by card click now, or can be specific if needed:
          onClick={(e) => { e.stopPropagation(); openModal('itemDetailModal', item._id); }}
        >
          View Details
        </button>
        {isOwnerItem && (
          <button
            type="button"
            onClick={handleDelete}
            className="delete-item-card-btn btn-danger mt-2 text-sm w-full py-2 rounded-md"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;