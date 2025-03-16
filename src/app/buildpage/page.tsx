'use client'
import { Header } from '@/components/Header'
import { useState, useEffect, useCallback } from 'react'
import { Col, Row, Container, Form, Button } from 'react-bootstrap'
import { AiGenComponent } from '@/components/AiGenComponent'
import { templates } from '@/functions/inputGenerate'

type TemplateType = 'restaurant' | 'logistics' | 'professional';

export default function BuildPage() {
  const [formData, setFormData] = useState({
    businessType: '',
    address: '',
    phone: '',
    email: '',
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: '',
    question8: '',
    question9: '',
    question10: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  const checkAllQuestionsAnswered = useCallback(() => {
    // Check if essential fields are filled
    if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
      return false;
    }
    
    // Get the questions for the selected template
    const template = templates[formData.businessType.toLowerCase() as TemplateType];
    const questions = template ? template.questions : [];
    
    // Check if all applicable questions are answered
    for (let i = 0; i < questions.length; i++) {
      const fieldName = `question${i + 1}` as keyof typeof formData;
      if (!formData[fieldName] || formData[fieldName].trim() === '') {
        return false;
      }
    }
    
    return true;
  }, [formData]);

  // Use useCallback for generateWebsite to avoid recreating it on each render
  const generateWebsite = useCallback(async () => {
    // Don't regenerate if we're already loading
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generatePage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setGeneratedHtml(data.htmlContent);
      setIsReady(true);
    } catch (err) {
      console.error('Error generating page:', err);
      setError('Failed to generate website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading]);

  // Fixed useEffect with all dependencies properly declared
  useEffect(() => {
    if (step === 4 && formData.businessType) {
      const hasAllAnswers = checkAllQuestionsAnswered();
      setAllQuestionsAnswered(hasAllAnswers);
      
      // Generate website automatically when all questions are answered
      if (hasAllAnswers && !isLoading && !isReady) {
        generateWebsite();
      }
    }
  }, [step, formData, checkAllQuestionsAnswered, generateWebsite, isLoading, isReady]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmitStep1 = () => {
    // Validate if all fields have values
    if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
      setError('Please fill out all required fields');
      return;
    }
    
    setError('');
    setStep(2);
  }

  const handleSubmitStep2 = () => {
    // Check if all questions in this step are answered
    const questions = getQuestions();
    for (let i = 0; i < 5; i++) {
      const fieldName = `question${i + 1}` as keyof typeof formData;
      if (i < questions.length && (!formData[fieldName] || formData[fieldName].trim() === '')) {
        setError('Please answer all questions before proceeding');
        return;
      }
    }
    
    setError('');
    setStep(3);
  }

  const handleSubmitStep3 = () => {
    // Check if all questions in this step are answered
    const questions = getQuestions();
    for (let i = 5; i < 10; i++) {
      const fieldName = `question${i + 1}` as keyof typeof formData;
      if (i < questions.length && (!formData[fieldName] || formData[fieldName].trim() === '')) {
        setError('Please answer all questions before proceeding');
        return;
      }
    }
    
    setError('');
    setStep(4);
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
          flexDirection: 'column',
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <p>Generating your website...</p>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <p>Complete all questions to generate your website</p>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    )
  }

  const getQuestions = () => {
    const template = templates[formData.businessType.toLowerCase() as TemplateType];
    return template ? template.questions : [];
  }

  const questions = getQuestions();

  // Render yes/no dropdown for appropriate questions
  const renderQuestionInput = (question: string, index: number) => {
    const fieldName = `question${index + 1}` as keyof typeof formData;
    
    if (question.toLowerCase().includes('(yes/no)')) {
      return (
        <select
          name={fieldName}
          className="form-control"
          onChange={handleChange}
          value={formData[fieldName]}
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );
    } else {
      return (
        <input
          name={fieldName}
          className="form-control"
          type="text"
          placeholder={`Answer to question ${index + 1}`}
          onChange={handleChange}
          value={formData[fieldName]}
        />
      );
    }
  };

  return (
    <div>
      <Header />
      <div style={{ width: '100%', textAlign: 'center', margin: 10 }}>
        <h1>Welcome to the Business Website Generator!</h1>
        {formData.businessType && <h2>Selected Template: {formData.businessType}</h2>}
      </div>
      <Container style={{ margin: 10, padding: 10, height: '100%' }} fluid>
        <Row style={{ height: '75vh', maxHeight: '80vh' }}>
          <Col md={4}>
            {step === 1 && (
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
                    value={formData.businessType}
                  >
                    <option value="">Select a template</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="logistics">Logistics</option>
                    <option value="professional">Professional</option>
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
                    value={formData.address}
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
                    value={formData.phone}
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
                    value={formData.email}
                  />
                </div>
                <Button
                  style={{ marginTop: 5, marginBottom: 5 }}
                  onClick={handleSubmitStep1}
                >
                  Next
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
            {step === 2 && (
              <Form style={{ width: '100%' }}>
                {questions.slice(0, 5).map((question, index) => (
                  <div
                    key={index}
                    className="form-group"
                    style={{ marginTop: 5, marginBottom: 5 }}
                  >
                    <label htmlFor={`question${index + 1}`}>{question}</label>
                    {renderQuestionInput(question, index)}
                  </div>
                ))}
                <Button
                  style={{ marginTop: 5, marginBottom: 5 }}
                  onClick={handleSubmitStep2}
                >
                  Next
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
            {step === 3 && (
              <Form style={{ width: '100%' }}>
                {questions.slice(5).map((question, index) => (
                  <div
                    key={index + 5}
                    className="form-group"
                    style={{ marginTop: 5, marginBottom: 5 }}
                  >
                    <label htmlFor={`question${index + 6}`}>{question}</label>
                    {renderQuestionInput(question, index + 5)}
                  </div>
                ))}
                <Button
                  style={{ marginTop: 5, marginBottom: 5 }}
                  onClick={handleSubmitStep3}
                >
                  Finish
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
            {step === 4 && (
              <div style={{ width: '100%', textAlign: 'center', padding: 20 }}>
                <h3>All Questions Completed!</h3>
                <p>Your website is being generated based on your answers.</p>
                {!isReady && !isLoading && (
                  <Button
                    style={{ marginTop: 5, marginBottom: 5 }}
                    onClick={generateWebsite}
                  >
                    Generate Website Now
                  </Button>
                )}
                {error && <p className="text-danger mt-2">{error}</p>}
              </div>
            )}
          </Col>
          <Col>
            <div
              style={{
                backgroundColor: 'lightblue',
                padding: 0, // Removed padding to maximize content space
                margin: 5,
                height: '100%',
                maxHeight: '75vh',
                borderRadius: 5,
                borderStyle: 'solid',
                borderColor: 'gray',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {isLoading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flexGrow: 1,
                  textAlign: 'center' 
                }}>
                  <div>
                    <p>Generating your website...</p>
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              ) : isReady ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <AiGenComponent htmlContent={generatedHtml} />
                </div>
              ) : (
                noPage()
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}