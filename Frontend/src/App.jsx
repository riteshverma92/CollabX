import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landingpage.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import { ToastContainer } from 'react-toastify'
import OtpVerfication from './pages/OtpVerfication.jsx'
import Forgotpassword from './pages/Forgotpassword.jsx'
import VerifyOtp from './pages/VerifyOtpForgot.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'
import Dashboard from './pages/dashboard.jsx'
import RoomPage from './pages/room-page.jsx'


function App() {
  return (
    <div>

      <ToastContainer></ToastContainer>
      <Routes>
        <Route path="/" element ={<LandingPage></LandingPage>}/>
        <Route path='/login' element ={<Login></Login>}/>
        <Route path='/register' element ={<Register></Register>}/>
        <Route path='/otp-verification' element={<OtpVerfication></OtpVerfication>}/>
        <Route path='forgot-password' element={<Forgotpassword></Forgotpassword>}/>
        <Route path='/verify-otp-forgot-password' element={<VerifyOtp></VerifyOtp>}/>
        <Route element={<ProtectedRoute/>}>
           <Route path="/dashboard" element={<Dashboard/>} />
           <Route path="/room/:roomId" element={<RoomPage />} />

        </Route>
      </Routes>
    </div>
  )
}

export default App