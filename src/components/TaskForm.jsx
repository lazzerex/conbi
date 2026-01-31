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

      // Delete existing task_categories
      await supabase
        .from('task_categories')
        .delete()
        .eq('task_id', taskId)

      // Insert new task_categories
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
      style={styles.overlay} 
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{task ? 'Edit Task' : 'New Task'}</h2>
          <motion.button 
            onClick={onClose} 
            style={styles.closeButton}
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter task title"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ ...styles.input, resize: 'vertical' }}
              placeholder="Enter task description"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Categories</label>
            <div style={styles.categoriesContainer}>
              {categories.map(category => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  style={{
                    ...styles.categoryChip,
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
                  style={styles.addCategoryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + New Category
                </motion.button>
              ) : (
                <div style={styles.newCategoryInput}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    style={styles.categoryInput}
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
                    style={styles.saveCategory}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                    }}
                    style={styles.cancelCategory}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <motion.div 
              style={styles.error}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div style={styles.actions}>
            <motion.button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            {task && (
              <motion.button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ ...styles.cancelButton, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #fee2e2' }}
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
              style={styles.submitButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              style={styles.deleteOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                style={styles.deleteModal}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.deleteIcon}>
                  <Trash2 size={32} color="#ef4444" />
                </div>
                <h3 style={styles.deleteTitle}>Delete Task?</h3>
                <p style={styles.deleteText}>Are you sure you want to delete this task? This action cannot be undone.</p>
                <div style={styles.deleteActions}>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={styles.deleteCancelBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    style={styles.deleteConfirmBtn}
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

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px 32px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  closeButton: {
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#64748b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    textTransform: 'capitalize',
  },
  input: {
    padding: '14px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  error: {
    padding: '14px 16px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '12px',
    fontSize: '14px',
    border: '1px solid #fee2e2',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '12px',
  },
  cancelButton: {
    padding: '12px 28px',
    background: 'none',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 28px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
  },
  categoriesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '4px 0',
  },
  categoryChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  addCategoryButton: {
    padding: '8px 14px',
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: '1px dashed #4f46e5',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  newCategoryInput: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  categoryInput: {
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    fontWeight: '500',
    minWidth: '150px',
  },
  saveCategory: {
    padding: '8px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelCategory: {
    padding: '8px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  deleteOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  deleteModal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
  },
  deleteIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  deleteTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
  },
  deleteText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  deleteActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  deleteCancelBtn: {
    padding: '12px 28px',
    background: 'none',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteConfirmBtn: {
    padding: '12px 28px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
  },
}
