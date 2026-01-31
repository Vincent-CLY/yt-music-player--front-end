import { memo } from 'react';
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
}

export default memo(function PlaylistItem({ item, isPlaying }: PlaylistItemProps) {
    return (
        <div id={item.id} className={`${styles.playlistItem} ${isPlaying ? styles.active : ''}`}>
            <img src={item.thumbnail.url} alt={item.title} className={styles.thumbnail} />
            <div className={styles.info}>
                <p className={styles.title}>{item.title}</p>
                <span className={styles.author}>{item.author}</span>
            </div>
            <span className={styles.duration}>{timeParser(item.duration)}</span>               
        </div>
    );
});       