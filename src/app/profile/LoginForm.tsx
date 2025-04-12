import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      console.log('login result', data)

      // Store user data in cookies (client-side)
      Cookies.set('user', JSON.stringify(data.user), {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      Cookies.set('authenticated', 'true', {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      // Force a full page reload instead of just refreshing the route data
      window.location.href = '/profile'
    } catch (error) {
      console.error('Authentication error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="m-2 p-2">
      <h2 className="font-bold mb-4">Login</h2>

      {error && (
        <div className="bg-red-50 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mx-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mx-2"
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

export default LoginForm
