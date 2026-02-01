import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { X, Tag, Trash2 } from 'lucide-react'

export default function TaskForm({ user, task, onClose, onSave }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
      if (error) throw error
      toast.success('Task deleted successfully!', { 
        style: { 
          background: '#fff', 
          color: '#10b981', 
          border: '1px solid #d1fae5', 
          fontWeight: '500' 
        } 
      })
      onSave()
      onClose()
    } catch (err) {
      toast.error('Failed to delete task.', { 
        style: { 
          background: '#fff', 
          color: '#ef4444', 
          border: '1px solid #fee2e2', 
          fontWeight: '500' 
        } 
      })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      })
      fetchTaskCategories(task.id)
    }
  }, [task])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      toast.error('Failed to fetch categories.', {
        style: {
          background: '#ffffff',
          color: '#ef4444',
          border: '1px solid #fee2e2',
          fontWeight: '500',
        },
      })
    }
  }

  const fetchTaskCategories = async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('category_id')
        .eq('task_id', taskId)

      if (error) throw error
      setSelectedCategories(data.map(tc => tc.category_id))
    } catch (error) {
      toast.error('Failed to fetch task categories.', {
        style: {
          background: '#ffffff',
          color: '#ef4444',
          border: '1px solid #fee2e2',
          fontWeight: '500',
        },
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const taskData = {
        ...formData,
        user_id: user.id,
        due_date: formData.due_date || null,
      }

      let taskId
      if (task) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id)

        if (error) throw error
        taskId = task.id
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()

        if (error) throw error
        taskId = data[0].id
      }

    
      await supabase
        .from('task_categories')
        .delete()
        .eq('task_id', taskId)

      
      if (selectedCategories.length > 0) {
        const taskCategories = selectedCategories.map(categoryId => ({
          task_id: taskId,
          category_id: categoryId
        }))

        const { error: tcError } = await supabase
          .from('task_categories')
          .insert(taskCategories)

        if (tcError) throw tcError
      }

      onSave()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          user_id: user.id,
          name: newCategoryName.trim(),
          color: randomColor
        }])
        .select()

      if (error) throw error
      
      setCategories([...categories, data[0]])
      setSelectedCategories([...selectedCategories, data[0].id])
      setNewCategoryName('')
      setShowNewCategory(false)
      toast.success('Category created successfully!', {
        style: {
          background: '#ffffff',
          color: '#10b981',
          border: '1px solid #d1fae5',
          fontWeight: '500',
        },
      })
    } catch (error) {
      toast.error('Failed to create category.', {
        style: {
          background: '#ffffff',
          color: '#ef4444',
          border: '1px solid #fee2e2',
          fontWeight: '500',
        },
      })
    }
  }

  return (
    <motion.div 
      className="task-form-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="task-form-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="task-form-header">
          <h2 className="task-form-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <motion.button 
            onClick={onClose} 
            className="task-form-close-button"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="task-form-container">
          <div className="task-form-group">
            <label className="task-form-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="task-form-input"
              placeholder="Enter task title"
            />
          </div>

          <div className="task-form-group">
            <label className="task-form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="task-form-input task-form-textarea"
              placeholder="Enter task description"
            />
          </div>

          <div className="task-form-row">
            <div className="task-form-group">
              <label className="task-form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="task-form-input"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="task-form-group">
              <label className="task-form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="task-form-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="task-form-group">
            <label className="task-form-label">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="task-form-input"
            />
          </div>

          <div className="task-form-group">
            <label className="task-form-label">Categories</label>
            <div className="task-form-categories-container">
              {categories.map(category => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className="task-form-category-chip"
                  style={{
                    backgroundColor: selectedCategories.includes(category.id) 
                      ? category.color 
                      : '#f1f5f9',
                    color: selectedCategories.includes(category.id) ? 'white' : '#64748b',
                    border: selectedCategories.includes(category.id)
                      ? 'none'
                      : '1px solid #e2e8f0'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tag size={14} />
                  {category.name}
                </motion.button>
              ))}
              {!showNewCategory ? (
                <motion.button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="task-form-add-category-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + New Category
                </motion.button>
              ) : (
                <div className="task-form-new-category-input">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="task-form-category-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateCategory()
                      } else if (e.key === 'Escape') {
                        setShowNewCategory(false)
                        setNewCategoryName('')
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="task-form-save-category"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                    }}
                    className="task-form-cancel-category"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <motion.div 
              className="task-form-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="task-form-actions">
            <motion.button 
              type="button" 
              onClick={onClose} 
              className="task-form-cancel-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            {task && (
              <motion.button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="task-form-cancel-button task-form-delete-button"
                disabled={deleting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={17} /> Delete
              </motion.button>
            )}
            <motion.button 
              type="submit" 
              disabled={loading} 
              className="task-form-submit-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="task-delete-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                className="task-delete-modal"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="task-delete-icon">
                  <Trash2 size={32} color="#ef4444" />
                </div>
                <h3 className="task-delete-title">Delete Task?</h3>
                <p className="task-delete-text">Are you sure you want to delete this task? This action cannot be undone.</p>
                <div className="task-delete-actions">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="task-delete-cancel-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    className="task-delete-confirm-btn"
                    disabled={deleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {deleting ? 'Deleting...' : 'Delete Task'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

