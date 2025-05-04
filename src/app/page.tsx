'use client'
import { Header } from '@/components/Header'
import {
  FaMagic,
  FaMousePointer,
  FaSearch,
  FaUniversalAccess,
  FaShieldAlt,
} from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-vh-100 bg-light">
      <Header />

      {/* Hero Section */}
      <div className="container py-4 py-md-5">
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-4">
            Build <span className="text-success">Smarter</span>,{' '}
            <span className="text-success">Faster</span>, and{' '}
            <span className="text-success">Effortlessly</span> with AI
          </h1>

          <p className="lead mx-auto mb-4" style={{ maxWidth: '800px' }}>
            Welcome to AiWebsiteBuildr, the future of website creation powered
            by artificial intelligence. Our AI-driven platform makes building
            stunning websites effortless—no coding required.
          </p>

          <div className="mb-5">
            <button className="btn btn-success btn-lg shadow px-4 py-2">
              Start Building For Free
            </button>
            <p className="text-muted small mt-2">No credit card required</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-5">
          <h2 className="text-center fw-bold mb-5">
            Why Choose AiWebsiteBuildr?
          </h2>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <FeatureCard
              icon={<FaMagic className="text-success" size={24} />}
              title="AI-Powered Design"
              description="Instantly generate beautiful, mobile-friendly websites in minutes."
            />
            <FeatureCard
              icon={<FaMousePointer className="text-success" size={24} />}
              title="Easy to customize"
              description="Customize layouts, colors, and content with ease."
            />
            <FeatureCard
              icon={<FaSearch className="text-success" size={24} />}
              title="SEO & Performance Optimized"
              description="Rank higher and load faster with built-in best practices."
            />
            <FeatureCard
              icon={<FaUniversalAccess className="text-success" size={24} />}
              title="Accessibility First"
              description="Our websites comply with WCAG standards, ensuring inclusivity for all users."
            />
            <FeatureCard
              icon={<FaShieldAlt className="text-success" size={24} />}
              title="Secure & Scalable"
              description="From personal portfolios to eCommerce stores, we provide a solid foundation for growth."
            />
            <div className="bg-success text-white rounded p-4 d-flex flex-column justify-content-center">
              <h3 className="h5 fw-bold mb-3">Ready to get started?</h3>
              <p className="mb-4">
                Join thousands of satisfied customers building their dream
                websites today.
              </p>
              <button className="btn btn-light text-success fw-semibold py-2 px-4 align-self-start">
                Try it free →
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mt-5 bg-white rounded shadow p-4">
          <div className="d-flex flex-column align-items-center text-center">
            <div className="d-flex mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="bi bi-star-fill text-warning"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              ))}
            </div>
            <p className="text-muted mb-3">
              "I had my entire business website up and running in just one
              afternoon. The AI suggestions were spot on and saved me thousands
              in design costs."
            </p>
            <div>
              <p className="fw-medium">Sarah Johnson</p>
              <p className="text-muted small">Small Business Owner</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-5 text-center">
          <h2 className="h4 fw-bold mb-4">
            ✨ Get started today and let AI build your perfect website!
          </h2>
          <button className="btn btn-success btn-lg shadow px-4 py-2">
            Start Building Now
          </button>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded p-4 shadow-sm hover-shadow transition">
      <div className="d-flex align-items-center mb-3">
        {icon}
        <h3 className="h5 fw-semibold ms-2">{title}</h3>
      </div>
      <p className="text-muted">{description}</p>
    </div>
  )
}
