// Base styles for media player and provider (~400B).
import '@vidstack/react/player/styles/default/theme.css';
import { MediaPlayer, MediaProvider, type MediaPlayerInstance, type MediaTimeUpdateEventDetail } from '@vidstack/react';
import { useRef, useCallback } from 'react';
import { useSponsorBlock } from '../../utils/useSponsorBlock';

interface MusicPlayerProps {
    videoID: string;
    onPlayStateChange: (isPlaying: boolean, color: string) => void;
}

export default function MusicPlayer({ videoID, onPlayStateChange }: MusicPlayerProps) {
    const playerRef = useRef<MediaPlayerInstance>(null);
    const { checkTime } = useSponsorBlock(videoID);

    const handleTimeUpdate = useCallback(
        (detail: MediaTimeUpdateEventDetail) => {
            const skipTo = checkTime(detail.currentTime);
            if (skipTo !== null && playerRef.current) {
                playerRef.current.currentTime = skipTo;
            }
        },
        [checkTime]
    );

    return (
        <MediaPlayer
            ref={playerRef}
            title="Sprite Fight"
            src={`youtube/${videoID}`}
            load="eager"
            posterLoad="eager"
            autoPlay
            viewType="video"
            onTimeUpdate={handleTimeUpdate}
        >
            <MediaProvider />
        </MediaPlayer>
    );
}
