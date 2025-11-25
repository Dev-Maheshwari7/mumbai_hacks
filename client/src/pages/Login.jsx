import React from 'react'
import { SignIn } from '@clerk/clerk-react';
const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>Login Page
    {/* Add this */}
      <SignIn />
    </div>
  )
}

export default Login