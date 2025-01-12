import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { Project } from './project.schema';
import { Model } from 'mongoose';
import { ProjectDto } from './project.dto';
import { Person } from '../person';
import { Institute } from '../institute';
import { Contract } from '../contract';
import { Workbook } from 'exceljs';
import { Authorization } from './model/enums';
import {
  ApplicationStatus,
  ProjectStatus,
  PromotionalClassification,
} from './model/enums';
import { ContractTypes } from '../contract/contract-type/contract-types';

const mockProject: Project = {
  id: 'mockProjectId',
  status: ProjectStatus.inProgress,
  applicationStatus: ApplicationStatus.contract,
  authorization: Authorization.accepted,
  promotionalClassification: PromotionalClassification.donation,
  financialType: 'mockFinancialType',
  startUpFinancing: false,
  smallProject: false,
  startUpResultId: 'mockStartUpResultId',
  thirdPartyProjectId: 'mockThirdPartyProjectId',
  title: 'mockTitle',
  subtitle: 'mockSubtitle',
  titleEnglish: 'mockTitleEnglish',
  subtitleEnglish: 'mockSubtitleEnglish',
  acronym: 'mockAcronym',
  fundingIndicator: 'mockFundingIndicator',
  sketchApplication: new Date(),
  proposalApplication: new Date(),
  demandApplication: new Date(),
  authorizationDate: new Date(),
  neutralExtensionApplication: new Date(),
  sketchExists: false,
  demandExists: false,
  neutralExtensionExists: false,
  mandate: 123,
  incherURL: 'mockIncherURL',
  fundingLine: 'mockFundingLine',
  baseComment: 'mockBaseComment',
  typeId: 'mockTypeId',
  formatId: 'mockFormatId',
  sponsorId: 'mockSponsorId',
  promoterId: 'mockPromoterId',
  projectManagerId: 'mockProjectManagerId',
  clerkId: 'mockClerkId',
  researchFocusId: 'mockResearchFocusId',
  responsibleId: ['mockResponsibleId1', 'mockResponsibleId2'],
  solicitedFromId: ['mockSolicitedFromId1'],
  leaderId: ['mockLeaderId1'],
  partnerId: ['mockPartnerId1'],
  projectLeaderId: 'mockProjectLeaderId',
  additionalPersons: [],
  participantComment: 'mockParticipantComment',
  plannedStart: new Date(),
  plannedEnd: new Date(),
  plannedRuntimeMonth: 12,
  plannedPersonMonth: 24,
  actualStart: new Date(),
  actualRuntimeMonth: 10,
  actualPersonMonth: 20,
  missingRuntimeMonth: 2,
  missingPersonMonth: 4,
  neutralExtension: false,
  extensionStart: new Date(),
  extensionEnd: new Date(),
  extensionRuntimeMonth: 0,
  extensionPersonMonth: 0,
  plannedFte: 1,
  actualFte: 0.8,
  missingFte: 0.2,
  extensionFte: 0,
  runtimeComment: 'mockRuntimeComment',
  runtimeImageId: 'mockRuntimeImageId',
  calculatedProjectEnd: new Date(),
  financialPlansBMBF: [],
  financialPlansDFG: [],
  financialPlansConRes: [],
  financialPlansOther: [],
  flatRates: [],
  personalCosts: 10000,
  materialCosts: 5000,
  projectCosts: 15000,
  flatRateSum: 1000,
  financialPlanSum: 16000,
  flatRateINCHER: 500,
  flatRateManagement: 500,
  receiptsBMBF: [],
  receiptsDFG: [],
  receiptsConRes: [],
  receiptsOther: [],
  shortDescriptionINCHER: 'mockShortDescriptionINCHER',
  shortDescriptionThFu: 'mockShortDescriptionThFu',
  tags: 'mockTags',
  longDescription: 'mockLongDescription',
  longDescriptionEnglish: 'mockLongDescriptionEnglish',
  website: 'mockWebsite',
  websiteEnglish: 'mockWebsiteEnglish',
  publications: [],
};

const mockPerson: Person = new Person();
mockPerson.firstName = 'Test';
mockPerson.lastName = 'User';
const mockInstitute: Institute = new Institute();
const mockContract: Contract = new Contract();
const mockWorkbook: Workbook = new Workbook();
const mockProjectDto: ProjectDto = new ProjectDto();
const mockContracts: Contract[] = [new Contract()];

