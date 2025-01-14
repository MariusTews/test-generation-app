import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CollectionNames } from 'src/constants/collection-names';
import { Committee } from '../committee';
import { CommitteeEntry } from '../committee/committee-entry';
import { Contract } from '../contract';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Person } from '../person';
import { Relationship } from '../relationship';
import { GenderReportService } from './person-report/gender-report/gender-report.service';
import { UniversalReportData } from './universal-report-data';
import { GenderResult } from './person-report/gender-report/gender-result';
import { Workbook, Worksheet } from 'exceljs';
import { ReportCell } from './universal-report-data';
import { ThirdPartyEvalReportService } from './evaluation-report/third-party-eval-report/third-party-eval-report.service';
import { Project } from '../project';
import { Institute } from '../institute';

describe('GenderReportService', () => {
  let service: GenderReportService;
  let personModel: Model<Person>;
  let contractModel: Model<Contract>;
  let committeeEntryModel: Model<CommitteeEntry>;
  let committeeModel: Model<Committee>;
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
          },
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(CollectionNames.COMMITTEES),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
            } as any),
          },
        },
        {
          provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
            } as any),
          },
        },
        {
          provide: getModelToken(CollectionNames.CONTRACT_TYPES),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
              where: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
            } as any),
          },
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
    relationshipModel = module.get<Model<Relationship>>(
      getModelToken(CollectionNames.RELATIONSHIPS_V3),
    );
    contractTypeModel = module.get<Model<ContractType>>(
      getModelToken(CollectionNames.CONTRACT_TYPES),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get report data', async () => {
    // Mock database interactions
    const mockCommittee = { name: 'Vorstand', id: 'committeeId1' };
    const mockCommitteeEntries = [
      { personId: 'personId1', committeeId: 'committeeId1' },
    ];
    const mockPersons = [{ _id: 'personId1', gender: 'männlich' }];
    const mockExecutiveCommittee = [mockCommittee];
    const mockDirectorateCommittee = [mockCommittee];
    const mockAdviserCommittee = [mockCommittee];
    const mockUnlimitedContracts: any = [];
    const mockBusinessOfficePeople: any = [];
    const mockEmployees: any = [];
    const mockSciAssCo: any = [];
    const mockSciAssThFu: any = [];
    const mockContractType: any = [];
    const mockPersonsForProfs = [{ _id: 'personId1', title: 'Prof. Dr.' }];
    const mockPersonsForEntries: any[] = [
      { _id: 'personId1', gender: 'männlich' },
    ];
    const today = new Date();

    jest.spyOn(committeeModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockExecutiveCommittee)
        .mockResolvedValueOnce(mockDirectorateCommittee)
        .mockResolvedValueOnce(mockAdviserCommittee),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(committeeEntryModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockCommitteeEntries)
        .mockResolvedValueOnce(mockCommitteeEntries)
        .mockResolvedValueOnce(mockCommitteeEntries),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(personModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockPersons)
        .mockResolvedValueOnce(mockPersonsForProfs)
        .mockResolvedValueOnce(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockUnlimitedContracts)
        .mockResolvedValueOnce(mockEmployees)
        .mockResolvedValueOnce(mockSciAssCo)
        .mockResolvedValueOnce(mockSciAssThFu),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(relationshipModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockBusinessOfficePeople),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(contractTypeModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContractType),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);

    const reportData: UniversalReportData = await service.getReportData();

    // Assertions
    expect(reportData).toBeDefined();
    expect(reportData.reportName).toBeDefined();
    expect(reportData.reportTable).toBeDefined();
    expect(reportData.reportTable.entries.length).toBeGreaterThanOrEqual(0);
    // Add more specific assertions based on expected report data structure
    expect(committeeModel.find).toHaveBeenCalledWith({
      name: service['executiveString'],
    });
    expect(committeeEntryModel.find).toHaveBeenCalledWith({
      committeeId: expect.any(String),
      start: { $lte: expect.any(Date) },
      end: { $gte: expect.any(Date) },
    });
    expect(personModel.find).toHaveBeenCalledWith({
      _id: { $in: ['personId1'] },
      current: true,
    });
  });

  it('should get report as excel', async () => {
    const mockReportData = {
      reportFileName: 'test.xlsx',
      reportName: 'test',
      reportHeading: 'test',
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
              { value: 1, rowSpan: 1 },
              { value: 1, rowSpan: 1 },
              { value: 0, rowSpan: 1 },
              { value: 0, rowSpan: 1 },
              { value: '100 | 0 | 0', rowSpan: 1 },
            ],
          },
        ],
        hasSumRow: false,
      },
    };
    const mockWorkbook = new Workbook();
    jest.spyOn(service, 'getReportData').mockResolvedValue(mockReportData);
    const worksheet = mockWorkbook.addWorksheet('test');
    worksheet.addRow([
      undefined,
      'test',
      'test',
      'test',
      'test',
      'test',
      'test',
    ]);
    worksheet.addRow([
      'Bereich',
      'Gesamt',
      'männlich',
      'weiblich',
      'divers',
      'Quote (m|w|d)',
    ]);
    worksheet.addRow(['Vorstand', 1, 1, 0, 0, '100 | 0 | 0']);

    const workbook: Workbook = await service.getReportAsExcel();

    expect(workbook).toBeDefined();
    expect(workbook.worksheets.length).toBe(1);
    expect(service.getReportData).toHaveBeenCalled();
    expect(workbook.worksheets[0].getRow(1).values).toEqual([
      undefined,
      'test',
      'test',
      'test',
      'test',
      'test',
      'test',
    ]);
    expect(workbook.worksheets[0].getRow(2).values).toEqual([
      undefined,
      'Bereich',
      'Gesamt',
      'männlich',
      'weiblich',
      'divers',
      'Quote (m|w|d)',
    ]);
    expect(workbook.worksheets[0].getRow(3).values).toEqual([
      undefined,
      'Vorstand',
      1,
      1,
      undefined,
      undefined,
      '100 | 0 | 0',
    ]);
  });

  it('should get report data with more data', async () => {
    // Mock database interactions
    const mockCommittee = { name: 'Vorstand', id: 'committeeId1' };
    const mockCommitteeEntries = [
      { personId: 'personId1', committeeId: 'committeeId1' },
      { personId: 'personId2', committeeId: 'committeeId1' },
    ];
    const mockPersons = [
      { _id: 'personId1', gender: 'männlich' },
      { _id: 'personId2', gender: 'weiblich' },
    ];
    const mockExecutiveCommittee = [mockCommittee];
    const mockDirectorateCommittee = [mockCommittee];
    const mockAdviserCommittee = [mockCommittee];
    const mockUnlimitedContracts: any = [
      { personId: 'personId3' },
      { personId: 'personId4' },
    ];
    const mockBusinessOfficePeople: any = [{ personId: 'personId5' }];
    const mockEmployees: any = [
      { personId: 'personId6' },
      { personId: 'personId7' },
    ];
    const mockSciAssCo: any = [{ personId: 'personId8' }];
    const mockSciAssThFu: any = [{ personId: 'personId9' }];
    const mockContractType: any = [];
    const mockPersonsForProfs = [
      { _id: 'personId1', title: 'Prof. Dr.' },
      { _id: 'personId2', title: 'Dr.' },
    ];
    const mockPersonsForEntries: any[] = [
      { _id: 'personId1', gender: 'männlich' },
      { _id: 'personId2', gender: 'weiblich' },
      { _id: 'personId3', gender: 'männlich' },
      { _id: 'personId4', gender: 'weiblich' },
      { _id: 'personId5', gender: 'divers' },
      { _id: 'personId6', gender: 'männlich' },
      { _id: 'personId7', gender: 'weiblich' },
      { _id: 'personId8', gender: 'männlich' },
      { _id: 'personId9', gender: 'weiblich' },
    ];
    const today = new Date();

    jest.spyOn(committeeModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockExecutiveCommittee)
        .mockResolvedValueOnce(mockDirectorateCommittee)
        .mockResolvedValueOnce(mockAdviserCommittee),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(committeeEntryModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockCommitteeEntries)
        .mockResolvedValueOnce(mockCommitteeEntries)
        .mockResolvedValueOnce(mockCommitteeEntries),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(personModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockPersons)
        .mockResolvedValueOnce(mockPersonsForProfs)
        .mockResolvedValueOnce(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries)
        .mockResolvedValue(mockPersonsForEntries),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce(mockUnlimitedContracts)
        .mockResolvedValueOnce(mockEmployees)
        .mockResolvedValueOnce(mockSciAssCo)
        .mockResolvedValueOnce(mockSciAssThFu),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(relationshipModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockBusinessOfficePeople),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(contractTypeModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockContractType),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);

    const reportData: UniversalReportData = await service.getReportData();

    expect(reportData).toBeDefined();
    expect(reportData.reportTable.entries.length).toBeGreaterThan(1);
  });

  describe('ThirdPartyEvalReportService', () => {
    let thirdPartyEvalReportService: ThirdPartyEvalReportService;
    let projectModel: Model<Project>;
    let instituteModel: Model<Institute>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ThirdPartyEvalReportService,
          {
            provide: getModelToken(CollectionNames.PROJECTS),
            useValue: {
              find: jest.fn().mockReturnValue({
                exec: jest.fn(),
                where: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
              } as any),
            },
          },
          {
            provide: getModelToken(CollectionNames.INSTITUTES_V3),
            useValue: {
              findById: jest.fn().mockReturnValue({
                exec: jest.fn(),
              } as any),
            },
          },
        ],
      }).compile();

      thirdPartyEvalReportService = module.get<ThirdPartyEvalReportService>(
        ThirdPartyEvalReportService,
      );
      projectModel = module.get<Model<Project>>(
        getModelToken(CollectionNames.PROJECTS),
      );
      instituteModel = module.get<Model<Institute>>(
        getModelToken(CollectionNames.INSTITUTES_V3),
      );
    });

    it('should be defined', () => {
      expect(thirdPartyEvalReportService).toBeDefined();
    });

    it('should get report data', async () => {
      const mockProjects: any[] = [
        {
          title: 'Project 1',
          acronym: 'P1',
          sponsorId: 'inst1',
          financialPlanSum: 100000,
          actualStart: new Date('2023-01-01'),
          calculatedProjectEnd: new Date('2024-01-01'),
        },
        {
          title: 'Project 2',
          acronym: 'P2',
          sponsorId: 'inst2',
          financialPlanSum: 200000,
          actualStart: new Date('2023-01-01'),
          calculatedProjectEnd: new Date('2024-01-01'),
        },
      ];
      const mockInstitutes: any[] = [
        { id: 'inst1', name: 'Institute 1' },
        { id: 'inst2', name: 'Institute 2' },
      ];
      const params = { begin: '2023-01-01', end: '2024-01-01' };

      jest.spyOn(projectModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(mockProjects)
          .mockResolvedValueOnce(mockProjects)
          .mockResolvedValueOnce(mockProjects),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any);
      jest.spyOn(instituteModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(mockInstitutes[0])
          .mockResolvedValueOnce(mockInstitutes[1]),
      } as any);

      const reportData: UniversalReportData =
        await thirdPartyEvalReportService.getReportData(params);

      expect(reportData).toBeDefined();
      expect(reportData.reportName).toBeDefined();
      expect(reportData.reportTable).toBeDefined();
      expect(reportData.reportTable.entries.length).toBeGreaterThanOrEqual(0);
      expect(projectModel.find).toHaveBeenCalled();
      expect(instituteModel.findById).toHaveBeenCalledTimes(6);
    });

    it('should get report as excel', async () => {
      const mockReportData = {
        reportFileName: 'test.xlsx',
        reportName: 'test',
        reportHeading: 'test',
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
                { value: 'Vorstand', rowSpan: 1 },
                { value: 1, rowSpan: 1 },
                { value: 1, rowSpan: 1 },
                { value: '2023-2024', rowSpan: 1 },
                { value: 100000, rowSpan: 1 },
              ],
            },
          ],
          hasSumRow: false,
        },
      };
      const mockWorkbook = new Workbook();
      jest
        .spyOn(thirdPartyEvalReportService, 'getReportData')
        .mockResolvedValue(mockReportData);
      const worksheet = mockWorkbook.addWorksheet('test');
      worksheet.addRow([undefined, 'test', 'test', 'test', 'test', 'test']);
      worksheet.addRow([
        'Projektname',
        'Akronym',
        'Fördergeber',
        'Laufzeit [nur Jahre]',
        'Fördersumme',
      ]);
      worksheet.addRow(['Vorstand', 1, 1, '2023-2024', 100000]);

      const workbook: Workbook =
        await thirdPartyEvalReportService.getReportAsExcel({
          begin: '2023-01-01',
          end: '2024-01-01',
        });

      expect(workbook).toBeDefined();
      expect(workbook.worksheets.length).toBe(1);
      expect(thirdPartyEvalReportService.getReportData).toHaveBeenCalled();
      expect(workbook.worksheets[0].getRow(1).values).toEqual([
        undefined,
        'test',
        'test',
        'test',
        'test',
        'test',
      ]);
      expect(workbook.worksheets[0].getRow(2).values).toEqual([
        undefined,
        'Projektname',
        'Akronym',
        'Fördergeber',
        'Laufzeit [nur Jahre]',
        'Fördersumme',
      ]);
      expect(workbook.worksheets[0].getRow(3).values).toEqual([
        undefined,
        'Vorstand',
        1,
        1,
        '2023-2024',
        100000,
      ]);
    });

    it('should get report data with more data', async () => {
      const mockProjects: any[] = [
        {
          title: 'Project 1',
          acronym: 'P1',
          sponsorId: 'inst1',
          financialPlanSum: 100000,
          actualStart: new Date('2023-01-01'),
          calculatedProjectEnd: new Date('2024-01-01'),
        },
        {
          title: 'Project 2',
          acronym: 'P2',
          sponsorId: 'inst2',
          financialPlanSum: 200000,
          actualStart: new Date('2023-01-01'),
          calculatedProjectEnd: new Date('2024-01-01'),
        },
      ];
      const mockInstitutes: any[] = [
        { id: 'inst1', name: 'Institute 1' },
        { id: 'inst2', name: 'Institute 2' },
      ];
      const params = { begin: '2023-01-01', end: '2024-01-01' };

      jest.spyOn(projectModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(mockProjects)
          .mockResolvedValueOnce(mockProjects)
          .mockResolvedValueOnce(mockProjects),
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any);
      jest.spyOn(instituteModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(mockInstitutes[0])
          .mockResolvedValueOnce(mockInstitutes[1]),
      } as any);

      const reportData: UniversalReportData =
        await thirdPartyEvalReportService.getReportData(params);

      expect(reportData).toBeDefined();
      expect(reportData.reportTable.entries.length).toBeGreaterThan(1);
      expect(projectModel.find).toHaveBeenCalled();
      expect(instituteModel.findById).toHaveBeenCalledTimes(6);
    });
  });
});
