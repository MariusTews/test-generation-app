import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './user.entity';
import { DataSource } from 'typeorm';
import UserCredentials from './userCredentials.entity';
import CertifiedCourse from './certifiedCourse.entity';
import { UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { Express } from 'express';
import EditUserDto from './editUserDto';
import LoginUserDto from './loginUserDto';
import setUserFireBrigadeDto from './setUserFireBrigadeDto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepository: Repository<User>;
  let userCredentialsRepository: Repository<UserCredentials>;
  let certifiedCourseRepository: Repository<CertifiedCourse>;
  let dataSource: DataSource;

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
              connect: jest.fn().mockResolvedValue(undefined),
              startTransaction: jest.fn().mockResolvedValue(undefined),
              commitTransaction: jest.fn().mockResolvedValue(undefined),
              rollbackTransaction: jest.fn().mockResolvedValue(undefined),
              release: jest.fn().mockResolvedValue(undefined),
              manager: {
                findOneBy: jest.fn(),
                findOne: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userCredentialsRepository = module.get<Repository<UserCredentials>>(getRepositoryToken(UserCredentials));
    certifiedCourseRepository = module.get<Repository<CertifiedCourse>>(getRepositoryToken(CertifiedCourse));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should post a new user', async () => {
    // Mock data
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const mockUser = {
      username: 'testuser',
      userPassword: 'password',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '123456789',
      rank: 'Test Rank',
      position: 'Test Position',
    };
    const mockUserCreated = { ...mockUser, userId: 'uuid', license: { licenseId: 'uuid' } } as any;
    const mockUsers: any[] = [];
    const mockLicense = { licenseId: 'uuid' } as any;
    jest.spyOn(bcrypt, 'genSalt').mockImplementation((arg, cb) => cb(null, 'salt'));
    jest.spyOn(bcrypt, 'hash').mockImplementation((arg, salt, cb) => cb(null, 'hash'));
    jest.spyOn(userCredentialsRepository, 'save').mockImplementation(() => Promise.resolve(undefined));
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    jest.spyOn(dataSource.createQueryRunner().manager, 'save').mockResolvedValue(mockUserCreated);

    //Execute the test
    const result = await controller.postUser(mockFile, mockUser);
    // Assertions
    expect(userRepository.find).toHaveBeenCalled();
    expect(userCredentialsRepository.save).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalled();
    expect(result).toEqual(mockUserCreated);
  });

  it('should get a user by id', async () => {
    const mockUserId = '123';
    const mockUser = { userId: mockUserId, username: 'testuser', termsOfRightsVersion: '1.0' } as any;
    const mockResult = { user: mockUser, termsOfRightsActual: true };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await controller.getUser(mockUserId);
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should refresh terms of rights', async () => {
    const mockUserId = '123';
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.refreshTermsOfRights(mockUserId);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should throw an HttpException if user already exists', async () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const mockUser = {
      username: 'testuser',
      userPassword: 'password',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '123456789',
      rank: 'Test Rank',
      position: 'Test Position',
    };
    const mockUsers: any = [{ username: mockUser.username }];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

    await expect(controller.postUser(mockFile, mockUser)).rejects.toThrow(HttpException);
  });

  it('should return null if creating a user fails', async () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const mockUser = {
      username: 'testuser',
      userPassword: 'password',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '123456789',
      rank: 'Test Rank',
      position: 'Test Position',
    };
    const mockUsers: any = [];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    jest.spyOn(dataSource.createQueryRunner().manager, 'save').mockRejectedValue(new Error('Failed to create user'));

    const result = await controller.postUser(mockFile, mockUser);
    expect(result).toBeNull();
  });

  it('should edit a user by id (name)', async () => {
    const mockUserId = '123';
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const mockEditUser = { editMode: 'name', payload: { name: 'newName' } } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (name) fails', async () => {
    const mockUserId = '123';
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const mockEditUser = { editMode: 'name', payload: { name: 'newName' } } as EditUserDto;
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Failed to update name'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should login a user', async () => {
    const mockLoginUser = { userName: 'testuser', userPassword: 'password' } as LoginUserDto;
    const mockUser = {
      userId: '123',
      username: 'testuser',
      termsOfRightsVersion: '1.0',
      amountOfLogins: 0,
      lastLogin: '',
    } as any;
    const mockCredentials = { username: 'testuser', hashedPassword: 'hash' } as any;
    const mockResult = { foundUser: mockUser, termsOfRightsActual: true };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(mockCredentials);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

    const result = await controller.loginUser(mockLoginUser);
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(userCredentialsRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
    expect(userRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should return null if login fails', async () => {
    const mockLoginUser = { userName: 'testuser', userPassword: 'password' } as LoginUserDto;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

    const result = await controller.loginUser(mockLoginUser);
    expect(result).toBeNull();
  });

  it('should add a certified course to a user', async () => {
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'application/pdf' } as Express.Multer.File;
    const mockCertifiedCourse = { name: 'testCourse', acquiredAt: '2024-01-01' };
    const mockUserId = '123';
    const mockUser = { userId: mockUserId } as any;
    const mockCertifiedCourseCreated = {
      ...mockCertifiedCourse,
      owner: mockUser,
      file: mockFile.buffer,
    } as any;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(certifiedCourseRepository, 'save').mockResolvedValue(mockCertifiedCourseCreated);

    const result = await controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId);
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(certifiedCourseRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockCertifiedCourseCreated);
  });

  it('should return null if adding a certified course fails', async () => {
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'application/pdf' } as Express.Multer.File;
    const mockCertifiedCourse = { name: 'testCourse', acquiredAt: '2024-01-01' };
    const mockUserId = '123';
    jest.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Failed to find user'));

    const result = await controller.addCertifiedCourse(mockFile, mockCertifiedCourse, mockUserId);
    expect(result).toEqual(undefined);
  });

  it('should set the fire brigade of a user', async () => {
    const mockSetFireBrigadeDto = { userId: '123', fireBrigadeId: '456' };
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(dataSource.createQueryRunner().manager, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.setFireBrigade(mockSetFireBrigadeDto);
    expect(dataSource.createQueryRunner().manager.update).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should return null if setting the fire brigade fails', async () => {
    const mockSetFireBrigadeDto = { userId: '123', fireBrigadeId: '456' };
    jest
      .spyOn(dataSource.createQueryRunner().manager, 'update')
      .mockRejectedValue(new Error('Failed to update fire brigade'));

    const result = await controller.setFireBrigade(mockSetFireBrigadeDto);
    expect(result).toBeUndefined();
  });

  it('should get all users', async () => {
    const mockUsers = [{ userId: '1' }, { userId: '2' }] as any[];
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

    const result = await controller.getUsers();
    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should return an empty array if no users are found', async () => {
    jest.spyOn(userRepository, 'find').mockResolvedValue([]);

    const result = await controller.getUsers();
    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should edit a user by id (password)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = {
      editMode: 'password',
      payload: { username: 'testuser', password: 'newPassword' },
    } as EditUserDto;
    jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue({ username: 'testuser', hashedPassword: 'hash' });
    jest.spyOn(bcrypt, 'genSalt').mockImplementation((arg, cb) => cb(null, 'salt'));
    jest.spyOn(bcrypt, 'hash').mockImplementation((arg, salt, cb) => cb(null, 'newHash'));
    jest.spyOn(userCredentialsRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userCredentialsRepository.findOne).toHaveBeenCalled();
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(userCredentialsRepository.update).toHaveBeenCalled();
    expect(result).toEqual({ affected: 1 } as UpdateResult);
  });

  it('should return null if editing a user (password) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = {
      editMode: 'password',
      payload: { username: 'testuser', password: 'newPassword' },
    } as EditUserDto;
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(undefined);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });
  it('should edit a user by id (position)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'position', payload: { position: 'newPosition' } } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (position) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'position', payload: { position: 'newPosition' } } as EditUserDto;
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Failed to update position'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should edit a user by id (username)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'username', payload: { username: 'newUsername' } } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newUsername' } });
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (username) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'username', payload: { username: 'newUsername' } } as EditUserDto;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ username: 'newUsername' } as any);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(null);
  });

  it('should edit a user by id (profilePicture)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'profilePicture', payload: {} } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (profilePicture) fails', async () => {
    const mockUserId = '123';
    const mockFile = undefined as unknown as Express.Multer.File;
    const mockEditUser = { editMode: 'profilePicture', payload: {} } as EditUserDto;
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Failed to update profile picture'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should edit a user by id (phone)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'phone', payload: { phone: 'newPhone' } } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (phone) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'phone', payload: { phone: 'newPhone' } } as EditUserDto;
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Failed to update phone'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should edit a user by id (address)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'address', payload: { address: 'newAddress' } } as EditUserDto;
    const mockUpdateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(userRepository.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdateResult);
  });

  it('should return null if editing a user (address) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'address', payload: { address: 'newAddress' } } as EditUserDto;
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Failed to update address'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should edit a user by id (certifiedCourses)', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'certifiedCourses', payload: { certifiedCourseId: '123' } } as EditUserDto;
    const mockDeleteResult = { affected: 1 } as UpdateResult;
    jest.spyOn(certifiedCourseRepository, 'delete').mockResolvedValue(mockDeleteResult);

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(certifiedCourseRepository.delete).toHaveBeenCalled();
    expect(result).toEqual(mockDeleteResult);
  });

  it('should return null if editing a user (certifiedCourses) fails', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'certifiedCourses', payload: { certifiedCourseId: '123' } } as EditUserDto;
    jest.spyOn(certifiedCourseRepository, 'delete').mockRejectedValue(new Error('Failed to delete certified course'));

    const result = await controller.editUser(mockUserId, mockFile, mockEditUser);
    expect(result).toEqual(undefined);
  });

  it('should throw an error if the edit mode is invalid', async () => {
    const mockUserId = '123';
    const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' } as Express.Multer.File;
    const mockEditUser = { editMode: 'invalidMode', payload: {} } as EditUserDto;

    await expect(controller.editUser(mockUserId, mockFile, mockEditUser)).rejects.toThrow(Error);
  });
});
