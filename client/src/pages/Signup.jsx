

import React, { useState } from 'react'
import { useNavigate, replace } from 'react-router-dom'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  // const [error, setError] = useState('')
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
    // setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // setError(data.message || 'Signup failed')
        toast.error(`${data.message || 'Signup failed'}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          delay: 0,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        return
      }

      // Don't auto-login, redirect to login page
      // alert('Account created successfully! Please login.')
      toast.info(`Account created successfully! Please login.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        delay: 0,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setTimeout(() => {
        navigate('/login', replace);
      }, 2200);

    } catch (err) {
      // setError('Error connecting to server: ' + err.message)
      toast.error(`Error connecting to server: + ${err.message}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        delay: 0,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>
      {/* {error && <p>{error}</p>} */}
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
        <button onClick={() => navigate('/login')}>
          Login
        </button>
      </p>
    </div>
  )
}