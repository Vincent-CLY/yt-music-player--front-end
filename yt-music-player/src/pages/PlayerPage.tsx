import { useState, useEffect, useMemo, useCallback } from 'react';
import Playlist from '../components/playlist/Playlist.tsx'
import MusicPlayer from '../components/music_player/MusicPlayer.tsx'
import styles from './PlayerPage.module.css';

interface PlayerProps {
    onError: () => void;
    onPlayStateChange: (isPlaying: boolean, color: string) => void;
}

export default function Player({ onError, onPlayStateChange }: PlayerProps) {
    const playlistItems = localStorage.getItem('playlistItems');
    const playOrder = localStorage.getItem('playOrder');
    const [currentIndex, setCurrentIndex] = useState(() => {
        const savedIndex = localStorage.getItem('currentIndex');
        return savedIndex ? parseInt(savedIndex) : 0;
    });
    const [loop, setLoop] = useState(false);

    const items = useMemo(() => playlistItems ? JSON.parse(playlistItems) : null, [playlistItems]);
    const order = useMemo(() => playOrder ? JSON.parse(playOrder) : null, [playOrder]);

    const handlePlaylistItemClick = useCallback((id: string) => {
        if (!items || !order) return;
        const orderIndex = order.findIndex((i: number) => items[i].id === id);
        if (orderIndex !== -1) {
            setCurrentIndex(orderIndex);
        }
    }, [items, order]);

    const handleNextSong = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            if (!order) return prevIndex;
            if (loop) {
                return (prevIndex + 1) % order.length;
            }
            if (prevIndex + 1 >= order.length) {
                onError();
                return prevIndex;
            }
            return prevIndex + 1;
        });
    }, [order, loop, onError]);

    useEffect(() => {
        localStorage.setItem('currentIndex', currentIndex.toString());
    }, [currentIndex]);

    if (!items || !order) {
        onError();
        return null;
    }

    const currentSongId = items[order[currentIndex]].id;

    return (
        <div className={styles.playerContainer}>
            <div className={styles.playerSection}>
                <MusicPlayer videoID={currentSongId} onPlayStateChange={onPlayStateChange} />
            </div>
            <div className={styles.playlistSection}>
                <Playlist items={items} order={order} currentId={currentSongId} onItemClick={handlePlaylistItemClick} />
            </div>
        </div>
    );
}