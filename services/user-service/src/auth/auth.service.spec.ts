// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

// Create a proper mock type for PrismaService
const mockPrismaService = {
  users: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let prismaService: typeof mockPrismaService;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    // Rest all mocks before each test
	jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('register()', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const mockHashedPassword = 'hashedPassword123';
    const mockCreatedUser = {
      uuid: 'user-uuid-123',
      userEmail: mockUserData.email,
      userPwd: mockHashedPassword,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    it('should successfully register a new user', async () => {
      // Arrange
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      jest.mocked(prismaService.users.create).mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.register(mockUserData.email, mockUserData.password);

      // Assert
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUserData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: { 
          userEmail: mockUserData.email, 
          userPwd: mockHashedPassword 
        },
      });
      expect(result).toEqual({
        user_id: 'user-uuid-123',
        user_email: mockUserData.email,
        createdAt: mockCreatedUser.createdAt,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      const existingUser = { uuid: 'existing-uuid', userEmail: mockUserData.email };
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        authService.register(mockUserData.email, mockUserData.password)
      ).rejects.toThrow(new ConflictException('Email already in use'));

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUserData.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.users.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      jest.mocked(prismaService.users.findUnique).mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        authService.register(mockUserData.email, mockUserData.password)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('login()', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const mockHashedPassword = 'hashedPassword123';
    const mockUser = {
      uuid: 'user-uuid-123',
      userEmail: mockUserData.email,
      userPwd: mockHashedPassword,
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockToken = 'jwt.token.here';
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jest.mocked(jwtService.sign).mockReturnValue(mockToken);

      // Act
      const result = await authService.login(mockUserData.email, mockUserData.password);

      // Assert
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUserData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUserData.password, mockHashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.uuid,
        email: mockUser.userEmail,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login(mockUserData.email, mockUserData.password)
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUserData.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        authService.login(mockUserData.email, mockUserData.password)
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUserData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUserData.password, mockHashedPassword);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison errors', async () => {
      // Arrange
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockRejectedValue(new Error('Bcrypt error') as never);

      // Act & Assert
      await expect(
        authService.login(mockUserData.email, mockUserData.password)
      ).rejects.toThrow('Bcrypt error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string inputs gracefully', async () => {
      // This would be caught by validation in a real scenario,
      // but testing service behavior directly
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(null);
      
      await expect(
        authService.register('', 'password')
      ).rejects.toThrow();
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'user+tag@sub.domain.co.uk';
      jest.mocked(prismaService.users.findUnique).mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedPass' as never);
      jest.mocked(prismaService.users.create).mockResolvedValue({
        uuid: 'uuid-123',
        userEmail: specialEmail,
        userPwd: 'hashedPass',
        createdAt: new Date(),
      });

      const result = await authService.register(specialEmail, 'password');
      
      expect(result.user_email).toBe(specialEmail);
    });
  });
});