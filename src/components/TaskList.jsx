import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Plus, LogOut, CheckCircle, Circle, Clock, AlertCircle, LayoutGrid } from 'lucide-react'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import './TaskList.css'

export default function TaskList({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast.error('Failed to fetch tasks. Please try again.', {
        style: {
          background: '#ffffff',
          color: '#ef4444',
          border: '1px solid #fee2e2',
          fontWeight: '500',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleTaskSaved = () => {
    fetchTasks()
    handleCloseForm()
  }

  const handleDeleteTask = async (taskId) => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
          Are you sure you want to delete this task?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            style={{ 
              padding: '8px 20px', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const { error } = await supabase
                  .from('tasks')
                  .delete()
                  .eq('id', taskId)

                if (error) throw error
                fetchTasks()
                toast.success('Task deleted successfully!', {
                  style: {
                    background: '#ffffff',
                    color: '#10b981',
                    border: '1px solid #d1fae5',
                    fontWeight: '500',
                  },
                })
              } catch (error) {
                toast.error('Failed to delete task. Please try again.', {
                  style: {
                    background: '#ffffff',
                    color: '#ef4444',
                    border: '1px solid #fee2e2',
                    fontWeight: '500',
                  },
                })
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            style={{ 
              padding: '8px 20px', 
              background: '#f3f4f6', 
              color: '#0f172a', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        minWidth: '320px',
        padding: '20px',
      },
    })
  }


  const getStatusCounts = () => {
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const total = tasks.length
    return { pending, inProgress, completed, total }
  }

  const counts = getStatusCounts()

  return (
    <div className="task-container">
      <div className="task-background-decoration"></div>
      
      <div className="task-board">
      <motion.div 
        className="task-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="task-header-left">
          <div className="task-logo-box">
            <LayoutGrid size={28} color="#0d9488" />
          </div>
          <div>
            <h1 className="task-title-text">Conbi</h1>
            <p className="task-user-email">{user.email}</p>
          </div>
        </div>
        <motion.button 
          onClick={handleSignOut} 
          className="task-signout-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>

      <motion.div 
        className="task-stats-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div 
          className="task-stat-card"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="task-stat-icon" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
            <LayoutGrid size={24} />
          </div>
          <div>
            <div className="task-stat-number">{counts.total}</div>
            <div className="task-stat-label" style={{ color: '#0d9488' }}>Total Tasks</div>
          </div>
        </motion.div>
        <motion.div 
          className="task-stat-card"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="task-stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="task-stat-number">{counts.pending}</div>
            <div className="task-stat-label" style={{ color: '#f59e0b' }}>Pending</div>
          </div>
        </motion.div>
        <motion.div 
          className="task-stat-card"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="task-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="task-stat-number">{counts.inProgress}</div>
            <div className="task-stat-label" style={{ color: '#3b82f6' }}>In Progress</div>
          </div>
        </motion.div>
        <motion.div 
          className="task-stat-card"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="task-stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="task-stat-number">{counts.completed}</div>
            <div className="task-stat-label" style={{ color: '#10b981' }}>Completed</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="task-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="task-content-header">
          <h2 className="task-content-title">My Tasks</h2>
          <motion.button 
            onClick={handleAddTask} 
            className="task-add-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            <span>Add Task</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="task-loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <motion.div 
            className="task-empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Circle size={48} color="#cbd5e1" />
            <p>No tasks yet. Create your first task!</p>
          </motion.div>
        ) : (
          <div className="task-list-grid">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <TaskItem
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskForm
            user={user}
            task={editingTask}
            onClose={handleCloseForm}
            onSave={handleTaskSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
