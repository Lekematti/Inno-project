import { Header } from '@/components/Header'
import { Col, Row, Container, Form, Button } from 'react-bootstrap'

export default function buildPage() {
  return (
    <div>
      <Header />
      <Container>
        <Row>
          <Col>
            <Form>
              <div className="form-group">
                <label htmlFor="businessType">Choose a template</label>
                <select className="form-control" id="businessType">
                  <option>Restaurant</option>
                  <option>Logistics</option>
                  <option>Professional</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="input-1">Address</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Osoite 10, 00100 Helsinki"
                  id="input-1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="input-2">Phone</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="+358 123456789"
                  id="input-2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="input-3">Email</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="mail@example.com"
                  id="input-3"
                />
              </div>
              <Button>Submit</Button>
            </Form>
          </Col>
          <Col>website</Col>
        </Row>
      </Container>
    </div>
  )
}
