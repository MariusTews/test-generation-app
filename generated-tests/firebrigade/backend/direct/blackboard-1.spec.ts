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

  it('getEntries should return empty array if no entries found', async () => {
    const mockFireBrigade = new FireBrigade();
    mockFireBrigade.fireBrigadeId = 'testFireBrigadeId';
    mockFireBrigade.state = 'testState';
    mockFireBrigade.district = 'testDistrict';
    const mockBoard = new BlackBoard();
    mockBoard.fireBrigade = mockFireBrigade;
    mockBoard.entries = [];
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
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValueOnce([]),
    } as any);

    const result = await controller.getEntries('testFireBrigadeId');
    expect(result).toBeDefined();
    expect(result.length).toBe(0);
  });

  it('getEntries should handle database error', async () => {
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockRejectedValueOnce(new Error('Database error')),
    } as any);
    await expect(controller.getEntries('testFireBrigadeId')).rejects.toThrowError('Database error');
  });

  it('postEntry should create a new BlackBoardEntry and handle database error', async () => {
    const mockUser = new User();
    mockUser.userId = 'testUserId';
    const mockBoard = new BlackBoard();
    mockBoard.fireBrigade = new FireBrigade();
    mockBoard.fireBrigade.fireBrigadeId = 'testFireBrigadeId';
    const dto: PostBlackBoardEntryDto = {
      title: 'testTitle',
      showInDistrict: true,
      creator: 'testUserId',
    };

    jest.spyOn(boardRepository, 'find').mockResolvedValueOnce([mockBoard] as any);
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser as any);
    jest.spyOn(entryRepository, 'save').mockRejectedValueOnce(new Error('Database error'));

    await expect(controller.postEntry('testFireBrigadeId', dto)).rejects.toThrowError('Database error');
    expect(entryRepository.save).toHaveBeenCalled();
  });

  it('postEntry should handle case where board is not found', async () => {
    const dto: PostBlackBoardEntryDto = {
      title: 'testTitle',
      showInDistrict: true,
      creator: 'testUserId',
    };
    jest.spyOn(boardRepository, 'find').mockResolvedValueOnce([] as any);
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(new User() as any);
    const result = await controller.postEntry('testFireBrigadeId', dto);
    expect(result).toBeUndefined();
    expect(entryRepository.save).not.toHaveBeenCalled();
  });

  it('postFinishEntry should handle database error', async () => {
    jest.spyOn(entryRepository, 'update').mockRejectedValueOnce(new Error('Database error'));
    await expect(controller.postFinishEntry('testEntryId')).rejects.toThrowError('Database error');
  });

  it('postAssignEntry should handle database error', async () => {
    const dto: AssignEntryDto = {
      entryId: 'testEntryId',
      userId: 'testUserId',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(new User() as any);
    jest.spyOn(entryRepository, 'update').mockRejectedValueOnce(new Error('Database error'));

    await expect(controller.postAssignEntry(dto)).rejects.toThrowError('Database error');
  });

  it('postAssignEntry should handle case where user is not found', async () => {
    const dto: AssignEntryDto = {
      entryId: 'testEntryId',
      userId: 'testUserId',
    };
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null as any);
    jest.spyOn(entryRepository, 'update').mockResolvedValueOnce({} as any);

    await controller.postAssignEntry(dto);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ userId: 'testUserId' });
    expect(entryRepository.update).not.toHaveBeenCalled();
  });
  it('getEntries should return empty array if board is not found', async () => {
    jest.spyOn(boardRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValueOnce(null),
    } as any);

    const result = await controller.getEntries('testFireBrigadeId');
    expect(result).toEqual([]);
  });
});
