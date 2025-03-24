'use client'
import { Header } from '@/components/Header'
import { useEffect } from 'react'
import { Col, Row, Container, Form, Button, ProgressBar } from 'react-bootstrap'
import { AiGenComponent } from '@/components/AiGenComponent'
import { useFormHandlers } from './useFormHandlers'
import { getQuestions} from './pageUtils'

export default function BuildPage() {
  const {
    formData,
    setFormData,
    isLoading,
    isReady,
    generatedHtml,
    error,
    step,
    setStep,
    /*allQuestionsAnswered,*/
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
    setError,
  } = useFormHandlers();

  useEffect(() => {
    if (step === 5 && formData.businessType) { // Changed from step 4 to step 5
      const hasAllAnswers = checkAllQuestionsAnswered();
      setAllQuestionsAnswered(hasAllAnswers);
      if (hasAllAnswers && !isLoading && !isReady) {
        generateWebsite();
      }
    }
  }, [step, formData, checkAllQuestionsAnswered, generateWebsite, isLoading, isReady, setAllQuestionsAnswered]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmitStep1 = () => {
    if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
      setError('Please fill out all required fields');
      return;
    }
    setError('');
    setStep(2);
  }

  const handleSubmitStep2 = () => {
    const questions = getQuestions(formData.businessType);
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
    const questions = getQuestions(formData.businessType);
    for (let i = 5; i < 10; i++) {
      const fieldName = `question${i + 1}` as keyof typeof formData;
      if (i < questions.length && (!formData[fieldName] || formData[fieldName].trim() === '')) {
        setError('Please answer all questions before proceeding');
        return;
      }
    }
    setError('');
    setStep(4); // Move to the image collection step
  }

  const handleSubmitStep4 = () => {
    if (!formData.imageInstructions || formData.imageInstructions.trim() === '') {
      setError('Please describe your image requirements or enter "none" if you don\'t need images');
      return;
    }
    
    setError('');
    setStep(5); // Move to the final generation step
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const questions = getQuestions(formData.businessType);
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(formData).filter(key => key.startsWith('question') && formData[key as keyof typeof formData].trim() !== '').length;
  // Prevent division by zero
  const progress = totalQuestions > 0 
    ? Math.round((answeredQuestions / totalQuestions) * 100) 
    : 0;

  const renderQuestionInput = (question: string, index: number) => {
    const fieldName = `question${index + 1}` as keyof typeof formData;
    const fieldValue = formData[fieldName] || '';
    
    if (question.toLowerCase().includes('(yes/no)')) {
      return (
        <select
          name={fieldName}
          className="form-control"
          onChange={handleChange}
          value={fieldValue}
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
          value={fieldValue}
        />
      );
    }
  };

  const noPage = (isLoading: boolean, error: string) => {
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
            <output className="spinner-border">
              <span className="visually-hidden">Loading...</span>
            </output>
          </div>
        ) : (
          <p>Complete all questions to generate your website</p>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    );
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
            {step > 1 && (
              <ProgressBar now={progress} label={`${progress}%`} style={{ marginBottom: 20 }} />
            )}
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
                    key={question}
                    className="form-group"
                    style={{ marginTop: 5, marginBottom: 5 }}
                  >
                    <label htmlFor={`question${index + 1}`}>{question}</label>
                    {renderQuestionInput(question, index)}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {step > 1 && (
                    <Button
                      style={{ marginTop: 5, marginBottom: 5, marginRight: 5 }}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    style={{ marginTop: 5, marginBottom: 5 }}
                    onClick={handleSubmitStep2}
                  >
                    Next
                  </Button>
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
            {step === 3 && (
              <Form style={{ width: '100%' }}>
                {questions.slice(5).map((question, index) => (
                  <div
                    key={question}
                    className="form-group"
                    style={{ marginTop: 5, marginBottom: 5 }}
                  >
                    <label htmlFor={`question${index + 6}`}>{question}</label>
                    {renderQuestionInput(question, index + 5)}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {step > 1 && (
                    <Button
                      style={{ marginTop: 5, marginBottom: 5, marginRight: 5 }}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    style={{ marginTop: 5, marginBottom: 5 }}
                    onClick={handleSubmitStep3}
                  >
                    Next
                  </Button>
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
            {step === 4 && (
              <Form style={{ width: '100%' }}>
                <h3>Image Information</h3>
                <div className="form-group mb-4">
                  <label htmlFor="imageInstructions">
                    Describe the images you want for your website
                  </label>
                  <textarea
                    name="imageInstructions"
                    id="imageInstructions"
                    className="form-control"
                    rows={6}
                    placeholder="Describe how many images you need, what they should show, and preferred style (realistic or artistic). Example: 'I need 3 images: a restaurant interior (realistic), our signature dish (artistic), and our chef team (realistic).'"
                    onChange={handleChange}
                    value={formData.imageInstructions || ''}
                  />
                  <small className="form-text text-muted mt-2">
                    <strong>Tip:</strong> For realistic images, keep descriptions simple. For unique visuals, choose artistic style.
                  </small>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    style={{ marginTop: 5, marginBottom: 5, marginRight: 5 }}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    style={{ marginTop: 5, marginBottom: 5 }}
                    onClick={handleSubmitStep4}
                  >
                    Generate Website
                  </Button>
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            )}
          </Col>
          <Col>
            <div
              style={{
                backgroundColor: 'lightblue',
                padding: 0,
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
              {(() => {
                if (isLoading) {
                  return (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      flexGrow: 1,
                      textAlign: 'center' 
                    }}>
                      <div>
                        <p>Generating your website...</p>
                        <output className="spinner-border">
                          <span className="visually-hidden">Loading...</span>
                        </output>
                      </div>
                    </div>
                  );
                } else if (isReady) {
                  return (
                    <div style={{ width: '100%', height: '100%' }}>
                      <AiGenComponent htmlContent={generatedHtml} />
                    </div>
                  );
                } else {
                  return noPage(isLoading, error);
                }
              })()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}