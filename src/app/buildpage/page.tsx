'use client'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { Col, Row, Container, Form, Button } from 'react-bootstrap'
import { AiGenComponent } from './../../components/AiGenComponent'

export default function buildPage() {
  const [isReady, setIsReady] = useState(false)
  return (
    <div>
      <Header />
      <Container style={{ margin: 0 }} fluid>
        <Row>
          <Col md={4}>
            <Form>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="businessType">Choose a template</label>
                <select className="form-control" id="businessType">
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
                  className="form-control"
                  type="text"
                  placeholder="Osoite 10, 00100 Helsinki"
                  id="input-1"
                />
              </div>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="input-2">Phone</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="+358 123456789"
                  id="input-2"
                />
              </div>
              <div
                className="form-group"
                style={{ marginTop: 5, marginBottom: 5 }}
              >
                <label htmlFor="input-3">Email</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="mail@example.com"
                  id="input-3"
                />
              </div>
              <Button
                style={{ marginTop: 5, marginBottom: 5 }}
                onClick={() => {
                  setIsReady(!isReady)
                }}
              >
                Submit
              </Button>
            </Form>
          </Col>
          <Col>{AiGenComponent(isReady)}</Col>
        </Row>
      </Container>
    </div>
  )
}
