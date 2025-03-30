'use client'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { Col, Container, Row, Button } from 'react-bootstrap'
import RegisterForm from './../../components/RegisterForm'
import LoginForm from '@/components/LoginForm'
import { useAuth } from '../context/AuthContext'

// User profile page or register/login page if user is not found in auth

const registerView = () => {
  return (
    <div>
      <Header />
      <div>
        <Container>
          <Row style={{ margin: 10 }}>
            <Col style={{ textAlign: 'center' }}>
              <div className="my-2">
                <LoginForm />
              </div>
              <div className="my-2">
                <RegisterForm />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isAuth, setIsAuth] = useState(false)

  if (!user) {
    return registerView()
  } else {
    return (
      <div>
        <Header />
        <h1>Welcome, {user.name}</h1>
        <Button onClick={logout}> Log out</Button>
      </div>
    )
  }
}
