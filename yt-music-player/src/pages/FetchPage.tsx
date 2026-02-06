import { useEffect, useState } from "react";
import { type PlaylistItemData } from "../components/playlist/playlist_item/PlaylistItem.tsx";
import shuffle from "../utils/shuffle.ts";

interface FetchProps {
    playlistId: string;
    onFetchResult: (status: 'success' | 'failed', data: any) => void;
    onProgressUpdate: (current: number, total: number) => void;
}

interface PlaylistThumbnailData {
    thumbnail: {
        url: string;
        width: number;
        height: number;
    }
}

export default function Fetch({ playlistId, onFetchResult, onProgressUpdate }: FetchProps) {
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
                    } catch {
                        console.warn("Failed to extract playlist thumbnail.");
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
        <div style={{ padding: '20px' }}>
            <h2>{statusText}</h2>
            <img src={playlistThumbnail} alt="Playlist Thumbnail" style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
            {/* 簡單的進度顯示 */}
            {total > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <p>Fetched: {progress} / ~{total}</p>
                    <progress value={progress} max={total} style={{ width: '100%' }}></progress>
                </div>
            )}
            
            {/* 如果還沒拿到總數，顯示 Loading */}
            {total === 0 && <p>Waiting for server response...</p>}
        </div>
    );
}