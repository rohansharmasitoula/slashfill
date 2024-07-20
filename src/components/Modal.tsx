import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataKey: string;
  dataValue: string;
  dataTag: string;
  onSave: (key: string, value: string, tag: string) => void;
}
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  dataKey,
  dataValue,
  dataTag,
  onSave,
}) => {
  const [key, setKey] = useState(dataKey);
  const [value, setValue] = useState(dataValue);
  const [tag, setTag] = useState(dataTag);

  useEffect(() => {
    setKey(dataKey);
    setValue(dataValue);
    setTag(dataTag);
  }, [dataKey, dataValue, dataTag]);

  const handleSave = () => {
    onSave(key, value, tag);
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h1>Update Data</h1>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="key">
            Key
          </label>
          <input
            id="key"
            type="text"
            placeholder="Enter key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="border p-2 mr-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="value">
            Value
          </label>
          <input
            id="value"
            type="text"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border p-2 mr-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="tag">
            Environment Tag
          </label>
          <input
            id="tag"
            type="text"
            placeholder="Enter environment tag (dev, staging, prod)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="border p-2 mr-2 w-full"
          />
        </div>
        <div className="flex space-x-2 mb-2">
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
