import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlackBoardController } from './black-board.controller';
import { BlackBoardService } from './black-board.service';
import BlackBoardEntry from './blackBoardEntry.entity';
import PostBlackBoardEntryDto from './postBlackBoardEntryDto';
import AssignEntryDto from './assignEntryDto';
import BlackBoard from './blackBoard.entity';
import User from 'src/user/user.entity';
import { Repository } from 'typeorm';
import FireBrigade from 'src/fire-brigade/fireBrigade.entity';

describe('BlackBoardController', () => {
  let controller: BlackBoardController;
  let service: BlackBoardService;
  let entryRepository: Repository<BlackBoardEntry>;
  let boardRepository: Repository<BlackBoard>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlackBoardController],
      providers: [
        BlackBoardService,
        {
          provide: getRepositoryToken(BlackBoardEntry),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BlackBoard),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<BlackBoardController>(BlackBoardController);
    service = module.get<BlackBoardService>(BlackBoardService);
    entryRepository = module.get<Repository<BlackBoardEntry>>(getRepositoryToken(BlackBoardEntry));
    boardRepository = module.get<Repository<BlackBoard>>(getRepositoryToken(BlackBoard));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getEntries should return entries', async () => {
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.fireBrigadeId = '123';
    mockFireBrigade.state = 'testState';
    mockFireBrigade.district = 'testDistrict';
    const mockUser = new User();
    mockUser.profilePicture = null;
    const mockBoard = new BlackBoard();
    mockBoard.fireBrigade = mockFireBrigade;
    const mockEntry = new BlackBoardEntry();
    mockEntry.creator = mockUser;
    mockBoard.entries = [mockEntry];
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnValueOnce({
            leftJoinAndSelect: jest.fn().mockReturnValueOnce({
              where: jest.fn().mockReturnValueOnce({
                getOne: jest.fn().mockResolvedValueOnce(mockBoard),
              }),
            }),
          }),
        }),
      }),
    } as any);
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnThis().mockReturnThis().mockReturnThis().mockReturnThis(),
      where: jest.fn().mockReturnThis().mockReturnThis().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis().mockReturnThis(),
      getMany: jest.fn().mockResolvedValueOnce([]),
    } as any);
    const result = await controller.getEntries('123');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('getEntries should return empty array if no board is found', async () => {
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnValueOnce({
            leftJoinAndSelect: jest.fn().mockReturnValueOnce({
              where: jest.fn().mockReturnValueOnce({
                getOne: jest.fn().mockResolvedValueOnce(null),
              }),
            }),
          }),
        }),
      }),
    } as any);
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnThis().mockReturnThis().mockReturnThis().mockReturnThis(),
      where: jest.fn().mockReturnThis().mockReturnThis().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis().mockReturnThis(),
      getMany: jest.fn().mockResolvedValueOnce([]),
    } as any);
    const result = await controller.getEntries('123');
    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  it('postEntry should create an entry', async () => {
    const mockUser = new User();
    mockUser.userId = 'user123';
    const mockBoard = new BlackBoard();
    mockBoard.fireBrigade = new FireBrigade();
    mockBoard.fireBrigade.fireBrigadeId = 'fb123';
    const mockDto: PostBlackBoardEntryDto = {
      title: 'test title',
      showInDistrict: true,
      creator: 'user123',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
    jest.spyOn(boardRepository, 'find').mockResolvedValueOnce([mockBoard]);
    jest.spyOn(entryRepository, 'save').mockResolvedValueOnce({ entryId: '1' } as any);
    await controller.postEntry('fb123', mockDto);
    expect(entryRepository.save).toHaveBeenCalled();
  });

  it('postEntry should handle case where no board is found', async () => {
    const mockUser = new User();
    mockUser.userId = 'user123';
    const mockDto: PostBlackBoardEntryDto = {
      title: 'test title',
      showInDistrict: true,
      creator: 'user123',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
    jest.spyOn(boardRepository, 'find').mockResolvedValueOnce([]);
    jest.spyOn(entryRepository, 'save').mockResolvedValue(undefined);
    await controller.postEntry('fb123', mockDto);
    expect(entryRepository.save).not.toHaveBeenCalled();
  });

  it('postFinishEntry should finish an entry', async () => {
    jest.spyOn(entryRepository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
    await controller.postFinishEntry('entry123');
    expect(entryRepository.update).toHaveBeenCalledWith('entry123', { finished: true, finishedAt: expect.any(String) });
  });

  it('postFinishEntry should handle entry not found', async () => {
    jest.spyOn(entryRepository, 'update').mockResolvedValueOnce({ affected: 0 } as any);
    await controller.postFinishEntry('entry123');
    expect(entryRepository.update).toHaveBeenCalledWith('entry123', { finished: true, finishedAt: expect.any(String) });
  });

  it('postAssignEntry should assign an entry', async () => {
    const mockUser = new User();
    mockUser.userId = 'user456';
    const mockDto: AssignEntryDto = {
      entryId: 'entry456',
      userId: 'user456',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
    jest.spyOn(entryRepository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
    await controller.postAssignEntry(mockDto);
    expect(entryRepository.update).toHaveBeenCalledWith({ entryId: 'entry456' }, { assignedTo: mockUser });
  });

  it('postAssignEntry should handle user not found', async () => {
    const mockDto: AssignEntryDto = {
      entryId: 'entry456',
      userId: 'user456',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
    jest.spyOn(entryRepository, 'update').mockResolvedValueOnce({ affected: 0 } as any);
    await controller.postAssignEntry(mockDto);
    expect(entryRepository.update).toHaveBeenCalledWith({ entryId: 'entry456' }, { assignedTo: null });
  });
});
