import React, { useState } from 'react';

const DeleteProfileDialog = ({ visible, onClose, onConfirm, loading = false }) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleClose = () => {
    setStep(1);
    setPassword('');
    setPasswordVisible(false);
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    if (!password.trim()) {
      alert('Molimo unesite vašu trenutnu lozinku.');
      return;
    }
    onConfirm(password);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const renderStep1 = () => (
    <div className="dialog-content">
      <div className="header">
        <div className="warning-icon">⚠️</div>
        <h2 className="title">Obriši profil</h2>
      </div>
      
      <p className="warning-text">
        Ova akcija će trajno obrisati vaš profil i sve povezane podatke.
      </p>
      
      <div className="warning-subtext">
        <p>• Svi vaši podaci će biti nepovratno obrisani</p>
        <p>• Nećete moći pristupiti aplikaciji</p>
        <p>• Ova akcija se ne može poništiti</p>
      </div>

      <div className="button-container">
        <button 
          className="btn btn-cancel" 
          onClick={handleClose}
        >
          Otkaži
        </button>
        
        <button 
          className="btn btn-continue" 
          onClick={handleFirstConfirm}
        >
          Nastavi
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="dialog-content">
      <div className="header">
        <div className="key-icon">🔑</div>
        <h2 className="title">Potvrdite brisanje</h2>
      </div>
      
      <p className="password-prompt">
        Da biste potvrdili brisanje profila, unesite vašu trenutnu lozinku:
      </p>

      <div className="input-container">
        <input
          type={passwordVisible ? "text" : "password"}
          className="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Trenutna lozinka"
          disabled={loading}
        />
        <button
          className="eye-button"
          onClick={() => setPasswordVisible(!passwordVisible)}
          disabled={loading}
          type="button"
        >
          {passwordVisible ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      <div className="button-container">
        <button 
          className="btn btn-cancel" 
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Nazad
        </button>
        
        <button 
          className={`btn btn-delete ${loading ? 'disabled' : ''}`}
          onClick={handleFinalConfirm}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            'Obriši profil'
          )}
        </button>
      </div>
    </div>
  );

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="dialog-container">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .dialog-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .dialog-content {
          padding: 24px;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .warning-icon, .key-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .title {
          font-size: 20px;
          font-weight: bold;
          color: #022C43;
          margin: 0;
        }

        .warning-text {
          font-size: 16px;
          color: #022C43;
          text-align: center;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .warning-subtext {
          font-size: 14px;
          color: #666666;
          text-align: left;
          line-height: 1.4;
          margin-bottom: 24px;
        }

        .warning-subtext p {
          margin: 4px 0;
        }

        .password-prompt {
          font-size: 16px;
          color: #022C43;
          text-align: center;
          margin-bottom: 20px;
        }

        .input-container {
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 24px;
          background: white;
        }

        .password-input {
          flex: 1;
          height: 48px;
          padding: 0 16px;
          font-size: 16px;
          color: #022C43;
          border: none;
          outline: none;
          background: transparent;
        }

        .eye-button {
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666666;
        }

        .eye-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-container {
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          height: 48px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 0.2s;
        }

        .btn:disabled {
          cursor: not-allowed;
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #666666;
          border: 1px solid #e2e8f0;
        }

        .btn-continue {
          background: #022C43;
          color: white;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .btn-delete.disabled {
          opacity: 0.6;
        }

        .loading-spinner {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default DeleteProfileDialog;