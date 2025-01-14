import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Workbook, Worksheet } from 'exceljs';
import { Model } from 'mongoose';
import { CollectionNames } from 'src/constants/collection-names';
import { Committee } from '../committee';
import { CommitteeEntry } from '../committee/committee-entry';
import { Contract } from '../contract';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Institute } from '../institute';
import { Person } from '../person';
import { Project } from '../project';
import { Relationship } from '../relationship';
import { ThirdPartyEvalReportService } from './evaluation-report/third-party-eval-report/third-party-eval-report.service';
import {
  ThirdPartyEvalResult,
  newThirdPartyEvalResult,
} from './evaluation-report/third-party-eval-report/third-party-eval-result';
import { GenderReportService } from './person-report/gender-report/gender-report.service';
import {
  GenderResult,
  newGenderEvalResult,
} from './person-report/gender-report/gender-result';
import {
  UniversalReportData,
  ReportCell,
  newCell,
} from './universal-report-data';
import { ContractTypes } from '../contract/contract-type/contract-types';
import { RelationshipTypes } from '../relationship/relationship-types';

describe('GenderReportService', () => {
  let service: GenderReportService;
  let personModel: Model<Person>;
  let contractModel: Model<Contract>;
  let committeeEntryModel: Model<CommitteeEntry>;
  let committeeModel: Model<Committee>;
  let contractTypeModel: Model<ContractType>;
  let relationshipModel: Model<Relationship>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenderReportService,
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            find: jest
              .fn()
              .mockReturnValue({
                exec: jest.fn(),
                select: jest.fn().mockReturnThis(),
              } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEES),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACT_TYPES),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
      ],
    }).compile();

    service = module.get<GenderReportService>(GenderReportService);
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    contractModel = module.get<Model<Contract>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    committeeEntryModel = module.get<Model<CommitteeEntry>>(
      getModelToken(CollectionNames.COMMITTEE_ENTRIES),
    );
    committeeModel = module.get<Model<Committee>>(
      getModelToken(CollectionNames.COMMITTEES),
    );
    contractTypeModel = module.get<Model<ContractType>>(
      getModelToken(CollectionNames.CONTRACT_TYPES),
    );
    relationshipModel = module.get<Model<Relationship>>(
      getModelToken(CollectionNames.RELATIONSHIPS_V3),
    );
  });

  it('getReportData should return UniversalReportData', async () => {
    const mockCommittee = [
      {
        id: '1',
        name: 'Vorstand',
        deleted: false,
        startRuntime: new Date(),
        endRuntime: new Date(),
      } as Committee,
    ];
    const mockCommitteeEntries = [
      {
        committeeId: '1',
        personId: '1',
        start: new Date(),
        end: new Date(),
        comment: '',
      },
    ] as CommitteeEntry[];
    const mockContracts = [] as Contract[];
    const mockRelationships = [] as Relationship[];
    const mockPersons = [] as Person[];

    jest
      .spyOn(committeeModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommittee),
      } as any);
    jest
      .spyOn(committeeEntryModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommitteeEntries),
      } as any);
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any)
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any)
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any)
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any)
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any);
    jest
      .spyOn(relationshipModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRelationships),
      } as any);
    jest
      .spyOn(personModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPersons),
        select: jest.fn().mockReturnThis(),
      } as any);

    const result = await service.getReportData();
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('reportFileName');
    expect(result).toHaveProperty('reportName');
    expect(result).toHaveProperty('reportHeading');
    expect(result).toHaveProperty('reportTable');
  });

  it('getReportAsExcel should return a Workbook', async () => {
    const mockReportData = {
      reportFileName: 'test.xlsx',
      reportName: 'test',
      reportHeading: 'test',
      reportTable: {
        header: { cells: [newCell('test')] },
        entries: [{ cells: [newCell('test')] }],
        hasSumRow: false,
      },
    } as UniversalReportData;
    jest
      .spyOn(service, 'getReportData')
      .mockReturnValueOnce(Promise.resolve(mockReportData));
    const result = await service.getReportAsExcel();
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Workbook);
  });

  it('getReportData should handle empty report', async () => {
    const mockCommittee = [
      {
        id: '1',
        name: 'Vorstand',
        deleted: false,
        startRuntime: new Date(),
        endRuntime: new Date(),
      } as Committee,
    ];
    const mockCommitteeEntries = [] as CommitteeEntry[];
    jest
      .spyOn(committeeModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommittee),
      } as any);
    jest
      .spyOn(committeeEntryModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommitteeEntries),
      } as any);
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue([] as Contract[]),
      } as any);
    jest
      .spyOn(relationshipModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue([] as Relationship[]),
      } as any);
    jest
      .spyOn(personModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue([] as Person[]),
      } as any);
    const result = await service.getReportData();
    expect(result).toBeDefined();
    expect(result.reportTable.entries).toEqual([]);
  });

  // it('getReport should return a GenderResult with entries', async () => {
  //   const mockCommittees = [{ id: '1', name: 'Vorstand' }, {id: '2', name: 'Direktorium'}, {id: '3', name: 'Beirat'}] as Committee[];
  //   jest.spyOn(committeeModel, 'find').mockValueOnce({exec: jest.fn().mockResolvedValueOnce(mockCommittees)} as any);
  //   jest.spyOn(committeeEntryModel, 'find').mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  //   jest.spyOn(contractModel, 'find').mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  //   jest.spyOn(relationshipModel, 'find').mockResolvedValueOnce([]);
  //   jest.spyOn(personModel, 'find').mockResolvedValueOnce([]);
  //   const result = await service.getReport();
  //   expect(result).toBeDefined();
  //   expect(result.entries).toBeDefined();
  //   expect(result.entries.length).toBeGreaterThanOrEqual(0);
  //   expect(result).toBeInstanceOf(Object);
  // });
});

