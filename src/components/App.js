import React from "react";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import Signup from "./Signup";
import Login from "./Login"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

function App() {
    return (
        <Routes>
            <Route exact path="/signup" element={
                <AuthProvider>
                    <Container className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                        <div className="w-100" style={{maxWidth: '400px'}}>
                            <Signup />
                        </div>
                    </Container>
                </AuthProvider>} />
            <Route path="/login" element={
                <AuthProvider>
                    <Container className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                        <div className="w-100" style={{maxWidth: '400px'}}>
                            <Login />
                        </div>
                    </Container>
                </AuthProvider>} />
            <Route path="/yo" element={<h2>YO</h2>}/>
        </Routes>
    )
}

export default App