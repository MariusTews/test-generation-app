import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Contract, ContractSchema } from './contract.schema';
import { Model } from 'mongoose';
import { ContractDto } from './contract.dto';
import { AddOn } from '../add-on';
import { Person } from '../person';
import { CollectionNames } from '../../constants/collection-names';
import { SciTimeVG } from '../person/model/sciTimeVG';
import { Qualification } from '../person/model/qualification';

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
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
            where: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(CollectionNames.ADD_ONS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([]),
            } as any),
          },
        },
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
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

  describe('create', () => {
    it('should create a new contract', async () => {
      const dto: ContractDto = {
        projectId: 'projectId',
        personId: 'personId',
        start: new Date(),
        end: new Date(),
        vte: 1,
        type: 'type',
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
        calculatedEnd: new Date(),
        calculatedVte: 1,
      };
      const createSpy = jest
        .spyOn(contractModel, 'create')
        .mockImplementation(() => Promise.resolve(mockContract));
      const personFindByIdSpy = jest
        .spyOn(personModel, 'findById')
        .mockResolvedValue(getPersonMock() as Person);
      const personFindByIdAndUpdateSpy = jest
        .spyOn(personModel, 'findByIdAndUpdate')
        .mockResolvedValue(getPersonMock() as Person);
      const contractFindSpy = jest
        .spyOn(contractModel, 'find')
        .mockResolvedValue([mockContract] as Contract[]);

      const result = await controller.create(dto);

      expect(createSpy).toHaveBeenCalledWith(dto);
      expect(personFindByIdSpy).toHaveBeenCalled();
      expect(contractFindSpy).toHaveBeenCalledWith({ personId: 'personId' });
      expect(personFindByIdAndUpdateSpy).toHaveBeenCalled();
      expect(result).toEqual(mockContract);
    });
  });

  describe('getOne', () => {
    it('should get one contract', async () => {
      const mockContract: Contract = getContractMock();
      const findByIdSpy = jest
        .spyOn(contractModel, 'findById')
        .mockResolvedValue(mockContract);

      const result = await controller.getOne('mockContractId');

      expect(findByIdSpy).toHaveBeenCalledWith('mockContractId');
      expect(result).toEqual(mockContract);
    });
    it('should return null if contract not found', async () => {
      const findByIdSpy = jest
        .spyOn(contractModel, 'findById')
        .mockResolvedValue(null);
      const result = await controller.getOne('mockContractId');
      expect(findByIdSpy).toHaveBeenCalledWith('mockContractId');
      expect(result).toEqual(null);
    });
  });

  describe('getAll', () => {
    it('should get all contracts', async () => {
      const mockContracts: Contract[] = [getContractMock(), getContractMock()];
      const findSpy = jest.spyOn(contractModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      } as any);

      const result = await controller.getAll({});

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(mockContracts);
    });
    it('should handle query parameters', async () => {
      const queryParams = { futureContracts: true };
      const mockContracts: Contract[] = [getContractMock()];
      const findSpy = jest.spyOn(contractModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      } as any);
      const result = await controller.getAll(queryParams);
      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(mockContracts);
    });
  });

  describe('update', () => {
    it('should update a contract', async () => {
      const dto: ContractDto = getContractDtoMock();
      const mockContract: Contract = getContractMock();
      const findByIdAndUpdateSpy = jest
        .spyOn(contractModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockContract),
        } as any);
      const findSpy = jest
        .spyOn(contractModel, 'find')
        .mockResolvedValue([mockContract]);
      const personFindByIdSpy = jest
        .spyOn(personModel, 'findById')
        .mockResolvedValue(getPersonMock() as Person);
      const personFindByIdAndUpdateSpy = jest
        .spyOn(personModel, 'findByIdAndUpdate')
        .mockResolvedValue(getPersonMock() as Person);
      const findByIdSpy = jest
        .spyOn(contractModel, 'findById')
        .mockResolvedValue(mockContract);
      const addOnFindSpy = jest.spyOn(addOnModel, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await controller.update('mockContractId', dto);

      expect(findByIdAndUpdateSpy).toHaveBeenCalled();
      expect(personFindByIdSpy).toHaveBeenCalled();
      expect(personFindByIdAndUpdateSpy).toHaveBeenCalled();
      expect(findByIdSpy).toHaveBeenCalledWith('mockContractId');
      expect(addOnFindSpy).toHaveBeenCalled();
      expect(result).toEqual(mockContract);
    });
    it('should return null if contract not found', async () => {
      const dto: ContractDto = getContractDtoMock();
      const findByIdSpy = jest
        .spyOn(contractModel, 'findById')
        .mockResolvedValue(null);
      const findByIdAndUpdateSpy = jest
        .spyOn(contractModel, 'findByIdAndUpdate')
        .mockResolvedValue(null);
      const result = await controller.update('mockContractId', dto);
      expect(findByIdSpy).toHaveBeenCalledWith('mockContractId');
      expect(findByIdAndUpdateSpy).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });

  describe('delete', () => {
    it('should delete a contract', async () => {
      const mockContract: Contract = getContractMock();
      const findByIdAndDeleteSpy = jest
        .spyOn(contractModel, 'findByIdAndDelete')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockContract),
        } as any);
      const personFindByIdSpy = jest
        .spyOn(personModel, 'findById')
        .mockResolvedValue(getPersonMock() as Person);
      const personFindByIdAndUpdateSpy = jest
        .spyOn(personModel, 'findByIdAndUpdate')
        .mockResolvedValue(getPersonMock() as Person);
      const contractFindSpy = jest
        .spyOn(contractModel, 'find')
        .mockResolvedValue([mockContract] as Contract[]);

      const result = await controller.delete('mockContractId');

      expect(findByIdAndDeleteSpy).toHaveBeenCalled();
      expect(personFindByIdSpy).toHaveBeenCalled();
      expect(personFindByIdAndUpdateSpy).toHaveBeenCalled();
      expect(result).toEqual(mockContract);
    });
    it('should return null if contract not found', async () => {
      const findByIdAndDeleteSpy = jest
        .spyOn(contractModel, 'findByIdAndDelete')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      const personFindByIdSpy = jest
        .spyOn(personModel, 'findById')
        .mockResolvedValue(getPersonMock() as Person);
      const personFindByIdAndUpdateSpy = jest
        .spyOn(personModel, 'findByIdAndUpdate')
        .mockResolvedValue(getPersonMock() as Person);

      const result = await controller.delete('mockContractId');

      expect(findByIdAndDeleteSpy).toHaveBeenCalled();
      expect(personFindByIdSpy).not.toHaveBeenCalled();
      expect(personFindByIdAndUpdateSpy).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });
});

