import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefix,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{ paddingLeft: prefix ? '40px' : undefined }}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && helperText && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
