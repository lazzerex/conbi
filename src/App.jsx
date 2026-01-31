import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import TaskList from './components/TaskList'

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
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#64748b', fontWeight: '500' }}>loading...</p>
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

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    backgroundColor: '#f8fafc',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}

export default App
