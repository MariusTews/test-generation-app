import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ContractService } from './contract.service';
import { Contract } from './contract.schema';
import { ContractDto } from './contract.dto';
import { Model } from 'mongoose';
import { AddOn } from '../add-on';
import { Person } from '../person';
import { CollectionNames } from '../../constants/collection-names';
import { CalculatePersonFieldsJob } from '../../cron-job/jobs/calculate-person-fields.job';
import { CalculateContractFieldsJob } from '../../cron-job/jobs/calculate-contract-fields.job';
import { Qualification } from '../person/model/qualification';

const mockContract: Contract = {
  id: 'mockContractId',
  projectId: 'mockProjectId',
  personId: 'mockPersonId',
  start: new Date(),
  end: new Date(),
  vte: 1,
  description: 'mockDescription',
  comment: 'mockComment',
  calculatedEnd: new Date(),
  calculatedVte: 1,
  supervisorIds: [],
  fundingType: 'mockFundingType',
  applicationDate: new Date(),
  type: 'mockType',
  salaryScale: 'mockSalaryScale',
  costCenter: 'mockCostCenter',
  limited: true,
  primaryTypeId: 'mockPrimaryTypeId',
  secondaryTypeId: 'mockSecondaryTypeId',
  researchFocusId: 'mockResearchFocusId',
};

const mockContractDto: ContractDto = {
  projectId: 'mockProjectId',
  personId: 'mockPersonId',
  start: new Date(),
  end: new Date(),
  vte: 1,
  description: 'mockDescription',
  comment: 'mockComment',
  calculatedEnd: new Date(),
  calculatedVte: 1,
  supervisorIds: [],
  fundingType: 'mockFundingType',
  applicationDate: new Date(),
  type: 'mockType',
  salaryScale: 'mockSalaryScale',
  costCenter: 'mockCostCenter',
  limited: true,
  primaryTypeId: 'mockPrimaryTypeId',
  secondaryTypeId: 'mockSecondaryTypeId',
  researchFocusId: 'mockResearchFocusId',
};

const mockAddOn: AddOn = {
  id: 'mockAddOnId',
  type: 'mockType',
  subType: 'mockSubType',
  contractId: 'mockContractId',
  start: new Date(),
  end: new Date(),
  applicationDate: new Date(),
  comment: 'mockComment',
  vte: 1,
  overtimeHours: 0,
  durationReasonId: 'mockDurationReasonId',
  substituteReason: 'mockSubstituteReason',
  substitutePersonId: 'mockSubstitutePersonId',
  substituteContractId: 'mockSubstituteContractId',
  substituteAddOn: 'mockSubstituteAddOn',
};

const mockPerson: Person = {
  id: 'mockPersonId',
  firstName: 'mockFirstName',
  lastName: 'mockLastName',
  bornLastName: 'mockBornLastName',
  title: 'mockTitle',
  gender: 'mockGender',
  member: false,
  extern: false,
  current: false,
  currentActivities: [],
  former: false,
  roomNumber: 'mockRoomNumber',
  emailWork: 'mockEmailWork',
  phoneWork: 'mockPhoneWork',
  certificate: false,
  rank: 'mockRank',
  instituteId: 'mockInstituteId',
  subInstituteId: 'mockSubInstituteId',
  subInstitute: 'mockSubInstitute',
  company: 'mockCompany',
  street: 'mockStreet',
  streetNo: 'mockStreetNo',
  additional: 'mockAdditional',
  plz: 'mockPlz',
  town: 'mockTown',
  country: 'mockCountry',
  candidature: false,
  firstApplication: 'mockFirstApplication',
  sciTimeVGs: [],
  retirement: new Date(),
  timeUsedUp: false,
  teamIds: [],
  workdays: [],
  qualification: [],
  thesis: new Qualification(),
  habilitation: new Qualification(),
  professorship: new Qualification(),
  loanIT: false,
  device: 'mockDevice',
  inventoryNumber: 'mockInventoryNumber',
  loanEnd: new Date(),
  emailExtension: false,
  emailExtensionEnd: new Date(),
  newsletter: false,
  calculatedVteSum: 0,
  calculatedEmploymentEnd: new Date(),
  comment: 'mockComment',
};

