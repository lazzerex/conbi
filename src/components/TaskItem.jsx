import { motion } from 'framer-motion'
import { Edit2, Trash2, Calendar, Flag } from 'lucide-react'
import './TaskItem.css'

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
      className="task-item-container"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="task-item-content" onClick={() => onEdit(task)}>
        <div className="task-item-header">
          <h3 className="task-item-title">{task.title}</h3>
          <div className="task-item-badges">
            <span 
              className="task-item-badge" 
              style={{ backgroundColor: getStatusColor(task.status) + '30', color: getStatusColor(task.status) }}
            >
              {task.status.replace('_', ' ')}
            </span>
            <span 
              className="task-item-badge" 
              style={{ backgroundColor: getPriorityColor(task.priority) + '30', color: getPriorityColor(task.priority) }}
            >
              <Flag size={11} />
              {task.priority}
            </span>
          </div>
        </div>
        {task.description && (
          <p className="task-item-description">{task.description}</p>
        )}
        {task.due_date && (
          <div className="task-item-due-date">
            <Calendar size={13} />
            <span>Due: {formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
      <div className="task-item-actions">
        <motion.button 
          onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
          className="task-item-button task-item-edit-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 size={18} />
        </motion.button>
        <motion.button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
          className="task-item-button task-item-delete-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}
