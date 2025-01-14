import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from './project.schema';
import { Model } from 'mongoose';
import { ExportHelper } from '../../util/export-helper';
import { CollectionNames } from '../../constants/collection-names';
import { ProjectDto } from './project.dto';
import { Workbook } from 'exceljs';
import { Contract } from '../contract';
import { Institute } from '../institute';
import { Person } from '../person';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;
  let projectModel: Model<Project>;
  let personModel: Model<Person>;
  let instituteModel: Model<Institute>;
  let contractModel: Model<Contract>;

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
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
            where: jest.fn().mockReturnThis(),
            collation: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(CollectionNames.PERSONS_V3),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(CollectionNames.INSTITUTES_V3),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(CollectionNames.CONTRACTS_V3),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a project', async () => {
      const mockProject = {
        _id: 'mockId',
        title: 'mockProject',
        // Add other properties as needed
      } as unknown as Project;
      jest.spyOn(projectModel, 'findById').mockResolvedValue(mockProject);
      const result = await controller.getOne('mockId');
      expect(result).toEqual(mockProject);
      expect(projectModel.findById).toHaveBeenCalledWith('mockId');
    });
    it('should return null if project not found', async () => {
      jest.spyOn(projectModel, 'findById').mockResolvedValue(null);
      const result = await controller.getOne('notExistingId');
      expect(result).toEqual(null);
      expect(projectModel.findById).toHaveBeenCalledWith('notExistingId');
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      const mockProjectDto = {} as ProjectDto;
      const mockProject = {
        _id: 'mockId',
        title: 'mockProject',
      } as unknown as Project;
      jest
        .spyOn(projectModel, 'create')
        .mockImplementation(() => Promise.resolve(mockProject));
      const result = await controller.create(mockProjectDto);
      expect(result).toEqual(mockProject);
      expect(projectModel.create).toHaveBeenCalledWith(mockProjectDto);
    });
    it('should throw an error if creation fails', async () => {
      const mockProjectDto = {} as ProjectDto;
      jest
        .spyOn(projectModel, 'create')
        .mockImplementation(() =>
          Promise.reject(new Error('Failed to create')),
        );
      await expect(controller.create(mockProjectDto)).rejects.toThrowError(
        'Failed to create',
      );
    });
  });

  describe('getAll', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        {
          _id: 'mockId1',
          title: 'mockProject1',
        },
        {
          _id: 'mockId2',
          title: 'mockProject2',
        },
      ] as unknown as Project[];
      const mongooseQuery = {
        exec: jest.fn().mockResolvedValue(mockProjects),
        where: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any;
      jest.spyOn(projectModel, 'find').mockReturnValue(mongooseQuery);
      const result = await controller.getAll({});
      expect(result).toEqual(mockProjects);
      expect(projectModel.find).toHaveBeenCalled();
      expect(mongooseQuery.exec).toHaveBeenCalled();
    });

    it('should return an empty array if no projects are found', async () => {
      const mongooseQuery = {
        exec: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any;
      jest.spyOn(projectModel, 'find').mockReturnValue(mongooseQuery);
      const result = await controller.getAll({});
      expect(result).toEqual([]);
      expect(projectModel.find).toHaveBeenCalled();
      expect(mongooseQuery.exec).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const mockProject = {
        _id: 'mockId',
        title: 'mockProject',
      } as unknown as Project;
      const mockProjectDto = { title: 'updatedTitle' } as ProjectDto;
      jest
        .spyOn(projectModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProject),
        } as any);
      const result = await controller.update('mockId', mockProjectDto);
      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockId',
        { $set: mockProjectDto },
        { new: true },
      );
    });
    it('should return null if project not found', async () => {
      jest
        .spyOn(projectModel, 'findByIdAndUpdate')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      const result = await controller.update('notExistingId', {} as ProjectDto);
      expect(result).toEqual(null);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'notExistingId',
        { $set: {} },
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      const mockProject = {
        _id: 'mockId',
        title: 'mockProject',
      } as unknown as Project;
      jest
        .spyOn(projectModel, 'findByIdAndDelete')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProject),
        } as any);
      const result = await controller.delete('mockId');
      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('mockId');
    });
    it('should return null if project not found', async () => {
      jest
        .spyOn(projectModel, 'findByIdAndDelete')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      const result = await controller.delete('notExistingId');
      expect(result).toEqual(null);
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(
        'notExistingId',
      );
    });
  });

  describe('service methods with workbooks', () => {
    it('should return a workbook for getAllTable', async () => {
      const mongooseQuery1 = {
        exec: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any;
      jest.spyOn(personModel, 'find').mockReturnValue(mongooseQuery1);
      const mongooseQuery2 = {
        exec: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      } as any;
      jest.spyOn(projectModel, 'find').mockReturnValue(mongooseQuery2);
      const workbook = await service.getAllTable({});
      expect(workbook).toBeInstanceOf(Workbook);
    });
    it('should return a workbook for getFinancialPlansAsExcel', async () => {
      jest
        .spyOn(projectModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue({} as Project),
        } as any);
      const workbook = await service.getFinancialPlansAsExcel('mockId', 0);
      expect(workbook).toBeInstanceOf(Workbook);
    });
    it('should return a workbook for getProDescAsExcel', async () => {
      jest
        .spyOn(projectModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue({} as Project),
        } as any);
      const workbook = await service.getProDescAsExcel('mockId');
      expect(workbook).toBeInstanceOf(Workbook);
    });
    it('should return a workbook for getOverview', async () => {
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
      const workbook = await service.getOverview('mockId');
      expect(workbook).toBeInstanceOf(Workbook);
    });
  });
});
