import { useState } from 'react';
import styles from './InputPage.module.css';

interface InputProps {
    playlistId: string;
    onSubmit: (playlistId: string) => void;
    isTransitioning: boolean;
}

export default function Input({ playlistId, onSubmit, isTransitioning }: InputProps) {
    const [inputValue, setInputValue] = useState(playlistId);
    const [buttonState, setButtonState] = useState<'idle' | 'validating' | 'success'>('idle');

    const isBusy = buttonState !== 'idle';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonState('validating');
        try {
            await onSubmit(inputValue);
            setButtonState('success');
        } catch {
            setButtonState('idle');
        }
    }

    return (
        <div className={`${styles.container} ${isTransitioning ? styles.sliding : ''}`}>
            <h1 className={styles.title}>Stream Your YouTube<br />Playlists Seamlessly</h1>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
                <div className={`${styles.searchWrapper} ${isBusy ? styles.validating : ''}`}>
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        id="playlist-input" 
                        type="text" 
                        className={styles.searchInput}
                        placeholder="Paste YouTube Playlist URL or ID..." 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isBusy || isTransitioning}
                    />
                    <button 
                        type="submit" 
                        className={`${styles.fetchButton} ${buttonState === 'success' ? styles.fetchButtonSuccess : ''}`}
                        disabled={isBusy || isTransitioning}
                    >
                        {buttonState === 'validating' ? (
                            <span className={styles.buttonContent}>
                                <svg className={styles.spinner} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="50 20" strokeLinecap="round" />
                                </svg>
                            </span>
                        ) : buttonState === 'success' ? (
                            <span className={styles.buttonContent}>
                                <svg className={styles.checkmark} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12.5l5.5 5.5L20 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        ) : 'Fetch Playlist'}
                    </button>
                </div>
            </form>
        </div>
    );
}