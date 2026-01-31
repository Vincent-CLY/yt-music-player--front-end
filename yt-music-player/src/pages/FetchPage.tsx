import { useEffect, useState } from "react";
import { type PlaylistItemData } from "../components/playlist/playlist_item/PlaylistItem.tsx";
import shuffle from "../utils/shuffle.ts";

interface FetchProps {
    playlistId: string;
    onFetchResult: (status: 'success' | 'failed', data: any) => void;
}

export default function Fetch({ playlistId, onFetchResult }: FetchProps) {
    // UI 狀態：顯示進度
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [statusText, setStatusText] = useState('Initializing connection...');

    useEffect(() => {
        if (!playlistId) return;

        let currentPlaylistItems: PlaylistItemData[] = [];
        let isFirstMsg = true;

        const url = `https://yt-music-player-backend-vincentclys-projects.vercel.app/api/playlist/${playlistId}`;
        console.log("Starting EventSource:", url);
        
        const eventSource = new EventSource(url);

        // Receive messages from server
        eventSource.onmessage = (e) => {
            try {
                const data: PlaylistItemData[] = JSON.parse(e.data);

                if (isFirstMsg) {
                    const dataStr = String(data); 
                    const totalItemsPattern = /(\d+)/g;
                    const match = dataStr.match(totalItemsPattern);
                    
                    if (match) {
                        const length = parseInt(match.join(''));
                        setTotal(length);
                        setStatusText('Fetching items...');
                    }
                    isFirstMsg = false;
                } else {
                    currentPlaylistItems.push(...data);
                    setProgress((prev) => prev + data.length);
                }
            } catch (error) {
                console.error('Error parsing stream data:', error);
                onFetchResult('failed', `Error parsing stream data: ${error}`);
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