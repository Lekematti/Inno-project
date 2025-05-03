'use client'
import { Header } from '@/components/Header'
import { useState } from 'react'

// Contact page with email form and team section
export default function ContactPage() {
  return (
    <div className="min-h-screen ">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Team Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 my-4">
            Meet Our Team
          </h2>
          <TeamSection />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 my-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help and answer any
            questions you might have.
          </p>
        </div>

        {/* Contact Form Section */}
        <div
          className="rounded shadow-lg p-12 mx-auto"
          style={{ width: '75%', marginBottom: '100px' }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 my-3 text-center p-4">
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </main>
    </div>
  )
}

// Contact form component with email submission
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your backend -> Maybe in the future
    alert('Thank you for your message. We will get back to you soon!')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-6">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-6">
        <div>
          <label
            htmlFor="name"
            className="form-label block my-2 text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control w-full p-3 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="form-label block my-2 text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control w-full p-3 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="subject"
          className="form-label block my-2 text-sm font-medium text-gray-700"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="form-control w-full p-3 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="message"
          className="form-label block my-2 text-sm font-medium text-gray-700"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          className="form-control w-full p-2 border border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>

      <div className="mt-10 mb-4">
        <button
          type="submit"
          className="inline-flex justify-center p-3 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 w-3/4 mx-auto block my-3"
        >
          Send Message
        </button>
      </div>
    </form>
  )
}

// Team section with circular profile images
function TeamSection() {
  const teamMembers = [
    {
      id: 1,
      name: 'Jane Cooper',
      role: 'CEO & Founder',
      imageSrc:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
      description:
        'Jane has over 10 years experience in the industry and leads our team with vision and passion.',
    },
    {
      id: 2,
      name: 'Michael Scott',
      role: 'CTO',
      imageSrc:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
      description:
        'Michael is our technical wizard who builds innovative solutions for our clients.',
    },
    {
      id: 3,
      name: 'Olivia Wilson',
      role: 'Design Lead',
      imageSrc:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
      description:
        'Olivia brings creativity and user-centered design thinking to every project we undertake.',
    },
    {
      id: 4,
      name: 'James Martinez',
      role: 'Client Relations',
      imageSrc:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
      description:
        'James ensures our clients receive exceptional service and support throughout their journey with us.',
    },
  ]

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className="col text-center d-flex flex-column align-items-center"
        >
          <div
            className="position-relative mb-4"
            style={{ width: '160px', height: '160px' }}
          >
            {/* Option 1: Using img tag instead of Next.js Image component */}
            <img
              src={member.imageSrc}
              alt={member.name}
              className="rounded-circle border border-4 border-white shadow img-fluid transition-transform duration-300 hover:scale-110"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Option 2: Using Next Image with unoptimized prop (uncomment this and remove img tag above if preferred)
            <Image
              src={member.imageSrc}
              alt={member.name}
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
              className="rounded-circle border border-4 border-white shadow transition-transform duration-300 hover:scale-110"
            />
            */}
          </div>
          <h3 className="fs-4 fw-semibold">{member.name}</h3>
          <p className="text-primary fw-medium mb-2">{member.role}</p>
          <p className="text-muted">{member.description}</p>
        </div>
      ))}
    </div>
  )
}
