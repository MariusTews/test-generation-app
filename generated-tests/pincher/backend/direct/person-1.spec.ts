import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Workbook } from 'exceljs';
import { Model } from 'mongoose';
import { CollectionNames } from 'src/constants/collection-names';
import { Qualification, Status } from './model/qualification';
import {
  getPersonTableWorkbook,
  fillPersonOverviewWorksheet,
} from './person-excel-helper';
import { PersonDto } from './person.dto';
import { Person } from './person.schema';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from 'src/auth/auth.guard';
import { ControllerUtils } from 'src/constants/controller-utils';
import { ExportHelper } from 'src/util/export-helper';

const mockPerson: Person = {
  id: 'mockId',
  firstName: 'John',
  lastName: 'Doe',
  bornLastName: 'Doe',
  title: 'Dr.',
  gender: 'male',
  roomNumber: '123',
  emailWork: 'john.doe@example.com',
  phoneWork: '123456789',
  member: true,
  extern: false,
  current: true,
  currentActivities: [],
  former: false,
  certificate: false,
  rank: '',
  instituteId: 'mockInstituteId',
  subInstituteId: '',
  subInstitute: '',
  company: '',
  street: '',
  streetNo: '',
  additional: '',
  plz: '',
  town: '',
  country: '',
  candidature: false,
  firstApplication: '',
  sciTimeVGs: [],
  retirement: new Date(),
  timeUsedUp: false,
  teamIds: [],
  workdays: [],
  loanIT: false,
  device: '',
  inventoryNumber: '',
  loanEnd: new Date(),
  emailExtension: false,
  emailExtensionEnd: new Date(),
  qualification: [],
  thesis: new Qualification(),
  habilitation: new Qualification(),
  professorship: new Qualification(),
  newsletter: false,
  calculatedVteSum: 0,
  calculatedEmploymentEnd: new Date(),
  comment: '',
};

const mockPersonDto: PersonDto = {
  firstName: 'John',
  lastName: 'Doe',
  bornLastName: 'Doe',
  title: 'Dr.',
  gender: 'male',
  member: true,
  extern: false,
  current: true,
  currentActivities: [],
  former: false,
  roomNumber: '123',
  emailWork: 'john.doe@example.com',
  phoneWork: '123456789',
  certificate: false,
  rank: '',
  instituteId: 'mockInstituteId',
  subInstituteId: '',
  subInstitute: '',
  company: '',
  street: '',
  streetNo: '',
  additional: '',
  plz: '',
  town: '',
  country: '',
  candidature: false,
  firstApplication: '',
  sciTimeVGs: [],
  retirement: new Date(),
  timeUsedUp: false,
  teamIds: '',
  workdays: [],
  loanIT: false,
  device: '',
  inventoryNumber: '',
  loanEnd: new Date(),
  emailExtension: false,
  emailExtensionEnd: new Date(),
  qualification: [],
  thesis: new Qualification(),
  habilitation: new Qualification(),
  professorship: new Qualification(),
  newsletter: false,
  calculatedVteSum: 0,
  calculatedEmploymentEnd: new Date(),
  comment: '',
};

