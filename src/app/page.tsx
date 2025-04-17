'use client'
import { Header } from '@/components/Header'
import { Button } from 'react-bootstrap'
import { postBlob } from '../functions/blobStorage'
import { useState } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  return (
    <div>
      <Header />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ margin: 20 }}>
          <h1 style={{ color: '#84CC16' }}>
            Build Smarter, Faster, and Effortlessly with AI
          </h1>
          <p
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              display: 'flex',
              marginTop: '10px',
            }}
          >
            Welcome to AiWebsiteBuildr, the future of website creation powered
            by artificial intelligence. Whether you&apos;re a small business
            owner, entrepreneur, or designer, our AI-driven platform makes
            building stunning, responsive, and fully customizable websites
            effortless—no coding required.
          </p>
          <section
            style={{
              textAlign: 'left',
              justifyContent: 'center',
              display: 'flex',
              marginTop: '10px',
            }}
          >
            <ul>
              <li>
                <strong>✅ AI-Powered Design</strong> – Instantly generate
                beautiful, mobile-friendly websites in minutes.
              </li>
              <li>
                <strong>✅ Drag & Drop Simplicity</strong> – Customize layouts,
                colors, and content with ease.
              </li>
              <li>
                <strong>✅ SEO & Performance Optimized</strong> – Rank higher
                and load faster with built-in best practices.
              </li>
              <li>
                <strong>✅ Accessibility First</strong> – Our websites comply
                with WCAG standards, ensuring inclusivity for all users.
              </li>
              <li>
                <strong>✅ Secure & Scalable</strong> – From personal portfolios
                to eCommerce stores, we provide a solid foundation for growth.
              </li>
            </ul>
          </section>
          <p>✨ Get started today and let AI build your perfect website!</p>
        </div>
        <div id="Demo">
          <h1>Here you can demo the functions</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="formFile" className="form-label">
                Test file input
              </label>
              <input
                className="form-control"
                type="file"
                id="formFile"
                onChange={handleFileChange}
              />
            </div>
            <Button type="submit" className="btn btn-primary">
              Submit test
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
