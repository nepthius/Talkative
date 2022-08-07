import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState, useEffect  } from "react";
import { auth } from "../firebase"

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState()

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
        })

        return unsubscribe
    }, [])

    auth.onAuthStateChanged(user => {
        setCurrentUser(user)
    })

    const value = {
        currentUser,
        signup
    }
    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}