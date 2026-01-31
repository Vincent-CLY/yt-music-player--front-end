import { useState, useReducer } from 'react'
import Input from './pages/InputPage.tsx'
import Fetch from './pages/FetchPage.tsx'
import Player from './pages/PlayerPage.tsx'
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
  const [playlistId, setPlaylistId] = useState('')

  const handleUrlSubmit = (submittedUrl: string) => {
    setPlaylistId(submittedUrl)
    setState('fetch')
  }

  const handleFetchResult = (status: 'success' | 'failed', data: any) => {
    if (status === 'success') {
      setState('player')
    } else {
      setState('input')
      alert('Failed to fetch playlist data: ' + data)
    }
  }

  const handlePlayerError = () => {
    setState('input')
    alert('Playlist data not found. Please fetch again.')
  }


  return (
    <>
      {state === 'input' && (
        <Input playlistId={playlistId} onSubmit={handleUrlSubmit} />
      )}

      {state === 'fetch' && (
        <Fetch playlistId={playlistId} onFetchResult={handleFetchResult} />
      )}

      {state === 'player' && (
        <Player onError={handlePlayerError}/>
      )}
    </>
  )
}

export default App
