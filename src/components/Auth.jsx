import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Mail, Lock, User, Eye, EyeOff, LayoutGrid, ArrowRight, CheckCircle2, CheckCircle } from 'lucide-react'
import './Auth.css'

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
    <div className="auth-container">
      <motion.div 
        className="auth-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="auth-info-panel">
          <div className="auth-brand">
            <div className="auth-logo-box">
              <LayoutGrid size={24} color="#0ea5e9" />
            </div>
            <h1 className="auth-brand-name">Conbi</h1>
          </div>
          
          <div className="auth-info-content">
            <motion.h2 
              className="auth-welcome-title"
              key={isLogin ? 'login-title' : 'signup-title'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLogin ? 'Welcome back to your workspace.' : 'Start your productivity journey.'}
            </motion.h2>
            
            <motion.p 
              className="auth-welcome-text"
              key={isLogin ? 'login-text' : 'signup-text'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLogin 
                ? 'Sign in to access your tasks, manage projects, and stay organized with your team.' 
                : 'Join thousands of users who are managing their daily tasks more efficiently with Conbi.'}
            </motion.p>

            <motion.div 
              className="auth-feature-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="auth-feature-item">
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Smart task organization</span>
              </div>
              <div className="auth-feature-item">
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Real-time collaboration</span>
              </div>
              <div className="auth-feature-item">
                <CheckCircle2 size={18} color="#38bdf8" />
                <span>Seamless cloud sync</span>
              </div>
            </motion.div>
          </div>

          <div className="auth-decorative-orb" />
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <AnimatePresence mode="wait">
              {verificationSent ? (
                <motion.div
                  key="verification-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="auth-verification-wrapper"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="auth-check-icon-wrapper"
                  >
                    <CheckCircle size={48} strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="auth-title" style={{ marginBottom: '16px' }}>Check your email</h2>
                  <p className="auth-check-email-text">
                    We've sent a verification link to<br/>
                    <strong className="auth-check-email-strong">{email}</strong>
                  </p>
                  <motion.button 
                    onClick={() => {
                      setVerificationSent(false)
                      setIsLogin(true)
                      setEmail('')
                      setPassword('')
                    }}
                    className="auth-button"
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
                  <div className="auth-form-header">
                    <h1 className="auth-title">{isLogin ? 'Sign in' : 'Create account'}</h1>
                    <div className="auth-switch-row">
                      <span className="auth-switch-text">
                        {isLogin ? "New to Conbi? " : "Already have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin)
                          setError(null)
                        }}
                        className="auth-link-button"
                      >
                        {isLogin ? 'Create an account' : 'Sign in'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAuth} className="auth-form">
                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div 
                          className="auth-input-group"
                          initial={{ opacity: 0, height: 0, marginTop: -10 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: -10 }}
                        >
                          <label className="auth-label">Full Name</label>
                          <div className="auth-input-wrapper">
                            <User size={18} className="auth-icon" />
                            <input
                              type="text"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="auth-input"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="auth-input-group">
                      <label className="auth-label">Email Address</label>
                      <div className="auth-input-wrapper">
                        <Mail size={18} className="auth-icon" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrapper">
                        <Lock size={18} className="auth-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="auth-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="auth-eye-button"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div 
                          className="auth-input-group"
                          initial={{ opacity: 0, height: 0, marginTop: -10 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: -10 }}
                        >
                          <label className="auth-label">Confirm Password</label>
                          <div className="auth-input-wrapper">
                            <Lock size={18} className="auth-icon" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required={!isLogin}
                              className="auth-input"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="auth-eye-button"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <motion.div 
                        className="auth-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      className="auth-button"
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
