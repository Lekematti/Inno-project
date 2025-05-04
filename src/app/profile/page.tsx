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
    <div className="dashboard-container">
      <Header />
      <Container fluid className="mt-4 px-4">
        <Row>
          <Col lg={12} className="mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-start border-5 border-success">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="h3 mb-0">
                  Welcome, {userData?.name ?? userData?.email ?? 'User'}
                </h1>
                <Button
                  onClick={handleLogout}
                  variant="outline-danger"
                  size="sm"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Log out
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={4} md={6} className="mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">
                  <i className="bi bi-image me-2"></i>
                  Upload Website Images
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="formFile" className="form-label">
                      Add png or jpg files:
                    </label>
                    <div className="input-group">
                      <input
                        className="form-control"
                        type="file"
                        id="formFile"
                        onChange={handleFileChange}
                      />
                    </div>
                    <small className="text-muted">Max file size: 5MB</small>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={!selectedFile}
                  >
                    <i className="bi bi-cloud-arrow-up me-1"></i>
                    Upload Image
                  </Button>
                </form>
              </div>
            </div>
          </Col>

          <Col lg={8} md={6} className="mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-globe me-2"></i>
                  Your Generated Websites
                </h5>
                <span className="badge bg-success rounded-pill">
                  {websiteFolders.length}
                </span>
              </div>
              <div className="card-body p-0">
                {websiteFolders.length === 0 ? (
                  <div className="text-center p-4">
                    <i
                      className="bi bi-folder-x text-muted"
                      style={{ fontSize: '2rem' }}
                    ></i>
                    <p className="text-muted mt-2">
                      No generated websites found.
                    </p>
                  </div>
                ) : (
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
                  >
                    {websiteFolders.map((folder) => (
                      <div key={folder.name} className="list-group-item">
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() =>
                            setExpanded(
                              expanded === folder.name ? null : folder.name
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <i
                            className={`bi ${
                              expanded === folder.name
                                ? 'bi-folder2-open'
                                : 'bi-folder'
                            } me-2 text-warning`}
                          ></i>
                          <span className="fw-bold">{folder.name}</span>
                          <i
                            className={`bi ${
                              expanded === folder.name
                                ? 'bi-chevron-down'
                                : 'bi-chevron-right'
                            } ms-auto`}
                          ></i>
                        </div>

                        {expanded === folder.name && (
                          <div className="ms-4 mt-2">
                            <div className="mb-2">
                              <span className="text-muted small">
                                HTML Files:
                              </span>
                              <ul className="list-unstyled ms-3 mb-0">
                                {folder.html.map((file: string) => (
                                  <li key={file} className="mb-1">
                                    <a
                                      href={`/gen_comp/${folder.name}/${file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
                                      <i className="bi bi-file-earmark-code me-1 text-primary"></i>
                                      {file}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {folder.images.length > 0 && (
                              <div>
                                <span className="text-muted small">
                                  Images:
                                </span>
                                <ul className="list-unstyled ms-3 mb-0">
                                  {folder.images.map((img: string) => (
                                    <li key={img} className="mb-1">
                                      <a
                                        href={`/gen_comp/${folder.name}/${img}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none"
                                      >
                                        <i className="bi bi-file-earmark-image me-1 text-success"></i>
                                        {img}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