describe('PersonService', () => {
  let service: PersonService;
  let personModel: Model<Person>;
  let committeeModel: Model<any>;
  let controller: PersonController;
  let instituteModel: Model<any>;
  let contractModel: Model<any>;
  let arrangementModel: Model<any>;
  let committeeEntryModel: Model<any>;
  let membershipModel: Model<any>;
  let relationshipModel: Model<any>;
  let tagModel: Model<any>;
  let projectModel: Model<any>;
  let contractTypeModel: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [
        PersonService,
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
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
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
            } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.ARRANGEMENTS),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
            } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
            } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.MEMBERSHIPS),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
            } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEES),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
            } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.TAGS),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.PROJECTS),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACT_TYPES),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() }),
          } as any,
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
        {
          provide: 'RoleGuard',
          useValue: new RoleGuard(new Reflector()),
        },
        {
          provide: 'ExportHelper',
          useValue: new ExportHelper(),
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    committeeModel = module.get<Model<any>>(
      getModelToken(CollectionNames.COMMITTEES),
    );
    controller = module.get<PersonController>(PersonController);
    instituteModel = module.get<Model<any>>(
      getModelToken(CollectionNames.INSTITUTES_V3),
    );
    contractModel = module.get<Model<any>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    arrangementModel = module.get<Model<any>>(
      getModelToken(CollectionNames.ARRANGEMENTS),
    );
    committeeEntryModel = module.get<Model<any>>(
      getModelToken(CollectionNames.COMMITTEE_ENTRIES),
    );
    membershipModel = module.get<Model<any>>(
      getModelToken(CollectionNames.MEMBERSHIPS),
    );
    relationshipModel = module.get<Model<any>>(
      getModelToken(CollectionNames.RELATIONSHIPS_V3),
    );
    tagModel = module.get<Model<any>>(getModelToken(CollectionNames.TAGS));
    projectModel = module.get<Model<any>>(
      getModelToken(CollectionNames.PROJECTS),
    );
    contractTypeModel = module.get<Model<any>>(
      getModelToken(CollectionNames.CONTRACT_TYPES),
    );
  });

  it('createPerson', async () => {
    const mockCreate = jest.spyOn(personModel, 'create');
    mockCreate.mockImplementation(() => Promise.resolve(mockPerson as any));
    const createdPerson = await service.create(mockPersonDto);
    expect(createdPerson).toEqual(mockPerson);
    expect(mockCreate).toHaveBeenCalledWith(mockPersonDto);
  });

  it('getOnePerson', async () => {
    const mockFindById = jest.spyOn(personModel, 'findById');
    mockFindById.mockResolvedValueOnce(mockPerson as any);
    const person = await service.getOne('mockId');
    expect(person).toEqual(mockPerson);
    expect(mockFindById).toHaveBeenCalledWith('mockId');
  });

  it('getOnePersonReturnsNull', async () => {
    const mockFindById = jest.spyOn(personModel, 'findById');
    mockFindById.mockResolvedValueOnce(null);
    const person = await service.getOne('nonExistentId');
    expect(person).toBeNull();
    expect(mockFindById).toHaveBeenCalledWith('nonExistentId');
  });

  it('getAllPersons', async () => {
    const mockFind = jest.spyOn(personModel, 'find');
    mockFind.mockReturnValueOnce({
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson]),
    } as any);
    const persons = await service.getAll({});
    expect(persons).toEqual([mockPerson]);
    expect(mockFind).toHaveBeenCalled();
  });

  it('getAllPersonsEmpty', async () => {
    const mockFind = jest.spyOn(personModel, 'find');
    mockFind.mockReturnValueOnce({
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([]),
    } as any);
    const persons = await service.getAll({});
    expect(persons).toEqual([]);
    expect(mockFind).toHaveBeenCalled();
  });

  it('updatePerson', async () => {
    const mockFindByIdAndUpdate = jest.spyOn(personModel, 'findByIdAndUpdate');
    mockFindByIdAndUpdate.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockPerson),
    } as any);
    const updatedPerson = await service.update('mockId', mockPersonDto);
    expect(updatedPerson).toEqual(mockPerson);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'mockId',
      { $set: mockPersonDto },
      { new: true },
    );
  });

  it('updatePersonReturnsNull', async () => {
    const mockFindByIdAndUpdate = jest.spyOn(personModel, 'findByIdAndUpdate');
    mockFindByIdAndUpdate.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const updatedPerson = await service.update('nonExistentId', mockPersonDto);
    expect(updatedPerson).toBeNull();
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'nonExistentId',
      { $set: mockPersonDto },
      { new: true },
    );
  });

  it('deletePerson', async () => {
    const mockFindByIdAndDelete = jest.spyOn(personModel, 'findByIdAndDelete');
    mockFindByIdAndDelete.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockPerson),
    } as any);
    const deletedPerson = await service.delete('mockId');
    expect(deletedPerson).toEqual(mockPerson);
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('mockId');
  });

  it('deletePersonReturnsNull', async () => {
    const mockFindByIdAndDelete = jest.spyOn(personModel, 'findByIdAndDelete');
    mockFindByIdAndDelete.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const deletedPerson = await service.delete('nonExistentId');
    expect(deletedPerson).toBeNull();
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
  });

  it('getAllTable', async () => {
    const mockGetAll = jest
      .spyOn(service, 'getAll')
      .mockResolvedValueOnce([mockPerson]);
    const workbook = await service.getAllTable({});
    expect(workbook instanceof Workbook).toBe(true);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('getAllTableEmpty', async () => {
    const mockGetAll = jest.spyOn(service, 'getAll').mockResolvedValueOnce([]);
    const workbook = await service.getAllTable({});
    expect(workbook instanceof Workbook).toBe(true);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('getOverview', async () => {
    const mockGetOne = jest
      .spyOn(service, 'getOne')
      .mockResolvedValueOnce(mockPerson);
    const contractMock = jest.spyOn(contractModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce([]),
    } as any);
    const instituteMock = jest
      .spyOn(instituteModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);
    const committeeEntryMock = jest
      .spyOn(committeeEntryModel, 'find')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const committeeMock = jest
      .spyOn(committeeModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);
    const arrangementMock = jest
      .spyOn(arrangementModel, 'find')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const relationshipMock = jest
      .spyOn(relationshipModel, 'find')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const membershipMock = jest
      .spyOn(membershipModel, 'find')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const tagMock = jest.spyOn(tagModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce({}),
    } as any);
    const projectMock = jest
      .spyOn(projectModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);
    const contractTypeMock = jest
      .spyOn(contractTypeModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);

    const workbook = await service.getOverview('mockId');
    expect(workbook instanceof Workbook).toBe(true);
    expect(mockGetOne).toHaveBeenCalledWith('mockId');
    expect(instituteMock).toHaveBeenCalled();
    expect(contractMock).toHaveBeenCalled();
    expect(committeeEntryMock).toHaveBeenCalled();
    expect(committeeMock).toHaveBeenCalled();
    expect(arrangementMock).toHaveBeenCalled();
    expect(relationshipMock).toHaveBeenCalled();
    expect(membershipMock).toHaveBeenCalled();
    expect(tagMock).toHaveBeenCalled();
    expect(projectMock).toHaveBeenCalled();
    expect(contractTypeMock).toHaveBeenCalled();
  });

  it('getOverviewReturnsEmptyWorkbook', async () => {
    const mockGetOne = jest
      .spyOn(service, 'getOne')
      .mockResolvedValueOnce(null);
    const workbook = await service.getOverview('nonExistentId');
    expect(workbook instanceof Workbook).toBe(true);
    expect(mockGetOne).toHaveBeenCalledWith('nonExistentId');
  });

  it('getAllCount', async () => {
    const mockFind = jest.spyOn(personModel, 'find');
    mockFind.mockReturnValueOnce({
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson, mockPerson]),
    } as any);
    const count = await controller.getAllCount({});
    expect(count).toBe(2);
    expect(mockFind).toHaveBeenCalled();
  });

  it('getAllCountEmpty', async () => {
    const mockFind = jest.spyOn(personModel, 'find');
    mockFind.mockReturnValueOnce({
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([]),
    } as any);
    const count = await controller.getAllCount({});
    expect(count).toBe(0);
    expect(mockFind).toHaveBeenCalled();
  });
});
