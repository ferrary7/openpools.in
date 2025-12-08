'use client'

export default function NotionInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoFilled = false,
  icon = null,
  error = null,
  rows = 1,
  className = '',
  maxLength = null,
  ...props
}) {
  const isTextarea = type === 'textarea' || rows > 1

  const inputClasses = `
    w-full px-4 py-3
    border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-primary-400 focus:border-primary-400
    outline-none transition-all
    text-gray-900 placeholder-gray-400
    ${error ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}
    ${className}
  `

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {maxLength && value && (
          <span className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-3.5 text-xl pointer-events-none">
            {icon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={`${inputClasses} ${icon ? 'pl-12' : ''} resize-none`}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`${inputClasses} ${icon ? 'pl-12' : ''}`}
            {...props}
          />
        )}
      </div>

      {/* Auto-fill indicator */}
      {autoFilled && !error && (
        <div className="flex items-center gap-1 text-xs text-primary-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Auto-filled from resume
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
