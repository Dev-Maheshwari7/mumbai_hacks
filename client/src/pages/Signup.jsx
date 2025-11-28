

// import React, { useState } from 'react'
// import { useNavigate, replace } from 'react-router-dom'
// import { ToastContainer, toast, Bounce } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function Signup({ onSignupSuccess }) {
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     username: '',
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
//       const response = await fetch('http://localhost:5000/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         // setError(data.message || 'Signup failed')
//         toast.error(`${data.message || 'Signup failed'}`, {
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

//       // Don't auto-login, redirect to login page
//       // alert('Account created successfully! Please login.')
//       toast.info(`Account created successfully! Please login.`, {
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
//         navigate('/login', replace);
//       }, 2200);

//     } catch (err) {
//       // setError('Error connecting to server: ' + err.message)
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
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div>
//       <h2>Sign Up</h2>
//       {/* {error && <p>{error}</p>} */}
//       <input
//         type="text"
//         name="username"
//         placeholder="Username"
//         value={formData.username}
//         onChange={handleChange}
//       />
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
//         {loading ? 'Signing up...' : 'Sign Up'}
//       </button>
//       <p>
//         Already have an account?{' '}
//         <button onClick={() => navigate('/login')}>
//           Login
//         </button>
//       </p>
//     </div>
//   )
// }



// New UI
import React, { useState } from 'react';
import { useNavigate, replace } from 'react-router-dom'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  // const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // setError(data.message || 'Signup failed');
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
        return;
      }

      // Successful signup, show message and redirect
      // setSuccessMessage('Account created successfully! Redirecting to login...');
      // Clear form after successful submission
      setFormData({ username: '', email: '', password: '' }); 
      
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
        if (onSignupSuccess) onSignupSuccess();
      }, 2200);
      // Navigate to login after a brief delay
      // setTimeout(() => {
      //   navigate('/login');
      //   if (onSignupSuccess) onSignupSuccess();
      // }, 1500);

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
      // We keep loading true briefly if redirecting, but reset if there's an immediate error
      if (!successMessage) setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        {/* Left Side - Illustration with Join Our Community */}
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
            <h1 style={styles.welcomeTitle}>Join Our Community!</h1>
            <p style={styles.welcomeSubtitle}>
              Create your profile today to unlock all amazing features.
            </p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div style={styles.rightSide}>
          <span 
            style={styles.backArrow}
            onClick={() => navigate(-1)}
          >
            ←
          </span>
          
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>
            Enter your details below<br/>
            or <span 
              style={styles.link}
              onClick={() => navigate('/login')}
            >
              click here to sign in
            </span>
          </p>

          {/* Error Message */}
          {/* {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )} */}

          {/* Success Message (Replaces alert) */}
          {successMessage && (
            <div style={styles.successBox}>
              <p style={styles.successText}>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.loginBtn,
                ...(loading ? styles.loginBtnDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign Up'}
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
    fontFamily: "'Inter', sans-serif",
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
    // Slightly different gradient for the signup side
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #3b82f6 100%)',
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
  // Slightly adjusted wave colors for the new gradient
  wave1: {
    width: '280px',
    height: '280px',
    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    top: '-80px',
    right: '-60px'
  },
  wave2: {
    width: '180px',
    height: '180px',
    background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
    bottom: '40px',
    left: '-40px'
  },
  wave3: {
    width: '140px',
    height: '140px',
    background: 'linear-gradient(135deg, #34d399, #10b981)',
    top: '150px',
    left: '30px'
  },
  wave4: {
    width: '160px',
    height: '160px',
    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
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
    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
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
  successBox: { // New style for success message
    marginBottom: '20px',
    padding: '12px',
    background: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px'
  },
  successText: {
    color: '#059669',
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
  loginBtn: {
    width: '100%',
    padding: '16px',
    // Swapped gradient colors to make it look a bit different from login
    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', 
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