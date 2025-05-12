import React, { useState } from 'react';
import Modal from '../Modal';
import { signupUser } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useModals } from '../../contexts/ModalContext';

const SignupModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showNotification } = useNotification();
  const { signupModalOpen, closeModal, openModal } = useModals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(email, password);
      showNotification('Signup successful! Please log in.', 'success');
      setEmail('');
      setPassword('');
      closeModal('signupModal');
      openModal('loginModal');
    } catch (error) {
      showNotification(error.message || 'Signup failed. Please try again.', 'error');
    }
  };

  return (
    <Modal isOpen={signupModalOpen} onClose={() => closeModal('signupModal')} title="Sign Up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="signup-email"
            name="email"
            required
            className="form-input w-full mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="signup-password"
            name="password"
            required
            className="form-input w-full mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5 rounded-md font-semibold">
          Sign Up
        </button>
      </form>
    </Modal>
  );
};

export default SignupModal;