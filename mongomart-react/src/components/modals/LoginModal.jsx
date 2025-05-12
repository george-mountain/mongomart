import React, { useState } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { loginModalOpen, closeModal } = useModals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setEmail('');
      setPassword('');
      closeModal('loginModal');
    }
  };

  return (
    <Modal isOpen={loginModalOpen} onClose={() => closeModal('loginModal')} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="login-email"
            name="email"
            required
            className="form-input w-full mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="login-password"
            name="password"
            required
            className="form-input w-full mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5 rounded-md font-semibold">
          Login
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;