import { Test, TestingModule } from '@nestjs/testing';
import { FireBrigadeService } from './fire-brigade.service';
import { FireBrigadeController } from './fire-brigade.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import FireBrigade from './fireBrigade.entity';
import CreateFireBrigadeRequest from './createFireBrigadeRequest.entity';
import JoinFireBrigadeRequest from './joinFireBrigadeRequest.entity';
import FireBrigadePicture from './fireBrigadePicture.entity';
import DeploymentStorage from 'src/deployment/deploymentStorage.entity';
import DistrictChatMap from 'src/chat/districtChatMap.entity';
import User from 'src/user/user.entity';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import FireBrigadeListItem from './fireBrigadeListItem';
import CreateFireBrigadeDto from './createFireBrigadeDto';
import ConfirmCreateRequestDto from './confirmCreateRequestDto';
import JoinFireBrigadeDto from './joinFireBrigadeDto';

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
  let dataSourceMock: DataSource;
  let queryRunner: QueryRunner;

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
              },
            }),
          },
        },
      ],
      controllers: [FireBrigadeController],
    }).compile();

    controller = module.get<FireBrigadeController>(FireBrigadeController);
    service = module.get<FireBrigadeService>(FireBrigadeService);
    fireBrigadeRepository = module.get(getRepositoryToken(FireBrigade));
    createRequestRepository = module.get(getRepositoryToken(CreateFireBrigadeRequest));
    joinRequestRepository = module.get(getRepositoryToken(JoinFireBrigadeRequest));
    pictureRepository = module.get(getRepositoryToken(FireBrigadePicture));
    deploymentStorageRepository = module.get(getRepositoryToken(DeploymentStorage));
    districtChatMapRepository = module.get(getRepositoryToken(DistrictChatMap));
    userRepository = module.get(getRepositoryToken(User));
    dataSourceMock = module.get(DataSource);
    queryRunner = dataSourceMock.createQueryRunner();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all fire brigades and create requests', async () => {
    const mockFireBrigades: FireBrigadeListItem[] = [
      {
        id: '1',
        name: 'Fire Brigade 1',
        address: 'Address 1',
        state: 'State 1',
        district: 'District 1',
        created: true,
        voluntary: true,
        deployments: 10,
        members: 20,
      },
      {
        id: '2',
        name: 'Fire Brigade 2',
        address: 'Address 2',
        state: 'State 2',
        district: 'District 2',
        created: false,
        voluntary: false,
        creator: 'user1',
        confirmations: ['user2', 'user3'],
      },
    ];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockFireBrigades);
    const result = await controller.getAllFireBrigadesAndCreateRequests();
    expect(result).toEqual(mockFireBrigades);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should create a fire brigade request', async () => {
    const mockDto: CreateFireBrigadeDto = {
      name: 'Test Fire Brigade',
      address: 'Test Address',
      state: 'Test State',
      district: 'Test District',
      voluntary: true,
      creator: 'testUser',
    };
    const mockRequest = { ...mockDto, confirmations: [], fireBrigadeId: 'testId' };
    jest.spyOn(createRequestRepository, 'save').mockResolvedValue(mockRequest as any);
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ position: 'Wehrleiter/in', fireBrigade: null } as any);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(null as any);
    const result = await controller.postCreateRequest(mockDto);
    expect(result).toEqual(mockRequest);
    expect(createRequestRepository.save).toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(createRequestRepository.findOne).toHaveBeenCalled();
  });

  it('should confirm a fire brigade creation request', async () => {
    const mockDto: ConfirmCreateRequestDto = {
      userId: 'testUser',
      fireBrigadeId: 'testFireBrigade',
    };
    jest
      .spyOn(queryRunner.manager, 'findOneBy')
      .mockResolvedValueOnce({
        confirmations: ['testUser2', 'testUser3'],
        fireBrigadeId: 'testFireBrigade',
        creator: 'testUser4',
      } as any)
      .mockResolvedValueOnce({ userId: 'testUser' } as any);
    jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(undefined);
    jest.spyOn(queryRunner.manager, 'delete').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(districtChatMapRepository, 'findOneBy').mockReturnValue(undefined);

    const result = await controller.postConfirmCreateRequest(mockDto);
    expect(result).toEqual({ joined: true });
    expect(queryRunner.manager.findOneBy).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalled();
    expect(queryRunner.manager.delete).toHaveBeenCalled();
  });

  it('should create a join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = {
      userId: 'testUser',
      fireBrigadeId: 'testFireBrigade',
    };
    jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue({ fireBrigade: null } as any);
    jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(undefined);
    await controller.postJoinRequest(mockDto);
    expect(queryRunner.manager.findOne).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalled();
  });

  it('should accept a join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = {
      userId: 'testUser',
      fireBrigadeId: 'testFireBrigade',
    };
    jest.spyOn(joinRequestRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ fireBrigade: null } as any);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValue(null);
    const result = await controller.postAcceptRequest(mockDto);
    expect(result).toEqual({ accepted: true });
    expect(joinRequestRepository.delete).toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalled();
    expect(createRequestRepository.findOne).toHaveBeenCalled();
  });

  it('should decline a join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = {
      userId: 'testUser',
      fireBrigadeId: 'testFireBrigade',
    };
    jest.spyOn(joinRequestRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
    await controller.postDeclineRequest(mockDto);
    expect(joinRequestRepository.delete).toHaveBeenCalledWith({ userId: 'testUser' });
  });

  it('should get all fire brigade pictures', async () => {
    const mockPictures = [
      { id: '1', picture: Buffer.from('test') },
      { id: '2', picture: Buffer.from('test2') },
    ];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue({ stationPictures: mockPictures } as any);
    const result = await controller.getAllPictures('testId');
    expect(result).toEqual(mockPictures);
    expect(fireBrigadeRepository.findOne).toHaveBeenCalledWith({
      where: { fireBrigadeId: 'testId' },
      relations: ['stationPictures'],
    });
  });

  it('should get all fire brigade members', async () => {
    const mockMembers = [
      { userId: '1', name: 'Test User 1' },
      { userId: '2', name: 'Test User 2' },
    ];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue({ members: mockMembers } as any);
    const result = await controller.getAllMembers('testId');
    expect(result).toEqual(mockMembers);
    expect(fireBrigadeRepository.findOne).toHaveBeenCalledWith({
      where: { fireBrigadeId: 'testId' },
      relations: ['members'],
    });
  });

  it('should get all fire brigade requests', async () => {
    const mockRequests = [
      { userId: '1', fireBrigadeId: 'testId' },
      { userId: '2', fireBrigadeId: 'testId' },
    ];
    jest.spyOn(joinRequestRepository, 'find').mockResolvedValue(mockRequests);
    const result = await controller.getFireBrigadeRequests('testId');
    expect(result).toEqual(mockRequests);
    expect(joinRequestRepository.find).toHaveBeenCalledWith({ where: { fireBrigadeId: 'testId' } });
  });

  it('should get a single fire brigade', async () => {
    const mockFireBrigade = { fireBrigadeId: 'testId', name: 'Test Fire Brigade' };
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue(mockFireBrigade as any);
    const result = await controller.getFireBrigade('testId');
    expect(result).toEqual(mockFireBrigade);
    expect(fireBrigadeRepository.findOne).toHaveBeenCalledWith({
      where: { fireBrigadeId: 'testId' },
      loadRelationIds: true,
    });
  });

  it('should get all addresses', async () => {
    const mockAddresses = ['Address 1', 'Address 2'];
    jest.spyOn(service, 'findAllAdresses').mockResolvedValue({ addresses: mockAddresses });
    const result = await controller.getAllAdresses();
    expect(result).toEqual({ addresses: mockAddresses });
    expect(service.findAllAdresses).toHaveBeenCalled();
  });

  it('should return all fire brigades', async () => {
    const mockFireBrigades = [
      { fireBrigadeId: '1', name: 'Fire Brigade 1' },
      { fireBrigadeId: '2', name: 'Fire Brigade 2' },
    ] as any;
    jest.spyOn(service, 'findAllFireBrigades').mockResolvedValue(mockFireBrigades);
    const result = await controller.getAllFireBrigades();
    expect(result).toEqual(mockFireBrigades);
    expect(service.findAllFireBrigades).toHaveBeenCalled();
  });

  it('should handle a fire brigade creation request with insufficient confirmations', async () => {
    const mockDto: ConfirmCreateRequestDto = {
      userId: 'testUser',
      fireBrigadeId: 'testFireBrigade',
    };
    jest.spyOn(queryRunner.manager, 'findOneBy').mockResolvedValue({
      confirmations: ['testUser2'],
      fireBrigadeId: 'testFireBrigade',
      creator: 'testUser4',
    } as any);
    jest.spyOn(queryRunner.manager, 'update').mockResolvedValue(undefined);
    const result = await controller.postConfirmCreateRequest(mockDto);
    expect(result).toEqual({ joined: false });
    expect(queryRunner.manager.findOneBy).toHaveBeenCalled();
    expect(queryRunner.manager.update).toHaveBeenCalled();
  });

  it('should add a picture', async () => {
    const file = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue({ stationPictures: [] } as any);
    jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(undefined);
    await controller.postPicture(file, 'testId');
    expect(queryRunner.manager.findOne).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalled();
  });

  it('should get all pictures', async () => {
    const mockPictures = [{ id: '1', picture: Buffer.from('test') }];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValue({ stationPictures: mockPictures } as any);
    const result = await controller.getAllPictures('testId');
    expect(result).toEqual(mockPictures);
    expect(fireBrigadeRepository.findOne).toHaveBeenCalledWith({
      where: { fireBrigadeId: 'testId' },
      relations: ['stationPictures'],
    });
  });

  it('should delete a picture', async () => {
    jest.spyOn(pictureRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
    const result = await controller.deletePicture('testId');
    expect(result).toEqual({ affected: 1 });
    expect(pictureRepository.delete).toHaveBeenCalledWith('testId');
  });
});
