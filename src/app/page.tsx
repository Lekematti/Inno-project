import { Header } from '@/components/Header'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { AiGenComponent } from '../components/AiGenComponent'

export default function Home() {
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
            by artificial intelligence. Whether you're a small business owner,
            entrepreneur, or designer, our AI-driven platform makes building
            stunning, responsive, and fully customizable websites effortless—no
            coding required.
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
          <Container>
            <Row>
              <Col style={{ height: '250px' }}>
                <div style={{ backgroundColor: 'blue', height: '100%' }}>
                  <Button>Cool button</Button>
                </div>
              </Col>
              <Col>
                <div style={{ backgroundColor: 'red', height: '100%' }}>
                  <AiGenComponent />
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  )
}
