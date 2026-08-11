import React, { useState, lazy, Suspense } from 'react'
import "./Home.css"
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import { SectionSkeleton } from '../../components/Skeleton/Skeleton'
import { Link } from 'react-router-dom'

const AppDownload = lazy(() => import('../../components/AppDownload/AppDownload'))
const Foodbot = lazy(() => import('../Foodbot/Foodbot'))

const Home = () => {
      const [category,setCategory] = useState("All")
      const promoCodes = [
        { code: "WELCOME20", detail: "20% off up to $8" },
        { code: "FEASTO10", detail: "10% off up to $6" },
        { code: "SAVE5", detail: "$5 off orders $25+" },
        { code: "TASTE15", detail: "15% off lunch favorites" },
      ]
  return (
  
    <div>
        <section className="promo-banner">
          <div className="promo-banner-copy">
            <span className="promo-banner-eyebrow">Limited-time offers</span>
            <h3>Save with promo codes at checkout</h3>
            <p>Use these codes on your next order for instant savings. The discount appears automatically in your cart and checkout totals.</p>
          </div>
          <div className="promo-banner-carousel" aria-label="Available promo codes">
            <div className="promo-banner-viewport">
              <div className="promo-banner-track">
                {[0, 1].map((setIndex) => (
                  <div className="promo-banner-set" key={setIndex} aria-hidden={setIndex === 1}>
                    {promoCodes.map((promo) => (
                      <div className="promo-code-chip" key={`${setIndex}-${promo.code}`}>
                        <span className="promo-code-label">{promo.code}</span>
                        <small>{promo.detail}</small>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <Link to="/cart" className="promo-banner-cta">Try it in cart</Link>
          </div>
        </section>
        <Header/>
        <ExploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        
        {/* Health & Macro Assistant Feature Teaser Banner */}
        <section className="health-teaser-banner" style={{
          margin: '40px 0',
          padding: '28px 32px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #2a1810 0%, #1a100d 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 18px 40px rgba(32, 19, 15, 0.15)',
          border: '1px solid rgba(255, 90, 61, 0.3)'
        }}>
          <div style={{ maxWidth: '580px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255, 90, 61, 0.2)',
              color: '#ff7453',
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '999px',
              marginBottom: '10px'
            }}>🥗 New Feature: Smart Health & Macro Assistant</span>
            <h3 style={{ fontSize: '26px', margin: '0 0 8px 0', fontWeight: '800' }}>Eat Smart, Stay Fit with Precision Macros</h3>
            <p style={{ fontSize: '14px', color: '#e5d5ce', margin: 0, lineHeight: '1.5' }}>
              Track calories, filter high-protein meals, keto options, and build AI-suggested meal combos tailored to your exact daily targets.
            </p>
          </div>
          <Link to="/health-planner" style={{
            background: 'linear-gradient(135deg, #ff5a3d 0%, #ff7453 100%)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '999px',
            fontWeight: '700',
            fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 10px 22px rgba(255, 90, 61, 0.3)'
          }}>
            Explore Health Planner 🥗 →
          </Link>
        </section>

        <Suspense fallback={<SectionSkeleton />}>
          <AppDownload/>
        </Suspense>

        <Suspense fallback={null}>
          <Foodbot/>
        </Suspense>
    </div>
  )
}

export default Home
