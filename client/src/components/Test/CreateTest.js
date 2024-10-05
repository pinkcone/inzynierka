import React, { useState } from 'react';
import CreateTestManual from './CreateTestManual';
import CreateTestAutomatic from './CreateTestAutomatic';
import styles from '../../styles/PageSet.module.css';

const CreateTest = ({ onClose }) => {
  const [activeTestType, setActiveTestType] = useState(null);
  
  const handleManualClick = () => {
    setActiveTestType('manual');
  };

  const handleAutomaticClick = () => {
    setActiveTestType('automatic');
  };

  return (
    <div className={styles.createTestContainer}>
      <h2>Utwórz test</h2>
      <button onClick={handleManualClick}>Utwórz test ręcznie</button>
      <button onClick={handleAutomaticClick}>Generuj test automatycznie</button>
      
      {activeTestType === 'manual' && <CreateTestManual onClose={onClose} />}
      {activeTestType === 'automatic' && <CreateTestAutomatic onClose={onClose} />}
    </div>
  );
};

export default CreateTest;
