import { Test, TestingModule } from '@nestjs/testing';
import { BlackBoardController } from './black-board.controller';
import { BlackBoardService } from './black-board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import BlackBoard from './blackBoard.entity';
import BlackBoardEntry from './blackBoardEntry.entity';
import User from '../user/user.entity';
import { DataSource, Repository } from 'typeorm';
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
    const mockFireBrigadeId = 'test-fire-brigade-id';
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const mockEntries: BlackBoardEntry[] = [
      {
        entryId: '1',
        title: 'Entry 1',
        finished: false,
        finishedAt: '',
        showInDistrict: false,
        board: null,
        creator: { userId: '1', profilePicture: null, name: 'Creator 1' } as User,
        assignedTo: null,
      },
      {
        entryId: '2',
        title: 'Entry 2',
        finished: true,
        finishedAt: fourDaysAgo.toISOString(),
        showInDistrict: true,
        board: null,
        creator: { userId: '2', profilePicture: null, name: 'Creator 2' } as User,
        assignedTo: null,
      },
    ];

    const mockBoard = {
      entries: mockEntries,
      fireBrigade: { fireBrigadeId: mockFireBrigadeId, state: 'state', district: 'district' },
    };

    const queryBuilderMock: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockBoard),
      getMany: jest.fn().mockResolvedValue([]),
    };

    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock);
    jest.spyOn(boardRepository, 'find').mockResolvedValue([{ fireBrigade: mockFireBrigadeId }] as any);
    jest.spyOn(entryRepository, 'delete').mockResolvedValue(undefined);

    const result = await controller.getEntries(mockFireBrigadeId);

    expect(result).toEqual(mockEntries);
    expect(boardRepository.createQueryBuilder).toHaveBeenCalled();
    expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(8);
    expect(queryBuilderMock.where).toHaveBeenCalled();
    expect(queryBuilderMock.getOne).toHaveBeenCalled();
    expect(entryRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should create a new entry', async () => {
    const mockFireBrigadeId = 'test-fire-brigade-id';
    const mockDto: PostBlackBoardEntryDto = { title: 'Test Entry', showInDistrict: true, creator: 'test-user-id' };
    const mockUser: User = {
      userId: 'test-user-id',
      username: 'testuser',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '1234567890',
      rank: 'Test Rank',
      position: 'Test Position',
      profilePicture: null,
      lastLogin: '2024-01-26T10:00:00.000Z',
      amountOfLogins: 0,
      termsOfRightsVersion: '1.0',
      chats: [],
      blackBoardEntries: [],
      certifiedCourse: [],
      blackBoardAssignments: [],
      workTime: [],
      license: null,
      fireBrigade: null,
    };
    const mockBoard = { fireBrigade: mockFireBrigadeId };

    jest.spyOn(boardRepository, 'find').mockResolvedValue([{ fireBrigade: mockFireBrigadeId }] as any);
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(entryRepository, 'save').mockResolvedValue({} as BlackBoardEntry);

    await controller.postEntry(mockFireBrigadeId, mockDto);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ userId: mockDto.creator });
    expect(entryRepository.save).toHaveBeenCalled();
  });

  it('should assign an entry to a user', async () => {
    const mockDto: AssignEntryDto = { entryId: 'test-entry-id', userId: 'test-user-id' };
    const mockUser: User = {
      userId: 'test-user-id',
      username: 'testuser',
      name: 'Test User',
      address: 'Test Address',
      telephoneNumber: '1234567890',
      rank: 'Test Rank',
      position: 'Test Position',
      profilePicture: null,
      lastLogin: '2024-01-26T10:00:00.000Z',
      amountOfLogins: 0,
      termsOfRightsVersion: '1.0',
      chats: [],
      blackBoardEntries: [],
      certifiedCourse: [],
      blackBoardAssignments: [],
      workTime: [],
      license: null,
      fireBrigade: null,
    };

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(entryRepository, 'update').mockResolvedValue(undefined);

    await controller.postAssignEntry(mockDto);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ userId: mockDto.userId });
    expect(entryRepository.update).toHaveBeenCalledWith({ entryId: mockDto.entryId }, { assignedTo: mockUser });
  });

  it('should finish an entry', async () => {
    const mockEntryId = 'test-entry-id';
    const mockFinishedAt = new Date().toISOString();

    jest.spyOn(entryRepository, 'update').mockResolvedValue(undefined);

    await controller.postFinishEntry(mockEntryId);

    expect(entryRepository.update).toHaveBeenCalledWith(mockEntryId, { finished: true, finishedAt: mockFinishedAt });
  });
});
