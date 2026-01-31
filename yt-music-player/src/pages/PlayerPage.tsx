import { useState, useEffect } from 'react';
import Playlist from '../components/playlist/Playlist.tsx'
import MusicPlayer from '../components/music_player/MusicPlayer.tsx'

interface PlayerProps {
    onError: () => void;
}

export default function Player({ onError }: PlayerProps) {
    const playlistItems = localStorage.getItem('playlistItems');
    const playOrder = localStorage.getItem('playOrder');
    const [currentIndex, setCurrentIndex] = useState(() => {
        const savedIndex = localStorage.getItem('currentIndex');
        return savedIndex ? parseInt(savedIndex) : 0;
    });
    const [loop, setLoop] = useState(false);

    if (!playlistItems || !playOrder) {
        onError();
        return null;
    }

    const items = JSON.parse(playlistItems);
    const order = JSON.parse(playOrder);

    const currentSongId = items[order[currentIndex]].id;

    const handleNextSong = () => {
        setCurrentIndex((prevIndex) => {
            if (loop) {
                return (prevIndex + 1) % order.length;
            }
            if (prevIndex + 1 >= order.length) {
                onError();
                return prevIndex; // stay at the last song
            }
            return prevIndex + 1;
        });
    };

    useEffect(() => {
        localStorage.setItem('currentIndex', currentIndex.toString());
    }, [currentIndex])

    return (
        <div>
            <MusicPlayer id={currentSongId} onEnded={handleNextSong} />
            <Playlist items={items} order={order} currentId={currentSongId} />
        </div>
    );
}