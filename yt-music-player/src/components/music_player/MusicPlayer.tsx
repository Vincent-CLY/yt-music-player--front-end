// Base styles for media player and provider (~400B).
import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';

interface MusicPlayerProps {
    videoID: string;
    onPlayStateChange: (isPlaying: boolean, color: string) => void;
}

export default function MusicPlayer({ videoID, onPlayStateChange }: MusicPlayerProps) {

    return (

        <MediaPlayer title="Sprite Fight" src={`youtube/${videoID}`} load="eager" // 立即載入，不等待進入視口
  posterLoad="eager" >
            <MediaProvider />
        </MediaPlayer>
    );
}
