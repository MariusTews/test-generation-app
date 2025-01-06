import { Test, TestingModule } from '@nestjs/testing';
import { FireBrigadeService } from './fire-brigade.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateFireBrigadeRequest from './createFireBrigadeRequest.entity';
import CreateFireBrigadeDto from './createFireBrigadeDto';
import JoinFireBrigadeDto from './joinFireBrigadeDto';
import JoinFireBrigadeRequest from './joinFireBrigadeRequest.entity';
import FireBrigade from './fireBrigade.entity';
import User from 'src/user/user.entity';
import { DataSource } from 'typeorm';
import FireBrigadePicture from './fireBrigadePicture.entity';
import DeploymentStorage from 'src/deployment/deploymentStorage.entity';
import DistrictChatMap from 'src/chat/districtChatMap.entity';
import BlackBoard from 'src/black-board/blackBoard.entity';
import Calendar from 'src/calendar/calendar.entity';
import FireBrigadeChat from 'src/chat/fireBrigadeChat.entity';
import ConfirmCreateRequestDto from './confirmCreateRequestDto';

describe('FireBrigadeService', () => {
  let service: FireBrigadeService;
  let fireBrigadeRepository: Repository<FireBrigade>;
  let createRequestRepository: Repository<CreateFireBrigadeRequest>;
  let joinRequestRepository: Repository<JoinFireBrigadeRequest>;
  let pictureRepository: Repository<FireBrigadePicture>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let districtChatMapRepository: Repository<DistrictChatMap>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;

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
                save: jest.fn().mockResolvedValue(undefined),
                update: jest.fn().mockResolvedValue(undefined),
                delete: jest.fn().mockResolvedValue(undefined),
                find: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

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
  });

  it('findAllFireBrigades should return all fire brigades', async () => {
    const mockFireBrigades: FireBrigade[] = [new FireBrigade()];
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    const fireBrigades = await service.findAllFireBrigades();
    expect(fireBrigades).toBe(mockFireBrigades);
  });

  it('findAll should return all fire brigades and create requests', async () => {
    const mockCreateRequests: CreateFireBrigadeRequest[] = [new CreateFireBrigadeRequest()];
    const mockFireBrigades: FireBrigade[] = [new FireBrigade()];
    const mockDeploymentStorage: DeploymentStorage = new DeploymentStorage();
    mockDeploymentStorage.deployments = [];
    mockFireBrigades[0].deploymentStorage = mockDeploymentStorage;
    mockFireBrigades[0].members = [];
    jest.spyOn(createRequestRepository, 'find').mockResolvedValueOnce(mockCreateRequests);
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    jest.spyOn(deploymentStorageRepository, 'findOne').mockResolvedValueOnce({ deployments: [] } as any);
    const fireBrigadeListItems = await service.findAll();
    expect(fireBrigadeListItems.length).toBeGreaterThanOrEqual(1);
  });

  it('find should return a fire brigade by id', async () => {
    const mockFireBrigade: FireBrigade = new FireBrigade();
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const fireBrigade = await service.find('1');
    expect(fireBrigade).toBe(mockFireBrigade);
  });

  it('findAllAdresses should return all addresses', async () => {
    const mockFireBrigades: FireBrigade[] = [new FireBrigade()];
    const mockRequests: CreateFireBrigadeRequest[] = [new CreateFireBrigadeRequest()];
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    jest.spyOn(createRequestRepository, 'find').mockResolvedValueOnce(mockRequests);
    const addresses = await service.findAllAdresses();
    expect(addresses.addresses.length).toBeGreaterThanOrEqual(0);
  });

  it('createRequest should create a new fire brigade request', async () => {
    const mockUser: User = new User();
    mockUser.position = 'Wehrleiter/in';
    mockUser.fireBrigade = null;
    const mockDto: CreateFireBrigadeDto = new CreateFireBrigadeDto();
    mockDto.creator = '1'; //added creator
    mockDto.name = 'test';
    mockDto.address = 'test';
    mockDto.district = 'test';
    mockDto.state = 'test';
    mockDto.voluntary = true;
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(createRequestRepository, 'save').mockResolvedValueOnce(new CreateFireBrigadeRequest()); // Mock the save method
    const request = await service.createRequest(mockDto);
    expect(request).toBeDefined();
    expect(createRequestRepository.save).toHaveBeenCalled();
  });

  it('confirmCreateRequest should confirm a create fire brigade request and join', async () => {
    const mockDto: ConfirmCreateRequestDto = new ConfirmCreateRequestDto();
    mockDto.fireBrigadeId = '1';
    mockDto.userId = '1';
    const mockRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();
    mockRequest.confirmations = ['2', '3'];
    mockRequest.creator = '4';
    const mockUser: User = new User();
    mockUser.userId = '1';
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOneBy').mockResolvedValueOnce(mockRequest);
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOneBy').mockResolvedValueOnce(mockUser);
    const result = await service.confirmCreateRequest(mockDto);
    expect(result.joined).toBe(true);
  });

  it('createJoinRequest should create a new join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = new JoinFireBrigadeDto();
    mockDto.userId = '1';
    mockDto.fireBrigadeId = '1';
    const mockUser: User = new User();
    mockUser.fireBrigade = null;
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOne').mockResolvedValueOnce(mockUser as any);
    await service.createJoinRequest(mockDto);
    expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalled();
  });

  it('acceptRequest should accept a join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = new JoinFireBrigadeDto();
    mockDto.userId = '1';
    mockDto.fireBrigadeId = '1';
    const mockUser: User = new User();
    mockUser.fireBrigade = null;
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(joinRequestRepository, 'delete').mockResolvedValueOnce(undefined);
    const result = await service.acceptRequest(mockDto);
    expect(result.accepted).toBe(true);
  });

  it('acceptRequest should reject a join fire brigade request because user is already in a firebrigade', async () => {
    const mockDto: JoinFireBrigadeDto = new JoinFireBrigadeDto();
    mockDto.userId = '1';
    mockDto.fireBrigadeId = '1';
    const mockUser: User = new User();
    mockUser.fireBrigade = new FireBrigade();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(joinRequestRepository, 'delete').mockResolvedValueOnce(undefined);
    const result = await service.acceptRequest(mockDto);
    expect(result.accepted).toBe(false);
  });

  it('declineRequest should decline a join fire brigade request', async () => {
    const mockDto: JoinFireBrigadeDto = new JoinFireBrigadeDto();
    mockDto.userId = '1';
    mockDto.fireBrigadeId = '1';
    jest.spyOn(joinRequestRepository, 'delete').mockResolvedValueOnce(undefined);
    await service.declineRequest(mockDto);
    expect(joinRequestRepository.delete).toHaveBeenCalledWith({ userId: '1' });
  });

  it('findRequests should return all join requests for a fire brigade', async () => {
    const mockJoinRequests: JoinFireBrigadeRequest[] = [new JoinFireBrigadeRequest()];
    jest.spyOn(joinRequestRepository, 'find').mockResolvedValueOnce(mockJoinRequests);
    const joinRequests = await service.findRequests('1');
    expect(joinRequests).toBe(mockJoinRequests);
  });

  it('addPicture should add a new fire brigade picture', async () => {
    const mockFile: any = { buffer: Buffer.alloc(0), mimetype: 'image/jpeg' };
    const mockFireBrigade: FireBrigade = new FireBrigade();
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOne').mockResolvedValueOnce(mockFireBrigade as any);

    await service.addPicture(mockFile, '1');
    expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalled();
  });

  it('findAllPictures should return all fire brigade pictures', async () => {
    const mockFireBrigade: FireBrigade = new FireBrigade();
    mockFireBrigade.stationPictures = [new FireBrigadePicture()];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const pictures = await service.findAllPictures('1');
    expect(pictures.length).toBe(1);
  });

  it('findAllMembers should return all members of a fire brigade', async () => {
    const mockFireBrigade: FireBrigade = new FireBrigade();
    mockFireBrigade.members = [new User()];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const members = await service.findAllMembers('1');
    expect(members.length).toBe(1);
  });

  it('deletePicture should delete a fire brigade picture', async () => {
    jest.spyOn(pictureRepository, 'delete').mockResolvedValueOnce(undefined);
    await service.deletePicture('1');
    expect(pictureRepository.delete).toHaveBeenCalledWith('1');
  });

  it('createRequest should not create a new fire brigade request if user is not Wehrleiter/in', async () => {
    const mockUser: User = new User();
    mockUser.position = 'Feuerwehrmann/frau';
    mockUser.fireBrigade = null;
    const mockDto: CreateFireBrigadeDto = new CreateFireBrigadeDto();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    const request = await service.createRequest(mockDto);
    expect(request).toBeUndefined();
  });

  it('createRequest should not create a new fire brigade request if user is already in a fire brigade', async () => {
    const mockUser: User = new User();
    mockUser.position = 'Wehrleiter/in';
    mockUser.fireBrigade = new FireBrigade();
    const mockDto: CreateFireBrigadeDto = new CreateFireBrigadeDto();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    const request = await service.createRequest(mockDto);
    expect(request).toBeUndefined();
  });

  it('createRequest should not create a new fire brigade request if user already created a request', async () => {
    const mockUser: User = new User();
    mockUser.position = 'Wehrleiter/in';
    mockUser.fireBrigade = null;
    const mockDto: CreateFireBrigadeDto = new CreateFireBrigadeDto();
    const mockRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(mockRequest);
    const request = await service.createRequest(mockDto);
    expect(request).toBeUndefined();
  });

  it('createJoinRequest should not create a new join fire brigade request if user is already in a fire brigade', async () => {
    const mockDto: JoinFireBrigadeDto = new JoinFireBrigadeDto();
    mockDto.userId = '1';
    mockDto.fireBrigadeId = '1';
    const mockUser: User = new User();
    mockUser.fireBrigade = new FireBrigade();
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOne').mockResolvedValueOnce(mockUser as any);
    await service.createJoinRequest(mockDto);
    expect(dataSource.createQueryRunner().manager.save).not.toHaveBeenCalled();
  });

  it('confirmCreateRequest should confirm a create fire brigade request and not join', async () => {
    const mockDto: ConfirmCreateRequestDto = new ConfirmCreateRequestDto();
    mockDto.fireBrigadeId = '1';
    mockDto.userId = '2';
    const mockRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();
    mockRequest.confirmations = [];
    mockRequest.creator = '1';
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOneBy').mockResolvedValueOnce(mockRequest);
    const result = await service.confirmCreateRequest(mockDto);
    expect(result.joined).toBe(false);
  });

  it('confirmCreateRequest should handle errors during transaction', async () => {
    const mockDto: ConfirmCreateRequestDto = new ConfirmCreateRequestDto();
    mockDto.fireBrigadeId = '1';
    mockDto.userId = '1';
    const mockRequest: CreateFireBrigadeRequest = new CreateFireBrigadeRequest();
    mockRequest.confirmations = [];
    mockRequest.creator = '1';
    jest.spyOn(dataSource.createQueryRunner().manager, 'findOneBy').mockRejectedValueOnce(new Error('Database error'));
    const result = await service.confirmCreateRequest(mockDto);
    expect(dataSource.createQueryRunner().rollbackTransaction).toHaveBeenCalled();
    expect(result.joined).toBe(false);
  });
});
