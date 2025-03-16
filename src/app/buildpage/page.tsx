'use client'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { Col, Row, Container, Form, Button } from 'react-bootstrap'
import { AiGenComponent } from './../../components/AiGenComponent'
import _ from 'lodash'

export default function buildPage() {
  const [formData, setFormData] = useState({})
  const [isReady, setIsReady] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    setIsReady(!isReady)
    console.log(formData)
  }

  const noPage = () => {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Your website will appear here
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div style={{ width: '100%', textAlign: 'center', margin: 10 }}>
        <h1>Welcome to the Business Website Generator!</h1>
      </div>
      <Container style={{ margin: 10, padding: 10, height: '100%' }} fluid>
        <Row style={{ height: '75vh', maxHeight: '80vh' }}>
          <Col md={4}>
            <Form style={{ width: '100%' }}>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="businessType">Choose a template</label>
                <select
                  className="form-control"
                  id="businessType"
                  onChange={handleChange}
                  name="businessType"
                >
                  <option>Restaurant</option>
                  <option>Logistics</option>
                  <option>Professional</option>
                </select>
              </div>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="input-1">Address</label>
                <input
                  name="address"
                  className="form-control"
                  type="text"
                  placeholder="Osoite 10, 00100 Helsinki"
                  id="input-1"
                  onChange={handleChange}
                />
              </div>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="input-2">Phone</label>
                <input
                  name="phone"
                  className="form-control"
                  type="text"
                  placeholder="+358 123456789"
                  id="input-2"
                  onChange={handleChange}
                />
              </div>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="input-3">Email</label>
                <input
                  name="email"
                  className="form-control"
                  type="email"
                  placeholder="mail@example.com"
                  id="input-3"
                  onChange={handleChange}
                />
              </div>
              <Button
                style={{ marginTop: 5, marginBottom: 5 }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Form>
          </Col>
          <Col>
            <div
              style={{
                backgroundColor: 'lightblue',
                padding: 5,
                margin: 5,
                height: '100%',
                maxHeight: '75vh',
                borderRadius: 5,
                borderStyle: 'solid',
                borderColor: 'gray',
                overflow: 'scroll',
              }}
            >
              {isReady ? AiGenComponent(isReady) : noPage()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
