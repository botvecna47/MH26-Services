
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Expect some text to be present, e.g., "MH26 Services" or similar
    // Since App might redirect or show loading, just rendering is a good start.
    expect(document.body).toBeDefined();
  });
});
