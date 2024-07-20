import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from "react-dom/client";

interface DataItem {
    key: string;
    value: string;
    tag: string;
}

interface Suggestion {
    key: string;
    value: string;
    tag: string;
}

interface DropdownProps {
    suggestions: Suggestion[];
    onSelect: (value: string) => void;
    style?: React.CSSProperties;
}

const Dropdown: React.FC<DropdownProps> = ({ suggestions, onSelect, style }) => {
    if (suggestions.length === 0) return null;

    return (
        <ul className="absolute border border-gray-300 bg-white shadow-lg max-h-60 overflow-y-auto z-50" style={style}>
            {suggestions.map((suggestion, index) => (
                <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                    onClick={() => onSelect(suggestion.value)}
                >
                    <span>{suggestion.key}: {suggestion.value}</span>
                    <span className="ml-2 relative inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                        {suggestion.tag}
                        <svg className="absolute left-0 w-2 h-2 ml-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0l5 10-5 10H5l5-10L5 0h5z" />
                        </svg>
                    </span>
                </li>
            ))}
        </ul>
    );
};

const ContentScript: React.FC = () => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [inputPosition, setInputPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [activeInput, setActiveInput] = useState<HTMLInputElement | null>(null);

    const handleInputChange = useCallback((event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target) return;
        setActiveInput(target);
        const value = target.value;
        const cursorPosition = target.selectionStart || 0;
        const commandIndex = value.lastIndexOf('/', cursorPosition);
        if (commandIndex > -1) {
            const command = value.slice(commandIndex + 1).trim();
            chrome.storage.local.get(null, (data: { [id: string]: DataItem }) => {
                const suggestions = Object.values(data)
                    .filter(item => item.key.toLowerCase().includes(command.toLowerCase()))
                    .map(item => ({ key: item.key, value: item.value, tag: item.tag }));

                setSuggestions(suggestions);
                setIsDropdownVisible(suggestions.length > 0);
                if (suggestions.length > 0) {
                    const rect = target.getBoundingClientRect();
                    setInputPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                }
            });
        } else {
            setIsDropdownVisible(false);
        }
    }, []);

    const handleSelectSuggestion = (value: string) => {
        if (activeInput) {
            const cursorPosition = activeInput.selectionStart || 0;
            const currentValue = activeInput.value;
            const commandIndex = currentValue.lastIndexOf('/', cursorPosition);

            if (commandIndex > -1) {
                activeInput.value =  value;
                setIsDropdownVisible(false);
            }
        }
    };

    useEffect(() => {
        const handleFocus = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target && target.tagName === 'INPUT') {
                target.addEventListener('input', handleInputChange);
            }
        };

        const handleBlur = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target && target.tagName === 'INPUT') {
                target.removeEventListener('input', handleInputChange);
            }
        };

        document.addEventListener('focusin', handleFocus, true);
        document.addEventListener('focusout', handleBlur, true);

        return () => {
            document.removeEventListener('focusin', handleFocus, true);
            document.removeEventListener('focusout', handleBlur, true);
        };
    }, [handleInputChange]);

    return (
        <>
            {isDropdownVisible && (
                <Dropdown
                    suggestions={suggestions}
                    onSelect={handleSelectSuggestion}
                    style={{ top: inputPosition.top, left: inputPosition.left }}
                />
            )}
        </>
    );
};

const container = document.createElement('div');
container.id = 'content-script-root';
createRoot(container).render(<ContentScript />);
document.body.appendChild(container);

export default ContentScript;
