import Login from './pages/Login.jsx'
import Aiagent from './pages/Aiagent.jsx'   
import Homepage from './pages/Homepage.jsx'
import React from 'react'
import Signup from './pages/Signup.jsx'
import { Route,Routes  } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const App = () => { 
  const {isLoaded,isSignedIn} = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>  
      <Routes>
        <Route path="/" element={!isSignedIn ? <Login /> : <Homepage />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/:userId" element={<Homepage />} /> */}
        <Route path="/aiagent" element={<Aiagent />} />
      </Routes>
    </>
  )     
}

export default App