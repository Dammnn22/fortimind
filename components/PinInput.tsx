
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';

interface PinInputProps {
  length: number;
  onComplete: (pin: string) => void;
  label?: string; // Label is now optional, can be passed by parent if needed
}

const PinInput: React.FC<PinInputProps> = ({ length, onComplete, label }) => {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== '') return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      onComplete(newPin.join(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    if (pastedData.length === length) {
      const newPin = pastedData.split('');
      setPin(newPin);
      onComplete(pastedData);
      inputRefs.current[length - 1]?.focus();
    }
  };


  return (
    <div className="flex flex-col items-center space-y-4">
      {label && <label className="text-sm font-medium text-neutral-dark dark:text-neutral-light">{label}</label>}
      <div className="flex space-x-2" onPaste={handlePaste}>
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="password" 
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            className="w-12 h-14 text-center text-2xl font-semibold border-2 border-neutral rounded-lg focus:border-primary focus:ring-1 focus:ring-primary bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-colors"
          />
        ))}
      </div>
    </div>
  );
};

export default PinInput;
