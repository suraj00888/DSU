import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useLocation} from 'react-router-dom'

export default function AuthLayout({children, authentication = true}) {
    const navigate = useNavigate()
    const location = useLocation()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        // For routes that require authentication (home, events, etc.)
        if (authentication && !authStatus) {
            navigate("/login")
        } 
        // For routes that are for non-authenticated users (login, signup)
        else if (!authentication && authStatus) {
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