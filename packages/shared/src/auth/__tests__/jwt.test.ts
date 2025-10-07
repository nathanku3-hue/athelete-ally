import { JWTManager } from '../jwt';

describe('JWTManager', () => {
  const mockPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'user' as const,
  };

  describe('getUserFromRequest', () => {
    describe('Next/Fetch Headers support', () => {
      it('should extract token from Next.js Headers with authorization', () => {
        const mockHeaders = {
          get: jest.fn((name: string) => {
            if (name === 'authorization') return 'Bearer valid-token';
            return null;
          }),
        };

        // Mock verifyToken to return expected payload
        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
        expect(mockHeaders.get).toHaveBeenCalledWith('authorization');
      });

      it('should return undefined for Next.js Headers with no authorization', () => {
        const mockHeaders = {
          get: jest.fn(() => null),
        };

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should handle Next.js Headers with empty authorization', () => {
        const mockHeaders = {
          get: jest.fn((name: string) => {
            if (name === 'authorization') return '';
            return null;
          }),
        };

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });
    });

    describe('Node/Express IncomingHttpHeaders support', () => {
      it('should extract token from Express headers with lowercase authorization', () => {
        const mockHeaders = {
          authorization: 'Bearer valid-token',
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should extract token from Express headers with uppercase Authorization', () => {
        const mockHeaders = {
          Authorization: 'Bearer valid-token',
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should prefer lowercase authorization over uppercase Authorization', () => {
        const mockHeaders = {
          authorization: 'Bearer lowercase-token',
          Authorization: 'Bearer uppercase-token',
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });
    });

    describe('Array header handling', () => {
      it('should accept single valid entry in array', () => {
        const mockHeaders = {
          authorization: ['Bearer valid-token'],
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should accept multiple identical entries in array', () => {
        const mockHeaders = {
          authorization: ['Bearer valid-token', 'Bearer valid-token'],
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should reject multiple distinct entries in array', () => {
        const mockHeaders = {
          authorization: ['Bearer token1', 'Bearer token2'],
        };

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should filter out empty strings in array', () => {
        const mockHeaders = {
          authorization: ['', 'Bearer valid-token', ''],
        };

        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should return undefined for empty array', () => {
        const mockHeaders = {
          authorization: [],
        };

        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });
    });

    describe('Bearer parsing variants', () => {
      beforeEach(() => {
        jest.spyOn(JWTManager, 'verifyToken').mockReturnValue(mockPayload as any);
      });

      it('should parse "Bearer TOKEN"', () => {
        const mockHeaders = { authorization: 'Bearer valid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should parse "bearer TOKEN" (case insensitive)', () => {
        const mockHeaders = { authorization: 'bearer valid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should parse "BEARER TOKEN" (uppercase)', () => {
        const mockHeaders = { authorization: 'BEARER valid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should parse "  Bearer   TOKEN  " (with extra spaces)', () => {
        const mockHeaders = { authorization: '  Bearer   valid-token  ' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should parse "Bearer\tTOKEN" (with tab)', () => {
        const mockHeaders = { authorization: 'Bearer\tvalid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should parse "Bearer\nTOKEN" (with newline)', () => {
        const mockHeaders = { authorization: 'Bearer\nvalid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toEqual(mockPayload);
      });

      it('should return undefined for "Token TOKEN" (invalid prefix)', () => {
        const mockHeaders = { authorization: 'Token valid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for "Basic TOKEN" (wrong auth type)', () => {
        const mockHeaders = { authorization: 'Basic valid-token' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for "Bearer" (missing token)', () => {
        const mockHeaders = { authorization: 'Bearer' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for "Bearer " (empty token)', () => {
        const mockHeaders = { authorization: 'Bearer ' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        const mockHeaders = { authorization: '' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for malformed header', () => {
        const mockHeaders = { authorization: 'Bearer token1 token2' };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });
    });

    describe('Null/undefined headers', () => {
      it('should return undefined for null authorization', () => {
        const mockHeaders = { authorization: null };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for undefined authorization', () => {
        const mockHeaders = { authorization: undefined };
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for missing headers', () => {
        const mockHeaders = {};
        const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
        expect(result).toBeUndefined();
      });

      it('should return undefined for null headers', () => {
        const result = JWTManager.getUserFromRequest({ headers: null as any });
        expect(result).toBeUndefined();
      });
    });

    describe('Error handling', () => {
      it('should return undefined when verifyToken throws error', () => {
        const mockHeaders = { authorization: 'Bearer invalid-token' };
        
        jest.spyOn(JWTManager, 'verifyToken').mockImplementation(() => {
          throw new Error('Invalid token');
        });

        // Should not throw, but return undefined
        expect(() => {
          const result = JWTManager.getUserFromRequest({ headers: mockHeaders });
          expect(result).toBeUndefined();
        }).not.toThrow();
      });
    });
  });

  describe('extractTokenFromHeader (legacy method)', () => {
    it('should extract token from valid Bearer header', () => {
      const result = JWTManager.extractTokenFromHeader('Bearer valid-token');
      expect(result).toBe('valid-token');
    });

    it('should throw error for missing header', () => {
      expect(() => {
        JWTManager.extractTokenFromHeader(undefined);
      }).toThrow('Authorization header is required');
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        JWTManager.extractTokenFromHeader('InvalidFormat token');
      }).toThrow('Invalid authorization header format');
    });
  });
});
