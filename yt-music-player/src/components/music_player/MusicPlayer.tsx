import React from 'react'
import ReactPlayer from 'react-player'

interface MusicPlayerProps {
    id: string;
    onEnded: () => void;
}

export default function MusicPlayer({ id, onEnded }: MusicPlayerProps) {
    return (
        <ReactPlayer 
            src={`https://www.youtube.com/watch?v=${id}`} 
            playing={true}
            controls={true}
            onEnded={onEnded}
        />
    )
}
