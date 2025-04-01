'use client';
import { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Button} from 'react-bootstrap';
import { industryColorPalettes } from '@/app/build/colorProcessor';
import { FormData, ColorPickerProps, ColorPreset } from '@/types/formData';

export const ColorPicker: React.FC<ColorPickerProps> = ({ index, formData, setFormData }) => {
  const [currentColor, setCurrentColor] = useState('#2E5984');
  const [manualColor, setManualColor] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const fieldName = `question${index + 1}` as keyof FormData;
  const businessType = formData.businessType || 'professional';
  const colorPresets = industryColorPalettes[businessType] || [];

  const MAX_COLORS = 4;

  // Initialize colors from form data
  useEffect(() => {
    const storedColors = formData[fieldName];
    if (storedColors && typeof storedColors === 'string') {
      const colors = storedColors.split(',').filter(Boolean);
      setSelectedColors(colors);
      if (colors.length > 0) {
        setCurrentColor(colors[0]);
      }
    }
  }, [fieldName, formData]);

  const handleColorAdd = useCallback((color: string) => {
    if (selectedColors.length < MAX_COLORS && !selectedColors.includes(color)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      setFormData(prev => ({ ...prev, [fieldName]: newColors.join(',') }));
      setManualColor(''); // Clear manual input after adding
    }
  }, [selectedColors, fieldName, setFormData]);

  const handleColorRemove = useCallback((colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    setFormData(prev => ({ ...prev, [fieldName]: newColors.join(',') }));
  }, [selectedColors, fieldName, setFormData]);

  const handleManualColorSubmit = () => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.exec(manualColor)) {
      handleColorAdd(manualColor);
    }
  };

  return (
    <div className="color-picker mb-4">
      <Form.Group>
        <Form.Label>Choose up to {MAX_COLORS} brand colors</Form.Label>
        <Row>
          {/* Color Picker */}
          <Col md={4} className="mb-3">
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
          </Col>

          {/* Manual HEX Input */}
          <Col md={4} className="mb-3">
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
          </Col>

          {/* Industry-Specific Suggestions */}
          <Col md={4}>
            <h6>Industry-specific color suggestions:</h6>
            <div className="d-flex flex-wrap gap-2">
              {colorPresets.map((preset: ColorPreset) => (
                <Button
                  key={preset.primary}
                  style={{ backgroundColor: preset.primary, color: getContrastColor(preset.primary) }}
                  onClick={() => handleColorAdd(preset.primary)}
                  disabled={selectedColors.length >= MAX_COLORS}
                  className="mb-2"
                >
                  {preset.name}
                </Button>
              ))}
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
  );
};

// Helper function for contrast calculation
const getContrastColor = (hexcolor: string) => {
  const { r, g, b } = hexToRgb(hexcolor);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff';
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};