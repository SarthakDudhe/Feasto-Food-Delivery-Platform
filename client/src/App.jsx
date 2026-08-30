import { useEffect, useState, lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

const Cart = lazy(() => import('./pages/Cart/Cart'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder/PlaceOrder'))
const Verify = lazy(() => import('./pages/Verify/Verify'))
const MyOrder = lazy(() => import('./pages/MyOrder/MyOrder'))
const TrackOrder = lazy(() => import('./pages/TrackOrder/TrackOrder'))
const HealthPlanner = lazy(() => import('./pages/HealthPlanner/HealthPlanner'))

const RedirectToRider = ({ path = "" }) => {
  useEffect(() => {
    window.location.href = `http://localhost:5175${path}`;
  }, [path]);
  return null;
};

function App() {
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('login-modal-open', showLogin)

    return () => {
      document.body.classList.remove('login-modal-open')
    }
  }, [showLogin])

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Suspense fallback={
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ff5a3d',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        }>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/health-planner' element={<HealthPlanner />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/order' element={<PlaceOrder />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/myorders' element={<MyOrder />} />
            <Route path='/track-order/:orderId' element={<TrackOrder />} />
            <Route path='/rider-signup' element={<RedirectToRider path="/register" />} />
            <Route path='/rider' element={<RedirectToRider path="/login" />} />
            <Route path='/rider-dashboard' element={<RedirectToRider path="/" />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  )
}


export default App
