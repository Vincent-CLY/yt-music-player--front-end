import { memo, useEffect, useRef } from 'react';
import styles from './PlaylistItem.module.css';
import timeParser from '../../../utils/timeParser';

export interface PlaylistItemData {
    id: string;
    title: string;
    thumbnail: {
        url: string;
        width: number;
        height: number;
    }; 
    author: string;
    duration: number;
}

interface PlaylistItemProps { 
    item: PlaylistItemData;
    isPlaying: boolean;
    onClick: (id: string) => void;
}

export default memo(function PlaylistItem({ item, isPlaying, onClick }: PlaylistItemProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPlaying && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isPlaying]);

    return (
        <div
            ref={ref}
            id={item.id}
            className={`${styles.playlistItem} ${isPlaying ? styles.active : ''}`}
            onClick={() => onClick(item.id)}
            style={{ cursor: 'pointer' }}
        >
            <img src={item.thumbnail.url} alt={item.title} className={styles.thumbnail} />
            <div className={styles.info}>
                <p className={styles.title}>{item.title}</p>
                <span className={styles.author}>{item.author}</span>
            </div>
            <span className={styles.duration}>{timeParser(item.duration)}</span>               
        </div>
    );
});       