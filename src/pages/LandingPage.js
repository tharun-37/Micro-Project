import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="landing-content"
      >
        <div className="logo-container">
          <Building2 size={48} className="logo-icon" />
          <h1 className="title">Campus Resource Nexus</h1>
        </div>
        <p className="subtitle">Seamlessly book and manage college facilities, rooms, and labs.</p>

        <div className="role-cards">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="role-card user-card"
            onClick={() => navigate('/user')}
          >
            <User size={32} />
            <h2>Student / Faculty</h2>
            <p>Book venues for your events, club activities, and seminars.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="role-card admin-card"
            onClick={() => navigate('/admin')}
          >
            <ShieldCheck size={32} />
            <h2>Administrator</h2>
            <p>Manage bookings, approve requests, and oversee resources.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
