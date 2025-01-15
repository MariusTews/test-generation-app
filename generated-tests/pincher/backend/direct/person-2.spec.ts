import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PersonService } from './person.service';
import { Person } from './person.schema';
import { PersonDto } from './person.dto';
import { Model } from 'mongoose';
import { Workbook } from 'exceljs';
import { Arrangement } from '../arrangement';
import { CommitteeEntry } from '../committee/committee-entry';
import { Committee } from '../committee';
import { Contract } from '../contract';
import { Relationship } from '../relationship';
import { Membership } from '../membership';
import { Tag } from '../tag';
import { Project } from '../project';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Institute } from '../institute';
import { CollectionNames } from '../../constants/collection-names';
import { Qualification, Status } from './model/qualification';
import { PersonController } from './person.controller';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from '../../auth/auth.guard';
import { ExportHelper } from '../../util/export-helper';

const mockPerson: Person = {
  id: 'mockPersonId',
  firstName: 'mockFirstName',
  lastName: 'mockLastName',
  bornLastName: 'mockBornLastName',
  title: 'mockTitle',
  gender: 'mockGender',
  member: true,
  extern: false,
  current: true,
  currentActivities: ['mockActivity'],
  former: false,
  roomNumber: 'mockRoomNumber',
  emailWork: 'mockEmailWork',
  phoneWork: 'mockPhoneWork',
  certificate: true,
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
  candidature: true,
  firstApplication: 'mockFirstApplication',
  sciTimeVGs: [],
  retirement: new Date(),
  timeUsedUp: false,
  teamIds: [],
  workdays: ['mockWorkday'],
  loanIT: true,
  device: 'mockDevice',
  inventoryNumber: 'mockInventoryNumber',
  loanEnd: new Date(),
  emailExtension: true,
  emailExtensionEnd: new Date(),
  qualification: ['mockQualification'],
  thesis: new Qualification(),
  habilitation: new Qualification(),
  professorship: new Qualification(),
  newsletter: true,
  calculatedVteSum: 100,
  calculatedEmploymentEnd: new Date(),
  comment: 'mockComment',
};

const mockPersonDto: PersonDto = {
  firstName: 'mockFirstName',
  lastName: 'mockLastName',
  bornLastName: 'mockBornLastName',
  title: 'mockTitle',
  gender: 'mockGender',
  member: true,
  extern: false,
  current: true,
  currentActivities: ['mockActivity'],
  former: false,
  roomNumber: 'mockRoomNumber',
  emailWork: 'mockEmailWork',
  phoneWork: 'mockPhoneWork',
  certificate: true,
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
  candidature: true,
  firstApplication: 'mockFirstApplication',
  sciTimeVGs: [],
  retirement: new Date(),
  timeUsedUp: false,
  teamIds: '',
  workdays: ['mockWorkday'],
  loanIT: true,
  device: 'mockDevice',
  inventoryNumber: 'mockInventoryNumber',
  loanEnd: new Date(),
  emailExtension: true,
  emailExtensionEnd: new Date(),
  qualification: ['mockQualification'],
  thesis: new Qualification(),
  habilitation: new Qualification(),
  professorship: new Qualification(),
  newsletter: true,
  calculatedVteSum: 100,
  calculatedEmploymentEnd: new Date(),
  comment: 'mockComment',
};

