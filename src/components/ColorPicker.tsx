'use client'
import { useState, useEffect, useCallback } from 'react'
import { Form, Row, Col, Button, Alert } from 'react-bootstrap'
import {
  industryColorPalettes,
  validateColor,
  processUserColors,
  generateRandomColorSet,
  checkWCAGCompliance,
} from '@/app/build/colorProcessor'
import { FormData, ColorPickerProps } from '@/types/formData'

export const ColorPicker: React.FC<ColorPickerProps> = ({
  index,
  formData,
  setFormData,
}) => {
  const [currentColor, setCurrentColor] = useState('#2E5984')
  const [manualColor, setManualColor] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [colorWarning, setColorWarning] = useState<string | null>(null)
  const [adjustedColors, setAdjustedColors] = useState<{
    [key: string]: string
  }>({})
  const [isRandomizing, setIsRandomizing] = useState(false)

  const fieldName = `question${index + 1}` as keyof FormData
  const businessType = formData.businessType || 'professional'
  const currentPresets =
    industryColorPalettes[businessType] || industryColorPalettes.professional

  const MAX_COLORS = 4

  // Initialize colors from form data
  useEffect(() => {
    const storedColors = formData[fieldName]
    if (storedColors && typeof storedColors === 'string') {
      const colors = storedColors.split(',').filter(Boolean)
      setSelectedColors(colors)
      if (colors.length > 0) {
        setCurrentColor(colors[0])
      }
    }
    // Reset selectedPreset when businessType changes
    setSelectedPreset('')
    setAdjustedColors({})
  }, [fieldName, formData, businessType])

  // Validate a color and provide feedback
  const validateAndAdjustColor = useCallback(
    (color: string): { isValid: boolean; adjustedColor: string } => {
      const validation = validateColor(color, businessType)
      if (!validation.isValid) {
        setColorWarning(`Adjusted color: ${validation.reason}`)
        setAdjustedColors((prev) => ({
          ...prev,
          [color]: validation.adjustedColor,
        }))
        return { isValid: false, adjustedColor: validation.adjustedColor }
      } else {
        setColorWarning(null)
        return { isValid: true, adjustedColor: color }
      }
    },
    [businessType]
  )

  const handleColorAdd = useCallback(
    (color: string) => {
      if (
        selectedColors.length < MAX_COLORS &&
        !selectedColors.includes(color)
      ) {
        // Validate and potentially adjust the color
        const { adjustedColor } = validateAndAdjustColor(color)

        const newColors = [...selectedColors, adjustedColor]
        setSelectedColors(newColors)

        // Update form data with validated colors
        const processedColors = processUserColors(newColors, businessType)
        setFormData((prev) => ({
          ...prev,
          [fieldName]: processedColors.join(','),
        }))

        setManualColor('') // Clear manual input after adding
      }
    },
    [
      selectedColors,
      fieldName,
      setFormData,
      validateAndAdjustColor,
      businessType,
    ]
  )

  const handleColorRemove = useCallback(
    (colorToRemove: string) => {
      const newColors = selectedColors.filter(
        (color) => color !== colorToRemove
      )
      setSelectedColors(newColors)

      // Also clean up the adjusted colors object
      const newAdjustedColors = { ...adjustedColors }
      delete newAdjustedColors[colorToRemove]
      setAdjustedColors(newAdjustedColors)

      // Update form data with remaining colors
      setFormData((prev) => ({ ...prev, [fieldName]: newColors.join(',') }))
    },
    [selectedColors, fieldName, setFormData, adjustedColors]
  )

  const handleManualColorSubmit = () => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexColorRegex.exec(manualColor)) {
      handleColorAdd(manualColor)
    }
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = currentPresets.find((p) => p.name === e.target.value)
    if (selected?.colors) {
      // Clear previous colors and set new ones
      setSelectedPreset(e.target.value)

      // Presets are already curated, but run them through processing to ensure consistency
      const processedColors = processUserColors(selected.colors, businessType)
      setSelectedColors(processedColors)

      // Update form data with the preset colors
      setFormData((prev) => ({
        ...prev,
        [fieldName]: processedColors.join(','),
      }))

      // Reset current color to first color in preset
      setCurrentColor(processedColors[0])
      // Reset manual color input and warnings
      setManualColor('')
      setColorWarning(null)
      setAdjustedColors({})
    } else {
      // Reset everything if no preset is selected
      setSelectedPreset('')
      setSelectedColors([])
      setFormData((prev) => ({
        ...prev,
        [fieldName]: '',
      }))
    }
  }

  // Generate random WCAG-compliant color set
  const handleRandomize = () => {
    setIsRandomizing(true)
    setColorWarning(null)

    // Generate a random set of colors that meet WCAG standards
    let randomColors: string[] = []
    let attempts = 0
    const maxAttempts = 10 // Prevent infinite loops

    do {
      randomColors = generateRandomColorSet(MAX_COLORS, businessType)
      attempts++
    } while (!checkWCAGCompliance(randomColors) && attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      setColorWarning(
        "Couldn't generate a fully WCAG-compliant set. These colors may need manual adjustment."
      )
    }

    // Set the selected colors
    setSelectedColors(randomColors)

    // Update form data with the random colors
    setFormData((prev) => ({
      ...prev,
      [fieldName]: randomColors.join(','),
      colorScheme: randomColors.join(',')
    }))

    // Update UI state
    setCurrentColor(randomColors[0])
    setSelectedPreset('')
    setManualColor('')
    setAdjustedColors({})
    setIsRandomizing(false)
  }

  // Generate a contrasting text color for the color buttons
  const getContrastColor = (hexcolor: string) => {
    const { r, g, b } = hexToRgb(hexcolor)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff'
  }

  return (
    <div className="color-picker mb-4">
      <Form.Group>
        <Form.Label>Choose up to {MAX_COLORS} brand colors</Form.Label>
        {colorWarning && (
          <Alert variant="warning" className="py-2 mb-3">
            <small>{colorWarning}</small>
          </Alert>
        )}

        <Row className="g-3">
          <Col md={3}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Form.Control
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="mb-2"
                aria-label="Color picker"
                style={{ height: '50px' }}
              />
              <Button
                variant="outline-primary"
                onClick={() => handleColorAdd(currentColor)}
                disabled={selectedColors.length >= MAX_COLORS}
                className="w-100"
              >
                Add Color
              </Button>
            </div>
          </Col>

          <Col md={3}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Form.Control
                type="text"
                placeholder="#HEX color (e.g., #FF5733)"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="mb-2"
              />
              <Button
                variant="outline-primary"
                onClick={handleManualColorSubmit}
                disabled={selectedColors.length >= MAX_COLORS}
                className="w-100"
              >
                Add Manual Color
              </Button>
            </div>
          </Col>

          <Col md={3}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h6 className="mb-2">Industry-specific palettes:</h6>
              <Form.Select
                value={selectedPreset}
                onChange={handlePresetChange}
                className="mb-2"
              >
                <option value="">Select a color palette</option>
                {currentPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </Form.Select>

              {/* Preview of selected preset */}
              {selectedPreset &&
                currentPresets.find((p) => p.name === selectedPreset)
                  ?.colors && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                    }}
                  >
                    {currentPresets
                      .find((p) => p.name === selectedPreset)
                      ?.colors.map((color, index) => (
                        <div
                          key={`${color}-${index}`}
                          style={{
                            backgroundColor: color,
                            width: '30px',
                            height: '30px',
                            borderRadius: '4px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            flexGrow: 1,
                          }}
                          title={color}
                        />
                      ))}
                  </div>
                )}
            </div>
          </Col>

          <Col md={3}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h6 className="mb-2">Generate WCAG-compliant colors:</h6>
              <Button
                variant="primary"
                onClick={handleRandomize}
                disabled={isRandomizing}
                className="w-100 h-100"
                style={{ minHeight: '50px' }}
              >
                {isRandomizing ? 'Generating...' : 'Randomize Colors'}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Selected Colors */}
        {selectedColors.length > 0 && (
          <div className="selected-colors mt-3">
            <h6>Preview of your color palette:</h6>
            <div className="d-flex flex-wrap gap-2">
              {selectedColors.map((color, i) => (
                <button
                  key={`${color}-${i}`}
                  style={{
                    backgroundColor: color,
                    color: getContrastColor(color),
                    cursor: 'pointer',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                  onClick={() => handleColorRemove(color)}
                  aria-label={`Remove ${color}`}
                >
                  {color} ⨉
                </button>
              ))}
            </div>
          </div>
        )}
      </Form.Group>
    </div>
  )
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}
