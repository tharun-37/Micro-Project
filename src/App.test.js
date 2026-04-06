import { render, screen } from '@testing-library/react';
import App from './App';

test('renders college resource management title', () => {
  render(<App />);
  const titleElement = screen.getByText(/College Resource Management/i);
  expect(titleElement).toBeInTheDocument();
});
