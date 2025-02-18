/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': 'var(--primary-blue)',
        linkedin: {
          blue: '#0077B5',
          lighter: '#00A0DC'
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#475569', // slate-600
            fontSize: '0.9375rem',
            lineHeight: '1.75',
            
            a: {
              color: '#2563eb', // blue-600
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s ease-in-out',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              '&:hover': {
                color: '#1d4ed8', // blue-700
                backgroundColor: '#eff6ff', // blue-50
              }
            },

            p: {
              color: '#475569', // slate-600
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              lineHeight: '1.75',
              '&:first-child': {
                marginTop: '0'
              },
              '&:last-child': {
                marginBottom: '0'
              }
            },

            'ul > li': {
              color: '#475569', // slate-600
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                backgroundColor: '#3b82f6', // blue-500
                borderRadius: '50%',
                width: '0.375rem',
                height: '0.375rem',
                left: '0.25rem',
                top: '0.6875rem',
                transform: 'translateY(-50%)'
              }
            },

            strong: {
              color: '#1e293b', // slate-800
              fontWeight: '600'
            },

            blockquote: {
              fontStyle: 'italic',
              color: '#475569', // slate-600
              borderLeftWidth: '4px',
              borderLeftColor: '#3b82f6', // blue-500
              backgroundColor: '#f8fafc', // slate-50
              borderRadius: '0.5rem',
              padding: '1rem 1.5rem',
              margin: '1.5rem 0',
              '& p': {
                margin: '0'
              }
            },

            code: {
              color: '#1e293b', // slate-800
              fontWeight: '500',
              backgroundColor: '#f1f5f9', // slate-100
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em'
            },

            pre: {
              backgroundColor: '#f8fafc', // slate-50
              color: '#1e293b', // slate-800
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              margin: '1.5rem 0',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto'
            }
          }
        },
        sm: {
          css: {
            fontSize: '0.875rem'
          }
        }
      },
      boxShadow: {
        'smooth': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      },
      transitionDuration: {
        '250': '250ms',
      },
      scale: {
        '102': '1.02',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};