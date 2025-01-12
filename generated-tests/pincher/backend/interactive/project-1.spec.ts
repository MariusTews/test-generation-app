import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from './project.schema';
import { Model } from 'mongoose';
import { ExportHelper } from '../../util/export-helper';
import { Person } from '../person';
import { Institute } from '../institute';
import { Contract } from '../contract';
import { CollectionNames } from '../../constants/collection-names';
import { Workbook } from 'exceljs';
import { ProjectDto } from './project.dto';
import {
  ApplicationStatus,
  Authorization,
  ProjectStatus,
  PromotionalClassification,
} from './model/enums';
import { Response } from 'express';

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: ProjectService;
  let projectModel: Model<Project>;
  let personModel: Model<Person>;
  let instituteModel: Model<Institute>;
  let contractModel: Model<Contract>;
  let exportHelper: ExportHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        ProjectService,
        {
          provide: getModelToken(CollectionNames.PROJECTS),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockReturnThis(),
              collation: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
            }),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn().mockReturnThis(),
            collation: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            find: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockReturnThis() } as any),
            findById: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockReturnThis() } as any),
            exec: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockReturnThis() } as any),
            exec: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockReturnThis() } as any),
            exec: jest.fn().mockReturnThis(),
          },
        },
        ExportHelper,
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);
    projectModel = module.get<Model<Project>>(
      getModelToken(CollectionNames.PROJECTS),
    );
    personModel = module.get<Model<Person>>(
      getModelToken(CollectionNames.PERSONS_V3),
    );
    instituteModel = module.get<Model<Institute>>(
      getModelToken(CollectionNames.INSTITUTES_V3),
    );
    contractModel = module.get<Model<Contract>>(
      getModelToken(CollectionNames.CONTRACTS_V3),
    );
    exportHelper = module.get<ExportHelper>(ExportHelper);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a project', async () => {
      const mockProject = {
        _id: 'mockId',
        title: 'Mock Project',
      };
      jest.spyOn(projectModel, 'findById').mockResolvedValue(mockProject);
      const result = await controller.getOne('mockId');
      expect(result).toEqual(mockProject);
      expect(projectModel.findById).toHaveBeenCalledWith('mockId');
    });

    it('should return null if project not found', async () => {
      jest.spyOn(projectModel, 'findById').mockResolvedValue(null);
      const result = await controller.getOne('notFoundId');
      expect(result).toBeNull();
      expect(projectModel.findById).toHaveBeenCalledWith('notFoundId');
    });
  });

  describe('getAll', () => {
    it('should return an array of projects', async () => {
      const mockProjects = [
        { _id: '1', title: 'Project 1' },
        { _id: '2', title: 'Project 2' },
      ];
      jest.spyOn(projectModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProjects),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      } as any);
      const result = await controller.getAll({});
      expect(result).toEqual(mockProjects);
      expect(projectModel.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const mockProjectDto: ProjectDto = {
        status: ProjectStatus.inProgress,
        applicationStatus: ApplicationStatus.contract,
        authorization: Authorization.notAccepted,
        promotionalClassification: PromotionalClassification.donation,
        financialType: 'BMBF',
        startUpFinancing: false,
        smallProject: false,
        startUpResultId: '',
        thirdPartyProjectId: '',
        title: 'New Project',
        subtitle: '',
        titleEnglish: '',
        subtitleEnglish: '',
        acronym: 'NP',
        fundingIndicator: '',
        sketchApplication: new Date(),
        proposalApplication: new Date(),
        demandApplication: new Date(),
        authorizationDate: new Date(),
        neutralExtensionApplication: new Date(),
        sketchExists: false,
        demandExists: false,
        neutralExtensionExists: false,
        mandate: 12345,
        incherURL: 'https://example.com',
        fundingLine: '',
        baseComment: '',
        typeId: '',
        formatId: '',
        sponsorId: '',
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
        plannedStart: new Date(),
        plannedEnd: new Date(),
        plannedRuntimeMonth: 12,
        plannedPersonMonth: 24,
        actualStart: new Date(),
        actualRuntimeMonth: 0,
        actualPersonMonth: 0,
        missingRuntimeMonth: 0,
        missingPersonMonth: 0,
        neutralExtension: false,
        extensionStart: new Date(),
        extensionEnd: new Date(),
        extensionRuntimeMonth: 0,
        extensionPersonMonth: 0,
        plannedFte: 0,
        actualFte: 0,
        missingFte: 0,
        extensionFte: 0,
        calculatedProjectEnd: new Date(),
        financialPlansBMBF: [],
        financialPlansDFG: [],
        financialPlansConRes: [],
        financialPlansOther: [],
        flatRates: [],
        personalCosts: 0,
        materialCosts: 0,
        projectCosts: 0,
        flatRateSum: 0,
        financialPlanSum: 0,
        flatRateINCHER: 0,
        flatRateManagement: 0,
        receiptsBMBF: [],
        receiptsDFG: [],
        receiptsConRes: [],
        receiptsOther: [],
        runtimeComment: '',
        runtimeImageId: '',
        shortDescriptionINCHER: '',
        shortDescriptionThFu: '',
        tags: '',
        longDescription: '',
        longDescriptionEnglish: '',
        website: '',
        websiteEnglish: '',
        publications: [],
      };
      const mockProject = { _id: 'newId', ...mockProjectDto };
      jest
        .spyOn(projectModel, 'create')
        .mockImplementation(() => Promise.resolve(mockProject));
      const result = await controller.create(mockProjectDto);
      expect(result).toEqual(mockProject);
      expect(projectModel.create).toHaveBeenCalledWith(mockProjectDto);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const mockProject = { _id: '1', title: 'Updated Project' };
      jest
        .spyOn(projectModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProject),
        } as any);
      const result = await controller.update('1', {
        title: 'Updated Project',
      } as ProjectDto);
      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: { title: 'Updated Project' } },
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      const mockProject = { _id: '1', title: 'Deleted Project' };
      jest
        .spyOn(projectModel, 'findByIdAndDelete')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProject),
        } as any);
      const result = await controller.delete('1');
      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('ProjectService', () => {
    describe('getAllTable', () => {
      it('should return a workbook', async () => {
        jest.spyOn(projectModel, 'find').mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
          collation: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        } as any);
        jest
          .spyOn(personModel, 'find')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
        const result = await projectService.getAllTable({});
        expect(result).toBeInstanceOf(Workbook);
      });
      it('should return an empty workbook if no projects are found', async () => {
        jest.spyOn(projectModel, 'find').mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
          collation: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        } as any);
        jest
          .spyOn(personModel, 'find')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
        const result = await projectService.getAllTable({});
        expect(result).toBeInstanceOf(Workbook);
      });
    });
    describe('getOverview', () => {
      it('should return a workbook', async () => {
        const testProject = new Project();
        testProject.title = 'Test Project';
        testProject.acronym = 'TP';
        testProject.solicitedFromId = [];
        testProject.responsibleId = [];
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue(testProject),
          } as any);
        jest
          .spyOn(personModel, 'findById')
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue({} as Person),
          } as any);
        jest
          .spyOn(instituteModel, 'findById')
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue({} as Institute),
          } as any);
        jest
          .spyOn(contractModel, 'find')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
        const result = await projectService.getOverview('1');
        expect(result).toBeInstanceOf(Workbook);
      });
      it('should return an empty workbook if no project is found', async () => {
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
        const result = await projectService.getOverview('1');
        expect(result).toBeInstanceOf(Workbook);
      });
    });
    describe('getProDescAsExcel', () => {
      it('should return a workbook', async () => {
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue({} as Project),
          } as any);
        const result = await projectService.getProDescAsExcel('1');
        expect(result).toBeInstanceOf(Workbook);
      });
      it('should return an empty workbook if no project is found', async () => {
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
        const result = await projectService.getProDescAsExcel('1');
        expect(result).toBeInstanceOf(Workbook);
      });
    });
    describe('getFinancialPlansAsExcel', () => {
      it('should return a workbook', async () => {
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({
            exec: jest.fn().mockResolvedValue({} as Project),
          } as any);
        const result = await projectService.getFinancialPlansAsExcel('1', 0);
        expect(result).toBeInstanceOf(Workbook);
      });
      it('should return an empty workbook if no project is found', async () => {
        jest
          .spyOn(projectModel, 'findById')
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
        const result = await projectService.getFinancialPlansAsExcel('1', 0);
        expect(result).toBeInstanceOf(Workbook);
      });
    });
  });
});
