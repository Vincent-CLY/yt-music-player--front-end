import { useState, useReducer } from 'react'
import Input from './pages/InputPage.tsx'
import Fetch from './pages/FetchPage.tsx'
import Player from './pages/PlayerPage.tsx'
import Vinyl from './components/vinyl/Vinyl.tsx';
import './App.css'
import parsePlaylistId from './utils/parsePlaylistId'

function App() {
  // const initialState = {
  //   playlistId: '',
  //   status: 'input' as 'input' | 'fetch' | 'player',
  //   error: null as string | null,
  // }

  // const reducer = (state: typeof initialState, action: any) => {
  //   switch (action.type) {
  //     case 'SUBMIT_ID':
  //       return { ...state, playlistId: action.payload }
  //     case 'FETCH_COMPLETE':
  //       return { ...state, state: action.payload }
  //     case 'FETCH_ERROR':
  //       return { ...state, error: action.payload }
  //     default: // player state
  //       return state
  //   }
  // }

  // const [state, dispatch] = useReducer(reducer, initialState);

  // const handleSubmit = (id: string) => {
  //   dispatch({ type: 'SUBMIT_ID', payload: id });
  // }

  const [count, setCount] = useState(0)
  const [state, setState] = useState<'input' | 'fetch' | 'player'>('input')
  const [inputUrl, setInputUrl] = useState('')
  const [playlistId, setPlaylistId] = useState('')

  const [fetchProgress, setFetchProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [vinylSpin, setVinylSpin] = useState(true)
  const [vinylColor, setVinylColor] = useState('#000000')
// #282937

  const handleUrlSubmit = async (submittedUrl: string) => {
    try {
        setInputUrl(submittedUrl);
        const playlistId = parsePlaylistId(submittedUrl);

        // Call the Validation Endpoint
        const response = await fetch(`https://yt-music-player-backend-vincentclys-projects.vercel.app/api/validate/${playlistId}`);
        if (!response.ok) {
            throw new Error('This playlist is unavailable or private.');
        }

        setPlaylistId(playlistId)
        setVinylSpin(true)
        setFetchProgress(0)

        // Trigger the transition animation
        setIsTransitioning(true)
        
        // Wait for 1.2s (animation duration) before switching state
        setTimeout(() => {
            setState('fetch')
            setIsTransitioning(false)
        }, 1200)

    } catch (error) {
        console.log(submittedUrl);
        alert((error as Error).message);
    }
  }
  
  const handleProgressUpdate = (current: number, total: number) => {
    setFetchProgress(current / total);
  }

  const handleFetchResult = (status: 'success' | 'failed', data: any) => {
    if (status === 'success') {
      setFetchProgress(1)
      setState('player')
    } else if (status === 'failed') {
      setState('input')
      setFetchProgress(0)
      setVinylSpin(true)
      alert('Failed to fetch playlist data: ' + data)
    }
  }

  const handlePlayerError = () => {
    setState('input')
    setVinylSpin(true)
    alert('Playlist data not found. Please fetch again.')
  }

  const handlePlayStateChange = (isPlaying: boolean, color: string) => {
    setVinylSpin(isPlaying)
    setVinylColor(color)
  }


  return (
    <>
      {state === 'input' && (
        <Input 
            playlistId={inputUrl} 
            onSubmit={handleUrlSubmit} 
            isTransitioning={isTransitioning}
        />
      )}

      {(state === 'fetch') && (
        <Fetch playlistId={playlistId} onFetchResult={handleFetchResult} onProgressUpdate={handleProgressUpdate} />
      )}

      {state === 'player' && (
        <Player onError={handlePlayerError} onPlayStateChange={handlePlayStateChange}/>
      )}
      {/* <div className={styles['vinyl-container']}> */}
        <Vinyl 
            isSpinning={vinylSpin} 
            appState={state} 
            progress={fetchProgress} 
            isTransitioning={isTransitioning}
        />
      {/* </div> */}
      <footer className="attribution-footer">
        <a href="https://www.vecteezy.com/free-vector/vinyl" target="_blank" rel="noopener noreferrer">
          Vinyl Vectors by Vecteezy
        </a>
      </footer>
    </>
  )
}

export default App