describe('ThirdPartyEvalReportService', () => {
  let service: ThirdPartyEvalReportService;
  let projectModel: Model<Project>;
  let instituteModel: Model<Institute>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThirdPartyEvalReportService,
        {
          provide: getModelToken(CollectionNames.PROJECTS),
          useValue: {
            find: jest
              .fn()
              .mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                exec: jest.fn(),
              } as any),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() } as any),
          } as any,
        },
      ],
    }).compile();

    service = module.get<ThirdPartyEvalReportService>(
      ThirdPartyEvalReportService,
    );
    projectModel = module.get<Model<Project>>(
      getModelToken(CollectionNames.PROJECTS),
    );
    instituteModel = module.get<Model<Institute>>(
      getModelToken(CollectionNames.INSTITUTES_V3),
    );
  });

  it('getReportData should return UniversalReportData', async () => {
    const params = { begin: '2023-01-01', end: '2023-12-31' };
    const mockProjects = [] as Project[];
    const mockInstitutes = [{ name: 'test' }] as Institute[];
    jest
      .spyOn(projectModel, 'find')
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProjects),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProjects),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProjects),
      } as any);
    jest
      .spyOn(instituteModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockInstitutes[0]),
      } as any);

    const result = await service.getReportData(params);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('reportFileName');
    expect(result).toHaveProperty('reportName');
    expect(result).toHaveProperty('reportHeading');
    expect(result).toHaveProperty('reportTable');
  });

  it('getReportAsExcel should return a Workbook', async () => {
    const mockReportData = {
      reportFileName: 'test.xlsx',
      reportName: 'test',
      reportHeading: 'test',
      reportTable: {
        header: { cells: [newCell('test')] },
        entries: [{ cells: [newCell('test')] }],
        hasSumRow: false,
      },
    } as UniversalReportData;
    const params = { begin: '2023-01-01', end: '2023-12-31' };
    jest
      .spyOn(service, 'getReportData')
      .mockReturnValueOnce(Promise.resolve(mockReportData));
    const result = await service.getReportAsExcel(params);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Workbook);
  });

  it('getReportData should handle empty parameters', async () => {
    const params = {};
    jest
      .spyOn(projectModel, 'find')
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const result = await service.getReportData(params);
    expect(result).toBeDefined();
    expect(result.reportTable.entries).toEqual([]);
  });

  it('getReportData should return a ThirdPartyEvalResult with entries', async () => {
    const mockProjects = [
      {
        title: 'Project 1',
        acronym: 'P1',
        sponsorId: '1',
        financialPlanSum: 10000,
        actualStart: new Date('2023-01-01'),
        calculatedProjectEnd: new Date('2023-12-31'),
      },
    ] as Project[];
    const params = { begin: '2023-01-01', end: '2023-12-31' };
    jest
      .spyOn(projectModel, 'find')
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProjects),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any)
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
    const mockInstitute = { name: 'Sponsor 1' } as Institute;
    jest
      .spyOn(instituteModel, 'findById')
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockInstitute),
      } as any);
    const result = await service.getReportData(params);
    expect(result).toBeDefined();
    expect(result.reportTable.entries).toBeDefined();
    expect(result.reportTable.entries.length).toBeGreaterThan(0);
    expect(result.reportTable.entries[0].cells[0].value).toBe(
      'vorher eingeworben, im Berichtszeitraum abgeschlossen',
    );
    expect(result.reportTable.entries[1].cells[0].value).toBe('Project 1');
    expect(result).toBeInstanceOf(Object);
  });
});
