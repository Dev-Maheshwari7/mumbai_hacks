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
// import React, { useState } from 'react'
// import { replace, useNavigate } from 'react-router-dom'
// import { ToastContainer, toast, Bounce } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function Login({ onLoginSuccess }) {
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })
//   // const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     // setError('')

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         // setError(data.message || 'Login failed')
//         toast.error(`${data.message || "Login failed"}`, {
//           position: "top-right",
//           autoClose: 2000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           delay: 0,
//           draggable: true,
//           progress: undefined,
//           theme: "light",
//           transition: Bounce,
//         });

//         return
//       }

//       localStorage.setItem('token', data.token)
//       // console.log('Token saved:', data.token)
//       setFormData({ email: '', password: '' })
//       onLoginSuccess()
//       toast.success("Logged-in Successfully", {
//         position: "top-right",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         delay: 0,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//         transition: Bounce,
//       });
//       setTimeout(() => {
//         navigate('/',replace)
//       }, 2200);
//     } catch (err) {
//       toast.error(`Error connecting to server: + ${err.message}`, {
//         position: "top-right",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         delay: 0,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//         transition: Bounce,
//       });
//       // setError('Error connecting to server: ' + err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div>
//       <h2>Login</h2>
//       {/* {error && <p>{error}</p>} */}
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={formData.email}
//         onChange={handleChange}
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         value={formData.password}
//         onChange={handleChange}
//       />
//       <button onClick={handleSubmit} disabled={loading}>
//         {loading ? 'Logging in...' : 'Login'}
//       </button>
//       <p>
//         Don't have an account?{' '}
//         <button onClick={() => navigate('/signup')}>
//           Sign Up
//         </button>
//       </p>
//     </div>
//   )
// }


import React, { useState } from 'react';
import { useNavigate,replace } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // setError(data.message || 'Login failed');
        toast.error(`${data.message || "Login failed"}`, {
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
        return;
      }

      localStorage.setItem('token', data.token);
      setFormData({ email: '', password: '' });
      onLoginSuccess();
      toast.success("Logged-in Successfully", {
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
        navigate('/',replace)
      }, 2200);
    } catch (err) {
      // setError('Error connecting to server: ' + err.message);
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
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        {/* Left Side - Illustration with Welcome Back */}
        <div style={styles.leftSide}>
          {/* Wave shapes at random positions */}
          <div style={{...styles.wave, ...styles.wave1}}></div>
          <div style={{...styles.wave, ...styles.wave2}}></div>
          <div style={{...styles.wave, ...styles.wave3}}></div>
          <div style={{...styles.wave, ...styles.wave4}}></div>
          <div style={{...styles.wave, ...styles.wave5}}></div>
          <div style={{...styles.wave, ...styles.wave6}}></div>
          <div style={{...styles.wave, ...styles.wave7}}></div>
          
          {/* Random Dots */}
          <div style={styles.dotsContainer}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>
          
          <div style={styles.welcomeText}>
            <h1 style={styles.welcomeTitle}>Welcome back!</h1>
            <p style={styles.welcomeSubtitle}>
              You can sign in to access with your existing profile
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={styles.rightSide}>
          <span 
            style={styles.backArrow}
            onClick={() => navigate(-1)}
          >
            ←
          </span>
          
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>
            Please enter your login information<br/>
            or <span 
              style={styles.link}
              onClick={() => navigate('/signup')}
            >
              click here to registration
            </span>
          </p>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.rememberMe}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="remember" style={styles.checkboxLabel}>
                Remember me
              </label>
            </div>
            <button 
              type="submit" 
              style={{
                ...styles.loginBtn,
                ...(loading ? styles.loginBtnDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px'
  },
  mainCard: {
    display: 'flex',
    width: '100%',
    maxWidth: '1000px',
    background: 'white',
    borderRadius: '30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    minHeight: '600px'
  },
  leftSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #22c55e 100%)',
    padding: '60px 40px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wave: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.5
  },
  wave1: {
    width: '280px',
    height: '280px',
    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
    top: '-80px',
    right: '-60px'
  },
  wave2: {
    width: '180px',
    height: '180px',
    background: 'linear-gradient(135deg, #86efac, #4ade80)',
    bottom: '40px',
    left: '-40px'
  },
  wave3: {
    width: '140px',
    height: '140px',
    background: 'linear-gradient(135deg, #bef264, #a3e635)',
    top: '150px',
    left: '30px'
  },
  wave4: {
    width: '160px',
    height: '160px',
    background: 'linear-gradient(135deg, #fde047, #facc15)',
    top: '60px',
    right: '120px'
  },
  wave5: {
    width: '110px',
    height: '110px',
    background: 'linear-gradient(135deg, #67e8f9, #22d3ee)',
    bottom: '10px',
    right: '60px'
  },
  wave6: {
    width: '200px',
    height: '200px',
    background: 'linear-gradient(135deg, #34d399, #10b981)',
    top: '280px',
    right: '-50px'
  },
  wave7: {
    width: '90px',
    height: '90px',
    background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
    bottom: '150px',
    left: '80px'
  },
  dotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  },
  dot: {
    position: 'absolute',
    width: '3px',
    height: '3px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '50%'
  },
  welcomeText: {
    position: 'relative',
    zIndex: 10,
    color: 'white',
    textAlign: 'center'
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '15px',
    margin: '0 0 15px 0'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    opacity: 0.95,
    margin: 0,
    lineHeight: '1.6'
  },
  rightSide: {
    flex: 1,
    padding: '50px 60px',
    background: 'white'
  },
  backArrow: {
    color: '#9ca3af',
    fontSize: '24px',
    cursor: 'pointer',
    marginBottom: '30px',
    display: 'inline-block'
  },
  title: {
    fontSize: '32px',
    color: '#1f2937',
    marginBottom: '10px',
    margin: '0 0 10px 0'
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '30px'
  },
  link: {
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  errorBox: {
    marginBottom: '20px',
    padding: '12px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '10px'
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center',
    margin: 0
  },
  formGroup: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box'
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '8px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    margin: 0,
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280'
  },
  loginBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(90deg, #22c55e 0%, #14b8a6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  loginBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};
