

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content relative"> 
        {title && <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">{title}</h2>}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl leading-none" 
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </>
  );
};

export default Modal;