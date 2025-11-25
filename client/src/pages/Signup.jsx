

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup({ onSignupSuccess }) {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Signup failed')
        return
      }

      localStorage.setItem('token', data.token)
      onSignupSuccess()
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <p>
        Already have an account?{' '}
        <button onClick={() => onSignupSuccess('toLogin')}>
          Login
        </button>
      </p>
    </div>
  )
}