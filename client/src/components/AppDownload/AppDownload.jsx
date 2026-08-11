import React from 'react'
import { assets } from '../../assets/assets'
import "./AppDownload.css"
const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
        <p>For a smoother experience, download <br /> the Feasto app</p>
        <div className="app-download-plaforms">
            <img src={assets.play_store} alt="Google Play Store" loading="lazy" decoding="async" />
            <img src={assets.app_store} alt="Apple App Store" loading="lazy" decoding="async" />
        </div>
    </div>
  )
}

export default AppDownload
