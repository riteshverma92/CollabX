import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landingpage.jsx'
import Dashboard from './pages/dashboard.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import { ToastContainer } from 'react-toastify'
import OtpVerfication from './pages/OtpVerfication.jsx'
import Forgotpassword from './pages/Forgotpassword.jsx'
import VerifyOtp from './pages/VerifyOtpForgot.jsx'


function App() {
  return (
    <div>

      <ToastContainer></ToastContainer>
      <Routes>
        <Route path="/" element ={<LandingPage></LandingPage>}/>
        <Route path='/dashboard' element={<Dashboard></Dashboard>}/>
        <Route path='/login' element ={<Login></Login>}/>
        <Route path='/register' element ={<Register></Register>}/>
        <Route path='/otp-verification' element={<OtpVerfication></OtpVerfication>}/>
        <Route path='forgot-password' element={<Forgotpassword></Forgotpassword>}/>
        <Route path='/verify-otp-forgot-password' element={<VerifyOtp></VerifyOtp>}/>
      </Routes>
    </div>
  )
}

export default App