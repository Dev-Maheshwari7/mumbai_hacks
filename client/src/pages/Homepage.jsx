import React, { useState, useEffect } from 'react'

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          localStorage.removeItem('token')
          onLogout()
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [onLogout])

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <nav>
        <h1>Social Media</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <div>
        <h1>Welcome to Social Media!</h1>
        {user && (
          <div>
            <p>Hello, {user.username}!</p>
            <p>Email: {user.email}</p>
          </div>
        )}
        <div>
          <p>Your social media feed goes here...</p>
        </div>
      </div>
    </div>
  )
}