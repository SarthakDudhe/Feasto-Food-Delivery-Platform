import React, { useContext, useEffect, useState } from 'react'
import "./LoginPopup.css"
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
const LoginPopup = ({setShowLogin}) => {

const{url,token,setToken} = useContext(StoreContext)

const[currentState,setCurrentState] = useState("Sign Up")
const [data,setData] = useState({
  name:"",
  email:"",
  password:""
})

const onChangeHandler=(event)=>{
  const name = event.target.name
  const value = event.target.value
  setData(data =>({...data,[name]:value}))
}

const onLogin = async(event) =>{
event.preventDefault()

let newURL = url
if (currentState == "Login") {
  newURL += "/api/user/login"
}
else{
  newURL +="/api/user/register"
}
const response = await axios.post(newURL,data);


if (response.data.success) {
  setToken(response.data.token);
  console.log(response.data.token)
  localStorage.setItem("token",response.data.token)
  setShowLogin(false)
}else{
  alert(response.data.message)
}

}



 

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className="login-popup-title">
            <h2>{currentState}</h2>
            <img src={assets.cross_icon} onClick={()=>setShowLogin(false)} alt="" />
        </div>
        <div className="login-popup-inputs">
            {
                currentState === "Login"? <></>:<input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder='Your name' required/>
            }
            
            <input onChange={onChangeHandler} value={data.email} type="email" name="email" placeholder='Your email' required />
            <input onChange={onChangeHandler} value={data.password} type="password" name="password" placeholder='Password'  required />
        </div>
        <button type='submit' >{currentState ==="Sign Up" ? "Create account" : "Login"}</button>
        <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, i agree to the terms of use & privacy policy. </p>
        </div>
        {
            currentState ==="Sign Up" ?   <p>Already have an account? <span onClick={()=>setCurrentState("Login")}>Login here</span></p> : <p>Create a new account? <span onClick={()=>setCurrentState("Sign Up")}>Click here</span></p>
        }
       
        
      </form>
    </div>
  )
}

export default LoginPopup