describe('ProjectService', () => {
  let service: ProjectService;
  let projectModel: Model<Project>;
  let personModel: Model<Person>;
  let instituteModel: Model<Institute>;
  let contractModel: Model<Contract>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken('projects'),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn().mockReturnValue({
              collation: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              exec: jest.fn(),
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
          provide: getModelToken('personsv3'),
          useValue: {
            find: jest.fn().mockReturnValue({
              collation: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              exec: jest.fn(),
            } as any),
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockPerson),
            } as any),
          },
        },
        {
          provide: getModelToken('institutesv3'),
          useValue: {
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockInstitute),
            } as any),
          },
        },
        {
          provide: getModelToken('contractsv3'),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockContracts),
            } as any),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectModel = module.get<Model<Project>>(getModelToken('projects'));
    personModel = module.get<Model<Person>>(getModelToken('personsv3'));
    instituteModel = module.get<Model<Institute>>(
      getModelToken('institutesv3'),
    );
    contractModel = module.get<Model<Contract>>(getModelToken('contractsv3'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should create a new project', async () => {
    jest
      .spyOn(projectModel, 'create')
      .mockImplementation(() => Promise.resolve(mockProject));
    const createdProject = await service.create(mockProjectDto);
    expect(createdProject).toEqual(mockProject);
    expect(projectModel.create).toHaveBeenCalledWith(mockProjectDto);
  });

  it('getOne should return a project by id', async () => {
    jest
      .spyOn(projectModel, 'findById')
      .mockResolvedValueOnce(mockProject as any);
    const project = await service.getOne('mockProjectId');
    expect(project).toEqual(mockProject);
    expect(projectModel.findById).toHaveBeenCalledWith('mockProjectId');
  });

  it('getOne should return null if project not found', async () => {
    jest.spyOn(projectModel, 'findById').mockResolvedValueOnce(null);
    const project = await service.getOne('nonexistentId');
    expect(project).toBeNull();
    expect(projectModel.findById).toHaveBeenCalledWith('nonexistentId');
  });

  it('getAll should return all projects', async () => {
    const mockQuery = {
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockProject] as any),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const projects = await service.getAll({});
    expect(projects).toEqual([mockProject]);
    expect(mockQuery.exec).toHaveBeenCalled();
  });

  it('getAll should return empty array if no projects found', async () => {
    const mockQuery = {
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([]),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const projects = await service.getAll({});
    expect(projects).toEqual([]);
    expect(mockQuery.exec).toHaveBeenCalled();
  });

  it('getAll should filter projects by title', async () => {
    const queryParams = { title: 'mockTitle' };
    const mockQuery = {
      and: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockProject] as any),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const projects = await service.getAll(queryParams);
    expect(projects).toEqual([mockProject]);
    expect(mockQuery.exec).toHaveBeenCalled();
  });

  it('getAll should filter projects by approved', async () => {
    const queryParams = { approved: true };
    const mockQuery = {
      and: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockProject] as any),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const projects = await service.getAll(queryParams);
    expect(projects).toEqual([mockProject]);
    expect(mockQuery.exec).toHaveBeenCalled();
  });

  it('update should update a project', async () => {
    jest.spyOn(projectModel, 'findByIdAndUpdate').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockProject),
    } as any);
    const updatedProject = await service.update(
      'mockProjectId',
      mockProjectDto,
    );
    expect(updatedProject).toEqual(mockProject);
    expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockProjectId',
      { $set: mockProjectDto },
      { new: true },
    );
  });

  it('update should return null if project not found', async () => {
    jest
      .spyOn(projectModel, 'findByIdAndUpdate')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const updatedProject = await service.update(
      'nonexistentId',
      mockProjectDto,
    );
    expect(updatedProject).toBeNull();
    expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'nonexistentId',
      { $set: mockProjectDto },
      { new: true },
    );
  });

  it('delete should delete a project', async () => {
    jest.spyOn(projectModel, 'findByIdAndDelete').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockProject),
    } as any);
    const deletedProject = await service.delete('mockProjectId');
    expect(deletedProject).toEqual(mockProject);
    expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(
      'mockProjectId',
    );
  });

  it('delete should return null if project not found', async () => {
    jest
      .spyOn(projectModel, 'findByIdAndDelete')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const deletedProject = await service.delete('nonexistentId');
    expect(deletedProject).toBeNull();
    expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(
      'nonexistentId',
    );
  });

  it('getFinancialPlansAsExcel should return a workbook', async () => {
    jest.spyOn(service, 'getOne').mockResolvedValueOnce(mockProject as any);
    const workbook = await service.getFinancialPlansAsExcel('mockProjectId', 0);
    expect(workbook instanceof Workbook).toBeTruthy();
  });

  it('getFinancialPlansAsExcel should return empty workbook if project not found', async () => {
    jest.spyOn(service, 'getOne').mockResolvedValueOnce(null);
    const workbook = await service.getFinancialPlansAsExcel('nonexistentId', 0);
    expect(workbook instanceof Workbook).toBeTruthy();
    expect(workbook.worksheets.length).toBe(0);
  });

  it('getAllTable should return a workbook', async () => {
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([mockProject] as any);
    const mockPersonFind = {
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockPerson]),
    } as any;
    jest.spyOn(personModel, 'find').mockReturnValue(mockPersonFind as any);
    const workbook = await service.getAllTable({});
    expect(workbook instanceof Workbook).toBeTruthy();
  });

  it('getAllTable should return a workbook even if no projects are found', async () => {
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([]);
    const mockPersonFind = {
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([]),
    } as any;
    jest.spyOn(personModel, 'find').mockReturnValue(mockPersonFind as any);
    const workbook = await service.getAllTable({});
    expect(workbook instanceof Workbook).toBeTruthy();
  });

  it('getProDescAsExcel should return a workbook', async () => {
    jest.spyOn(projectModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockProject),
    } as any);
    const workbook = await service.getProDescAsExcel('mockProjectId');
    expect(workbook instanceof Workbook).toBeTruthy();
  });

  it('getProDescAsExcel should return empty workbook if project not found', async () => {
    jest
      .spyOn(projectModel, 'findById')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const workbook = await service.getProDescAsExcel('nonexistentId');
    expect(workbook instanceof Workbook).toBeTruthy();
    expect(workbook.worksheets.length).toBe(0);
  });

  it('getOverview should return a workbook', async () => {
    jest.spyOn(projectModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockProject),
    } as any);
    jest.spyOn(instituteModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockInstitute),
    } as any);
    jest.spyOn(personModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce([mockPerson]),
    } as any);
    jest.spyOn(contractModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockContracts),
    } as any);
    jest.spyOn(personModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockPerson]),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any);
    jest.spyOn(service, 'getOne').mockResolvedValue(mockProject);
    const workbook = await service.getOverview('mockProjectId');
    expect(workbook instanceof Workbook).toBeTruthy();
  });

  it('getOverview should return empty workbook if project not found', async () => {
    jest
      .spyOn(projectModel, 'findById')
      .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    const workbook = await service.getOverview('nonexistentId');
    expect(workbook instanceof Workbook).toBeTruthy();
    expect(workbook.worksheets.length).toBe(0);
  });

  it('filter should filter projects by authorization', async () => {
    const queryParams = { authorization: Authorization.accepted };
    const mockQuery = {
      and: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockProject] as any),
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const query = service.filter(queryParams);
    expect(query).toBeDefined();
    const mockExec = jest.spyOn(mockQuery, 'exec');
    mockExec.mockResolvedValueOnce([mockProject]);
    await query.exec();
    expect(mockExec).toHaveBeenCalled();
  });

  it('filter should handle empty queryParams gracefully', async () => {
    const queryParams = {};
    const mockQuery = {
      collation: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockProject] as any),
    } as any;
    jest.spyOn(projectModel, 'find').mockReturnValue(mockQuery);
    const query = service.filter(queryParams);
    expect(query).toBeDefined();
    const mockExec = jest.spyOn(mockQuery, 'exec');
    mockExec.mockResolvedValueOnce([mockProject]);
    await query.exec();
    expect(mockExec).toHaveBeenCalled();
  });
});
