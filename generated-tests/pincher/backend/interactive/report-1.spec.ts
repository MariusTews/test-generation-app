import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Committee } from '../committee';
import { CommitteeEntry } from '../committee/committee-entry';
import { Contract } from '../contract';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Relationship } from '../relationship';
import { GenderReportService } from './person-report/gender-report/gender-report.service';
import { UniversalReportData } from './universal-report-data';
import { CollectionNames } from 'src/constants/collection-names';
import { Workbook } from 'exceljs';
import { ThirdPartyEvalReportService } from './evaluation-report/third-party-eval-report/third-party-eval-report.service';
import { Institute } from '../institute';
import {
  GenderResult,
  GenderEvalEntry,
} from './person-report/gender-report/gender-result';
import {
  ThirdPartyEvalResult,
  ThirdPartyEvalEntry,
} from './evaluation-report/third-party-eval-report/third-party-eval-result';
import { Person } from '../person';
import { Qualification } from '../person/model/qualification';
import {
  ProjectStatus,
  ApplicationStatus,
  Authorization,
  PromotionalClassification,
} from '../project/model/enums';
import { Project } from '../project';

describe('Report Services', () => {
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
              find: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({ exec: jest.fn() }),
              }),
            },
          },
          {
            provide: getModelToken(CollectionNames.CONTRACTS_V3),
            useValue: {
              find: jest.fn().mockReturnValue({ exec: jest.fn() }),
            },
          },
          {
            provide: getModelToken(CollectionNames.COMMITTEE_ENTRIES),
            useValue: {
              find: jest.fn().mockReturnValue({ exec: jest.fn() }),
            },
          },
          {
            provide: getModelToken(CollectionNames.COMMITTEES),
            useValue: {
              find: jest.fn().mockReturnValue({ exec: jest.fn() }),
            },
          },
          {
            provide: getModelToken(CollectionNames.RELATIONSHIPS_V3),
            useValue: {
              find: jest.fn().mockReturnValue({ exec: jest.fn() }),
            },
          },
          {
            provide: getModelToken(CollectionNames.CONTRACT_TYPES),
            useValue: {
              find: jest.fn().mockReturnValue({ exec: jest.fn() }),
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
      // Mock committeeModel.find
      const mockExecutiveCommittee = [
        { id: 'executiveCommitteeId', name: 'Vorstand' },
      ];
      const mockFindCommittee = jest
        .spyOn(committeeModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockExecutiveCommittee),
        } as any);

      // Mock other model.find methods
      const mockFindCommitteeEntry = jest
        .spyOn(committeeEntryModel, 'find')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
      const mockFindContract = jest
        .spyOn(contractModel, 'find')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
      const mockFindRelationship = jest
        .spyOn(relationshipModel, 'find')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
      const mockFindPerson = jest.spyOn(personModel, 'find').mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      } as any);
      const mockFindContractType = jest
        .spyOn(contractTypeModel, 'find')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);

      const result: UniversalReportData = await service.getReportData();

      expect(result).toBeDefined();
      expect(mockFindCommittee).toHaveBeenCalledWith({ name: 'Vorstand' });
      expect(mockFindCommitteeEntry).toHaveBeenCalled();
      expect(mockFindContract).toHaveBeenCalled();
      expect(mockFindRelationship).toHaveBeenCalled();
      expect(mockFindPerson).toHaveBeenCalled();
      expect(mockFindContractType).toHaveBeenCalled();
      // Add more assertions as needed
      expect(result.reportTable.entries.length).toBeGreaterThanOrEqual(0);
    });

    it('should get report as excel', async () => {
      const mockReportData: UniversalReportData = {
        reportFileName: 'test.xlsx',
        reportName: 'test',
        reportHeading: 'test',
        reportTable: {
          header: { cells: [{ value: 'test', rowSpan: 1 }] },
          entries: [{ cells: [{ value: 'test', rowSpan: 1 }] }],
          hasSumRow: false,
        },
      };
      jest.spyOn(service, 'getReportData').mockResolvedValue(mockReportData);
      const result: Workbook = await service.getReportAsExcel();
      expect(result).toBeDefined();
      expect(service.getReportData).toHaveBeenCalled();
    });

    it('should get report as excel with populated data', async () => {
      const mockGenderEvalEntry: GenderEvalEntry = {
        category: 'testCategory',
        total: 10,
        femaleCount: 5,
        maleCount: 5,
        otherCount: 0,
        rate: '50 | 50 | 0',
      };
      const mockReportData: UniversalReportData = {
        reportFileName: 'test.xlsx',
        reportName: 'GenderReport',
        reportHeading: 'Gender Report',
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
                { value: mockGenderEvalEntry.category, rowSpan: 1 },
                { value: mockGenderEvalEntry.total, rowSpan: 1 },
                { value: mockGenderEvalEntry.maleCount, rowSpan: 1 },
                { value: mockGenderEvalEntry.femaleCount, rowSpan: 1 },
                { value: mockGenderEvalEntry.otherCount, rowSpan: 1 },
                { value: mockGenderEvalEntry.rate, rowSpan: 1 },
              ],
            },
          ],
          hasSumRow: false,
        },
      };
      jest.spyOn(service, 'getReportData').mockResolvedValue(mockReportData);
      const result: Workbook = await service.getReportAsExcel();
      expect(result).toBeDefined();
      expect(service.getReportData).toHaveBeenCalled();
    });

    it('should get report data with data', async () => {
      const mockExecutiveCommittee = [
        { id: 'executiveCommitteeId', name: 'Vorstand' },
      ];
      const mockFindCommittee = jest
        .spyOn(committeeModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockExecutiveCommittee),
        } as any);
      const mockCommitteeEntry: CommitteeEntry[] = [
        {
          id: '1',
          personId: '1',
          committeeId: 'executiveCommitteeId',
          start: new Date(),
          end: new Date(),
          comment: 'test',
        },
      ];
      const mockFindCommitteeEntry = jest
        .spyOn(committeeEntryModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCommitteeEntry),
        } as any);
      const mockContract: Contract[] = [
        {
          id: '1',
          projectId: '1',
          personId: '1',
          limited: false,
          start: new Date(),
          end: new Date(),
          vte: 1,
          description: 'test',
          comment: 'test',
          calculatedEnd: new Date(),
          calculatedVte: 1,
          supervisorIds: ['1'],
          fundingType: 'test',
          applicationDate: new Date(),
          type: 'Ats',
          salaryScale: 'test',
          costCenter: 'test',
          primaryTypeId: '1',
          secondaryTypeId: '1',
          researchFocusId: '1',
        },
      ];
      const mockFindContract = jest
        .spyOn(contractModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockContract),
        } as any);
      const mockRelationship: Relationship[] = [
        {
          id: '1',
          personId: '1',
          type: 'BusinessOffice',
          comment: 'test',
          website: 'test',
          contractorTypeId: '1',
          roleTypeId: '1',
          eventType: 'test',
          semester: 'test',
          topic: 'test',
          current: true,
        },
      ];
      const mockFindRelationship = jest
        .spyOn(relationshipModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRelationship),
        } as any);
      const mockPerson: Person[] = [
        {
          id: '1',
          firstName: 'Test',
          lastName: 'Person',
          bornLastName: 'Test',
          title: 'Test',
          gender: 'männlich',
          member: true,
          extern: false,
          current: true,
          currentActivities: [],
          former: false,
          roomNumber: '1',
          emailWork: 'test@test.de',
          phoneWork: '123456789',
          certificate: false,
          rank: 'Test',
          instituteId: '1',
          subInstituteId: '1',
          subInstitute: 'Test',
          company: 'Test',
          street: 'Test',
          streetNo: '1',
          additional: 'Test',
          plz: '12345',
          town: 'Test',
          country: 'Test',
          candidature: false,
          firstApplication: 'Test',
          sciTimeVGs: [],
          retirement: new Date(),
          timeUsedUp: false,
          teamIds: ['1'],
          workdays: [],
          qualification: [],
          thesis: new Qualification(),
          habilitation: new Qualification(),
          professorship: new Qualification(),
          loanIT: false,
          device: 'Test',
          inventoryNumber: '1',
          loanEnd: new Date(),
          emailExtension: false,
          emailExtensionEnd: new Date(),
          newsletter: false,
          calculatedVteSum: 1,
          calculatedEmploymentEnd: new Date(),
          comment: 'Test',
        },
      ];
      const mockFindPerson = jest.spyOn(personModel, 'find').mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPerson) }),
      } as any);
      const mockFindContractType = jest
        .spyOn(contractTypeModel, 'find')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);

      const result: UniversalReportData = await service.getReportData();

      expect(result).toBeDefined();
      expect(mockFindCommittee).toHaveBeenCalledWith({ name: 'Vorstand' });
      expect(mockFindCommitteeEntry).toHaveBeenCalled();
      expect(mockFindContract).toHaveBeenCalled();
      expect(mockFindRelationship).toHaveBeenCalled();
      expect(mockFindPerson).toHaveBeenCalled();
      expect(mockFindContractType).toHaveBeenCalled();
      expect(result.reportTable.entries.length).toBeGreaterThanOrEqual(1);
    });
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
                sort: jest.fn().mockReturnValue({ exec: jest.fn() }),
              }),
            },
          },
          {
            provide: getModelToken(CollectionNames.INSTITUTES_V3),
            useValue: {
              findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
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

    it('should get third party eval report data', async () => {
      const params = { begin: '2023-01-01', end: '2023-12-31' };
      const mockProject: Project = {
        id: '1',
        title: 'Test Project',
        acronym: 'TP',
        financialPlanSum: 100000,
        sponsorId: '1',
        actualStart: new Date('2023-01-01'),
        calculatedProjectEnd: new Date('2024-01-01'),
        status: ProjectStatus.inProgress,
        applicationStatus: ApplicationStatus.contract,
        authorization: Authorization.accepted,
        promotionalClassification: PromotionalClassification.donation,
        financialType: 'public',
        startUpFinancing: false,
        smallProject: false,
        titleEnglish: 'Test Project English',
        subtitle: 'Subtitle',
        subtitleEnglish: 'Subtitle English',
        fundingIndicator: 'Test Funding',
        sketchApplication: new Date(),
        proposalApplication: new Date(),
        demandApplication: new Date(),
        authorizationDate: new Date(),
        neutralExtensionApplication: new Date(),
        sketchExists: true,
        demandExists: true,
        neutralExtensionExists: false,
        mandate: 1,
        incherURL: 'test.url',
        fundingLine: 'Test Funding Line',
        baseComment: 'Test Comment',
        typeId: '1',
        formatId: '1',
        promoterId: '1',
        projectManagerId: '1',
        clerkId: '1',
        researchFocusId: '1',
        responsibleId: ['1'],
        solicitedFromId: ['1'],
        leaderId: ['1'],
        partnerId: ['1'],
        projectLeaderId: '1',
        additionalPersons: [],
        participantComment: 'Test Participant Comment',
        plannedStart: new Date(),
        plannedEnd: new Date(),
        plannedRuntimeMonth: 12,
        plannedPersonMonth: 12,
        actualRuntimeMonth: 12,
        actualPersonMonth: 12,
        missingRuntimeMonth: 0,
        missingPersonMonth: 0,
        neutralExtension: false,
        extensionStart: new Date(),
        extensionEnd: new Date(),
        extensionRuntimeMonth: 0,
        extensionPersonMonth: 0,
        plannedFte: 1,
        actualFte: 1,
        missingFte: 0,
        extensionFte: 0,
        runtimeComment: 'Test Runtime Comment',
        runtimeImageId: '1',
        financialPlansBMBF: [],
        financialPlansDFG: [],
        financialPlansConRes: [],
        financialPlansOther: [],
        flatRates: [],
        personalCosts: 10000,
        materialCosts: 0,
        projectCosts: 0,
        flatRateSum: 0,
        flatRateINCHER: 0,
        flatRateManagement: 0,
        receiptsBMBF: [],
        receiptsDFG: [],
        receiptsConRes: [],
        receiptsOther: [],
        shortDescriptionINCHER: 'Test Short Description INCHER',
        shortDescriptionThFu: 'Test Short Description ThFu',
        tags: 'Test Tags',
        longDescription: 'Test Long Description',
        longDescriptionEnglish: 'Test Long Description English',
        website: 'test.website',
        websiteEnglish: 'test.website.english',
        publications: [],
        startUpResultId: '1',
        thirdPartyProjectId: '1',
      };
      jest.spyOn(projectModel, 'find').mockReturnValue({
        sort: jest
          .fn()
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockProject]),
          }),
      } as any);
      jest
        .spyOn(instituteModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue({ name: 'Test' }),
        } as any);
      const result: UniversalReportData =
        await thirdPartyEvalReportService.getReportData(params);
      expect(result).toBeDefined();
      expect(projectModel.find).toHaveBeenCalled();
    });

    it('should get third party eval report as excel', async () => {
      const params = { begin: '2023-01-01', end: '2023-12-31' };
      jest
        .spyOn(thirdPartyEvalReportService, 'getReportData')
        .mockResolvedValue({
          reportFileName: 'test.xlsx',
          reportName: 'test',
          reportHeading: 'test',
          reportTable: {
            header: { cells: [{ value: 'test', rowSpan: 1 }] },
            entries: [{ cells: [{ value: 'test', rowSpan: 1 }] }],
            hasSumRow: false,
          },
        });
      const result: Workbook =
        await thirdPartyEvalReportService.getReportAsExcel(params);
      expect(result).toBeDefined();
      expect(thirdPartyEvalReportService.getReportData).toHaveBeenCalledWith(
        params,
      );
    });

    it('should get third party eval report as excel with populated data', async () => {
      const params = { begin: '2023-01-01', end: '2023-12-31' };
      const mockThirdPartyEvalEntry: ThirdPartyEvalEntry = {
        name: 'Test Project',
        acronym: 'TP',
        sponsor: 'Test Sponsor',
        runtime: '2023 - 2024',
        fundingSum: 100000,
      };
      const mockReportData: UniversalReportData = {
        reportFileName: 'test.xlsx',
        reportName: 'ThirdPartyEvalReport',
        reportHeading: 'Third Party Evaluation Report',
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
                { value: mockThirdPartyEvalEntry.name, rowSpan: 1 },
                { value: mockThirdPartyEvalEntry.acronym, rowSpan: 1 },
                { value: mockThirdPartyEvalEntry.sponsor, rowSpan: 1 },
                { value: mockThirdPartyEvalEntry.runtime, rowSpan: 1 },
                { value: mockThirdPartyEvalEntry.fundingSum, rowSpan: 1 },
              ],
            },
          ],
          hasSumRow: false,
        },
      };
      jest
        .spyOn(thirdPartyEvalReportService, 'getReportData')
        .mockResolvedValue(mockReportData);
      const result: Workbook =
        await thirdPartyEvalReportService.getReportAsExcel(params);
      expect(result).toBeDefined();
      expect(thirdPartyEvalReportService.getReportData).toHaveBeenCalledWith(
        params,
      );
    });

    it('should get third party eval report data with data', async () => {
      const params = { begin: '2023-01-01', end: '2023-12-31' };
      const mockProject: Project = {
        id: '1',
        title: 'Test Project',
        acronym: 'TP',
        financialPlanSum: 100000,
        sponsorId: '1',
        actualStart: new Date('2023-01-01'),
        calculatedProjectEnd: new Date('2024-01-01'),
        status: ProjectStatus.inProgress,
        applicationStatus: ApplicationStatus.contract,
        authorization: Authorization.accepted,
        promotionalClassification: PromotionalClassification.donation,
        financialType: 'public',
        startUpFinancing: false,
        smallProject: false,
        titleEnglish: 'Test Project English',
        subtitle: 'Subtitle',
        subtitleEnglish: 'Subtitle English',
        fundingIndicator: 'Test Funding',
        sketchApplication: new Date(),
        proposalApplication: new Date(),
        demandApplication: new Date(),
        authorizationDate: new Date(),
        neutralExtensionApplication: new Date(),
        sketchExists: true,
        demandExists: true,
        neutralExtensionExists: false,
        mandate: 1,
        incherURL: 'test.url',
        fundingLine: 'Test Funding Line',
        baseComment: 'Test Comment',
        typeId: '1',
        formatId: '1',
        promoterId: '1',
        projectManagerId: '1',
        clerkId: '1',
        researchFocusId: '1',
        responsibleId: ['1'],
        solicitedFromId: ['1'],
        leaderId: ['1'],
        partnerId: ['1'],
        projectLeaderId: '1',
        additionalPersons: [],
        participantComment: 'Test Participant Comment',
        plannedStart: new Date(),
        plannedEnd: new Date(),
        plannedRuntimeMonth: 12,
        plannedPersonMonth: 12,
        actualRuntimeMonth: 12,
        actualPersonMonth: 12,
        missingRuntimeMonth: 0,
        missingPersonMonth: 0,
        neutralExtension: false,
        extensionStart: new Date(),
        extensionEnd: new Date(),
        extensionRuntimeMonth: 0,
        extensionPersonMonth: 0,
        plannedFte: 1,
        actualFte: 1,
        missingFte: 0,
        extensionFte: 0,
        runtimeComment: 'Test Runtime Comment',
        runtimeImageId: '1',
        financialPlansBMBF: [],
        financialPlansDFG: [],
        financialPlansConRes: [],
        financialPlansOther: [],
        flatRates: [],
        personalCosts: 10000,
        materialCosts: 0,
        projectCosts: 0,
        flatRateSum: 0,
        flatRateINCHER: 0,
        flatRateManagement: 0,
        receiptsBMBF: [],
        receiptsDFG: [],
        receiptsConRes: [],
        receiptsOther: [],
        shortDescriptionINCHER: 'Test Short Description INCHER',
        shortDescriptionThFu: 'Test Short Description ThFu',
        tags: 'Test Tags',
        longDescription: 'Test Long Description',
        longDescriptionEnglish: 'Test Long Description English',
        website: 'test.website',
        websiteEnglish: 'test.website.english',
        publications: [],
        startUpResultId: '1',
        thirdPartyProjectId: '1',
      };
      jest.spyOn(projectModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProject]),
        }),
      } as any);
      jest.spyOn(instituteModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Test Sponsor' }),
      } as any);
      const result: UniversalReportData =
        await thirdPartyEvalReportService.getReportData(params);
      expect(result).toBeDefined();
      expect(projectModel.find).toHaveBeenCalled();
      expect(result.reportTable.entries.length).toBeGreaterThanOrEqual(1);
    });
  });
});
