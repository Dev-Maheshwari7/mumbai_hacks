// import Login from './pages/Login.jsx'
// import Aiagent from './pages/Aiagent.jsx'   
// import Homepage from './pages/Homepage.jsx'
// import React from 'react'
// import Signup from './pages/Signup.jsx'
// import { Route,Routes  } from 'react-router-dom'
// import { useUser } from '@clerk/clerk-react'

// const App = () => { 
//   const {isLoaded,isSignedIn} = useUser()

//   if (!isLoaded) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>  
//       <Routes>
//         <Route path="/" element={!isSignedIn ? <Login /> : <Homepage />} />
//         <Route path="/signup" element={<Signup />} />
//         {/* <Route path="/:userId" element={<Homepage />} /> */}
//         <Route path="/aiagent" element={<Aiagent />} />
//       </Routes>
//     </>
//   )     
// }

// export default App
import Trending from "./pages/Trending.jsx";
import Login from './pages/Login.jsx'
import Aiagent from './pages/Aiagent.jsx'
import Homepage from './pages/Homepage.jsx'
import Profile from './pages/Profile.jsx'
import React, { useState, useEffect } from 'react'
import Signup from './pages/Signup.jsx'
import { Route, Routes, Navigate } from 'react-router-dom'
import { credentialsContext } from './context/context';

const App = () => {
  const [userName, setuserName] = useState("")
  const [email, setemail] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsSignedIn(!!token)
    setIsLoaded(true)
  }, [])

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsSignedIn(true)
    }
  }

  const handleSignupSuccess = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsSignedIn(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsSignedIn(false)
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // used the react icons so installed it from npm
  //installed the uuid from npm
  
  return (
    <>
      <credentialsContext.Provider value={{ email, setemail,userName, setuserName }}>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />
          <Route
            path="/"
            element={
              isSignedIn ? (
                <Homepage onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isSignedIn ? (
                <Profile onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/aiagent"
            element={
              isSignedIn ? (
                <Aiagent />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/trending"
            element={
              isSignedIn ? (
                <Trending />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={isSignedIn ? "/" : "/login"} replace />} />
        </Routes>
        </credentialsContext.Provider>
      </>
      )     
}

      export default App