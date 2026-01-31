import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Plus, LogOut, CheckCircle, Circle, Clock, AlertCircle, LayoutGrid } from 'lucide-react'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

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
    <div style={styles.container}>
      <motion.div 
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.headerLeft}>
          <div style={styles.logoBox}>
            <LayoutGrid size={28} color="#4f46e5" />
          </div>
          <div>
            <h1 style={styles.title}>ConBi</h1>
            <p style={styles.userEmail}>{user.email}</p>
          </div>
        </div>
        <motion.button 
          onClick={handleSignOut} 
          style={styles.signOutButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>


      <motion.div 
        style={styles.statsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div 
          style={{ ...styles.statCard }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div style={{ ...styles.statIcon, backgroundColor: '#f3f4f6', color: '#6366f1' }}>
            <LayoutGrid size={24} />
          </div>
          <div>
            <div style={styles.statNumber}>{counts.total}</div>
            <div style={{ ...styles.statLabel, color: '#6366f1' }}>Total Tasks</div>
          </div>
        </motion.div>
        <motion.div 
          style={{ ...styles.statCard }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div style={{ ...styles.statIcon, backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={styles.statNumber}>{counts.pending}</div>
            <div style={{ ...styles.statLabel, color: '#f59e0b' }}>Pending</div>
          </div>
        </motion.div>
        <motion.div 
          style={{ ...styles.statCard }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={styles.statNumber}>{counts.inProgress}</div>
            <div style={{ ...styles.statLabel, color: '#3b82f6' }}>In Progress</div>
          </div>
        </motion.div>
        <motion.div 
          style={{ ...styles.statCard }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div style={{ ...styles.statIcon, backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={styles.statNumber}>{counts.completed}</div>
            <div style={{ ...styles.statLabel, color: '#10b981' }}>Completed</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        style={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={styles.contentHeader}>
          <h2 style={styles.contentTitle}>My Tasks</h2>
          <motion.button 
            onClick={handleAddTask} 
            style={styles.addButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            <span>Add Task</span>
          </motion.button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <motion.div 
            style={styles.empty}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Circle size={48} color="#cbd5e1" />
            <p>No tasks yet. Create your first task!</p>
          </motion.div>
        ) : (
          <div style={styles.taskList}>
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

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    backgroundColor: '#f8fafc',
    backgroundImage: `radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 25%), 
                      radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 25%)`,
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '24px 32px',
    borderRadius: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logoBox: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '2px',
    letterSpacing: '-0.02em',
  },
  userEmail: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  signOutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  statsContainer: {
    maxWidth: '1400px',
    margin: '0 auto 32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    borderRadius: '24px',
    backgroundColor: 'white',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s',
  },
  statIcon: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    paddingBottom: '40px',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  contentTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '120px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    color: '#94a3b8',
    fontSize: '16px',
    backgroundColor: 'white',
    borderRadius: '24px',
    border: '2px dashed #e2e8f0',
  },
  taskList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
    alignItems: 'start',
  },
}
