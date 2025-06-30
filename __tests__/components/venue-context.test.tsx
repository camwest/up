/**
 * Component tests for VenueContext using Bun + React Testing Library
 */

import { test, expect, mock, beforeEach } from 'bun:test';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { VenueContext, useVenueContext } from '../../components/venue-context';
import { type Pattern } from '../../lib/patterns';

// Mock the dependencies using Bun's mock
const mockRequestLocation = mock();
const mockGetLocationErrorMessage = mock();
const mockPresenceManager = {
  on: mock(),
  joinVenue: mock(),
  leaveVenue: mock(),
  getVenueState: mock(),
  getOtherPatterns: mock(),
  detectCollisions: mock(),
};
const mockGetPresenceManager = mock(() => mockPresenceManager);
const mockPrepareCreateRequest = mock();

// Mock the modules
mock.module('../../lib/location', () => ({
  requestLocation: mockRequestLocation,
  getLocationErrorMessage: mockGetLocationErrorMessage,
}));

mock.module('../../lib/presence', () => ({
  getPresenceManager: mockGetPresenceManager,
}));

mock.module('../../lib/venues', () => ({
  VenueAPI: {
    prepareCreateRequest: mockPrepareCreateRequest,
  },
}));

const mockPattern: Pattern = {
  primary: 'FF008C',
  animation: 'pulse',
  speed: 3,
};

beforeEach(() => {
  // Reset all mocks before each test
  mockRequestLocation.mockReset();
  mockGetLocationErrorMessage.mockReset();
  mockPresenceManager.on.mockReset();
  mockPresenceManager.joinVenue.mockReset();
  mockPresenceManager.leaveVenue.mockReset();
  mockPresenceManager.getVenueState.mockReset();
  mockPresenceManager.getOtherPatterns.mockReset();
  mockPresenceManager.detectCollisions.mockReset();
  mockGetPresenceManager.mockReset();
  mockPrepareCreateRequest.mockReset();

  // Set up default mock implementations
  mockGetLocationErrorMessage.mockReturnValue('Location error');
  mockPresenceManager.getVenueState.mockReturnValue(null);
  mockPresenceManager.getOtherPatterns.mockReturnValue([]);
  mockPresenceManager.detectCollisions.mockReturnValue([]);
  mockGetPresenceManager.mockReturnValue(mockPresenceManager);
  mockPrepareCreateRequest.mockReturnValue({
    url: '/api/venues/test123',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });

  // Mock fetch globally
  global.fetch = mock(() => Promise.resolve(new Response('{}')));
});

test('renders initial location request UI', () => {
  render(<VenueContext />);
  
  expect(screen.getByText('Find Others Nearby')).toBeInTheDocument();
  expect(screen.getByText('See other patterns in your area and avoid conflicts')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enable Location Features/i })).toBeInTheDocument();
  expect(screen.getByText(/Your location stays private/i)).toBeInTheDocument();
});

test('shows requesting state when location is being requested', async () => {
  // Mock requestLocation to return a never-resolving promise
  mockRequestLocation.mockReturnValue(new Promise(() => {}));
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Requesting location access...')).toBeInTheDocument();
  });
});

test('handles successful location grant and shows venue info', async () => {
  // Mock successful location request
  mockRequestLocation.mockResolvedValue({
    success: true,
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  });

  // Mock venue state after joining
  mockPresenceManager.getVenueState.mockReturnValue({
    venue_id: 'dr5ru7',
    user_count: 1,
    active_patterns: new Map(),
    last_updated: Date.now(),
  });

  mockPresenceManager.joinVenue.mockResolvedValue(undefined);
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Your Area')).toBeInTheDocument();
    expect(screen.getByText('Area DR5RU7')).toBeInTheDocument();
    expect(screen.getByText('1 pattern active')).toBeInTheDocument();
  });

  // Verify presence manager was called correctly
  expect(mockPresenceManager.joinVenue).toHaveBeenCalledWith(
    { latitude: 40.7589, longitude: -73.9851 },
    mockPattern,
    'TEST-PATTERN-1'
  );
});

test('handles location access denied', async () => {
  mockRequestLocation.mockResolvedValue({
    success: false,
    error: 'permission_denied',
  });
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Location features unavailable')).toBeInTheDocument();
    expect(screen.getByText('permission_denied')).toBeInTheDocument();
  });
});