function getPersonMock(): Person {
  return {
    id: 'personId',
    firstName: 'firstName',
    lastName: 'lastName',
    bornLastName: 'bornLastName',
    title: 'title',
    gender: 'gender',
    member: true,
    extern: true,
    current: true,
    currentActivities: [],
    former: true,
    roomNumber: 'roomNumber',
    emailWork: 'emailWork',
    phoneWork: 'phoneWork',
    certificate: true,
    rank: 'rank',
    instituteId: 'instituteId',
    subInstituteId: 'subInstituteId',
    subInstitute: 'subInstitute',
    company: 'company',
    street: 'street',
    streetNo: 'streetNo',
    additional: 'additional',
    plz: 'plz',
    town: 'town',
    country: 'country',
    candidature: true,
    firstApplication: 'firstApplication',
    sciTimeVGs: [],
    retirement: new Date(),
    timeUsedUp: true,
    teamIds: [],
    workdays: [],
    qualification: [],
    thesis: new Qualification(),
    habilitation: new Qualification(),
    professorship: new Qualification(),
    loanIT: true,
    device: 'device',
    inventoryNumber: 'inventoryNumber',
    loanEnd: new Date(),
    emailExtension: true,
    emailExtensionEnd: new Date(),
    newsletter: true,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: new Date(),
    comment: 'comment',
  };
}

function getContractMock(): Contract {
  return {
    id: 'mockContractId',
    projectId: 'projectId',
    personId: 'personId',
    start: new Date(),
    end: new Date(),
    vte: 1,
    type: 'type',
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
}

function getContractDtoMock(): ContractDto {
  return {
    projectId: 'projectId',
    personId: 'personId',
    start: new Date(),
    end: new Date(),
    vte: 1,
    type: 'type',
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
}
