import { useState } from 'react';
import parsePlaylistId from '../utils/parsePlaylistId';

interface InputProps {
    playlistId: string;
    onSubmit: (playlistId: string) => void;
}

export default function Input({ playlistId, onSubmit }: InputProps) {
    const [inputValue, setInputValue] = useState(playlistId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const playlistId = parsePlaylistId(inputValue);
            onSubmit(playlistId);
        } catch (error) {
            alert((error as Error).message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="playlist-input">Search for music:</label>
            <input id="playlist-input" type="text" placeholder="Please enter a YouTube playlist URL or ID..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit">Search</button>
        </form>
    );
}