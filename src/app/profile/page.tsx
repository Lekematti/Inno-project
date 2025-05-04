'use client'

import { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Header } from '@/components/Header'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { postBlob } from '../../functions/blobStorage'
import { WebsiteFolder } from '@/types/formData'

// Main Profile Page Component
export default function ProfilePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  interface UserData {
    name?: string
    email?: string
    id?: string
  }

  const [userData, setUserData] = useState<UserData | null>(null)

  const [websiteFolders, setWebsiteFolders] = useState<WebsiteFolder[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
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

  useEffect(() => {
    fetch('/api/user-websites')
      .then((res) => res.json())
      .then((data) => setWebsiteFolders(data.folders ?? []))
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
        <Container className="mt-8 my-3 p-3 ">
          <Row>
            <Col className="  ">
              <div className="my-2 h-100 p-2 d-flex justify-content-center">
                <LoginForm />
              </div>
            </Col>
            <Col>
              <div className="my-2 h-100 p-2 d-flex justify-content-center">
                <RegisterForm />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]) // Store selected file in state
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Submit a file!')
      return
    }
    postBlob(selectedFile)
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
                Welcome, {userData?.name ?? userData?.email ?? 'User'}
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Log out
            </Button>
          </Col>
        </Row>
        <Row className=" row-cols-1 justify-content-center">
          <Col className="my-5 text-center col-4">
            <div>
              <h1>Add images to use on your website:</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="formFile" className="form-label">
                    Add png or jpg files:
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="formFile"
                    onChange={handleFileChange}
                  />
                </div>
                <Button type="submit" className="btn btn-primary">
                  Submit image
                </Button>
              </form>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8}>
            <h2 className="mb-3">Your Generated Websites</h2>
            <div
              style={{
                maxHeight: 300,
                overflowY: 'auto',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 16,
                background: '#fafbfc',
              }}
            >
              {websiteFolders.length === 0 ? (
                <div className="text-muted">No generated websites found.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {websiteFolders.map((folder) => (
                    <li key={folder.name} style={{ marginBottom: 12 }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                        onClick={() =>
                          setExpanded(
                            expanded === folder.name ? null : folder.name
                          )
                        }
                      >
                        {folder.name}
                      </button>
                      {expanded === folder.name && (
                        <ul style={{ marginTop: 8, marginLeft: 16 }}>
                          {folder.html.map((file: string) => (
                            <li key={file}>
                              <a
                                href={`/gen_comp/${folder.name}/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#2563eb',
                                  textDecoration: 'underline',
                                }}
                              >
                                {file}
                              </a>
                            </li>
                          ))}
                          {folder.images.length > 0 && (
                            <li>
                              <strong>Images:</strong>
                              <ul>
                                {folder.images.map((img: string) => (
                                  <li key={img}>
                                    <a
                                      href={`/gen_comp/${folder.name}/${img}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: '#2563eb',
                                        textDecoration: 'underline',
                                      }}
                                    >
                                      {img}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
