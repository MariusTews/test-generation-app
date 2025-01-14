import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AddOn } from '../add-on';
import { Person } from '../person';
import { ContractController } from './contract.controller';
import { ContractDto } from './contract.dto';
import { Contract } from './contract.schema';
import { ContractService } from './contract.service';
import { CollectionNames } from '../../constants/collection-names';

describe('ContractController', () => {
  let controller: ContractController;
  let service: ContractService;
  let contractModel: Model<Contract>;
  let addOnModel: Model<AddOn>;
  let personModel: Model<Person>;

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
            find: jest
              .fn()
              .mockReturnValue({
                exec: jest.fn(),
                sort: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
              } as any),
            findByIdAndUpdate: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
            findByIdAndDelete: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
          },
        },
        {
          provide: getModelToken(CollectionNames.ADD_ONS_V3),
          useValue: {
            find: jest
              .fn()
              .mockReturnValue({
                sort: jest.fn().mockReturnValueOnce([]),
              } as any),
          },
        },
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
          },
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
    service = module.get<ContractService>(ContractService);
    contractModel = module.get<Model<Contract>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    addOnModel = module.get<Model<AddOn>>(
      getModelToken(CollectionNames.ADD_ONS_V3),
    );
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should create a new contract', async () => {
    const dto: ContractDto = {
      projectId: 'projectId1',
      personId: 'personId1',
      start: new Date(),
      end: new Date(),
      vte: 1,
      description: 'description1',
      comment: 'comment1',
      supervisorIds: [],
      fundingType: 'fundingType1',
      applicationDate: new Date(),
      type: 'type1',
      salaryScale: 'salaryScale1',
      costCenter: 'costCenter1',
      limited: true,
      primaryTypeId: 'primaryTypeId1',
      secondaryTypeId: 'secondaryTypeId1',
      researchFocusId: 'researchFocusId1',
      calculatedEnd: new Date(),
      calculatedVte: 0,
    };
    const newContract = new Contract();
    newContract.id = 'newContractId';
    newContract.personId = 'personId1';
    Object.assign(newContract, dto);
    jest
      .spyOn(contractModel, 'create')
      .mockImplementation(() => Promise.resolve(newContract));
    jest
      .spyOn(personModel, 'findById')
      .mockResolvedValueOnce({ id: 'personId1' } as any);
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({} as any);
    jest.spyOn(contractModel, 'find').mockReturnValueOnce([newContract] as any);

    const result = await controller.create(dto);
    expect(result).toEqual(newContract);
    expect(contractModel.create).toHaveBeenCalledWith(dto);
    expect(personModel.findById).toHaveBeenCalledWith('personId1');
    expect(personModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractModel.find).toHaveBeenCalledWith({ personId: 'personId1' });
  });

  it('getOne should return a contract', async () => {
    const contract = new Contract();
    contract.id = 'contractId1';
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValueOnce(contract as any);
    const result = await controller.getOne('contractId1');
    expect(result).toEqual(contract);
    expect(contractModel.findById).toHaveBeenCalledWith('contractId1');
  });

  it('getOne should return null if contract not found', async () => {
    jest.spyOn(contractModel, 'findById').mockResolvedValueOnce(null);
    const result = await controller.getOne('contractId1');
    expect(result).toEqual(null);
    expect(contractModel.findById).toHaveBeenCalledWith('contractId1');
  });

  it('getAll should return an array of contracts', async () => {
    const contracts = [new Contract(), new Contract()];
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(contracts),
        sort: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      } as any);
    const result = await controller.getAll({});
    expect(result).toEqual(contracts);
    expect(contractModel.find).toHaveBeenCalled();
  });

  it('getAll should return an empty array if no contracts found', async () => {
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
        sort: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      } as any);
    const result = await controller.getAll({});
    expect(result).toEqual([]);
    expect(contractModel.find).toHaveBeenCalled();
  });

  it('getAll should handle queryParams for filtering', async () => {
    const queryParams = { futureContracts: true };
    const contracts = [new Contract()];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    contracts[0].start = new Date(todayDate.getTime() + 86400000); // tomorrow
    jest.spyOn(contractModel, 'find').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(contracts),
      sort: jest.fn().mockReturnThis(),
    } as any);
    const result = await controller.getAll(queryParams);
    expect(result).toEqual(contracts);
    expect(contractModel.find).toHaveBeenCalled();
  });

  it('update should update a contract', async () => {
    const id = 'contractId1';
    const dto: ContractDto = {
      projectId: 'projectId1',
      personId: 'personId1',
      start: new Date(),
      end: new Date(),
      vte: 1,
      description: 'description1',
      comment: 'comment1',
      supervisorIds: [],
      fundingType: 'fundingType1',
      applicationDate: new Date(),
      type: 'type1',
      salaryScale: 'salaryScale1',
      costCenter: 'costCenter1',
      limited: true,
      primaryTypeId: 'primaryTypeId1',
      secondaryTypeId: 'secondaryTypeId1',
      researchFocusId: 'researchFocusId1',
      calculatedEnd: new Date(),
      calculatedVte: 0,
    };
    const contract = new Contract();
    contract.id = id;
    contract.personId = 'personId1';
    const updatedContract = new Contract();
    updatedContract.id = id;
    Object.assign(updatedContract, dto);
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValueOnce(contract as any);
    jest
      .spyOn(addOnModel, 'find')
      .mockReturnValueOnce({ sort: jest.fn().mockReturnValueOnce([]) } as any);
    jest
      .spyOn(contractModel, 'findByIdAndUpdate')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedContract),
      } as any);
    jest
      .spyOn(personModel, 'findById')
      .mockResolvedValueOnce({ id: 'personId1' } as any);
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({} as any);
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValueOnce([updatedContract] as any);
    const result = await controller.update(id, dto);
    expect(result).toEqual(updatedContract);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(contractModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(personModel.findById).toHaveBeenCalledWith('personId1');
    expect(personModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractModel.find).toHaveBeenCalledWith({ personId: 'personId1' });
  });

  it('update should return null if contract not found', async () => {
    const id = 'contractId1';
    const dto: ContractDto = {
      projectId: 'projectId1',
      personId: 'personId1',
      start: new Date(),
      end: new Date(),
      vte: 1,
      description: 'description1',
      comment: 'comment1',
      supervisorIds: [],
      fundingType: 'fundingType1',
      applicationDate: new Date(),
      type: 'type1',
      salaryScale: 'salaryScale1',
      costCenter: 'costCenter1',
      limited: true,
      primaryTypeId: 'primaryTypeId1',
      secondaryTypeId: 'secondaryTypeId1',
      researchFocusId: 'researchFocusId1',
      calculatedEnd: new Date(),
      calculatedVte: 0,
    };
    jest.spyOn(contractModel, 'findById').mockResolvedValueOnce(null);
    const result = await controller.update(id, dto);
    expect(result).toEqual(null);
    expect(contractModel.findById).toHaveBeenCalledWith(id);
    expect(contractModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('delete should delete a contract', async () => {
    const id = 'contractId1';
    const contract = new Contract();
    contract.id = id;
    contract.personId = 'personId1';
    jest
      .spyOn(contractModel, 'findByIdAndDelete')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(contract),
      } as any);
    jest
      .spyOn(personModel, 'findById')
      .mockResolvedValueOnce({ id: 'personId1' } as any);
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({} as any);
    jest.spyOn(contractModel, 'find').mockReturnValueOnce([contract] as any);
    const result = await controller.delete(id);
    expect(result).toEqual(contract);
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(personModel.findById).toHaveBeenCalledWith('personId1');
    expect(personModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(contractModel.find).toHaveBeenCalledWith({ personId: 'personId1' });
  });

  it('delete should return null if contract not found', async () => {
    const id = 'contractId1';
    jest
      .spyOn(contractModel, 'findByIdAndDelete')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const result = await controller.delete(id);
    expect(result).toEqual(null);
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});
