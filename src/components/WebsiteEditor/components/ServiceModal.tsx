import React from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

interface ServiceModalProps {
  showAddServiceModal: boolean
  setShowAddServiceModal: (show: boolean) => void
  serviceIcon: string
  setServiceIcon: (icon: string) => void
  serviceTitle: string
  setServiceTitle: (title: string) => void
  serviceDescription: string
  setServiceDescription: (description: string) => void
  addNewServiceItem: () => void
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  showAddServiceModal,
  setShowAddServiceModal,
  serviceIcon,
  setServiceIcon,
  serviceTitle,
  setServiceTitle,
  serviceDescription,
  setServiceDescription,
  addNewServiceItem,
}) => {
  return (
    <Modal
      show={showAddServiceModal}
      onHide={() => setShowAddServiceModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Service Icon</Form.Label>
          <Form.Select
            value={serviceIcon}
            onChange={(e) => setServiceIcon(e.target.value)}
          >
            <option value="bi-box-seam">Box (Warehousing)</option>
            <option value="bi-truck">Truck (Transport)</option>
            <option value="bi-globe">Globe (International)</option>
            <option value="bi-graph-up">Graph (Analytics)</option>
            <option value="bi-shield-check">Shield (Security)</option>
            <option value="bi-clock-history">Clock (Time-Critical)</option>
            <option value="bi-gear">Gear (Technical)</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Service Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., Express Delivery"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Service Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Describe your service in a few sentences..."
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />
        </Form.Group>

        <div className="mt-3 p-3 bg-light rounded">
          <p className="fw-bold mb-2">Preview:</p>
          <div className="text-center p-3 border rounded">
            <i
              className={`bi ${serviceIcon}`}
              style={{ fontSize: '2rem', color: '#104159' }}
            ></i>
            <h4>{serviceTitle || 'Service Title'}</h4>
            <p>
              {serviceDescription || 'Service description will appear here.'}
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowAddServiceModal(false)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={addNewServiceItem}
          disabled={!serviceTitle || !serviceDescription}
        >
          Add Service
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ServiceModal
