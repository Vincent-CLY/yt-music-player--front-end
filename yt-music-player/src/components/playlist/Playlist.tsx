import { memo } from 'react';
import PlaylistItem, { type PlaylistItemData } from "./playlist_item/PlaylistItem.tsx";

interface PlaylistProps {
    items: PlaylistItemData[],
    order: number[],
    currentId: string;
    onItemClick: (id: string) => void;
}

export default memo(function Playlist( {items, order, currentId, onItemClick}: PlaylistProps ) {
    return (
        <div>
            {order.map( (index, orderIndex) => (
                <PlaylistItem 
                    key={`${orderIndex}-${items[index].id}`} 
                    item={items[index]} 
                    isPlaying={items[index].id === currentId}
                    onClick={onItemClick}
                />
            ))}
        </div>
    );
});