import React, { useState, useEffect } from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { Modal } from './components/Modal';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface DataItem {
  key: string;
  value: string;
  tag: string;
}

type DataList = { [id: string]: DataItem };

const Popup: React.FC = () => {
  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');
  const [dataTag, setDataTag] = useState('');
  const [dataList, setDataList] = useState<DataList>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editTag, setEditTag] = useState('');

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      setDataList(data);
    });
  }, []);

  const generateId = (key: string, tag: string): string => {
    return `${tag}-${key}`;
  };

  const handleSave = () => {
    const id = generateId(dataKey, dataTag);
    const data: DataItem = { key: dataKey, value: dataValue, tag: dataTag };

    if (dataList[id]) {
      alert('The key and tag combination must be unique.');
      return;
    }

    chrome.storage.local.set({ [id]: data }, () => {
      setDataList((prevDataList) => ({ ...prevDataList, [id]: data }));
      setDataKey('');
      setDataValue('');
      setDataTag('');
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          const importedData: { [id: string]: DataItem } = JSON.parse(result);

          if (!Object.values(importedData).every(item => item.key && item.tag && item.value)) {
            alert('The imported data format is invalid.');
            return;
          }

          const existingData = await new Promise<{ [id: string]: DataItem }>((resolve) =>
              chrome.storage.local.get(null, (data) => resolve(data as { [id: string]: DataItem })),
          );

          const newData: { [id: string]: DataItem } = {};
          const errors: string[] = [];

          for (const [id, item] of Object.entries(importedData)) {
            const { key, value, tag } = item;
            const newId = generateId(key, tag);

            if (existingData[newId]) {
              errors.push(`Duplicate entry found for key: ${key} and tag: ${tag}`);
            } else {
              newData[newId] = item;
            }
          }

          if (errors.length > 0) {
            alert(errors.join('\n'));
          } else {
            const updatedData = { ...existingData, ...newData };
            chrome.storage.local.set(updatedData, () => {
              window.location.reload();
            });
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          alert('Failed to parse JSON. Please check the file format.');
        }
      };

      reader.readAsText(file);
    } else {
      alert('No file selected.');
    }
  };

  const handleExport = () => {
    chrome.storage.local.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      URL.revokeObjectURL(url);
      window.location.reload();
    });
  };

  const handleDeleteSelected = () => {
    const idsToRemove = Array.from(selectedIds);
    chrome.storage.local.remove(idsToRemove, () => {
      const newDataList = { ...dataList };
      idsToRemove.forEach((id) => {
        delete newDataList[id];
      });
      setDataList(newDataList);
      setSelectedIds(new Set());
      window.location.reload();
    });
  };

  const handleDeleteSingle = (id: string) => {
    chrome.storage.local.remove(id, () => {
      const newDataList = { ...dataList };
      delete newDataList[id];
      setDataList(newDataList);
      window.location.reload();
    });
  };

  const handleUpdateSingle = (id: string) => {
    const { key, value, tag } = dataList[id];
    setEditId(id);
    setEditKey(key);
    setEditValue(value);
    setEditTag(tag);
    setIsModalOpen(true);
    window.location.reload();
  };

  const handleModalSave = (key: string, value: string, tag: string) => {
    const id = generateId(key, tag);
    const updatedData: DataItem = { key, value, tag };

    if (dataList[id] && id !== editId) {
      alert('The key and tag combination must be unique.');
      return;
    }

    chrome.storage.local.set({ [id]: updatedData }, () => {
      setDataList((prevDataList) => ({ ...prevDataList, [id]: updatedData }));
      setIsModalOpen(false);
    });
    window.location.reload();
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return newSelectedIds;
    });
  };

  const handleSelectAllChange = () => {
    if (selectedIds.size === filteredDataList.length) {
      setSelectedIds(new Set());
    } else {
      const newSelectedIds = new Set(filteredDataList.map(([id]) => id));
      setSelectedIds(newSelectedIds);
    }
  };

  const filteredDataList = Object.entries(dataList).filter(
      ([id, { key, value, tag }]) =>
          (key || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tag || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
      <div className="popup-container">
        <div className="p-6 rounded-b-lg shadow-md flex flex-col items-start bg-gradient-to-tl">
          <div className="flex items-center mb-2">
            <img src='./logo.png' alt="SlashFill Logo" className="object-scale-down h-12 w-10 mr-4"/>
            <h1 className="text-2xl font-bold">SlashFill</h1>
          </div>
          <p className="text-orange-600 text-xs leading-relaxed">
            Effortlessly fill data with smart tagging and quick slash commands.
          </p>
        </div>


        <div className="popup-body">
          <div className="accordion">
            <div
                className={`accordion-header ${isConfigOpen ? 'active' : ''}`}
                onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              Configure
            </div>
            {isConfigOpen && (
                <div className="accordion-content">
                  <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Key"
                        value={dataKey}
                        onChange={(e) => setDataKey(e.target.value)}
                        className="border p-2 mr-2 w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Value"
                        value={dataValue}
                        onChange={(e) => setDataValue(e.target.value)}
                        className="border p-2 mr-2 w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Environment Tag (dev, staging, prod)"
                        value={dataTag}
                        onChange={(e) => setDataTag(e.target.value)}
                        className="border p-2 mr-2 w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                      Save
                    </button>
                    <label className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer">
                      Import
                      <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          style={{display: 'none'}}
                      />
                    </label>
                    <button
                        onClick={handleExport}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                      Export
                    </button>
                  </div>
                </div>
            )}
          </div>
          <div className="accordion">
            <div
                className={`accordion-header ${isViewOpen ? 'active' : ''}`}
                onClick={() => setIsViewOpen(!isViewOpen)}
            >
              View
            </div>
            {isViewOpen && (
                <div className="accordion-content">
                  <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Search (key, value, tag)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 w-full"
                    />
                  </div>
                  {selectedIds.size > 0 && (
                      <div className="flex mb-2">
                        <button className="bg-red-500 text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
                                onClick={() => handleDeleteSelected()}>
                          <TrashIcon className="h-3 w-3 "/>
                        </button>
                      </div>
                  )}
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                      <tr>
                        <th>
                          <input
                              type="checkbox"
                              onChange={handleSelectAllChange}
                              checked={selectedIds.size === filteredDataList.length}
                          />
                        </th>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Tag</th>
                        <th>Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredDataList.length > 0 ? (
                          filteredDataList.map(([id, {key, value, tag}]) => (
                              <tr key={id}>
                                <td>
                                  <input
                                      type="checkbox"
                                      checked={selectedIds.has(id)}
                                      onChange={() => handleCheckboxChange(id)}
                                  />
                                </td>
                                <td>{key}</td>
                                <td>{value}</td>
                                <td>{tag}</td>
                                <td>
                                  <button
                                      onClick={() => handleDeleteSingle(id)}
                                      className="bg-red-500 text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
                                  >
                                    <TrashIcon className="h-3 w-3"/>
                                  </button>
                                  <button
                                      onClick={() => handleUpdateSingle(id)}
                                      className="bg-emerald-600 text-white px-2 py-1 rounded flex items-center"
                                  >
                                    <PencilSquareIcon className="h-3 w-3"/>
                                  </button>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan={5}>No data found</td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
            )}
          </div>
        </div>
        <div className="rounded-t-lg bg-gray-100 p-4 shadow-md mt-4">
          <p className="text-center text-sm text-gray-700">
            Developed by{' '}
            <a
                href="https://github.com/rohansharmasitoula"
                className="text-blue-500 hover:text-blue-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
            >
              Rohan Sharma Sitoula
            </a>
          </p>
        </div>


        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            dataKey={editKey}
            dataValue={editValue}
            dataTag={editTag}
            onSave={handleModalSave}
        />
      </div>
  );
};

const root = document.getElementById('root') as HTMLElement;
createRoot(root).render(
    <React.StrictMode>
      <Popup/>
    </React.StrictMode>,
);

export default Popup;
