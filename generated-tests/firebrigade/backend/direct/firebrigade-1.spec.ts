import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FireBrigadeService } from './fire-brigade.service';
import { FireBrigadeController } from './fire-brigade.controller';
import FireBrigade from './fireBrigade.entity';
import CreateFireBrigadeRequest from './createFireBrigadeRequest.entity';
import JoinFireBrigadeRequest from './joinFireBrigadeRequest.entity';
import FireBrigadePicture from './fireBrigadePicture.entity';
import DeploymentStorage from 'src/deployment/deploymentStorage.entity';
import DistrictChatMap from 'src/chat/districtChatMap.entity';
import User from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import CreateFireBrigadeDto from './createFireBrigadeDto';
import JoinFireBrigadeDto from './joinFireBrigadeDto';
import ConfirmCreateRequestDto from './confirmCreateRequestDto';
import FireBrigadeListItem from './fireBrigadeListItem';
import BlackBoard from 'src/black-board/blackBoard.entity';
import Calendar from 'src/calendar/calendar.entity';
import FireBrigadeChat from 'src/chat/fireBrigadeChat.entity';

describe('FireBrigadeController', () => {
  let controller: FireBrigadeController;
  let service: FireBrigadeService;
  let dataSourceMock: any;
  let fireBrigadeRepository: Repository<FireBrigade>;
  let createRequestRepository: Repository<CreateFireBrigadeRequest>;
  let joinRequestRepository: Repository<JoinFireBrigadeRequest>;
  let pictureRepository: Repository<FireBrigadePicture>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let districtChatMapRepository: Repository<DistrictChatMap>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FireBrigadeController],
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
    }).compile();

    controller = module.get<FireBrigadeController>(FireBrigadeController);
    service = module.get<FireBrigadeService>(FireBrigadeService);
    dataSourceMock = module.get(DataSource);
    fireBrigadeRepository = module.get(getRepositoryToken(FireBrigade));
    createRequestRepository = module.get(getRepositoryToken(CreateFireBrigadeRequest));
    joinRequestRepository = module.get(getRepositoryToken(JoinFireBrigadeRequest));
    pictureRepository = module.get(getRepositoryToken(FireBrigadePicture));
    deploymentStorageRepository = module.get(getRepositoryToken(DeploymentStorage));
    districtChatMapRepository = module.get(getRepositoryToken(DistrictChatMap));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('getAllFireBrigadesAndCreateRequests should return FireBrigadeListItem[]', async () => {
    const mockFireBrigades: FireBrigade[] = [new FireBrigade(), new FireBrigade()];
    const mockCreateRequests: CreateFireBrigadeRequest[] = [new CreateFireBrigadeRequest()];
    const mockDeploymentStorage = new DeploymentStorage();
    mockDeploymentStorage.storageId = 'testStorageId';
    mockDeploymentStorage.deployments = [];
    mockFireBrigades[0].deploymentStorage = mockDeploymentStorage;
    mockFireBrigades[0].members = [];
    mockFireBrigades[1].deploymentStorage = new DeploymentStorage();
    mockFireBrigades[1].deploymentStorage.storageId = 'testStorageId2';
    mockFireBrigades[1].members = [];

    const mockFireBrigadeListItems: FireBrigadeListItem[] = [
      {
        id: '1',
        name: 'Fire Brigade 1',
        address: 'Address 1',
        state: 'State 1',
        district: 'District 1',
        created: true,
        voluntary: true,
        deployments: 0,
        members: 0,
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
      },
    ];

    jest.spyOn(createRequestRepository, 'find').mockResolvedValueOnce(mockCreateRequests);
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    jest.spyOn(deploymentStorageRepository, 'findOne').mockResolvedValue({ deployments: [] } as any);
    const result = await controller.getAllFireBrigadesAndCreateRequests();
    expect(result.length).toBeGreaterThan(0);
  });

  it('getAllFireBrigades should return FireBrigade[]', async () => {
    const mockFireBrigades: FireBrigade[] = [new FireBrigade()];
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    const result = await controller.getAllFireBrigades();
    expect(result).toEqual(mockFireBrigades);
  });

  it('getFireBrigade should return a FireBrigade', async () => {
    const mockFireBrigade: FireBrigade = new FireBrigade();
    mockFireBrigade.fireBrigadeId = '1';
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const result = await controller.getFireBrigade('1');
    expect(result).toEqual(mockFireBrigade);
  });

  it('getFireBrigadeRequests should return JoinFireBrigadeRequest[]', async () => {
    const mockRequests: JoinFireBrigadeRequest[] = [new JoinFireBrigadeRequest()];
    jest.spyOn(joinRequestRepository, 'find').mockResolvedValueOnce(mockRequests);
    const result = await controller.getFireBrigadeRequests('1');
    expect(result).toEqual(mockRequests);
  });

  it('getAllPictures should return FireBrigadePicture[]', async () => {
    const mockPictures: FireBrigadePicture[] = [new FireBrigadePicture()];
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.stationPictures = mockPictures;
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const result = await controller.getAllPictures('1');
    expect(result).toEqual(mockPictures);
  });

  it('getAllMembers should return User[]', async () => {
    const mockMembers: User[] = [new User()];
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.members = mockMembers;
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const result = await controller.getAllMembers('1');
    expect(result).toEqual(mockMembers);
  });

  it('getAllAdresses should return an object with addresses', async () => {
    const mockFireBrigades: FireBrigade[] = [{ address: 'Address 1' } as any, { address: 'Address 2' } as any];
    const mockRequests: CreateFireBrigadeRequest[] = [{ address: 'Address 3' } as any];
    jest.spyOn(fireBrigadeRepository, 'find').mockResolvedValueOnce(mockFireBrigades);
    jest.spyOn(createRequestRepository, 'find').mockResolvedValueOnce(mockRequests);
    const result = await controller.getAllAdresses();
    expect(result.addresses).toContain('Address 1');
    expect(result.addresses).toContain('Address 2');
    expect(result.addresses).toContain('Address 3');
  });

  it('postCreateRequest should call createRequest', async () => {
    const mockDto: CreateFireBrigadeDto = {
      name: 'Fire Brigade',
      address: 'Address',
      state: 'State',
      district: 'District',
      voluntary: true,
      creator: '1',
    };
    const mockRequest = new CreateFireBrigadeRequest();
    jest.spyOn(service, 'createRequest').mockResolvedValueOnce(mockRequest);
    jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValueOnce({ position: 'Wehrleiter/in', fireBrigade: null } as any);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    const result = await controller.postCreateRequest(mockDto);
    expect(result).toEqual(mockRequest);
  });

  it('postConfirmCreateRequest should call confirmCreateRequest', async () => {
    const mockDto: ConfirmCreateRequestDto = { userId: '1', fireBrigadeId: '1' };
    const mockResponse = { joined: true };
    jest.spyOn(dataSourceMock, 'createQueryRunner').mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOneBy: jest.fn().mockResolvedValueOnce({ confirmations: [] } as any),
        findOne: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    } as any);
    jest.spyOn(service, 'confirmCreateRequest').mockResolvedValueOnce(mockResponse);
    const result = await controller.postConfirmCreateRequest(mockDto);
    expect(result).toEqual(mockResponse);
  });

  it('postJoinRequest should call createJoinRequest', async () => {
    const mockDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    jest.spyOn(service, 'createJoinRequest').mockImplementationOnce(() => undefined);
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ fireBrigade: null } as any);
    await controller.postJoinRequest(mockDto);
    expect(service.createJoinRequest).toHaveBeenCalledWith(mockDto);
  });

  it('postDeclineRequest should call declineRequest', async () => {
    const mockDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    jest.spyOn(service, 'declineRequest').mockImplementationOnce(() => undefined);
    await controller.postDeclineRequest(mockDto);
    expect(service.declineRequest).toHaveBeenCalledWith(mockDto);
  });

  it('postAcceptRequest should call acceptRequest', async () => {
    const mockDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    const mockResponse = { accepted: true };
    jest.spyOn(service, 'acceptRequest').mockResolvedValueOnce(mockResponse);
    jest.spyOn(joinRequestRepository, 'delete').mockImplementationOnce(() => undefined);
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ fireBrigade: null } as any);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(null);
    const result = await controller.postAcceptRequest(mockDto);
    expect(result).toEqual(mockResponse);
  });

  it('postPicture should call addPicture', async () => {
    const mockFile: any = { mimetype: 'image/jpeg', buffer: Buffer.from('test') };
    jest.spyOn(service, 'addPicture').mockImplementationOnce(() => undefined);
    await controller.postPicture(mockFile, '1');
    expect(service.addPicture).toHaveBeenCalled();
  });

  it('deletePicture should call deletePicture', async () => {
    const mockResult = { affected: 1 } as any;
    jest.spyOn(service, 'deletePicture').mockResolvedValueOnce(mockResult);
    const result = await controller.deletePicture('1');
    expect(result).toEqual(mockResult);
  });

  it('postConfirmCreateRequest should create a fire brigade if confirmations >=3', async () => {
    const mockDto: ConfirmCreateRequestDto = { userId: '3', fireBrigadeId: '1' };
    const mockRequest = new CreateFireBrigadeRequest();
    mockRequest.fireBrigadeId = '1';
    mockRequest.confirmations = ['1', '2', '3'];
    const mockUser = new User();
    mockUser.userId = '1';
    const mockDeploymentStorage = new DeploymentStorage();
    mockDeploymentStorage.deployments = [];
    const mockBlackBoard = new BlackBoard();
    mockBlackBoard.entries = [];
    const mockCalendar = new Calendar();
    mockCalendar.appointments = [];
    const mockChat = new FireBrigadeChat();
    mockChat.messages = [];
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.fireBrigadeId = '1';
    mockFireBrigade.members = [mockUser];
    mockFireBrigade.deploymentStorage = mockDeploymentStorage;
    mockFireBrigade.blackBoard = mockBlackBoard;
    mockFireBrigade.calendar = mockCalendar;
    mockFireBrigade.chat = mockChat;

    jest.spyOn(dataSourceMock, 'createQueryRunner').mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOneBy: jest.fn().mockResolvedValueOnce(mockRequest),
        findOne: jest.fn().mockResolvedValueOnce(mockUser),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    } as any);

    jest.spyOn(districtChatMapRepository, 'findOneBy').mockResolvedValueOnce(null);
    jest.spyOn(districtChatMapRepository, 'save').mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(service, 'confirmCreateRequest').mockResolvedValueOnce({ joined: true });
    const result = await controller.postConfirmCreateRequest(mockDto);
    expect(result).toEqual({ joined: true });
  });

  it('postJoinRequest should not create a request if user is already member of a firebrigade', async () => {
    const mockDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    const mockUser = new User();
    mockUser.fireBrigade = new FireBrigade();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    await controller.postJoinRequest(mockDto);
    expect(service.createJoinRequest).not.toHaveBeenCalled();
  });

  it('acceptRequest should return accepted: false if user is member of firebrigade or has a create request', async () => {
    const mockDto: JoinFireBrigadeDto = { userId: '1', fireBrigadeId: '1' };
    const mockUser = new User();
    mockUser.fireBrigade = new FireBrigade();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
    jest.spyOn(createRequestRepository, 'findOne').mockResolvedValueOnce(new CreateFireBrigadeRequest());
    jest.spyOn(service, 'acceptRequest').mockResolvedValueOnce({ accepted: false });
    const result = await controller.postAcceptRequest(mockDto);
    expect(result).toEqual({ accepted: false });
  });

  it('find should return null if no fire brigade with given id exists', async () => {
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(null);
    const result = await service.find('nonexistentId');
    expect(result).toBeNull();
  });

  it('findAllPictures should return an empty array if no pictures exist', async () => {
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.stationPictures = [];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const result = await service.findAllPictures('1');
    expect(result).toEqual([]);
  });

  it('findAllMembers should return an empty array if no members exist', async () => {
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.members = [];
    jest.spyOn(fireBrigadeRepository, 'findOne').mockResolvedValueOnce(mockFireBrigade);
    const result = await service.findAllMembers('1');
    expect(result).toEqual([]);
  });
});
