import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import CreateUserDto from './createUserDto';
import LoginUserDto from './loginUserDto';
import EditUserDto from './editUserDto';
import setUserFireBrigadeDto from './setUserFireBrigadeDto';
import { DataSource } from 'typeorm';
import CertifiedCourseDto from './certifiedCourseDto';
import UserCredentials from './userCredentials.entity';
import CertifiedCourse from './certifiedCourse.entity';
import License from 'src/license/license.entity';
import Constants from 'src/util/constants';
import * as bcrypt from 'bcrypt';
import FireBrigade from 'src/fire-brigade/fireBrigade.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
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
                save: jest.fn(),
                findOne: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userCredentialsRepository = module.get<Repository<UserCredentials>>(getRepositoryToken(UserCredentials));
    certifiedCourseRepository = module.get<Repository<CertifiedCourse>>(getRepositoryToken(CertifiedCourse));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create a user', async () => {
    const file = { buffer: Buffer.from('test'), mimetype: 'image/png' } as any;
    const userDto = new CreateUserDto();
    userDto.username = 'testuser';
    userDto.userPassword = 'password';
    userDto.name = 'Test User';
    userDto.address = 'Test Address';
    userDto.telephoneNumber = '123456789';
    userDto.rank = 'Test Rank';
    userDto.position = 'Test Position';

    const mockUser = new User();
    mockUser.userId = '123';
    mockUser.username = userDto.username;
    mockUser.name = userDto.name;
    mockUser.address = userDto.address;
    mockUser.telephoneNumber = userDto.telephoneNumber;
    mockUser.rank = userDto.rank;
    mockUser.position = userDto.position;
    mockUser.profilePicture = file.buffer;
    mockUser.lastLogin = '';
    mockUser.amountOfLogins = 0;
    mockUser.license = new License();
    mockUser.termsOfRightsVersion = Constants.TERMS_OF_RIGHTS_VERSION;
    mockUser.fireBrigade = new FireBrigade();
    mockUser.chats = [];
    mockUser.blackBoardEntries = [];
    mockUser.certifiedCourse = [];
    mockUser.blackBoardAssignments = [];
    mockUser.workTime = [];

    const createCredentialsSpy = jest.spyOn(service, 'createCredentials').mockResolvedValue(undefined);
    const createOneSpy = jest.spyOn(service, 'createOne').mockResolvedValue(mockUser as any);
    const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);

    const result = await controller.postUser(file, userDto);

    expect(createCredentialsSpy).toHaveBeenCalledWith(userDto);
    expect(createOneSpy).toHaveBeenCalledWith(file, userDto);
    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should not create a user if username already exists', async () => {
    const file = { buffer: Buffer.from('test'), mimetype: 'image/png' } as any;
    const userDto = new CreateUserDto();
    userDto.username = 'testuser';
    userDto.userPassword = 'password';
    userDto.name = 'Test User';
    userDto.address = 'Test Address';
    userDto.telephoneNumber = '123456789';
    userDto.rank = 'Test Rank';
    userDto.position = 'Test Position';

    const mockUser = new User();
    mockUser.userId = '123';
    mockUser.username = userDto.username;
    mockUser.name = userDto.name;
    mockUser.address = userDto.address;
    mockUser.telephoneNumber = userDto.telephoneNumber;
    mockUser.rank = userDto.rank;
    mockUser.position = userDto.position;
    mockUser.profilePicture = file.buffer;
    mockUser.lastLogin = '';
    mockUser.amountOfLogins = 0;
    mockUser.license = new License();
    mockUser.termsOfRightsVersion = Constants.TERMS_OF_RIGHTS_VERSION;
    mockUser.fireBrigade = new FireBrigade();
    mockUser.chats = [];
    mockUser.blackBoardEntries = [];
    mockUser.certifiedCourse = [];
    mockUser.blackBoardAssignments = [];
    mockUser.workTime = [];

    const createCredentialsSpy = jest.spyOn(service, 'createCredentials').mockResolvedValue(undefined);
    const createOneSpy = jest.spyOn(service, 'createOne').mockResolvedValue(mockUser as any);
    const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([mockUser]);

    const result = await controller.postUser(file, userDto);

    expect(createCredentialsSpy).toHaveBeenCalledWith(userDto);
    expect(createOneSpy).not.toHaveBeenCalled();
    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should login a user', async () => {
    const userDto = new LoginUserDto();
    userDto.userName = 'testuser';
    userDto.userPassword = 'password';

    const mockUser = new User();
    mockUser.userId = '123';
    mockUser.username = userDto.userName;
    mockUser.name = 'Test User';
    mockUser.address = 'Test Address';
    mockUser.telephoneNumber = '123456789';
    mockUser.rank = 'Test Rank';
    mockUser.position = 'Test Position';
    mockUser.profilePicture = null;
    mockUser.lastLogin = '';
    mockUser.amountOfLogins = 0;
    mockUser.license = new License();
    mockUser.termsOfRightsVersion = Constants.TERMS_OF_RIGHTS_VERSION;
    mockUser.fireBrigade = new FireBrigade();
    mockUser.chats = [];
    mockUser.blackBoardEntries = [];
    mockUser.certifiedCourse = [];
    mockUser.blackBoardAssignments = [];
    mockUser.workTime = [];

    const mockCredentials = new UserCredentials();
    mockCredentials.username = userDto.userName;
    mockCredentials.hashedPassword = 'hash';

    const mockResult = { foundUser: mockUser, termsOfRightsActual: true };

    const userRepositorySpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    const userCredentialsRepositorySpy = jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue(mockCredentials as any);
    const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const updateUserSpy = jest.spyOn(service, 'updateUser').mockResolvedValue(mockUser);

    const result = await controller.loginUser(userDto);

    expect(userRepositorySpy).toHaveBeenCalled();
    expect(userCredentialsRepositorySpy).toHaveBeenCalled();
    expect(bcryptCompareSpy).toHaveBeenCalled();
    expect(updateUserSpy).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should not login a user with incorrect password', async () => {
    const userDto = new LoginUserDto();
    userDto.userName = 'testuser';
    userDto.userPassword = 'wrongpassword';

    const mockUser = new User();
    mockUser.userId = '123';
    mockUser.username = userDto.userName;

    const mockCredentials = new UserCredentials();
    mockCredentials.username = userDto.userName;
    mockCredentials.hashedPassword = 'hash';

    const userRepositorySpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    const userCredentialsRepositorySpy = jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue(mockCredentials as any);
    const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const updateUserSpy = jest.spyOn(service, 'updateUser').mockResolvedValue(mockUser);

    const result = await controller.loginUser(userDto);

    expect(userRepositorySpy).toHaveBeenCalled();
    expect(userCredentialsRepositorySpy).toHaveBeenCalled();
    expect(bcryptCompareSpy).toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should not login a user if user does not exist', async () => {
    const userDto = new LoginUserDto();
    userDto.userName = 'testuser';
    userDto.userPassword = 'password';

    const userRepositorySpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(null as any);
    const userCredentialsRepositorySpy = jest.spyOn(userCredentialsRepository, 'findOne');
    const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');
    const updateUserSpy = jest.spyOn(service, 'updateUser');

    const result = await controller.loginUser(userDto);

    expect(userRepositorySpy).toHaveBeenCalled();
    expect(userCredentialsRepositorySpy).not.toHaveBeenCalled();
    expect(bcryptCompareSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should edit a user', async () => {
    const id = '123';
    const file = { buffer: Buffer.from('test'), mimetype: 'image/png' } as any;
    const userDto = new EditUserDto();
    userDto.editMode = 'name';
    userDto.payload = { name: 'New Name' };

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { name: userDto.payload.name });
    expect(result).toEqual({ affected: 1 });
  });

  it('should edit a user password', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'password';
    userDto.payload = { username: 'testuser', password: 'newpassword' };

    const mockCredentials = new UserCredentials();
    mockCredentials.username = userDto.payload.username;
    mockCredentials.hashedPassword = 'oldhash';

    const userCredentialsRepositorySpy = jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue(mockCredentials as any);
    const bcryptGenSaltSpy = jest
      .spyOn(bcrypt, 'genSalt')
      .mockImplementation((arg1, callback) => callback(null, 'salt'));
    const bcryptHashSpy = jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation((arg1, arg2, callback) => callback(null, 'newhash'));
    const userCredentialsUpdateSpy = jest
      .spyOn(userCredentialsRepository, 'update')
      .mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(userCredentialsRepositorySpy).toHaveBeenCalled();
    expect(bcryptGenSaltSpy).toHaveBeenCalled();
    expect(bcryptHashSpy).toHaveBeenCalled();
    expect(userCredentialsUpdateSpy).toHaveBeenCalledWith(
      { username: userDto.payload.username },
      { hashedPassword: 'newhash' },
    );
    expect(result).toBeUndefined();
  });

  it('should not edit a user password if credentials not found', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'password';
    userDto.payload = { username: 'testuser', password: 'newpassword' };

    const userCredentialsRepositorySpy = jest
      .spyOn(userCredentialsRepository, 'findOne')
      .mockResolvedValue(null as any);
    const bcryptGenSaltSpy = jest.spyOn(bcrypt, 'genSalt');
    const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');
    const userCredentialsUpdateSpy = jest.spyOn(userCredentialsRepository, 'update');

    const result = await controller.editUser(id, file, userDto);

    expect(userCredentialsRepositorySpy).toHaveBeenCalled();
    expect(bcryptGenSaltSpy).not.toHaveBeenCalled();
    expect(bcryptHashSpy).not.toHaveBeenCalled();
    expect(userCredentialsUpdateSpy).not.toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should edit a user profile picture', async () => {
    const id = '123';
    const file = { buffer: Buffer.from('test'), mimetype: 'image/png' } as any;
    const userDto = new EditUserDto();
    userDto.editMode = 'profilePicture';
    userDto.payload = {};

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { profilePicture: file.buffer });
    expect(result).toEqual({ affected: 1 });
  });

  it('should remove a user profile picture', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'profilePicture';
    userDto.payload = {};

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { profilePicture: null });
    expect(result).toEqual({ affected: 1 });
  });

  it('should not edit user profile picture with wrong mime type', async () => {
    const id = '123';
    const file = { buffer: Buffer.from('test'), mimetype: 'text/plain' } as any;
    const userDto = new EditUserDto();
    userDto.editMode = 'profilePicture';
    userDto.payload = {};

    const updateSpy = jest.spyOn(userRepository, 'update');

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should set fire brigade for a user', async () => {
    const userDto = new setUserFireBrigadeDto();
    userDto.userId = '123';
    userDto.fireBrigadeId = '456';

    const updateSpy = jest
      .spyOn(dataSource.createQueryRunner().manager, 'update')
      .mockResolvedValue({ affected: 1 } as any);

    await controller.setFireBrigade(userDto);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should refresh terms of rights', async () => {
    const id = '123';
    const mockUpdateResult = { affected: 1 } as UpdateResult;

    const updateSpy = jest.spyOn(service, 'refreshTermsOfRights').mockResolvedValue(mockUpdateResult as any);
    const result = await controller.refreshTermsOfRights(id);

    expect(updateSpy).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockUpdateResult);
  });

  it('should get a user', async () => {
    const id = '123';
    const mockUser = new User();
    mockUser.userId = '123';
    mockUser.username = 'testuser';
    mockUser.name = 'Test User';
    mockUser.address = 'Test Address';
    mockUser.telephoneNumber = '123456789';
    mockUser.rank = 'Test Rank';
    mockUser.position = 'Test Position';
    mockUser.profilePicture = null;
    mockUser.lastLogin = '';
    mockUser.amountOfLogins = 0;
    mockUser.license = new License();
    mockUser.termsOfRightsVersion = Constants.TERMS_OF_RIGHTS_VERSION;
    mockUser.fireBrigade = new FireBrigade();
    mockUser.chats = [];
    mockUser.blackBoardEntries = [];
    mockUser.certifiedCourse = [];
    mockUser.blackBoardAssignments = [];
    mockUser.workTime = [];

    const mockResult = { user: mockUser, termsOfRightsActual: true };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(mockResult as any);

    const result = await controller.getUser(id);

    expect(findOneSpy).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockResult);
  });

  it('should get all users', async () => {
    const mockUsers = [new User()];
    const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers as any);

    const result = await controller.getUsers();

    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should add a certified course', async () => {
    const file = { buffer: Buffer.from('test') } as any;
    const certifiedCourseDto = new CertifiedCourseDto();
    certifiedCourseDto.name = 'Test Course';
    certifiedCourseDto.acquiredAt = '2024-01-01';
    const id = '123';

    const mockCertifiedCourse = new CertifiedCourse();
    mockCertifiedCourse.name = certifiedCourseDto.name;
    mockCertifiedCourse.acquiredAt = certifiedCourseDto.acquiredAt;
    mockCertifiedCourse.file = file.buffer;
    mockCertifiedCourse.owner = new User();

    const userRepositorySpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(new User() as any);
    const saveSpy = jest.spyOn(certifiedCourseRepository, 'save').mockResolvedValue(mockCertifiedCourse as any);

    const result = await controller.addCertifiedCourse(file, certifiedCourseDto, id);

    expect(userRepositorySpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(result).toEqual(mockCertifiedCourse);
  });

  it('should edit a user position', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'position';
    userDto.payload = { position: 'New Position' };

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { position: userDto.payload.position });
    expect(result).toEqual({ affected: 1 });
  });

  it('should edit a user username', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'username';
    userDto.payload = { username: 'NewUsername' };

    const userRepositoryFindOneSpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(null as any);
    const userRepositoryUpdateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(userRepositoryFindOneSpy).toHaveBeenCalledWith({ where: { username: userDto.payload.username } });
    expect(userRepositoryUpdateSpy).toHaveBeenCalledWith({ userId: id }, { username: userDto.payload.username });
    expect(result).toEqual({ affected: 1 });
  });

  it('should not edit a user username if username already exists', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'username';
    userDto.payload = { username: 'NewUsername' };

    const mockUser = new User();
    mockUser.username = userDto.payload.username;

    const userRepositoryFindOneSpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    const userRepositoryUpdateSpy = jest.spyOn(userRepository, 'update');

    const result = await controller.editUser(id, file, userDto);

    expect(userRepositoryFindOneSpy).toHaveBeenCalledWith({ where: { username: userDto.payload.username } });
    expect(userRepositoryUpdateSpy).not.toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should edit a user phone number', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'phone';
    userDto.payload = { phone: '0123456789' };

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { telephoneNumber: userDto.payload.phone });
    expect(result).toEqual({ affected: 1 });
  });

  it('should edit a user address', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'address';
    userDto.payload = { address: 'New Address' };

    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(updateSpy).toHaveBeenCalledWith({ userId: id }, { address: userDto.payload.address });
    expect(result).toEqual({ affected: 1 });
  });

  it('should delete a certified course', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'certifiedCourses';
    userDto.payload = { certifiedCourseId: '456' };

    const deleteSpy = jest.spyOn(certifiedCourseRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    const result = await controller.editUser(id, file, userDto);

    expect(deleteSpy).toHaveBeenCalledWith({ courseId: userDto.payload.certifiedCourseId });
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw an error for invalid edit mode', async () => {
    const id = '123';
    const file = null;
    const userDto = new EditUserDto();
    userDto.editMode = 'invalid';
    userDto.payload = {};

    await expect(controller.editUser(id, file, userDto)).rejects.toThrowError();
  });
});
