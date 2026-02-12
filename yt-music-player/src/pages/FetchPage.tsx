import { useEffect, useState } from "react";
import { type PlaylistItemData } from "../components/playlist/playlist_item/PlaylistItem.tsx";
import shuffle from "../utils/shuffle.ts";
import styles from "./FetchPage.module.css";

interface FetchProps {
    playlistId: string;
    onFetchResult: (status: 'success' | 'failed', data: any) => void;
    onProgressUpdate: (current: number, total: number) => void;
    onThumbnailReady?: () => void;
}

interface PlaylistThumbnailData {
    thumbnail: {
        url: string;
        width: number;
        height: number;
    }
}

export default function Fetch({ playlistId, onFetchResult, onProgressUpdate, onThumbnailReady }: FetchProps) {
    // UI 狀態：顯示進度
    const [playlistThumbnail, setPlaylistThumbnail] = useState('');
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [statusText, setStatusText] = useState('Initializing connection...');

    useEffect(() => {
        if (!playlistId) return;

        let currentPlaylistItems: PlaylistItemData[] = [];
        let currentThumbnail = '';
        let metaMsg = 2;

        const url = `https://yt-music-player-backend-vincentclys-projects.vercel.app/api/playlist/${playlistId}`;
        console.log("Starting EventSource:", url);
        
        const eventSource = new EventSource(url);

        // Receive messages from server
        eventSource.onmessage = (e) => {
            try {
                const rawData = JSON.parse(e.data);

                if (metaMsg === 2) {
                    const dataStr = String(rawData); 
                    const totalItemsPattern = /(\d+)/g;
                    const match = dataStr.match(totalItemsPattern);
                    
                    if (match) {
                        const length = parseInt(match.join(''));
                        setTotal(length);
                    }
                    metaMsg = 1;
                } else if (metaMsg === 1) {
                    const data = rawData as PlaylistThumbnailData;
                    try {
                        currentThumbnail = data.thumbnail.url;
                        console.log("Thumbnail received:", currentThumbnail);
                        setPlaylistThumbnail(currentThumbnail);

                        // Preload the image, then signal ready
                        const img = new Image();
                        img.onload = () => {
                            console.log("Thumbnail image preloaded");
                            onThumbnailReady?.();
                        };
                        img.onerror = () => {
                            console.warn("Thumbnail preload failed, proceeding anyway");
                            onThumbnailReady?.();
                        };
                        img.src = currentThumbnail;
                    } catch {
                        console.warn("Failed to extract playlist thumbnail.");
                        onThumbnailReady?.();
                    } finally {
                        metaMsg = 0;
                        setStatusText('Fetching items...');
                    }
                } else {
                    const data = rawData as PlaylistItemData[];
                    currentPlaylistItems.push(...data);
                    setProgress((prev) => prev + data.length);
                }
            } catch (error) {
                console.error('Error retreiving data from server:', error);
                onFetchResult('failed', `Error retreiving data from server: ${error}`);
            }
        };

        // Handle custom error event from server
        const handleErrorEvent = (e: MessageEvent) => {
            console.error('Server sent error event:', e);
            eventSource.close();
            
            let errorMsg = "Unknown error from server";
            try {
                if (e.data) errorMsg = JSON.parse(e.data);
            } catch {}
            onFetchResult('failed', errorMsg);
        };
        eventSource.addEventListener('playlistFetchFailed', handleErrorEvent);

        // Handle completion event from server
        eventSource.addEventListener('complete', () => {
            console.log('Stream complete.');
            eventSource.close();

            try {
                // save to localStorage
                window.localStorage.setItem('playlistItems', JSON.stringify(currentPlaylistItems));
                window.localStorage.setItem('playlistThumbnail', currentThumbnail);

                // Fisher-Yates Shuffle set play order
                const order = shuffle(currentPlaylistItems.length);
                window.localStorage.setItem('playOrder', JSON.stringify(order));
                
                // 稍微延遲一點讓用戶看到 100% 進度條 (Optional)
                setTimeout(() => {
                    onFetchResult('success', currentPlaylistItems);
                }, 500);

            } catch (err) {
                console.error("Storage error:", err);
                onFetchResult('failed', "Failed to save playlist to local storage.");
            }
        });

        // Handle connection errors
        eventSource.onerror = (err) => {
            if (eventSource.readyState === EventSource.CLOSED) {
                // Connection closed normally
                console.log("Connection closed by server.");
            } else {
                // network error
                console.error("Connection error:", err);
                eventSource.close();
                onFetchResult('failed', 'Connection lost');
            }
        };

        return () => {
            console.log("Closing connection");
            eventSource.close();
        };
    }, []);

    return (
        <div className={styles.fetchContainer}>
            <h2 className={styles.statusText}>{statusText}</h2>
            <div className={styles.thumbnailWrapper}>
                <img src={playlistThumbnail} alt="Playlist Thumbnail" className={styles.thumbnail} />
            </div>
            {/* 簡單的進度顯示 */}
            {total > 0 && (
                <div className={styles.progressSection}>
                    <p className={styles.progressLabel}>Fetched: {progress} / ~{total}</p>
                    <div className={styles.progressBarWrapper}>
                        <div className={styles.progressBarFill} style={{ width: `${(progress / total) * 100}%` }} />
                    </div>
                </div>
            )}
            
            {/* 如果還沒拿到總數，顯示 Loading */}
            {total === 0 && <p className={styles.waitingText}>Waiting for server response...</p>}
        </div>
    );
}