test('shows other patterns when venue details are expanded', async () => {
  mockRequestLocation.mockResolvedValue({
    success: true,
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  });

  mockPresenceManager.getVenueState.mockReturnValue({
    venue_id: 'dr5ru7',
    user_count: 2,
    active_patterns: new Map(),
    last_updated: Date.now(),
  });

  mockPresenceManager.getOtherPatterns.mockReturnValue([
    {
      user_id: 'user_123',
      pattern_id: 'CYAN-WAVE-15',
      pattern_data: { primary: '00F9FF', animation: 'wave', speed: 4 },
      joined_at: Date.now() - 120000, // 2 minutes ago
      last_seen: Date.now() - 60000,
    },
  ]);
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  // Enable location
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Your Area')).toBeInTheDocument();
  });

  // Initially, other patterns should not be visible
  expect(screen.queryByText('Other Patterns:')).not.toBeInTheDocument();
  
  // Click the toggle button to show details
  const toggleButtons = screen.getAllByRole('button');
  const toggleButton = toggleButtons.find(button => button.getAttribute('aria-label') === null && button.textContent === '');
  expect(toggleButton).toBeDefined();
  
  fireEvent.click(toggleButton!);
  
  await waitFor(() => {
    expect(screen.getByText('Other Patterns:')).toBeInTheDocument();
    expect(screen.getByText('CYAN-WAVE-15')).toBeInTheDocument();
  });
});

test('displays collision warning when conflicts detected', async () => {
  mockRequestLocation.mockResolvedValue({
    success: true,
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  });

  mockPresenceManager.getVenueState.mockReturnValue({
    venue_id: 'dr5ru7',
    user_count: 2,
    active_patterns: new Map(),
    last_updated: Date.now(),
  });

  // Mock collision detection
  mockPresenceManager.detectCollisions.mockReturnValue([
    {
      user_id: 'user_456',
      pattern_id: 'NEON-PULSE-99',
      pattern_data: { primary: 'FF008C', animation: 'pulse', speed: 3 }, // Same as our pattern
      joined_at: Date.now() - 60000,
      last_seen: Date.now() - 30000,
    },
  ]);
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Pattern Conflict Detected')).toBeInTheDocument();
    expect(screen.getByText(/1 other pattern nearby is very similar/i)).toBeInTheDocument();
  });
});

test('useVenueContext hook provides venue context component and state', () => {
  const TestComponent = () => {
    const { venueState, collisions, VenueContextComponent } = useVenueContext(mockPattern, 'TEST-PATTERN-1');
    
    return (
      <div>
        <div data-testid="venue-state">{venueState ? 'has-venue' : 'no-venue'}</div>
        <div data-testid="collision-count">{collisions.length}</div>
        <VenueContextComponent />
      </div>
    );
  };
  
  render(<TestComponent />);
  
  expect(screen.getByTestId('venue-state')).toHaveTextContent('no-venue');
  expect(screen.getByTestId('collision-count')).toHaveTextContent('0');
  expect(screen.getByText('Find Others Nearby')).toBeInTheDocument();
});

test('calls onVenueStateChange callback when venue state changes', async () => {
  const onVenueStateChange = mock();
  
  mockRequestLocation.mockResolvedValue({
    success: true,
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  });

  const mockVenueState = {
    venue_id: 'dr5ru7',
    user_count: 1,
    active_patterns: new Map(),
    last_updated: Date.now(),
  };

  mockPresenceManager.getVenueState.mockReturnValue(mockVenueState);
  
  render(
    <VenueContext 
      pattern={mockPattern} 
      patternId="TEST-PATTERN-1"
      onVenueStateChange={onVenueStateChange}
    />
  );
  
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(onVenueStateChange).toHaveBeenCalledWith(mockVenueState);
  });
});

test('leave venue functionality works correctly', async () => {
  mockRequestLocation.mockResolvedValue({
    success: true,
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  });

  mockPresenceManager.getVenueState.mockReturnValue({
    venue_id: 'dr5ru7',
    user_count: 1,
    active_patterns: new Map(),
    last_updated: Date.now(),
  });
  
  render(<VenueContext pattern={mockPattern} patternId="TEST-PATTERN-1" />);
  
  // Enable location and join venue
  const enableButton = screen.getByRole('button', { name: /Enable Location Features/i });
  fireEvent.click(enableButton);
  
  await waitFor(() => {
    expect(screen.getByText('Your Area')).toBeInTheDocument();
  });

  // Click leave venue button
  const leaveButton = screen.getByRole('button', { name: /Leave Area/i });
  fireEvent.click(leaveButton);
  
  // Should call presence manager leaveVenue
  expect(mockPresenceManager.leaveVenue).toHaveBeenCalled();
});