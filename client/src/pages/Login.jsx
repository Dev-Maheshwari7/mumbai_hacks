// import React from 'react'
// import { SignIn } from '@clerk/clerk-react';
// const Login = () => {
//   return (
//     <div className='min-h-screen flex flex-col md:flex-row'>Login Page
//     {/* Add this */}
//       <SignIn />
//     </div>
//   )
// }

// export default Login
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ 
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('token', data.token)
      // console.log('Token saved:', data.token)
      setFormData({ email: '', password: '' })
      onLoginSuccess()
      navigate('/')
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </p>
    </div>
  )
}