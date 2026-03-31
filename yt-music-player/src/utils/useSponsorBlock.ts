import { useState, useEffect, useCallback, useRef } from 'react';

interface Segment {
    segment: [number, number]; // [startTime, endTime]
    UUID: string;
    category: string;
}

const SPONSORBLOCK_API = 'https://sponsor.ajay.app/api/skipSegments';

// Categories to skip — adjust as needed
const CATEGORIES = [
    'sponsor',
    'selfpromo',
    'interaction',    // "like and subscribe" reminders
    'intro',
    'outro',
    'music_offtopic', // non-music sections in music videos
];

export function useSponsorBlock(videoID: string) {
    const [segments, setSegments] = useState<Segment[]>([]);
    const skippedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        setSegments([]);
        skippedRef.current = new Set();

        const params = new URLSearchParams({
            videoID,
            categories: JSON.stringify(CATEGORIES),
        });

        fetch(`${SPONSORBLOCK_API}?${params}`)
            .then((res) => {
                if (!res.ok) return []; // 404 = no segments for this video
                return res.json();
            })
            .then((data: Segment[]) => {
                if (Array.isArray(data)) {
                    setSegments(data);
                }
            })
            .catch(() => {
                // silently ignore network errors
            });
    }, [videoID]);

    /**
     * Call this on every timeupdate.
     * Returns the time to seek to if inside a sponsor segment, otherwise null.
     */
    const checkTime = useCallback(
        (currentTime: number): number | null => {
            for (const seg of segments) {
                const [start, end] = seg.segment;
                if (
                    currentTime >= start &&
                    currentTime < end &&
                    !skippedRef.current.has(seg.UUID)
                ) {
                    skippedRef.current.add(seg.UUID);
                    return end;
                }
            }
            return null;
        },
        [segments]
    );

    return { segments, checkTime };
}
