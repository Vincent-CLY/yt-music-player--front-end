import PlaylistItem, { type PlaylistItemData } from "./playlist_item/PlaylistItem.tsx";

interface PlaylistProps {
    items: PlaylistItemData[],
    order: number[],
    currentId: string;
}

export default function Playlist( {items, order, currentId}: PlaylistProps ) {
    return (
        <div>
            {order.map( (index) => (
                <PlaylistItem 
                    key={items[index].id} 
                    item={items[index]} 
                    isPlaying={items[index].id === currentId}
                />
            ))}
        </div>
    );
}