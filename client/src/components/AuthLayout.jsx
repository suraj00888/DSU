import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useLocation} from 'react-router-dom'

export default function AuthLayout({children, authentication = true}) {
    const navigate = useNavigate()
    const location = useLocation()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)
    
    console.log("AuthLayout: Path:", location.pathname, "Auth Status:", authStatus, "Auth Required:", authentication)

    useEffect(() => {
        // For routes that require authentication (home, events, etc.)
        if (authentication && !authStatus) {
            console.log("Not authenticated, redirecting to login from:", location.pathname)
            navigate("/login")
        } 
        // For routes that are for non-authenticated users (login, signup)
        else if (!authentication && authStatus) {
            console.log("Already authenticated, redirecting to home from:", location.pathname)
            navigate("/") // Redirect authenticated users to home instead of dashboard
        }
        setLoader(false)
    }, [authStatus, navigate, authentication, location.pathname])

    return loader ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">Loading...</h1>
        </div>
    ) : (
        <div className="w-full">{children}</div>
    )
}