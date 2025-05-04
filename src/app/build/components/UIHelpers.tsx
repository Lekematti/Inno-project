// This file contains UI helper components.

export const ColorTips = () => (
  <div
    className="color-info alert alert-info mt-2 mb-3 p-2"
    style={{ fontSize: '0.85rem' }}
  >
    <p className="mb-1">
      <strong>🎨 Color Tips:</strong>
    </p>
    <ul className="mb-0 ps-3">
      <li>Choose colors that reflect your brand personality</li>
      <li>Industry-specific suggestions are provided as buttons</li>
      <li>Your selected color will generate a harmonious palette</li>
      <li>Good color choice improves user experience and conversions</li>
    </ul>
  </div>
)

export const LoadingIndicator = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
      textAlign: 'center',
    }}
  >
    <div>
      <p>Generating your website...</p>
      <output className="spinner-border">
        <span className="visually-hidden">Loading...</span>
      </output>
    </div>
  </div>
)

export const NoPage = ({
  isLoading,
  error,
}: {
  isLoading: boolean
  error: string
}) => (
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
)
