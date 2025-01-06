import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './user.entity';
import { DataSource } from 'typeorm';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import CreateUserDto from './createUserDto';
import UserCredentials from './userCredentials.entity';
import { forwardRef } from '@nestjs/common';
import CertifiedCourse from './certifiedCourse.entity';
import License from '../license/license.entity';
import * as bcrypt from 'bcrypt';
import { Readable } from 'stream';
import LoginUserDto from './loginUserDto';
import { UpdateResult } from 'typeorm';
import EditUserDto from './editUserDto';
import setUserFireBrigadeDto from './setUserFireBrigadeDto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import CertifiedCourseDto from './certifiedCourseDto';
import { getManager } from 'typeorm';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let userCredentialsRepository: Repository<UserCredentials>;
  let certfiedCourseRepository: Repository<CertifiedCourse>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserCredentials),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CertifiedCourse),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
                update: jest.fn(),
                findOne: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
    userCredentialsRepository = module.get<Repository<UserCredentials>>(getRepositoryToken(UserCredentials));
    certfiedCourseRepository = module.get<Repository<CertifiedCourse>>(getRepositoryToken(CertifiedCourse));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'profilePicture',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './uploads',
      filename: 'test.png',
      path: './uploads/test.png',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockUser: CreateUserDto = {
      username: 'testuser',
      userPassword: 'password',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '1234567890',
      rank: 'Test Rank',
      position: 'Test Position',
    };

    const mockUsers: any = [{ username: 'existinguser' }];

    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    jest.spyOn(userCredentialsRepository, 'save').mockResolvedValue(undefined);
    jest
      .spyOn(dataSource.createQueryRunner().manager, 'save')
      .mockResolvedValue({ userId: 'mockUserId', username: 'testuser', name: 'Test User' });
    jest.spyOn(bcrypt, 'genSalt').mockImplementation((arg1, cb) => cb(null, 'mockSalt'));
    jest.spyOn(bcrypt, 'hash').mockImplementation((arg1, arg2, cb) => cb(null, 'mockHash'));

    const result = await controller.postUser(mockFile, mockUser);

    expect(userRepository.find).toHaveBeenCalled();
    expect(userCredentialsRepository.save).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalled();
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 'mockSalt', expect.any(Function));
    expect(result).toBeDefined();
  });

  it('should login a user', async () => {
    const mockUser: LoginUserDto = {
      userName: 'testuser',
      userPassword: 'password',
    };
    const mockFoundUser: any = { userId: '1', username: 'testuser' };
    const mockFoundCredentials = { username: 'testuser', hashedPassword: 'hashedPassword' };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockFoundUser);
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(mockFoundCredentials);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);
    const result = await controller.loginUser(mockUser);
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(userCredentialsRepository.findOne).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(userRepository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should refresh terms of rights', async () => {
    const mockId = '1';
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userService, 'refreshTermsOfRights').mockResolvedValue(mockUpdateResult);
    const result = await controller.refreshTermsOfRights(mockId);
    expect(userService.refreshTermsOfRights).toHaveBeenCalledWith(mockId);
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (name)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'profilePicture',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './uploads',
      filename: 'test.png',
      path: './uploads/test.png',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockUser: EditUserDto = {
      editMode: 'name',
      payload: { name: 'New Name' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { name: 'New Name' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (password)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'password',
      payload: { username: 'testuser', password: 'newPassword' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue({ username: 'testuser', hashedPassword: 'oldPassword' });
    jest.spyOn(userCredentialsRepository, 'update').mockResolvedValue(mockUpdateResult);
    jest.spyOn(bcrypt, 'genSalt').mockImplementation((arg1, cb) => cb(null, 'mockSalt'));
    jest.spyOn(bcrypt, 'hash').mockImplementation((arg1, arg2, cb) => cb(null, 'mockHash'));
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userCredentialsRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 'mockSalt', expect.any(Function));
    expect(userCredentialsRepository.update).toHaveBeenCalledWith(
      { username: 'testuser' },
      { hashedPassword: 'mockHash' },
    );
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (position)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'position',
      payload: { position: 'New Position' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { position: 'New Position' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (username)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'username',
      payload: { username: 'newUsername' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newUsername' } });
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { username: 'newUsername' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (profilePicture)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'profilePicture',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './uploads',
      filename: 'test.png',
      path: './uploads/test.png',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockUser: EditUserDto = {
      editMode: 'profilePicture',
      payload: {},
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { profilePicture: mockFile.buffer });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (phone)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'phone',
      payload: { phone: '123-456-7890' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { telephoneNumber: '123-456-7890' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (address)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'address',
      payload: { address: 'New Address' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { address: 'New Address' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should edit a user (certifiedCourses)', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'certifiedCourses',
      payload: { certifiedCourseId: 'courseId' },
    };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(certfiedCourseRepository, 'delete').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(certfiedCourseRepository.delete).toHaveBeenCalledWith({ courseId: 'courseId' });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should throw an error when setting fire brigade for non-existent user', async () => {
    const mockUser: setUserFireBrigadeDto = {
      userId: 'nonExistentUser',
      fireBrigadeId: '1',
    };
    const queryRunner = dataSource.createQueryRunner();
    jest.spyOn(queryRunner.manager, 'update').mockRejectedValue(new Error('User not found'));
    await expect(controller.setFireBrigade(mockUser)).rejects.toThrow(BadRequestException);
  });

  it('should throw error for invalid edit mode', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = {
      editMode: 'invalidMode',
      payload: {},
    };
    await expect(controller.editUser(mockId, mockFile, mockUser)).rejects.toThrowError();
  });

  it('should throw NotFoundException if user not found for editUser', async () => {
    const mockId = 'nonExistentUser';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = { editMode: 'name', payload: { name: 'test' } };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 0,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    await expect(controller.editUser(mockId, mockFile, mockUser)).rejects.toThrow(NotFoundException);
  });

  it('should return null if username already exists during editUser', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = { editMode: 'username', payload: { username: 'existingUser' } };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ userId: '2', username: 'existingUser' } as any);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(result).toBeNull();
  });

  it('should handle undefined file in editUser', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = undefined;
    const mockUser: EditUserDto = { editMode: 'profilePicture', payload: {} };
    const mockUpdateResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { profilePicture: null });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should handle image/jpeg mimetype in editUser', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'profilePicture',
      originalname: 'test.jpeg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './uploads',
      filename: 'test.jpeg',
      path: './uploads/test.jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockUser: EditUserDto = { editMode: 'profilePicture', payload: {} };
    const mockUpdateResult: UpdateResult = { raw: [], affected: 1, generatedMaps: [] };
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(userRepository.update).toHaveBeenCalledWith({ userId: mockId }, { profilePicture: mockFile.buffer });
    expect(result).toEqual(mockUpdateResult);
  });

  it('should handle invalid mimetype in editUser', async () => {
    const mockId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'profilePicture',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      destination: './uploads',
      filename: 'test.txt',
      path: './uploads/test.txt',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockUser: EditUserDto = { editMode: 'profilePicture', payload: {} };
    const result = await controller.editUser(mockId, mockFile, mockUser);
    expect(result).toBeUndefined();
  });

  it('should set fire brigade successfully', async () => {
    const mockUser: setUserFireBrigadeDto = {
      userId: 'existingUser',
      fireBrigadeId: '1',
    };
    const mockUpdateResult: UpdateResult = { raw: [], affected: 1, generatedMaps: [] };
    jest.spyOn(dataSource.createQueryRunner().manager, 'update').mockResolvedValue(mockUpdateResult);
    const result = await controller.setFireBrigade(mockUser);
    expect(dataSource.createQueryRunner().manager.update).toHaveBeenCalledWith(
      User,
      { userId: 'existingUser' },
      { fireBrigade: { fireBrigadeId: '1' } },
    );
    expect(result).toBeUndefined();
  });

  it('should throw error if setting fire brigade fails', async () => {
    const mockUser: setUserFireBrigadeDto = {
      userId: 'existingUser',
      fireBrigadeId: '1',
    };
    jest.spyOn(dataSource.createQueryRunner().manager, 'update').mockRejectedValue(new Error('Failed to update'));
    await expect(controller.setFireBrigade(mockUser)).rejects.toThrow(BadRequestException);
  });

  it('should add certified course successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: './uploads',
      filename: 'test.pdf',
      path: './uploads/test.pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockCertifiedCourse: CertifiedCourseDto = { name: 'Test Course', acquiredAt: '2024-01-01' };
    const mockUserId = '1';
    const mockNewCertifiedCourse: any = {
      name: 'Test Course',
      acquiredAt: '2024-01-01',
      file: mockFile.buffer,
      owner: { userId: '1' },
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ userId: mockUserId } as any);
    jest.spyOn(certfiedCourseRepository, 'save').mockResolvedValue(mockNewCertifiedCourse as any);
    const result = await controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: mockUserId } });
    expect(certfiedCourseRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockNewCertifiedCourse);
  });

  it('should throw error if adding certified course fails', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: './uploads',
      filename: 'test.pdf',
      path: './uploads/test.pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockCertifiedCourse: CertifiedCourseDto = { name: 'Test Course', acquiredAt: '2024-01-01' };
    const mockUserId = '1';
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ userId: mockUserId } as any);
    jest.spyOn(certfiedCourseRepository, 'save').mockRejectedValue(new Error('Failed to save'));
    await expect(controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId)).rejects.toThrow();
  });

  it('should get user successfully', async () => {
    const mockId = '1';
    const mockUser = { userId: '1', username: 'testuser' };
    jest.spyOn(userService, 'findOne').mockResolvedValue({ user: mockUser as any, termsOfRightsActual: true });
    const result = await controller.getUser(mockId);
    expect(userService.findOne).toHaveBeenCalledWith(mockId);
    expect(result).toEqual({ user: mockUser, termsOfRightsActual: true });
  });

  it('should throw NotFoundException if user not found for getUser', async () => {
    const mockId = 'nonExistentUser';
    jest.spyOn(userService, 'findOne').mockResolvedValue({ user: null, termsOfRightsActual: false });
    await expect(controller.getUser(mockId)).rejects.toThrow(NotFoundException);
  });

  it('should get all users successfully', async () => {
    const mockUsers: any = [
      { userId: '1', username: 'user1' },
      { userId: '2', username: 'user2' },
    ];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    const result = await controller.getUsers();
    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should throw error if findAll fails', async () => {
    jest.spyOn(userRepository, 'find').mockRejectedValue(new Error('Failed to find users'));
    await expect(controller.getUsers()).rejects.toThrow();
  });

  it('should throw NotFoundException if user not found for addCertifiedCourse', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: './uploads',
      filename: 'test.pdf',
      path: './uploads/test.pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockCertifiedCourse: CertifiedCourseDto = { name: 'Test Course', acquiredAt: '2024-01-01' };
    const mockUserId = 'nonExistentUser';
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    await expect(controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if user not found for refreshTermsOfRights', async () => {
    const mockId = 'nonExistentUser';
    const mockUpdateResult: UpdateResult = { raw: [], affected: 0, generatedMaps: [] };
    jest.spyOn(userService, 'refreshTermsOfRights').mockResolvedValue(mockUpdateResult);
    await expect(controller.refreshTermsOfRights(mockId)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if no users found for findAll', async () => {
    jest.spyOn(userService, 'findAll').mockResolvedValue([]);
    await expect(controller.getUsers()).resolves.toEqual([]);
  });

  it('should find one user successfully', async () => {
    const mockId = '1';
    const mockUser = { userId: '1', username: 'testuser' };
    jest.spyOn(userService, 'findOne').mockResolvedValue({ user: mockUser as any, termsOfRightsActual: true });
    const result = await controller.getUser(mockId);
    expect(userService.findOne).toHaveBeenCalledWith(mockId);
    expect(result).toEqual({ user: mockUser, termsOfRightsActual: true });
  });

  it('should throw error if findOne fails', async () => {
    const mockId = '1';
    jest.spyOn(userService, 'findOne').mockRejectedValue(new Error('Failed to find user'));
    await expect(controller.getUser(mockId)).rejects.toThrow();
  });

  it('should find all users successfully', async () => {
    const mockUsers: any = [
      { userId: '1', username: 'user1' },
      { userId: '2', username: 'user2' },
    ];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    const result = await controller.getUsers();
    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should throw error if findAll fails', async () => {
    jest.spyOn(userRepository, 'find').mockRejectedValue(new Error('Failed to find users'));
    await expect(controller.getUsers()).rejects.toThrow();
  });

  it('should add certified course successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: './uploads',
      filename: 'test.pdf',
      path: './uploads/test.pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockCertifiedCourse: CertifiedCourseDto = { name: 'Test Course', acquiredAt: '2024-01-01' };
    const mockUserId = '1';
    const mockNewCertifiedCourse: any = {
      name: 'Test Course',
      acquiredAt: '2024-01-01',
      file: mockFile.buffer,
      owner: { userId: '1' },
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ userId: mockUserId } as any);
    jest.spyOn(certfiedCourseRepository, 'save').mockResolvedValue(mockNewCertifiedCourse as any);
    const result = await controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: mockUserId } });
    expect(certfiedCourseRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockNewCertifiedCourse);
  });

  it('should throw error if adding certified course fails', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: './uploads',
      filename: 'test.pdf',
      path: './uploads/test.pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: new Readable(),
    };
    const mockCertifiedCourse: CertifiedCourseDto = { name: 'Test Course', acquiredAt: '2024-01-01' };
    const mockUserId = '1';
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ userId: mockUserId } as any);
    jest.spyOn(certfiedCourseRepository, 'save').mockRejectedValue(new Error('Failed to save'));
    await expect(controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId)).rejects.toThrow();
  });

  it('should find one user successfully', async () => {
    const mockId = '1';
    const mockUser = { userId: '1', username: 'testuser' };
    jest.spyOn(userService, 'findOne').mockResolvedValue({ user: mockUser as any, termsOfRightsActual: true });
    const result = await controller.getUser(mockId);
    expect(userService.findOne).toHaveBeenCalledWith(mockId);
    expect(result).toEqual({ user: mockUser, termsOfRightsActual: true });
  });

  it('should throw error if findOne fails', async () => {
    const mockId = '1';
    jest.spyOn(userService, 'findOne').mockRejectedValue(new Error('Failed to find user'));
    await expect(controller.getUser(mockId)).rejects.toThrow();
  });

  it('should find all users successfully', async () => {
    const mockUsers: any = [
      { userId: '1', username: 'user1' },
      { userId: '2', username: 'user2' },
    ];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    const result = await controller.getUsers();
    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should throw error if findAll fails', async () => {
    jest.spyOn(userRepository, 'find').mockRejectedValue(new Error('Failed to find users'));
    await expect(controller.getUsers()).rejects.toThrow();
  });

  it('should throw error if find one fails', async () => {
    const mockId = '1';
    jest.spyOn(userService, 'findOne').mockRejectedValue(new Error('Failed to find user'));
    await expect(controller.getUser(mockId)).rejects.toThrow();
  });

  it('should throw error if find all fails', async () => {
    jest.spyOn(userService, 'findAll').mockRejectedValue(new Error('Failed to find users'));
    await expect(controller.getUsers()).rejects.toThrow();
  });
});