describe('ContractService', () => {
  let service: ContractService;
  let contractModel: Model<Contract>;
  let personModel: Model<Person>;
  let addOnModel: Model<AddOn>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
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
            find: jest.fn(),
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

    service = module.get<ContractService>(ContractService);
    contractModel = module.get<Model<Contract>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    addOnModel = module.get<Model<AddOn>>(
      getModelToken(CollectionNames.ADD_ONS_V3),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should create a new contract', async () => {
    jest
      .spyOn(contractModel, 'create')
      .mockImplementation(() => Promise.resolve(mockContract));
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(mockPerson);
    jest.spyOn(personModel, 'findById').mockResolvedValueOnce(mockPerson);
    jest.spyOn(contractModel, 'find').mockResolvedValueOnce([mockContract]);
    jest
      .spyOn(CalculatePersonFieldsJob, 'calculatePerson')
      .mockImplementation(() => {});

    const result = await service.create(mockContractDto);
    expect(result).toEqual(mockContract);
    expect(contractModel.create).toHaveBeenCalledWith(mockContractDto);
    expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockContract.personId,
      { $set: mockPerson },
      { new: true },
    );
    expect(personModel.findById).toHaveBeenCalledWith(mockContract.personId);
    expect(contractModel.find).toHaveBeenCalledWith({
      personId: mockPerson.id,
    });
    expect(CalculatePersonFieldsJob.calculatePerson).toHaveBeenCalledWith(
      [mockContract],
      mockPerson,
    );
  });

  it('getOne should return a contract', async () => {
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValueOnce(mockContract as any);
    const result = await service.getOne('mockContractId');
    expect(result).toEqual(mockContract);
    expect(contractModel.findById).toHaveBeenCalledWith('mockContractId');
  });

  it('getOne should return null if contract not found', async () => {
    jest.spyOn(contractModel, 'findById').mockResolvedValueOnce(null);
    const result = await service.getOne('nonexistentContractId');
    expect(result).toBeNull();
    expect(contractModel.findById).toHaveBeenCalledWith(
      'nonexistentContractId',
    );
  });

  it('getAll should return all contracts', async () => {
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockContract]),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any);
    const result = await service.getAll({});
    expect(result).toEqual([mockContract]);
    expect(contractModel.find).toHaveBeenCalled();
  });

  it('getAll should return empty array if no contracts found', async () => {
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any);
    const result = await service.getAll({});
    expect(result).toEqual([]);
    expect(contractModel.find).toHaveBeenCalled();
  });

  it('getAll should handle queryParams', async () => {
    const queryParams = { futureContracts: true };
    const mockQuery = {
      where: jest.fn(),
      exec: jest.fn().mockResolvedValueOnce([mockContract]),
    };
    jest.spyOn(service, 'filter').mockReturnValue(mockQuery as any);
    const result = await service.getAll(queryParams);
    expect(result).toEqual([mockContract]);
    expect(service.filter).toHaveBeenCalledWith(queryParams);
  });

  it('update should update a contract', async () => {
    jest
      .spyOn(contractModel, 'findById')
      .mockResolvedValueOnce(mockContract as any);
    jest
      .spyOn(contractModel, 'findByIdAndUpdate')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockContract as any),
      } as any);
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(mockPerson);
    jest.spyOn(personModel, 'findById').mockResolvedValueOnce(mockPerson);
    jest.spyOn(contractModel, 'find').mockResolvedValueOnce([mockContract]);
    jest
      .spyOn(CalculateContractFieldsJob, 'calculateContract')
      .mockImplementation(() => {});
    jest.spyOn(addOnModel, 'find').mockReturnValue({
      sort: jest
        .fn()
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce([mockAddOn]),
        } as any),
    } as any);
    const result = await service.update('mockContractId', mockContractDto);
    expect(result).toEqual(mockContract);
    expect(contractModel.findById).toHaveBeenCalledWith('mockContractId');
    expect(contractModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockContractId',
      { $set: { ...mockContractDto, id: 'mockContractId' } },
      { new: true },
    );
    expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockContract.personId,
      { $set: mockPerson },
      { new: true },
    );
    expect(personModel.findById).toHaveBeenCalledWith(mockContract.personId);
    expect(contractModel.find).toHaveBeenCalledWith({
      personId: mockPerson.id,
    });
    expect(CalculatePersonFieldsJob.calculatePerson).toHaveBeenCalledWith(
      [mockContract],
      mockPerson,
    );
    expect(addOnModel.find).toHaveBeenCalledWith({
      contractId: 'mockContractId',
    });
  });

  it('update should return null if contract not found', async () => {
    jest.spyOn(contractModel, 'findById').mockResolvedValueOnce(null);
    jest
      .spyOn(contractModel, 'findByIdAndUpdate')
      .mockReturnValue({ exec: jest.fn() } as any);
    const result = await service.update(
      'nonexistentContractId',
      mockContractDto,
    );
    expect(result).toBeNull();
    expect(contractModel.findById).toHaveBeenCalledWith(
      'nonexistentContractId',
    );
    expect(contractModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('delete should delete a contract', async () => {
    jest
      .spyOn(contractModel, 'findByIdAndDelete')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockContract),
      } as any);
    jest
      .spyOn(personModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(mockPerson);
    jest.spyOn(personModel, 'findById').mockResolvedValueOnce(mockPerson);
    jest.spyOn(contractModel, 'find').mockResolvedValueOnce([mockContract]);
    jest
      .spyOn(CalculatePersonFieldsJob, 'calculatePerson')
      .mockImplementation(() => {});
    const result = await service.delete('mockContractId');
    expect(result).toEqual(mockContract);
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(
      'mockContractId',
    );
    expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockContract.personId,
      { $set: mockPerson },
      { new: true },
    );
    expect(personModel.findById).toHaveBeenCalledWith(mockContract.personId);
    expect(contractModel.find).toHaveBeenCalledWith({
      personId: mockPerson.id,
    });
    expect(CalculatePersonFieldsJob.calculatePerson).toHaveBeenCalledWith(
      [mockContract],
      mockPerson,
    );
  });

  it('delete should return null if contract not found', async () => {
    jest
      .spyOn(contractModel, 'findByIdAndDelete')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const result = await service.delete('nonexistentContractId');
    expect(result).toBeNull();
    expect(contractModel.findByIdAndDelete).toHaveBeenCalledWith(
      'nonexistentContractId',
    );
  });
});
