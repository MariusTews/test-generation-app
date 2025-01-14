import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Workbook } from 'exceljs';
import { CollectionNames } from 'src/constants/collection-names';
import { ThirdPartyEvalReportService } from './evaluation-report/third-party-eval-report/third-party-eval-report.service';
import { GenderReportService } from './person-report/gender-report/gender-report.service';
import { UniversalReportData } from './universal-report-data';
import { Model } from 'mongoose';
import { Committee } from '../committee';
import { CommitteeEntry } from '../committee/committee-entry';
import { Contract } from '../contract';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Institute } from '../institute';
import { Person } from '../person';
import { Project } from '../project';
import { Relationship } from '../relationship';
import {
  newGenderEvalResult,
  GenderResult,
} from './person-report/gender-report/gender-result';

describe('GenderReportService', () => {
  let service: GenderReportService;
  let personModel: Model<Person>;
  let committeeModel: Model<Committee>;
  let committeeEntryModel: Model<CommitteeEntry>;
  let contractModel: Model<Contract>;
  let relationshipModel: Model<Relationship>;
  let contractTypeModel: Model<ContractType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenderReportService,
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            find: jest.fn(),
            select: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEES),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.CONTRACT_TYPES),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          } as any,
        },
      ],
    }).compile();

    service = module.get<GenderReportService>(GenderReportService);
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    committeeModel = module.get<Model<Committee>>(
      getModelToken(CollectionNames.COMMITTEES),
    );
    committeeEntryModel = module.get<Model<CommitteeEntry>>(
      getModelToken(CollectionNames.COMMITTEE_ENTRIES),
    );
    contractModel = module.get<Model<Contract>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    relationshipModel = module.get<Model<Relationship>>(
      getModelToken(CollectionNames.RELATIONSHIPS_V3),
    );
    contractTypeModel = module.get<Model<ContractType>>(
      getModelToken(CollectionNames.CONTRACT_TYPES),
    );
  });

  it('should getReportData with empty result', async () => {
    const mockReportData: UniversalReportData = {
      reportFileName: 'Übersicht_GeschVerh.xlsx',
      reportName: 'P_Ü_GeschVerh',
      reportHeading: 'Übersicht Geschlächterverhältnisse',
      reportTable: {
        header: { cells: [] },
        entries: [],
        hasSumRow: false,
      },
    };
    jest.spyOn(personModel, 'find').mockResolvedValue([]);
    jest
      .spyOn(committeeModel, 'find')
      .mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            {
              id: 'committeeId1',
              name: 'Vorstand',
              deleted: false,
              startRuntime: new Date(),
              endRuntime: new Date(),
            },
          ]),
      } as any);
    jest
      .spyOn(committeeEntryModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    jest
      .spyOn(relationshipModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    jest
      .spyOn(contractTypeModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    jest
      .spyOn(personModel, 'find')
      .mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      } as any);
    const result = await service.getReportData();
    expect(result).toEqual(expect.any(Object));
    expect(personModel.find).toHaveBeenCalled();
    expect(committeeModel.find).toHaveBeenCalled();
    expect(committeeEntryModel.find).toHaveBeenCalled();
    expect(contractModel.find).toHaveBeenCalled();
    expect(relationshipModel.find).toHaveBeenCalled();
    expect(contractTypeModel.find).toHaveBeenCalled();
  });

  it('should getReportData with populated result', async () => {
    const mockReportData: UniversalReportData = {
      reportFileName: 'Übersicht_GeschVerh.xlsx',
      reportName: 'P_Ü_GeschVerh',
      reportHeading: 'Übersicht Geschlächterverhältnisse',
      reportTable: {
        header: {
          cells: [
            { value: 'Bereich', rowSpan: 1 },
            { value: 'Gesamt', rowSpan: 1 },
            { value: 'männlich', rowSpan: 1 },
            { value: 'weiblich', rowSpan: 1 },
            { value: 'divers', rowSpan: 1 },
            { value: 'Quote (m|w|d)', rowSpan: 1 },
          ],
        },
        entries: [
          {
            cells: [
              { value: 'Vorstand', rowSpan: 1 },
              { value: 10, rowSpan: 1 },
              { value: 5, rowSpan: 1 },
              { value: 5, rowSpan: 1 },
              { value: 0, rowSpan: 1 },
              { value: '50 | 50 | 0', rowSpan: 1 },
            ],
          },
        ],
        hasSumRow: false,
      },
    };
    jest
      .spyOn(committeeModel, 'find')
      .mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            {
              id: 'committeeId1',
              name: 'Vorstand',
              deleted: false,
              startRuntime: new Date(),
              endRuntime: new Date(),
            },
          ]),
      } as any);
    jest
      .spyOn(committeeEntryModel, 'find')
      .mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            { personId: 'personId1', committeeId: 'committeeId1' },
          ] as any),
      } as any);
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ personId: 'personId1' }] as any),
      } as any);
    jest
      .spyOn(relationshipModel, 'find')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ personId: 'personId1' }] as any),
      } as any);
    jest
      .spyOn(personModel, 'find')
      .mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue([
            { gender: 'männlich' },
            { gender: 'weiblich' },
          ] as any),
      } as any);
    jest
      .spyOn(contractTypeModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    const result = await service.getReportData();
    expect(result).toEqual(expect.any(Object));
    expect(personModel.find).toHaveBeenCalled();
    expect(committeeModel.find).toHaveBeenCalled();
    expect(committeeEntryModel.find).toHaveBeenCalled();
    expect(contractModel.find).toHaveBeenCalled();
    expect(relationshipModel.find).toHaveBeenCalled();
  });

  it('should getReportAsExcel', async () => {
    const mockWorkbook = new Workbook();
    const mockReportData: UniversalReportData = {
      reportFileName: 'Übersicht_GeschVerh.xlsx',
      reportName: 'P_Ü_GeschVerh',
      reportHeading: 'Übersicht Geschlächterverhältnisse',
      reportTable: {
        header: {
          cells: [
            { value: 'Bereich', rowSpan: 1 },
            { value: 'Gesamt', rowSpan: 1 },
            { value: 'männlich', rowSpan: 1 },
            { value: 'weiblich', rowSpan: 1 },
            { value: 'divers', rowSpan: 1 },
            { value: 'Quote (m|w|d)', rowSpan: 1 },
          ],
        },
        entries: [],
        hasSumRow: false,
      },
    };
    jest.spyOn(personModel, 'find').mockResolvedValue([]);
    jest
      .spyOn(service, 'getReportData')
      .mockResolvedValue(mockReportData as any);
    const result = await service.getReportAsExcel();
    expect(result).toEqual(expect.any(Workbook));
  });
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
            find: jest.fn(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          } as any,
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest.fn(),
            exec: jest.fn(),
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

  it('should getReportData with empty params', async () => {
    const mockReportData: UniversalReportData = {
      reportFileName: 'Drittmittelprojekte.xlsx',
      reportName: 'E_Drittmittel',
      reportHeading: 'Drittmittelprojekte',
      reportTable: {
        header: { cells: [] },
        entries: [],
        hasSumRow: false,
      },
    };
    const mockParams = {};
    jest
      .spyOn(projectModel, 'find')
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      } as any);
    const result = await service.getReportData(mockParams);
    expect(result).toEqual(mockReportData);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('should getReportData with populated result', async () => {
    const mockReportData: UniversalReportData = {
      reportFileName: 'Drittmittelprojekte.xlsx',
      reportName: 'E_Drittmittel',
      reportHeading: 'Drittmittelprojekte',
      reportTable: {
        header: {
          cells: [
            { value: 'Projektname', rowSpan: 1 },
            { value: 'Akronym', rowSpan: 1 },
            { value: 'Fördergeber', rowSpan: 1 },
            { value: 'Laufzeit [nur Jahre]', rowSpan: 1 },
            { value: 'Fördersumme', rowSpan: 1 },
          ],
        },
        entries: [
          {
            cells: [
              { value: 'Projekt A', rowSpan: 1 },
              { value: 'PA', rowSpan: 1 },
              { value: 'Förderer X', rowSpan: 1 },
              { value: '2023 - 2024', rowSpan: 1 },
              { value: 100000, rowSpan: 1 },
            ],
          },
        ],
        hasSumRow: false,
      },
    };
    const mockParams = { begin: '2023-01-01', end: '2023-12-31' };
    const mockProject = {
      title: 'Projekt A',
      subtitle: '',
      titleEnglish: '',
      subtitleEnglish: '',
      acronym: 'PA',
      fundingIndicator: '',
      sketchApplication: null,
      proposalApplication: null,
      demandApplication: null,
      authorizationDate: null,
      neutralExtensionApplication: null,
      sketchExists: false,
      demandExists: false,
      neutralExtensionExists: false,
      mandate: 0,
      incherURL: '',
      fundingLine: '',
      baseComment: '',
      typeId: '',
      formatId: '',
      sponsorId: 'sponsorId1',
      promoterId: '',
      projectManagerId: '',
      clerkId: '',
      researchFocusId: '',
      responsibleId: [],
      solicitedFromId: [],
      leaderId: [],
      partnerId: [],
      projectLeaderId: '',
      additionalPersons: [],
      participantComment: '',
      plannedStart: null,
      plannedEnd: null,
      plannedRuntimeMonth: 0,
      plannedPersonMonth: 0,
      actualStart: new Date('2023-01-01'),
      actualRuntimeMonth: 0,
      actualPersonMonth: 0,
      missingRuntimeMonth: 0,
      missingPersonMonth: 0,
      neutralExtension: false,
      extensionStart: null,
      extensionEnd: null,
      extensionRuntimeMonth: 0,
      extensionPersonMonth: 0,
      plannedFte: 0,
      actualFte: 0,
      missingFte: 0,
      extensionFte: 0,
      runtimeComment: '',
      runtimeImageId: '',
      calculatedProjectEnd: new Date('2023-12-31'),
      financialPlansBMBF: [],
      financialPlansDFG: [],
      financialPlansConRes: [],
      financialPlansOther: [],
      flatRates: [],
      personalCosts: 0,
      materialCosts: 0,
      projectCosts: 0,
      flatRateSum: 0,
      financialPlanSum: 100000,
      flatRateINCHER: 0,
      flatRateManagement: 0,
      receiptsBMBF: [],
      receiptsDFG: [],
      receiptsConRes: [],
      receiptsOther: [],
      shortDescriptionINCHER: '',
      shortDescriptionThFu: '',
      tags: '',
      longDescription: '',
      longDescriptionEnglish: '',
      website: '',
      websiteEnglish: '',
      publications: [],
      status: 'in Bearbeitung',
      applicationStatus: 'in Bearbeitung',
      authorization: 'genehmigt',
      promotionalClassification: 'nicht förderfähig',
    };
    const mockInstitute = { name: 'Förderer X' };
    jest
      .spyOn(projectModel, 'find')
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockProject] as any),
      } as any);
    jest
      .spyOn(instituteModel, 'findById')
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInstitute as any),
      } as any);
    const result = await service.getReportData(mockParams);
    expect(result).toEqual(expect.any(Object));
    expect(projectModel.find).toHaveBeenCalled();
    expect(instituteModel.findById).toHaveBeenCalled();
  });

  it('should getReportAsExcel', async () => {
    const mockWorkbook = new Workbook();
    const mockReportData: UniversalReportData = {
      reportFileName: 'Drittmittelprojekte.xlsx',
      reportName: 'E_Drittmittel',
      reportHeading: 'Drittmittelprojekte',
      reportTable: {
        header: {
          cells: [
            { value: 'Projektname', rowSpan: 1 },
            { value: 'Akronym', rowSpan: 1 },
            { value: 'Fördergeber', rowSpan: 1 },
            { value: 'Laufzeit [nur Jahre]', rowSpan: 1 },
            { value: 'Fördersumme', rowSpan: 1 },
          ],
        },
        entries: [],
        hasSumRow: false,
      },
    };
    const mockParams = { begin: '2023-01-01', end: '2023-12-31' };
    jest.spyOn(projectModel, 'find').mockResolvedValue([]);
    jest
      .spyOn(service, 'getReportData')
      .mockResolvedValue(mockReportData as any);
    const result = await service.getReportAsExcel(mockParams);
    expect(result).toEqual(expect.any(Workbook));
  });
});
