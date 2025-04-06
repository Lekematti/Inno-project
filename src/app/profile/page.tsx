// app/profile/page.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { signIn } from '../context/AuthContext'

// Header component (simplified for this example)
const Header = () => {
  return (
    <div className="p-4 bg-gray-100 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">My App</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/profile" className="hover:underline">
                Profile
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

// Login Form Component
const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Authentication error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && (
        <div className="bg-red-50 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>
    </div>
  )
}

// Register Form Component
const RegisterForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess('Account created successfully! You can now log in.')
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      {error && (
        <div className="bg-red-50 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-3 rounded mb-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          {loading ? 'Creating account...' : 'Register'}
        </Button>
      </form>
    </div>
  )
}

// Main Profile Page Component
export default function ProfilePage() {
  const { data: session, status } = useSession()

  // Show loading state when checking authentication
  if (status === 'loading') {
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
  if (!session?.user) {
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
                Welcome, {session.user.name || session.user.email}
              </h1>
              <div className="mb-4">
                <p>
                  <strong>Email:</strong> {session.user.email}
                </p>
                <p>
                  <strong>User ID:</strong> {session.user.id}
                </p>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: '/profile' })}
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