describe('PersonService', () => {
  let service: PersonService;
  let model: Model<Person>;
  let controller: PersonController;
  let instituteModel: Model<Institute>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
            countDocuments: jest.fn(),
            collation: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: { find: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.ARRANGEMENTS),
          useValue: { find: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
          useValue: { find: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.MEMBERSHIPS),
          useValue: { find: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEES),
          useValue: { findById: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
          useValue: { find: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.TAGS),
          useValue: { findById: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.PROJECTS),
          useValue: { findById: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACT_TYPES),
          useValue: { findById: jest.fn() } as any,
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
          },
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
        {
          provide: RoleGuard,
          useValue: new RoleGuard(new Reflector()),
        },
        {
          provide: ExportHelper,
          useValue: { workbookToRes: jest.fn() },
        },
      ],
      controllers: [PersonController],
    }).compile();

    service = module.get<PersonService>(PersonService);
    model = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    controller = module.get(PersonController);
    instituteModel = module.get<Model<Institute>>(
      getModelToken(CollectionNames.INSTITUTES_V3),
    );
  });

  it('should create a person', async () => {
    jest
      .spyOn(model, 'create')
      .mockImplementation(() => Promise.resolve(mockPerson));
    const createdPerson = await service.create(mockPersonDto);
    expect(createdPerson).toEqual(mockPerson);
    expect(model.create).toHaveBeenCalledWith(mockPersonDto);
  });

  it('should get one person', async () => {
    jest.spyOn(model, 'findById').mockResolvedValueOnce(mockPerson as any);
    const person = await service.getOne('mockPersonId');
    expect(person).toEqual(mockPerson);
    expect(model.findById).toHaveBeenCalledWith('mockPersonId');
  });

  it('should get one person, returning null if not found', async () => {
    jest.spyOn(model, 'findById').mockResolvedValueOnce(null);
    const person = await service.getOne('nonExistentId');
    expect(person).toEqual(null);
    expect(model.findById).toHaveBeenCalledWith('nonExistentId');
  });

  it('should get all persons', async () => {
    jest.spyOn(model, 'find').mockReturnValueOnce({
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson] as any),
    } as any);
    const persons = await service.getAll({});
    expect(persons).toEqual([mockPerson]);
    expect(model.find).toHaveBeenCalled();
  });

  it('should get all persons with specific query parameters', async () => {
    const queryParams = { lastName: 'mockLastName' };
    jest.spyOn(model, 'find').mockReturnValueOnce({
      and: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson] as any),
    } as any);

    const persons = await service.getAll(queryParams);
    expect(persons).toEqual([mockPerson]);
    expect(model.find).toHaveBeenCalled();
  });

  it('should update a person', async () => {
    jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockPerson as any),
    } as any);
    const updatedPerson = await service.update('mockPersonId', mockPersonDto);
    expect(updatedPerson).toEqual(mockPerson);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockPersonId',
      { $set: mockPersonDto },
      { new: true },
    );
  });

  it('should update a person, returning null if not found', async () => {
    jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const updatedPerson = await service.update('nonExistentId', mockPersonDto);
    expect(updatedPerson).toEqual(null);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'nonExistentId',
      { $set: mockPersonDto },
      { new: true },
    );
  });

  it('should delete a person', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockPerson as any),
    } as any);
    const deletedPerson = await service.delete('mockPersonId');
    expect(deletedPerson).toEqual(mockPerson);
    expect(model.findByIdAndDelete).toHaveBeenCalledWith('mockPersonId');
  });

  it('should delete a person, returning null if not found', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const deletedPerson = await service.delete('nonExistentId');
    expect(deletedPerson).toEqual(null);
    expect(model.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
  });

  it('should get all persons as table', async () => {
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([mockPerson]);
    jest.spyOn(model, 'findById').mockResolvedValueOnce(new Institute());
    const workbook = await service.getAllTable({});
    expect(workbook).toBeInstanceOf(Workbook);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('should get all persons as table with specific query parameters', async () => {
    const queryParams = { lastName: 'mockLastName' };
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([mockPerson]);
    jest.spyOn(model, 'findById').mockResolvedValueOnce(new Institute());
    const workbook = await service.getAllTable(queryParams);
    expect(workbook).toBeInstanceOf(Workbook);
    expect(service.getAll).toHaveBeenCalledWith(queryParams);
  });

  it('should get person overview', async () => {
    jest.spyOn(service, 'getOne').mockResolvedValueOnce(mockPerson);
    jest.spyOn(instituteModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(new Institute()),
    } as any);
    jest.spyOn(model, 'find').mockResolvedValueOnce([]);
    const workbook = await service.getOverview('mockPersonId');
    expect(workbook).toBeInstanceOf(Workbook);
    expect(service.getOne).toHaveBeenCalledWith('mockPersonId');
  });

  it('should get person overview, returning empty workbook if person not found', async () => {
    jest.spyOn(service, 'getOne').mockResolvedValueOnce(null);
    const workbook = await service.getOverview('nonExistentId');
    expect(workbook).toBeInstanceOf(Workbook);
    expect(workbook.worksheets.length).toBe(0);
    expect(service.getOne).toHaveBeenCalledWith('nonExistentId');
  });

  it('should get all persons count', async () => {
    jest
      .spyOn(model, 'find')
      .mockResolvedValueOnce([mockPerson, mockPerson] as any);
    jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(2);
    const count = await controller.getAllCount({});
    expect(count).toBe(2);
    expect(model.find).toHaveBeenCalled();
    expect(model.countDocuments).toHaveBeenCalled();
  });

  it('should get all persons count with query parameters', async () => {
    const queryParams = { lastName: 'mockLastName' };
    jest.spyOn(model, 'find').mockReturnValueOnce({
      and: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson] as any),
    } as any);
    jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(1);
    const count = await controller.getAllCount(queryParams);
    expect(count).toBe(1);
    expect(model.find).toHaveBeenCalled();
    expect(model.countDocuments).toHaveBeenCalled();
  });

  it('should get all persons count, handling empty result', async () => {
    jest.spyOn(model, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce([] as any),
    } as any);
    const count = await controller.getAllCount({});
    expect(count).toBe(0);
    expect(model.find).toHaveBeenCalled();
  });
});
