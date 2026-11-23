import { Component } from 'react';
import { ACADEMY } from '../config';

/**
 * Catches any unexpected runtime error so a parent never sees a blank white page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Registration form error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100svh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: 'linear-gradient(180deg,#0a0c10,#12151b)',
          color: '#f4efe6',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: '36px 32px',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(22,26,33,0.9)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 34, marginBottom: 10 }} aria-hidden="true">
            武
          </div>
          <h1 style={{ fontSize: 22, margin: '0 0 10px' }}>Something went wrong</h1>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(244,239,230,0.66)', margin: '0 0 22px' }}>
            The registration page hit an unexpected error. Your details have not been submitted —
            please reload and try again, or contact the academy directly and we will register your
            child for you.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 26px',
                borderRadius: 999,
                border: 0,
                background: 'linear-gradient(135deg,#f0cf8e,#d9a94e)',
                color: '#1a1408',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
            <a
              href={`mailto:${ACADEMY.email}`}
              style={{
                padding: '14px 26px',
                borderRadius: 999,
                border: '1px solid rgba(244,239,230,0.26)',
                color: '#f4efe6',
                fontSize: 13.5,
                textDecoration: 'none',
              }}
            >
              Email {ACADEMY.email}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
