import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventCard from './EventCard';
import type { WildfireEvent } from '../types';

const baseEvent: WildfireEvent = {
  id: '1',
  title: 'Test Wildfire',
  description: '',
  link: '',
  closed: null,
  categories: [{ id: 'wildfires', title: 'Wildfires' }],
  sources: [{ id: 'src1', url: 'https://example.com/fire' }],
  geometry: [
    {
      magnitudeValue: null,
      magnitudeUnit: null,
      date: '2026-01-15T00:00:00Z',
      type: 'Point',
      coordinates: [10, 20],
    },
  ],
};

describe('EventCard', () => {
  it('renders the event title', () => {
    render(<EventCard event={baseEvent} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('Test Wildfire')).toBeInTheDocument();
  });

  it('shows "Active" badge when the event is not closed', () => {
    render(<EventCard event={baseEvent} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows "Closed" badge when the event is closed', () => {
    const closedEvent = { ...baseEvent, closed: '2026-02-01T00:00:00Z' };
    render(<EventCard event={closedEvent} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<EventCard event={baseEvent} isSelected={false} onClick={onClick} />);
    fireEvent.click(screen.getByText('Test Wildfire'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a source link that stops propagation on click', () => {
    const onClick = vi.fn();
    render(<EventCard event={baseEvent} isSelected={false} onClick={onClick} />);
    const link = screen.getByText('View Source ↗');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not render a source link when there are no sources', () => {
    const noSourceEvent = { ...baseEvent, sources: [] };
    render(<EventCard event={noSourceEvent} isSelected={false} onClick={() => {}} />);
    expect(screen.queryByText('View Source ↗')).not.toBeInTheDocument();
  });
});
