import { Test, TestingModule } from '@nestjs/testing';
import { BlackBoardController } from './black-board.controller';
import { BlackBoardService } from './black-board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import BlackBoard from './blackBoard.entity';
import BlackBoardEntry from './blackBoardEntry.entity';
import User from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import FireBrigade from 'src/fire-brigade/fireBrigade.entity';
import PostBlackBoardEntryDto from './postBlackBoardEntryDto';
import AssignEntryDto from './assignEntryDto';

describe('BlackBoardController', () => {
  let controller: BlackBoardController;
  let service: BlackBoardService;
  let boardRepository: Repository<BlackBoard>;
  let entryRepository: Repository<BlackBoardEntry>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlackBoardController],
      providers: [
        BlackBoardService,
        {
          provide: getRepositoryToken(BlackBoard),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BlackBoardEntry),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BlackBoardController>(BlackBoardController);
    service = module.get<BlackBoardService>(BlackBoardService);
    boardRepository = module.get<Repository<BlackBoard>>(getRepositoryToken(BlackBoard));
    entryRepository = module.get<Repository<BlackBoardEntry>>(getRepositoryToken(BlackBoardEntry));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a list of entries for a given fireBrigadeId', async () => {
    const fireBrigadeId = 'test-fire-brigade-id';
    const mockEntries: BlackBoardEntry[] = [
      {
        entryId: 'test-entry-id-1',
        title: 'Test Entry 1',
        finished: false,
        finishedAt: '',
        showInDistrict: true,
        board: {
          boardId: 'test-board-id',
          fireBrigade: {
            fireBrigadeId: 'test-firebrigade-id',
            name: 'Test Fire Brigade 1',
            address: 'Test Address 1',
            state: 'Test State 1',
            district: 'Test District 1',
            voluntary: false,
            deploymentStorage: null,
            chat: null,
            calendar: null,
            members: [],
            vehicles: [],
            stationPictures: [],
            vehiclePictures: [],
            workTime: [],
            blackBoard: null,
          },
          entries: [],
        },
        creator: {
          userId: 'test-user-id-1',
          username: 'testuser1',
          name: 'Test User 1',
          address: 'Test Address 1',
          telephoneNumber: '123456789',
          rank: 'Test Rank 1',
          position: 'Test Position 1',
          profilePicture: null,
          lastLogin: new Date().toISOString(),
          amountOfLogins: 1,
          termsOfRightsVersion: '1.0',
          license: null,
          fireBrigade: {
            fireBrigadeId: 'test-firebrigade-id',
            name: 'Test Fire Brigade 1',
            address: 'Test Address 1',
            state: 'Test State 1',
            district: 'Test District 1',
            voluntary: false,
            deploymentStorage: null,
            chat: null,
            calendar: null,
            members: [],
            vehicles: [],
            stationPictures: [],
            vehiclePictures: [],
            workTime: [],
            blackBoard: null,
          },
          chats: [],
          blackBoardEntries: [],
          certifiedCourse: [],
          blackBoardAssignments: [],
          workTime: [],
        },
        assignedTo: null,
      },
      {
        entryId: 'test-entry-id-2',
        title: 'Test Entry 2',
        finished: true,
        finishedAt: new Date().toISOString(),
        showInDistrict: false,
        board: {
          boardId: 'test-board-id',
          fireBrigade: {
            fireBrigadeId: 'test-firebrigade-id',
            name: 'Test Fire Brigade 2',
            address: 'Test Address 2',
            state: 'Test State 2',
            district: 'Test District 2',
            voluntary: true,
            deploymentStorage: null,
            chat: null,
            calendar: null,
            members: [],
            vehicles: [],
            stationPictures: [],
            vehiclePictures: [],
            workTime: [],
            blackBoard: null,
          },
          entries: [],
        },
        creator: {
          userId: 'test-user-id-2',
          username: 'testuser2',
          name: 'Test User 2',
          address: 'Test Address 2',
          telephoneNumber: '987654321',
          rank: 'Test Rank 2',
          position: 'Test Position 2',
          profilePicture: null,
          lastLogin: new Date().toISOString(),
          amountOfLogins: 2,
          termsOfRightsVersion: '1.0',
          license: null,
          fireBrigade: {
            fireBrigadeId: 'test-firebrigade-id',
            name: 'Test Fire Brigade 2',
            address: 'Test Address 2',
            state: 'Test State 2',
            district: 'Test District 2',
            voluntary: true,
            deploymentStorage: null,
            chat: null,
            calendar: null,
            members: [],
            vehicles: [],
            stationPictures: [],
            vehiclePictures: [],
            workTime: [],
            blackBoard: null,
          },
          chats: [],
          blackBoardEntries: [],
          certifiedCourse: [],
          blackBoardAssignments: [],
          workTime: [],
        },
        assignedTo: {
          userId: 'test-user-id-3',
          username: 'testuser3',
          name: 'Test User 3',
          address: 'Test Address 3',
          telephoneNumber: '135792468',
          rank: 'Test Rank 3',
          position: 'Test Position 3',
          profilePicture: null,
          lastLogin: new Date().toISOString(),
          amountOfLogins: 3,
          termsOfRightsVersion: '1.0',
          license: null,
          fireBrigade: {
            fireBrigadeId: 'test-firebrigade-id',
            name: 'Test Fire Brigade 3',
            address: 'Test Address 3',
            state: 'Test State 3',
            district: 'Test District 3',
            voluntary: false,
            deploymentStorage: null,
            chat: null,
            calendar: null,
            members: [],
            vehicles: [],
            stationPictures: [],
            vehiclePictures: [],
            workTime: [],
            blackBoard: null,
          },
          chats: [],
          blackBoardEntries: [],
          certifiedCourse: [],
          blackBoardAssignments: [],
          workTime: [],
        },
      },
    ];
    const mockBoard: BlackBoard = {
      boardId: 'test-board-id',
      fireBrigade: {
        fireBrigadeId: fireBrigadeId,
        name: 'Test Fire Brigade',
        address: 'Test Address',
        state: 'Test State',
        district: 'Test District',
        voluntary: false,
        deploymentStorage: null,
        chat: null,
        calendar: null,
        members: [],
        vehicles: [],
        stationPictures: [],
        vehiclePictures: [],
        workTime: [],
        blackBoard: null,
      }, // Mock FireBrigade data
      entries: mockEntries, //assign mock entries
    };

    const queryBuilderMock: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockBoard),
      getMany: jest.fn().mockResolvedValue([]),
    };

    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock);

    // Mock other necessary methods from the service if needed.

    const entries = await controller.getEntries(fireBrigadeId);
    expect(entries).toBeDefined();
    //Add assertions here.
    expect(entries).toEqual(mockEntries); //This assertion needs to be adjusted to your needs.
  });

  it('should create a new entry', async () => {
    const fireBrigadeId = 'test-fire-brigade-id';
    const dto: PostBlackBoardEntryDto = {
      title: 'Test Entry 3',
      showInDistrict: false,
      creator: 'test-user-id-4',
    };
    const mockUser = {
      userId: 'test-user-id-4',
      username: 'testuser4',
      name: 'Test User 4',
      address: 'Test Address 4',
      telephoneNumber: '11223344',
      rank: 'Test Rank 4',
      position: 'Test Position 4',
      profilePicture: null,
      lastLogin: new Date().toISOString(),
      amountOfLogins: 4,
      termsOfRightsVersion: '1.0',
      license: null,
      fireBrigade: {
        fireBrigadeId: 'test-firebrigade-id',
        name: 'Test Fire Brigade 4',
        address: 'Test Address 4',
        state: 'Test State 4',
        district: 'Test District 4',
        voluntary: false,
        deploymentStorage: null,
        chat: null,
        calendar: null,
        members: [],
        vehicles: [],
        stationPictures: [],
        vehiclePictures: [],
        workTime: [],
        blackBoard: null,
      },
      chats: [],
      blackBoardEntries: [],
      certifiedCourse: [],
      blackBoardAssignments: [],
      workTime: [],
    };
    const mockBoard = {
      boardId: 'test-board-id',
      fireBrigade: {
        fireBrigadeId: 'test-firebrigade-id',
        name: 'Test Fire Brigade 4',
        address: 'Test Address 4',
        state: 'Test State 4',
        district: 'Test District 4',
        voluntary: false,
        deploymentStorage: null,
        chat: null,
        calendar: null,
        members: [],
        vehicles: [],
        stationPictures: [],
        vehiclePictures: [],
        workTime: [],
        blackBoard: null,
      },
      entries: [],
    };
    const mockEntry = {
      title: 'Test Entry 3',
      showInDistrict: false,
      finished: false,
      finishedAt: '',
      creator: mockUser,
      board: mockBoard,
    };

    jest.spyOn(boardRepository, 'find').mockResolvedValue([mockBoard]);
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(entryRepository, 'save').mockResolvedValue(undefined);

    const result = await controller.postEntry(fireBrigadeId, dto);
    expect(result).toEqual(undefined);
  });

  it('should finish an entry', async () => {
    const entryId = 'test-entry-id-1';
    const mockResult = undefined;
    jest.spyOn(entryRepository, 'update').mockResolvedValue(mockResult as any);
    const result = await controller.postFinishEntry(entryId);
    expect(result).toEqual(mockResult);
  });

  it('should assign an entry to a user', async () => {
    const dto: AssignEntryDto = {
      entryId: 'test-entry-id-1',
      userId: 'test-user-id-1',
    };
    const mockUser = {
      userId: 'test-user-id-1',
      username: 'testuser1',
      name: 'Test User 1',
      address: 'Test Address 1',
      telephoneNumber: '123456789',
      rank: 'Test Rank 1',
      position: 'Test Position 1',
      profilePicture: null,
      lastLogin: new Date().toISOString(),
      amountOfLogins: 1,
      termsOfRightsVersion: '1.0',
      license: null,
      fireBrigade: {
        fireBrigadeId: 'test-firebrigade-id',
        name: 'Test Fire Brigade 1',
        address: 'Test Address 1',
        state: 'Test State 1',
        district: 'Test District 1',
        voluntary: false,
        deploymentStorage: null,
        chat: null,
        calendar: null,
        members: [],
        vehicles: [],
        stationPictures: [],
        vehiclePictures: [],
        workTime: [],
        blackBoard: null,
      },
      chats: [],
      blackBoardEntries: [],
      certifiedCourse: [],
      blackBoardAssignments: [],
      workTime: [],
    };
    const mockResult = undefined;
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(entryRepository, 'update').mockResolvedValue(mockResult as any);

    const result = await controller.postAssignEntry(dto);
    expect(result).toEqual(mockResult);
  });

  it('should handle error during entry creation', async () => {
    const fireBrigadeId = 'test-fire-brigade-id';
    const dto: PostBlackBoardEntryDto = {
      title: 'Test Entry 3',
      showInDistrict: false,
      creator: 'test-user-id-4',
    };
    jest.spyOn(boardRepository, 'find').mockRejectedValue(new Error('Failed to find board'));
    await expect(controller.postEntry(fireBrigadeId, dto)).rejects.toThrowError('Failed to find board');
  });

  it('should handle error during entry assignment', async () => {
    const dto: AssignEntryDto = {
      entryId: 'test-entry-id-1',
      userId: 'test-user-id-1',
    };
    jest.spyOn(userRepository, 'findOneBy').mockRejectedValue(new Error('Failed to find user'));
    await expect(controller.postAssignEntry(dto)).rejects.toThrowError('Failed to find user');
  });
});
