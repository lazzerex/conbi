import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Mail, Lock, User, Eye, EyeOff, LayoutGrid, ArrowRight, CheckCircle2, CheckCircle } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [verificationSent, setVerificationSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (error) throw error
        
        if (data.user) {
          await supabase.from('profiles').insert([
            { id: data.user.id, email, full_name: fullName }
          ])
          
          setVerificationSent(true)
          
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setFullName('')
        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <motion.div 
        style={styles.wrapper}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left Side - Info Panel */}
        <div style={styles.infoPanel}>
          <div style={styles.brand}>
            <div style={styles.logoBox}>
              <LayoutGrid size={24} color="#0ea5e9" />
            </div>
            <h1 style={styles.brandName}>ConBi</h1>
          </div>
          
          <div style={styles.infoContent}>
            <motion.h2 
              style={styles.welcomeTitle}
              key={isLogin ? 'login-title' : 'signup-title'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLogin ? 'Welcome back to your workspace.' : 'Start your productivity journey.'}
            </motion.h2>
            
            <motion.p 
              style={styles.welcomeText}
              key={isLogin ? 'login-text' : 'signup-text'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLogin 
                ? 'Sign in to access your tasks, manage projects, and stay organized with your team.' 
                : 'Join thousands of users who are managing their daily tasks more efficiently with ConBi.'}
            </motion.p>

            <motion.div 
              style={styles.featureList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div style={styles.featureItem}>
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Smart task organization</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Real-time collaboration</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Seamless cloud sync</span>
              </div>
            </motion.div>
          </div>

          <div style={styles.decorativeOrb} />
        </div>

        {/* Right Side - Form */}
        <div style={styles.formPanel}>
          <div style={styles.formContent}>
            <AnimatePresence mode="wait">
              {verificationSent ? (
                <motion.div
                  key="verification-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{ 
                      display: 'inline-flex', 
                      padding: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e0f2fe',
                      color: '#0ea5e9',
                      marginBottom: '32px',
                      boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <CheckCircle size={48} strokeWidth={2.5} />
                  </motion.div>
                  <h2 style={{ ...styles.title, marginBottom: '16px' }}>Check your email</h2>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#0e7490', marginBottom: '32px' }}>
                    We've sent a verification link to<br/>
                    <strong style={{ color: '#0e7490' }}>{email}</strong>
                  </p>
                  <motion.button 
                    onClick={() => {
                      setVerificationSent(false)
                      setIsLogin(true)
                      setEmail('')
                      setPassword('')
                    }}
                    style={styles.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Sign In
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={styles.formHeader}>
                    <h1 style={styles.title}>{isLogin ? 'Sign in' : 'Create account'}</h1>
                    <div style={styles.switchRow}>
                      <span style={styles.switchText}>
                        {isLogin ? "New to ConBi? " : "Already have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin)
                          setError(null)
                        }}
                        style={styles.linkButton}
                      >
                        {isLogin ? 'Create an account' : 'Sign in'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAuth} style={styles.form}>
                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div 
                          style={styles.inputGroup}
                          initial={{ opacity: 0, height: 0, marginTop: -10 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: -10 }}
                        >
                          <label style={styles.label}>Full Name</label>
                          <div style={styles.inputWrapper}>
                            <User size={18} style={styles.icon} />
                            <input
                              type="text"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email Address</label>
                      <div style={styles.inputWrapper}>
                        <Mail size={18} style={styles.icon} />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Password</label>
                      <div style={styles.inputWrapper}>
                        <Lock size={18} style={styles.icon} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div 
                          style={styles.inputGroup}
                          initial={{ opacity: 0, height: 0, marginTop: -10 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: -10 }}
                        >
                          <label style={styles.label}>Confirm Password</label>
                          <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.icon} />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required={!isLogin}
                              style={styles.input}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              style={styles.eyeButton}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <motion.div 
                        style={styles.error}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      style={styles.button}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0fdfa',
    backgroundImage: `linear-gradient(rgba(236, 254, 255, 0.85), rgba(236, 254, 255, 0.85)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2070')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  wrapper: {
    width: '100%',
    maxWidth: '1200px',
    minHeight: '680px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  infoPanel: {
    flex: '1',
    backgroundColor: '#0ea5e9',
    backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    color: 'white',
    '@media (max-width: 900px)': {
      display: 'none',
    },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  logoBox: {
    width: '40px',
    height: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  brandName: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  infoContent: {
    zIndex: 10,
    maxWidth: '440px',
  },
  welcomeTitle: {
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '20px',
    letterSpacing: '-0.02em',
  },
  welcomeText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '40px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.97)',
  },
  decorativeOrb: {
    position: 'absolute',
    bottom: '-50px',
    right: '-50px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 1,
  },
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    backgroundColor: '#ffffff',
  },
  formContent: {
    width: '100%',
    maxWidth: '420px',
  },
  formHeader: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '15px',
  },
  switchText: {
    color: '#64748b',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#0ea5e9',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflow: 'hidden',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '15px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fee2e2',
  },
}
