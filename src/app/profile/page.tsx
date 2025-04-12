'use client'

import { useState, useEffect } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Header } from '@/components/Header'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

// Main Profile Page Component
export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  // Check for the authenticated cookie on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authCookie = Cookies.get('authenticated')
      setIsAuthenticated(authCookie === 'true')

      // If we have a user cookie, try to parse it
      const userCookie = Cookies.get('user')
      if (userCookie) {
        try {
          const parsedUser = JSON.parse(userCookie)
          setUserData(parsedUser)
        } catch (e) {
          console.error('Error parsing user cookie:', e)
        }
      }
    }

    checkAuth()
  }, [])

  // Handle logout
  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('authenticated')
    Cookies.remove('user')
    Cookies.remove('token')

    // Update state
    setIsAuthenticated(false)
    setUserData(null)

    // Refresh the page
    router.refresh()
  }

  // Show loading state when checking authentication
  if (isAuthenticated === null) {
    return (
      <div>
        <Header />
        <Container className="mt-8">
          <Row>
            <Col className="text-center">
              <p>Loading...</p>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // If not authenticated, show login/register forms
  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <Container className="mt-8">
          <Row>
            <Col className="text-center">
              <div className="my-4">
                <LoginForm />
              </div>
              <div className="my-4">
                <RegisterForm />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // If authenticated, show user profile
  return (
    <div>
      <Header />
      <Container className="mt-8">
        <Row>
          <Col className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-4">
                Welcome, {userData?.name || userData?.email || 'User'}
              </h1>
              <div className="mb-4">
                {userData?.email && (
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                )}
                {userData?.id && (
                  <p>
                    <strong>User ID:</strong> {userData.id}
                  </p>
                )}
              </div>
              <Button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Log out
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
