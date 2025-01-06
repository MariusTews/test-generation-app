import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import CreateUserDto from './createUserDto';
import UserCredentials from './userCredentials.entity';
import LoginUserDto from './loginUserDto';
import EditUserDto from './editUserDto';
import setUserFireBrigadeDto from './setUserFireBrigadeDto';
import { DataSource } from 'typeorm';
import CertifiedCourseDto from './certifiedCourseDto';
import CertifiedCourse from './certifiedCourse.entity';
import License from '../license/license.entity';
import FireBrigade from '../fire-brigade/fireBrigade.entity';
import * as bcrypt from 'bcrypt';

const mockUser: User = {
  userId: '1',
  username: 'testuser',
  name: 'Test User',
  address: 'Test Address',
  telephoneNumber: '1234567890',
  rank: 'Test Rank',
  position: 'Test Position',
  profilePicture: null,
  lastLogin: '2024-07-24T12:00:00.000Z',
  amountOfLogins: 0,
  termsOfRightsVersion: '1.0',
  license: new License(),
  fireBrigade: new FireBrigade(),
  chats: [],
  blackBoardEntries: [],
  blackBoardAssignments: [],
  workTime: [],
  certifiedCourse: [],
};

const mockUser2: User = {
  userId: '2',
  username: 'testuser2',
  name: 'Test User 2',
  address: 'Test Address 2',
  telephoneNumber: '0987654321',
  rank: 'Test Rank 2',
  position: 'Test Position 2',
  profilePicture: null,
  lastLogin: '2024-07-24T12:00:00.000Z',
  amountOfLogins: 0,
  termsOfRightsVersion: '1.0',
  license: new License(),
  fireBrigade: new FireBrigade(),
  chats: [],
  blackBoardEntries: [],
  blackBoardAssignments: [],
  workTime: [],
  certifiedCourse: [],
};

const mockUserCredentials: UserCredentials = {
  username: 'testuser',
  hashedPassword: 'hashedpassword',
};

const mockCertifiedCourse: CertifiedCourse = {
  courseId: '1',
  name: 'Test Course',
  acquiredAt: '2024-07-24T12:00:00.000Z',
  file: null,
  owner: mockUser,
};

const mockUpdateResult: UpdateResult = {
  raw: [],
  affected: 1,
} as any;

