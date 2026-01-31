import { motion } from 'framer-motion'
import { Edit2, Trash2, Calendar, Flag } from 'lucide-react'

export default function TaskItem({ task, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'in_progress': return '#3b82f6'
      case 'completed': return '#10b981'
      default: return '#999'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      default: return '#999'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  return (
    <motion.div 
      style={styles.container}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div style={styles.content} onClick={() => onEdit(task)}>
        <div style={styles.header}>
          <h3 style={styles.title}>{task.title}</h3>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, backgroundColor: getStatusColor(task.status) + '30', color: getStatusColor(task.status) }}>
              {task.status.replace('_', ' ')}
            </span>
            <span style={{ ...styles.badge, backgroundColor: getPriorityColor(task.priority) + '30', color: getPriorityColor(task.priority) }}>
              <Flag size={11} />
              {task.priority}
            </span>
          </div>
        </div>
        {task.description && (
          <p style={styles.description}>{task.description}</p>
        )}
        {task.due_date && (
          <div style={styles.dueDate}>
            <Calendar size={13} />
            <span>Due: {formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
      <div style={styles.actions}>
        <motion.button 
          onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
          style={{ ...styles.button, backgroundColor: '#eff6ff', color: '#3b82f6' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 size={18} />
        </motion.button>
        <motion.button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
          style={{ ...styles.button, backgroundColor: '#fef2f2', color: '#ef4444' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  content: {
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: '0.02em',
  },
  description: {
    fontSize: '15px',
    color: '#64748b',
    margin: '8px 0',
    lineHeight: '1.6',
  },
  dueDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '12px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginLeft: '16px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
}
