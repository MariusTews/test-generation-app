import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './contract.schema';
import { Model } from 'mongoose';
import { ContractDto } from './contract.dto';
import { getModelToken } from '@nestjs/mongoose';
import { CollectionNames } from '../../constants/collection-names';
import { BadRequestException } from '@nestjs/common';

describe('ContractController', () => {
  let controller: ContractController;
  let service: ContractService;
  let contractModel: Model<Contract>;
  let addOnModel: Model<any>;
  let personModel: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        ContractService,
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          } as unknown as Model<Contract>,
        },
        {
          provide: getModelToken(CollectionNames.ADD_ONS_V3),
          useValue: {
            find: jest.fn(),
          } as unknown as Model<any>,
        },
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            find: jest.fn(),
          } as unknown as Model<any>,
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
    service = module.get<ContractService>(ContractService);
    contractModel = module.get(getModelToken(CollectionNames.CONTRACTS_V3));
    addOnModel = module.get(getModelToken(CollectionNames.ADD_ONS_V3));
    personModel = module.get(getModelToken(CollectionNames.PERSONS_V3));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a contract', async () => {
    const dto: ContractDto = {
      projectId: 'projectId',
      personId: 'personId',
      type: 'type',
      start: new Date(),
      end: new Date(),
      vte: 1,
      description: 'description',
      comment: 'comment',
      calculatedEnd: new Date(),
      calculatedVte: 1,
      supervisorIds: [],
      fundingType: 'fundingType',
      applicationDate: new Date(),
      salaryScale: 'salaryScale',
      costCenter: 'costCenter',
      limited: true,
      primaryTypeId: 'primaryTypeId',
      secondaryTypeId: 'secondaryTypeId',
      researchFocusId: 'researchFocusId',
    };
    const mockContract: Contract = {
      id: 'mockContractId',
      ...dto,
    };

    jest
      .spyOn(contractModel, 'create')
      .mockImplementation(async () => ({ id: 'mockContractId', ...dto }));
    jest.spyOn(personModel, 'findById').mockResolvedValue({});
    jest.spyOn(personModel, 'findByIdAndUpdate').mockResolvedValue({});
    jest.spyOn(contractModel, 'find').mockResolvedValue([]);

    const result = await controller.create(dto);
    // Assertions
    expect(contractModel.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'mockContractId', ...dto });
    expect(result.id).toBeDefined();
    expect(result.projectId).toEqual(dto.projectId);
    expect(result.personId).toEqual(dto.personId);
    expect(result.type).toEqual(dto.type);
  });

  it('should get one contract', async () => {
    const id = 'testId';
    const mockContract = { id, ...new ContractDto() };
    jest.spyOn(contractModel, 'findById').mockResolvedValue(mockContract);
    const result = await controller.getOne(id);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockContract);
  });

  it('should get all contracts', async () => {
    const mockContracts = [
      { id: '1', ...new ContractDto() },
      { id: '2', ...new ContractDto() },
    ];
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContracts),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    const result = await controller.getAll({});
    expect(contractModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockContracts);
  });

  it('should update a contract', async () => {
    const id = 'testId';
    const dto = new ContractDto();
    const mockContract = { id, ...dto };
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValue({ id: 'testId', ...new ContractDto() });
    jest.spyOn(contractModel, 'findByIdAndUpdate').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContract),
    } as any);
    jest.spyOn(personModel, 'findById').mockResolvedValue({});
    jest.spyOn(personModel, 'findByIdAndUpdate').mockResolvedValue({});
    jest.spyOn(contractModel, 'find').mockResolvedValue([]);

    const result = await controller.update(id, dto);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(contractModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { $set: expect.objectContaining(dto) },
      { new: true },
    );
    expect(result).toEqual(mockContract);
  });

  it('should delete a contract', async () => {
    const id = 'testId';
    const mockContract = { id, ...new ContractDto() };
    jest.spyOn(contractModel, 'findByIdAndDelete').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContract),
    } as any);
    jest.spyOn(personModel, 'findById').mockResolvedValue({});
    jest.spyOn(personModel, 'findByIdAndUpdate').mockResolvedValue({});
    jest.spyOn(contractModel, 'find').mockResolvedValue([]);

    const result = await controller.delete(id);
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockContract);
  });

  it('should handle getOne with non-existent contract', async () => {
    const id = 'nonExistentId';
    jest.spyOn(contractModel, 'findById').mockResolvedValue(null);
    const result = await controller.getOne(id);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should handle getAll with query parameters', async () => {
    const queryParams = { type: 'type' };
    const mockContracts = [
      { id: '1', type: 'type' },
      { id: '2', type: 'type' },
    ];
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContracts),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    const result = await controller.getAll(queryParams);
    expect(contractModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockContracts);
  });

  it('should handle update with non-existent contract', async () => {
    const id = 'nonExistentId';
    const dto = new ContractDto();
    jest.spyOn(contractModel, 'findById').mockResolvedValue(null);
    jest
      .spyOn(contractModel, 'findByIdAndUpdate')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
    const result = await controller.update(id, dto);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(contractModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle delete with non-existent contract', async () => {
    const id = 'nonExistentId';
    jest
      .spyOn(contractModel, 'findByIdAndDelete')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
    const result = await controller.delete(id);
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should handle getAll with error', async () => {
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    await expect(controller.getAll({})).rejects.toThrow(Error);
  });

  it('should handle update with error', async () => {
    const id = 'testId';
    const dto = new ContractDto();
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValue({ id: 'testId', ...new ContractDto() });
    jest.spyOn(contractModel, 'findByIdAndUpdate').mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    } as any);
    await expect(controller.update(id, dto)).rejects.toThrow(Error);
  });

  it('should handle delete with error', async () => {
    const id = 'testId';
    jest.spyOn(contractModel, 'findByIdAndDelete').mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    } as any);
    await expect(controller.delete(id)).rejects.toThrow(Error);
  });
});
