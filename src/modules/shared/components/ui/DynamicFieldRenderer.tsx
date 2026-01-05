'use client';

import { DynamicFieldDefinition } from '@/modules/shared/types/dynamic-fields';
import {
  CalendarToday as CalendarIcon,
  AttachFile as FileIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import React from 'react';

interface DynamicFieldRendererProps {
  field: DynamicFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string | string[];
  disabled?: boolean;
  readOnly?: boolean;
  showRequired?: boolean;
  showDescription?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  compact?: boolean;
}

/**
 * Componente para renderizar un campo dinámico según su tipo
 */
export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  readOnly = false,
  showRequired = true,
  showDescription = true,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  compact = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const hasError = Array.isArray(error) ? error.length > 0 : !!error;
  const errorMessage = Array.isArray(error) ? error.join(', ') : error;

  const commonProps = {
    disabled: disabled || readOnly,
    fullWidth,
    variant,
    size,
    error: hasError,
    onBlur,
  };

  const renderLabel = () => {
    const requiredMark = field.validation?.required && showRequired ? ' *' : '';
    return `${field.label}${requiredMark}`;
  };

  const renderDescription = () => {
    if (!showDescription || !field.description || compact) return null;

    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {field.description}
      </Typography>
    );
  };

  const renderHelperText = () => {
    if (hasError) {
      return <FormHelperText error>{errorMessage}</FormHelperText>;
    }
    return null;
  };

  switch (field.type) {
    case 'text':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            multiline={false}
            helperText={errorMessage}
            InputProps={{
              readOnly,
              inputProps: {
                maxLength: field.validation?.maxLength,
                minLength: field.validation?.minLength,
              },
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'textarea':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            multiline
            rows={compact ? 2 : 4}
            helperText={errorMessage}
            InputProps={{
              readOnly,
              inputProps: {
                maxLength: field.validation?.maxLength,
                minLength: field.validation?.minLength,
              },
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'number':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value) || null)}
            placeholder={field.placeholder}
            helperText={errorMessage}
            InputProps={{
              readOnly,
              inputProps: {
                min: field.validation?.min,
                max: field.validation?.max,
                step: 'any',
              },
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'email':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'ejemplo@correo.com'}
            helperText={errorMessage}
            InputProps={{
              readOnly,
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'phone':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '+1 (555) 123-4567'}
            helperText={errorMessage}
            InputProps={{
              readOnly,
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'url':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <TextField
            {...commonProps}
            label={renderLabel()}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://ejemplo.com'}
            helperText={errorMessage}
            InputProps={{
              readOnly,
              endAdornment: value && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => window.open(value, '_blank')}
                    disabled={!value || disabled}
                  >
                    <LinkIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {renderDescription()}
        </Box>
      );

    case 'date':
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mb: compact ? 1 : 2 }}>
            <DatePicker
              label={renderLabel()}
              value={value ? new Date(value) : null}
              onChange={(newValue) => onChange(newValue?.toISOString().split('T')[0])}
              disabled={disabled || readOnly}
              slotProps={{
                textField: {
                  ...commonProps,
                  helperText: errorMessage,
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
            {renderDescription()}
          </Box>
        </LocalizationProvider>
      );

    case 'datetime':
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ mb: compact ? 1 : 2 }}>
            <DateTimePicker
              label={renderLabel()}
              value={value ? new Date(value) : null}
              onChange={(newValue) => onChange(newValue?.toISOString())}
              disabled={disabled || readOnly}
              slotProps={{
                textField: {
                  ...commonProps,
                  helperText: errorMessage,
                },
              }}
            />
            {renderDescription()}
          </Box>
        </LocalizationProvider>
      );

    case 'select':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <FormControl {...commonProps} error={hasError}>
            <FormLabel>{renderLabel()}</FormLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              displayEmpty
              disabled={disabled || readOnly}
            >
              <MenuItem value="">
                <em>Seleccionar...</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {renderHelperText()}
          </FormControl>
          {renderDescription()}
        </Box>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <FormControl {...commonProps} error={hasError}>
            <FormLabel>{renderLabel()}</FormLabel>
            <Select
              multiple
              value={selectedValues}
              onChange={(e) => {
                const newValue = Array.isArray(e.target.value) ? e.target.value : [];
                onChange(newValue);
              }}
              disabled={disabled || readOnly}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as any[]).map((val) => {
                    const option = field.options?.find((opt) => opt.value === val);
                    return <Chip key={val} label={option?.label || val} size="small" />;
                  })}
                </Box>
              )}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {renderHelperText()}
          </FormControl>
          {renderDescription()}
        </Box>
      );

    case 'radio':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <FormControl {...commonProps} error={hasError}>
            <FormLabel>{renderLabel()}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              row={compact}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={option.disabled || disabled || readOnly}
                />
              ))}
            </RadioGroup>
            {renderHelperText()}
          </FormControl>
          {renderDescription()}
        </Box>
      );

    case 'checkbox':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled || readOnly}
              />
            }
            label={renderLabel()}
          />
          {hasError && renderHelperText()}
          {renderDescription()}
        </Box>
      );

    case 'file':
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <FormControl {...commonProps} error={hasError}>
            <FormLabel>{renderLabel()}</FormLabel>
            <TextField
              type="file"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                onChange(file);
              }}
              disabled={disabled || readOnly}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FileIcon />
                  </InputAdornment>
                ),
              }}
            />
            {renderHelperText()}
          </FormControl>
          {renderDescription()}
        </Box>
      );

    default:
      return (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <Typography variant="body2" color="error">
            Tipo de campo no soportado: {field.type}
          </Typography>
        </Box>
      );
  }
};