const mockUpdateResult0: UpdateResult = {
  raw: [],
  affected: 0,
} as any;

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      update: jest.fn(),
    },
  }),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepository: Repository<User>;
  let userCredentialsRepository: Repository<UserCredentials>;
  let certifiedCourseRepository: Repository<CertifiedCourse>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserCredentials),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CertifiedCourse),
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userCredentialsRepository = module.get<Repository<UserCredentials>>(getRepositoryToken(UserCredentials));
    certifiedCourseRepository = module.get<Repository<CertifiedCourse>>(getRepositoryToken(CertifiedCourse));
  });

  it('should createUser', async () => {
    const createUserDto: CreateUserDto = new CreateUserDto();
    createUserDto.username = 'testuser';
    createUserDto.userPassword = 'password';
    createUserDto.name = 'Test User';
    createUserDto.address = 'Test Address';
    createUserDto.telephoneNumber = '1234567890';
    createUserDto.rank = 'Test Rank';
    createUserDto.position = 'Test Position';

    jest.spyOn(userRepository, 'find').mockResolvedValue([]);
    jest.spyOn(userCredentialsRepository, 'save').mockResolvedValue(mockUserCredentials as any);
    const mockNewUser = { ...mockUser };
    mockNewUser.lastLogin = '';
    mockNewUser.license = new License();
    delete mockNewUser.userId;
    delete mockNewUser.chats;
    delete mockNewUser.blackBoardEntries;
    delete mockNewUser.blackBoardAssignments;
    delete mockNewUser.fireBrigade;
    delete mockNewUser.workTime;
    delete mockNewUser.certifiedCourse;
    delete mockNewUser.profilePicture;

    jest.spyOn(userRepository, 'save').mockResolvedValue(mockNewUser as any);

    const result = await controller.postUser({} as any, createUserDto);
    expect(result).toEqual(mockNewUser);
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    expect(userCredentialsRepository.save).toHaveBeenCalled();
  });

  it('should not createUser if user already exists', async () => {
    const createUserDto: CreateUserDto = new CreateUserDto();
    createUserDto.username = 'testuser';
    createUserDto.userPassword = 'password';
    createUserDto.name = 'Test User';
    createUserDto.address = 'Test Address';
    createUserDto.telephoneNumber = '1234567890';
    createUserDto.rank = 'Test Rank';
    createUserDto.position = 'Test Position';

    jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);

    const result = await controller.postUser({} as Express.Multer.File, createUserDto);
    expect(result).toBeNull();
    expect(userRepository.find).toHaveBeenCalled();
  });

  it('should addCertifiedCourse', async () => {
    const newCertifiedCourse = new CertifiedCourse();
    newCertifiedCourse.name = 'Test Course';
    newCertifiedCourse.acquiredAt = '2024-07-24T12:00:00.000Z';
    newCertifiedCourse.file = undefined;
    newCertifiedCourse.owner = mockUser;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(certifiedCourseRepository, 'save').mockResolvedValue(newCertifiedCourse as any);

    const result = await controller.addCertifiedCourse({} as any, newCertifiedCourse, '1');
    expect(result).toEqual(newCertifiedCourse);
    expect(certifiedCourseRepository.save).toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalled();
  });

  it('should editUser - name', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'name', payload: { name: 'New Name' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - password', async () => {
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(mockUserCredentials as any);
    jest.spyOn(bcrypt, 'genSalt').mockImplementation((arg1, callback) => callback(null, 'salt'));
    jest.spyOn(bcrypt, 'hash').mockImplementation((arg1, arg2, callback) => callback(null, 'newHash'));
    jest.spyOn(userCredentialsRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = {
      editMode: 'password',
      payload: { username: 'testuser', password: 'newPassword' },
    };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toBeUndefined();
    expect(userCredentialsRepository.update).toHaveBeenCalled();
  });

  it('should editUser - position', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'position', payload: { position: 'New Position' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - username', async () => {
    jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUser2 as any);
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'username', payload: { username: 'newUsername' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should not editUser - username if username already exists', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser2 as any);

    const editUserDto: EditUserDto = { editMode: 'username', payload: { username: 'testuser2' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toBeNull();
    expect(userRepository.findOne).toHaveBeenCalled();
  });

  it('should editUser - profilePicture', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'profilePicture', payload: {} };
    const buffer = Buffer.from('test', 'binary');
    const result = await controller.editUser('1', { buffer, mimetype: 'image/jpeg' } as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - profilePicture to null', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'profilePicture', payload: {} };
    const result = await controller.editUser('1', undefined as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - phone', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'phone', payload: { phone: '0123456789' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - address', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'address', payload: { address: 'New Address' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should editUser - certifiedCourses', async () => {
    jest.spyOn(certifiedCourseRepository, 'delete').mockResolvedValue(mockUpdateResult as any);

    const editUserDto: EditUserDto = { editMode: 'certifiedCourses', payload: { certifiedCourseId: '1' } };
    const result = await controller.editUser('1', {} as any, editUserDto);
    expect(result).toEqual(mockUpdateResult);
    expect(certifiedCourseRepository.delete).toHaveBeenCalled();
  });

  it('should setFireBrigade', async () => {
    const setFireBrigadeDto: setUserFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    jest.spyOn(mockDataSource.createQueryRunner().manager, 'update').mockResolvedValue(mockUpdateResult as any);

    await controller.setFireBrigade(setFireBrigadeDto);
    expect(mockDataSource.createQueryRunner().manager.update).toHaveBeenCalled();
  });

  it('should loginUser', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(mockUserCredentials as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const loginUserDto: LoginUserDto = { userName: 'testuser', userPassword: 'password' };
    const result = await controller.loginUser(loginUserDto);
    expect(result).toEqual({ foundUser: mockUser, termsOfRightsActual: true });
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(userCredentialsRepository.findOne).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalled();
  });

  it('should not loginUser', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userCredentialsRepository, 'findOne').mockResolvedValue(mockUserCredentials as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const loginUserDto: LoginUserDto = { userName: 'testuser', userPassword: 'wrongpassword' };
    const result = await controller.loginUser(loginUserDto);
    expect(result).toBeNull();
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(userCredentialsRepository.findOne).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalled();
  });

  it('should refreshTermsOfRights', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult as any);

    const result = await controller.refreshTermsOfRights('1');
    expect(result).toEqual(mockUpdateResult);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should not refreshTermsOfRights', async () => {
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUpdateResult0 as any);

    const result = await controller.refreshTermsOfRights('3');
    expect(result).toEqual(mockUpdateResult0);
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should getUser', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

    const result = await controller.getUser('1');
    expect(result).toEqual({ user: mockUser, termsOfRightsActual: true });
    expect(userRepository.findOne).toHaveBeenCalled();
  });

  it('should not getUser', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const result = await controller.getUser('3');
    expect(result).toEqual(null);
    expect(userRepository.findOne).toHaveBeenCalled();
  });

  it('should getUsers', async () => {
    jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser, mockUser2]);

    const result = await controller.getUsers();
    expect(result).toEqual([mockUser, mockUser2]);
    expect(userRepository.find).toHaveBeenCalled();
  });
});
