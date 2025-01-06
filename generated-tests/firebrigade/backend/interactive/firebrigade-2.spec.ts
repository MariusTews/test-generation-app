import { Test, TestingModule } from '@nestjs/testing';
import { FireBrigadeService } from './fire-brigade.service';
import { FireBrigadeController } from './fire-brigade.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import FireBrigade from './fireBrigade.entity';
import CreateFireBrigadeRequest from './createFireBrigadeRequest.entity';
import JoinFireBrigadeDto from './joinFireBrigadeDto';
import JoinFireBrigadeRequest from './joinFireBrigadeRequest.entity';
import FireBrigadePicture from './fireBrigadePicture.entity';
import DeploymentStorage from 'src/deployment/deploymentStorage.entity';
import DistrictChatMap from 'src/chat/districtChatMap.entity';
import User from 'src/user/user.entity';
import CreateFireBrigadeDto from './createFireBrigadeDto';
import ConfirmCreateRequestDto from './confirmCreateRequestDto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';

describe('FireBrigadeController', () => {
  let controller: FireBrigadeController;
  let service: FireBrigadeService;
  let fireBrigadeRepository: Repository<FireBrigade>;
  let createRequestRepository: Repository<CreateFireBrigadeRequest>;
  let joinRequestRepository: Repository<JoinFireBrigadeRequest>;
  let pictureRepository: Repository<FireBrigadePicture>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let districtChatMapRepository: Repository<DistrictChatMap>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let queryRunner: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FireBrigadeService,
        {
          provide: getRepositoryToken(FireBrigade),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CreateFireBrigadeRequest),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(JoinFireBrigadeRequest),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(FireBrigadePicture),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeploymentStorage),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DistrictChatMap),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
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
                find: jest.fn(),
              },
            }),
          },
        },
      ],
      controllers: [FireBrigadeController],
    }).compile();

    controller = module.get<FireBrigadeController>(FireBrigadeController);
    service = module.get<FireBrigadeService>(FireBrigadeService);
    fireBrigadeRepository = module.get<Repository<FireBrigade>>(getRepositoryToken(FireBrigade));
    createRequestRepository = module.get<Repository<CreateFireBrigadeRequest>>(
      getRepositoryToken(CreateFireBrigadeRequest),
    );
    joinRequestRepository = module.get<Repository<JoinFireBrigadeRequest>>(getRepositoryToken(JoinFireBrigadeRequest));
    pictureRepository = module.get<Repository<FireBrigadePicture>>(getRepositoryToken(FireBrigadePicture));
    deploymentStorageRepository = module.get<Repository<DeploymentStorage>>(getRepositoryToken(DeploymentStorage));
    districtChatMapRepository = module.get<Repository<DistrictChatMap>>(getRepositoryToken(DistrictChatMap));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all fire brigades and create requests', async () => {
    // Arrange
    const mockFireBrigades: FireBrigade[] = [new FireBrigade()];
    const mockCreateRequests: CreateFireBrigadeRequest[] = [new CreateFireBrigadeRequest()];
    const mockDeploymentStorage: DeploymentStorage = new DeploymentStorage();
    mockDeploymentStorage.storageId = '123';
    mockDeploymentStorage.deployments = [];
    const mockMembers: User[] = [new User()];
    mockFireBrigades[0].deploymentStorage = mockDeploymentStorage;
    mockFireBrigades[0].members = mockMembers;
    const findSpy = jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValue(mockFireBrigades);
    const createRequestSpy = jest.spyOn(createRequestRepository, 'find').mockResolvedValue(mockCreateRequests);
    const deploymentStorageSpy = jest
      .spyOn(deploymentStorageRepository, 'findOne')
      .mockResolvedValue(mockDeploymentStorage);

    // Act
    const result = await controller.getAllFireBrigadesAndCreateRequests();

    // Assert
    expect(result).toBeDefined();
    expect(findSpy).toHaveBeenCalled();
    expect(createRequestSpy).toHaveBeenCalled();
    expect(deploymentStorageSpy).toHaveBeenCalled();
  });

  it('should create a join request', async () => {
    // Arrange
    const mockJoinFireBrigadeDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '2' };
    const mockUser: User = new User();
    mockUser.fireBrigade = null;
    const findOneSpy = jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(mockUser);
    const saveSpy = jest.spyOn(queryRunner.manager, 'save');

    // Act
    await controller.postJoinRequest(mockJoinFireBrigadeDto);

    // Assert
    expect(findOneSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should create a fire brigade request', async () => {
    //Arrange
    const mockCreateFireBrigadeDto: CreateFireBrigadeDto = {
      name: 'Test Fire Brigade',
      address: 'Test Address',
      state: 'Test State',
      district: 'Test District',
      voluntary: true,
      creator: '1',
    };
    const mockUser: User = new User();
    mockUser.position = 'Wehrleiter/in';
    mockUser.fireBrigade = null;
    const mockPossibleRequest: CreateFireBrigadeRequest | null = null;
    const findOneSpyUser = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    const findOneSpyRequest = jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(mockPossibleRequest);
    const saveSpy = jest.spyOn(createRequestRepository, 'save').mockReturnValue(undefined);

    //Act
    await controller.postCreateRequest(mockCreateFireBrigadeDto);

    //Assert
    expect(findOneSpyUser).toHaveBeenCalled();
    expect(findOneSpyRequest).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should confirm a fire brigade creation request', async () => {
    // Arrange
    const mockConfirmCreateRequestDto: ConfirmCreateRequestDto = {
      userId: '1',
      fireBrigadeId: '2',
    };
    const mockRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();
    mockRequest.confirmations = ['2', '3'];
    mockRequest.creator = '4';
    const findOneBySpy = jest.spyOn(queryRunner.manager, 'findOneBy').mockResolvedValue(mockRequest);
    const saveSpy = jest.spyOn(queryRunner.manager, 'save');
    const deleteSpy = jest.spyOn(queryRunner.manager, 'delete');

    // Act
    await controller.postConfirmCreateRequest(mockConfirmCreateRequestDto);

    // Assert
    expect(findOneBySpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should accept a join request', async () => {
    // Arrange
    const mockJoinFireBrigadeDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '2' };
    const mockUser: User = new User();
    mockUser.fireBrigade = null;
    const mockPossibleRequest: CreateFireBrigadeRequest | null = null;
    const findOneSpyUser = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    const findOneSpyRequest = jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(mockPossibleRequest);
    const deleteSpy = jest.spyOn(joinRequestRepository, 'delete').mockResolvedValue(undefined);

    // Act
    await controller.postAcceptRequest(mockJoinFireBrigadeDto);

    // Assert
    expect(findOneSpyUser).toHaveBeenCalled();
    expect(findOneSpyRequest).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should throw a BadRequestException if trying to confirm a request with an already existing fire brigade', async () => {
    // Arrange
    const mockConfirmCreateRequestDto: ConfirmCreateRequestDto = { userId: '1', fireBrigadeId: '2' };
    const mockFireBrigade: FireBrigade = new FireBrigade();
    jest.spyOn(queryRunner.manager, 'findOneBy').mockResolvedValue(null);
    jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(mockFireBrigade);

    // Act & Assert
    await expect(controller.postConfirmCreateRequest(mockConfirmCreateRequestDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw a NotFoundException if trying to accept a join request that does not exist', async () => {
    // Arrange
    const mockJoinFireBrigadeDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '2' };
    const mockUser: User = new User();
    mockUser.fireBrigade = null;
    const mockPossibleRequest: CreateFireBrigadeRequest | null = null;
    const findOneSpyUser = jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    const findOneSpyRequest = jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(mockPossibleRequest);
    const deleteSpy = jest.spyOn(joinRequestRepository, 'delete').mockRejectedValue(new NotFoundException());

    // Act & Assert
    await expect(controller.postAcceptRequest(mockJoinFireBrigadeDto)).rejects.toThrow(NotFoundException);
  });

  it('should decline a join request', async () => {
    //Arrange
    const mockJoinFireBrigadeDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '2' };
    const deleteSpy = jest.spyOn(joinRequestRepository, 'delete').mockResolvedValue(undefined);

    //Act
    await controller.postDeclineRequest(mockJoinFireBrigadeDto);

    //Assert
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should throw a bad request exception if the user is not allowed to create a fire brigade request', async () => {
    // Arrange
    const mockCreateFireBrigadeDto: CreateFireBrigadeDto = {
      name: 'Test Fire Brigade',
      address: 'Test Address',
      state: 'Test State',
      district: 'Test District',
      voluntary: true,
      creator: '1',
    };
    const mockUser: User = new User();
    mockUser.position = 'Feuerwehrmann/frau';
    mockUser.fireBrigade = new FireBrigade();
    const mockPossibleRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(mockPossibleRequest);

    // Act & Assert
    await expect(controller.postCreateRequest(mockCreateFireBrigadeDto)).rejects.toThrow(BadRequestException);
  });

  it('should get a fire brigade by id', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockFireBrigade: FireBrigade = new FireBrigade();
    const findOneSpy = jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(mockFireBrigade);

    //Act
    await controller.getFireBrigade(fireBrigadeId);

    //Assert
    expect(findOneSpy).toHaveBeenCalledWith({ where: { fireBrigadeId: fireBrigadeId }, loadRelationIds: true });
  });

  it('should throw a NotFoundException if fire brigade with given id does not exist', async () => {
    //Arrange
    const fireBrigadeId = '1';
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(undefined);

    //Act & Assert
    await expect(controller.getFireBrigade(fireBrigadeId)).rejects.toThrow(NotFoundException);
  });

  it('should get all fire brigade pictures for a given fire brigade id', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockFireBrigade: FireBrigade = new FireBrigade();
    const mockPictures = [];
    mockFireBrigade.stationPictures = mockPictures;
    const findOneSpy = jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(mockFireBrigade);

    //Act
    await controller.getAllPictures(fireBrigadeId);

    //Assert
    expect(findOneSpy).toHaveBeenCalledWith({
      where: { fireBrigadeId: fireBrigadeId },
      relations: ['stationPictures'],
    });
  });

  it('should throw a NotFoundException if no pictures for given fire brigade id exist', async () => {
    //Arrange
    const fireBrigadeId = '1';
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(undefined);

    //Act & Assert
    await expect(controller.getAllPictures(fireBrigadeId)).rejects.toThrow(NotFoundException);
  });

  it('should get all members for a given fire brigade id', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockFireBrigade: FireBrigade = new FireBrigade();
    const mockMembers = [];
    mockFireBrigade.members = mockMembers;
    const findOneSpy = jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(mockFireBrigade);

    //Act
    await controller.getAllMembers(fireBrigadeId);

    //Assert
    expect(findOneSpy).toHaveBeenCalledWith({ where: { fireBrigadeId: fireBrigadeId }, relations: ['members'] });
  });

  it('should throw a NotFoundException if no members for given fire brigade id exist', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const findOneSpy = jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(undefined);

    //Act & Assert
    await expect(controller.getAllMembers(fireBrigadeId)).rejects.toThrow(NotFoundException);
  });

  it('should add a picture to a fire brigade', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'picture',
      originalname: 'test.png',
      encoding: 'utf8',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
      size: 4,
      destination: '',
      filename: '',
      path: '',
      stream: new Readable(),
    };
    const addPictureSpy = jest.spyOn(service, 'addPicture');

    //Act
    await controller.postPicture(mockFile, fireBrigadeId);

    //Assert
    expect(addPictureSpy).toHaveBeenCalledWith(mockFile, fireBrigadeId);
  });

  it('should throw a bad request exception if the mime type of the uploaded file is not allowed', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockFile: Express.Multer.File = {
      fieldname: 'picture',
      originalname: 'test.txt',
      encoding: 'utf8',
      mimetype: 'text/plain',
      buffer: Buffer.from('test'),
      size: 4,
      destination: '',
      filename: '',
      path: '',
      stream: new Readable(),
    };
    const addPictureSpy = jest.spyOn(service, 'addPicture');

    //Act & Assert
    await expect(controller.postPicture(mockFile, fireBrigadeId)).rejects.toThrow(BadRequestException);
  });

  it('should delete a fire brigade picture', async () => {
    //Arrange
    const pictureId = '1';
    const deleteSpy = jest.spyOn(pictureRepository, 'delete').mockResolvedValue(undefined);

    //Act
    await controller.deletePicture(pictureId);

    //Assert
    expect(deleteSpy).toHaveBeenCalledWith(pictureId);
  });

  it('should throw a NotFoundException if trying to delete a fire brigade picture that does not exist', async () => {
    //Arrange
    const pictureId = '1';
    jest.spyOn(pictureRepository, 'delete').mockRejectedValue(new NotFoundException());

    //Act & Assert
    await expect(controller.deletePicture(pictureId)).rejects.toThrow(NotFoundException);
  });

  it('should get all addresses', async () => {
    //Arrange
    const mockFireBrigades = [new FireBrigade(), new FireBrigade()];
    const mockRequests = [new CreateFireBrigadeRequest(), new CreateFireBrigadeRequest()];
    jest.spyOn(service, 'findAllFireBrigades').mockResolvedValue(mockFireBrigades);
    jest.spyOn(createRequestRepository, 'find').mockResolvedValue(mockRequests);

    //Act
    await controller.getAllAdresses();

    //Assert
    expect(service.findAllFireBrigades).toHaveBeenCalled();
    expect(createRequestRepository.find).toHaveBeenCalled();
  });

  it('should get all fire brigades', async () => {
    //Arrange
    const mockFireBrigades = [new FireBrigade()];
    const findSpy = jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValue(mockFireBrigades);

    //Act
    await controller.getAllFireBrigades();

    //Assert
    expect(findSpy).toHaveBeenCalled();
  });

  it('should get all requests for a given fire brigade id', async () => {
    //Arrange
    const fireBrigadeId = '1';
    const mockRequests = [new JoinFireBrigadeRequest()];
    const findSpy = jest.spyOn(joinRequestRepository, 'find').mockResolvedValue(mockRequests);

    //Act
    await controller.getFireBrigadeRequests(fireBrigadeId);

    //Assert
    expect(findSpy).toHaveBeenCalledWith({ where: { fireBrigadeId: fireBrigadeId } });
  });

  it('should throw a NotFoundException if no requests for the given fire brigade id exist', async () => {
    //Arrange
    const fireBrigadeId = '1';
    jest.spyOn(joinRequestRepository, 'find').mockResolvedValue(undefined);

    //Act & Assert
    await expect(controller.getFireBrigadeRequests(fireBrigadeId)).rejects.toThrow(NotFoundException);
  });

  it('should get a fire brigade by id', async () => {
    const fireBrigadeId = '1';
    const mockFireBrigade = new FireBrigade();
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(mockFireBrigade);
    await controller.getFireBrigade(fireBrigadeId);
    expect(fireBrigadeRepository.findOne).toHaveBeenCalledWith({
      where: { fireBrigadeId: fireBrigadeId },
      loadRelationIds: true,
    });
  });

  it('should throw not found exception if fire brigade does not exist', async () => {
    const fireBrigadeId = '1';
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(undefined);
    await expect(controller.getFireBrigade(fireBrigadeId)).rejects.toThrow(NotFoundException);
  });
});
