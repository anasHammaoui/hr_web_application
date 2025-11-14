// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
