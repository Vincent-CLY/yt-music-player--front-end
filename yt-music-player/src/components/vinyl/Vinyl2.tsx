import React from 'react';
import styles from './Vinyl.module.css';
import vinyl2 from '../../assets/vinyl2.svg';

interface Vinyl2Props {
    appState: 'input' | 'fetch' | 'player';
    progress?: number;
    isSpinning: boolean;
    isTransitioning?: boolean;
}

export default function Vinyl2({ appState, progress = 0, isSpinning }: Vinyl2Props) {
    const rollRotation = progress * 360 * 4;

    return (
        <div className={`${styles['vinyl-container']} ${styles[appState]}`} style={{ '--progress': progress } as React.CSSProperties}>
            <img
                src={vinyl2}
                alt="Vinyl record"
                className={styles.vinyl}
                style={{
                    transform: appState === 'fetch' ? `rotate(${rollRotation}deg)` : undefined,
                    animation: (appState === 'fetch' || !isSpinning) ? 'none' : undefined
                }}
            />
        </div>
    );
}
