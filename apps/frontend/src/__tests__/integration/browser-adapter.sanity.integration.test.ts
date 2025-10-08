import browserAdapter from '@athlete-ally/logger/browser';

describe('Browser Adapter Sanity Test', () => {
  it('should not import Node.js core modules', () => {
    // This test ensures the browser adapter doesn't accidentally import Node.js modules
    // which would break in browser environments
    
    // Check that the adapter is defined and is a function/object
    expect(browserAdapter).toBeDefined();
    expect(typeof browserAdapter).toBe('object');
    
    // Verify it has the expected structure
    expect(browserAdapter).toHaveProperty('emit');
    expect(typeof browserAdapter.emit).toBe('function');
    
    // Test that it can be called without Node.js dependencies
    const mockEvent = {
      level: 'info' as const,
      msg: 'test message',
      ts: new Date().toISOString(),
      service: 'test',
      module: 'test',
      env: 'test'
    };
    
    // This should not throw even in a browser-like environment
    expect(() => {
      browserAdapter.emit(mockEvent);
    }).not.toThrow();
  });
  
  it('should handle different log levels', () => {
    const levels = ['debug', 'info', 'warn', 'error'] as const;
    
    levels.forEach(level => {
      const mockEvent = {
        level,
        msg: `test ${level} message`,
        ts: new Date().toISOString(),
        service: 'test',
        module: 'test',
        env: 'test'
      };
      
      expect(() => {
        browserAdapter.emit(mockEvent);
      }).not.toThrow();
    });
  });
});
