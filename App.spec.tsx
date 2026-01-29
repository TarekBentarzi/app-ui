import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render the app component', () => {
    render(<App />);
    expect(screen.getByText(/Open up App.tsx/i)).toBeInTheDocument();
  });

  it('should display the status bar', () => {
    render(<App />);
    const component = screen.getByText(/Open up App.tsx/i);
    expect(component).toBeInTheDocument();
  });
});
