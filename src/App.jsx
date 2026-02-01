import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import TaskList from './components/TaskList'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-spinner"></div>
        <p className="app-loading-text">loading...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div>
        {!session ? (
          <Auth />
        ) : (
          <TaskList user={session.user} />
        )}
      </div>
    </>
  )
}

export default App
