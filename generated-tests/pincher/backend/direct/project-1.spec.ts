import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { Project } from './project.schema';
import { Model } from 'mongoose';
import { ProjectDto } from './project.dto';
import { Workbook } from 'exceljs';
import { Person } from '../person';
import { Authorization } from './model/enums';
import { Institute } from '../institute';
import { Contract } from '../contract';

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
            find: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({
                and: jest.fn(),
                where: jest
                  .fn()
                  .mockReturnThis()
                  .mockReturnValue({ equals: jest.fn() }),
                sort: jest.fn().mockReturnThis(),
                collation: jest.fn().mockReturnThis(),
                exec: jest.fn(),
                select: jest.fn().mockReturnThis(),
              } as any),
            findByIdAndUpdate: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
            findByIdAndDelete: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
            aggregate: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
          },
        },
        {
          provide: getModelToken('personsv3'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('institutesv3'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('contractsv3'),
          useValue: {
            find: jest
              .fn()
              .mockReturnThis()
              .mockReturnValue({ exec: jest.fn() } as any),
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
    const dto = {
      title: 'Test Project',
      acronym: 'TP',
    };
    const newProject = new Project();
    newProject.title = 'Test Project';
    newProject.acronym = 'TP';

    jest
      .spyOn(projectModel, 'create')
      .mockImplementation(() => Promise.resolve(newProject));

    const createdProject = await service.create(dto as ProjectDto);

    expect(createdProject).toEqual(newProject);
    expect(projectModel.create).toHaveBeenCalledWith(dto);
  });

  it('getOne should return a project by id', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';

    jest
      .spyOn(projectModel, 'findById')
      .mockResolvedValueOnce(testProject as any);

    const project = await service.getOne('456');

    expect(project).toEqual(testProject);
    expect(projectModel.findById).toHaveBeenCalledWith('456');
  });

  it('getAll should return all projects', async () => {
    const testProject1 = new Project();
    testProject1.title = 'Test Project 1';
    testProject1.acronym = 'TP1';
    const testProject2 = new Project();
    testProject2.title = 'Test Project 2';
    testProject2.acronym = 'TP2';

    jest.spyOn(projectModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([testProject1, testProject2]),
      where: jest.fn().mockReturnThis(),
    } as any);

    const projects = await service.getAll({});

    expect(projects).toEqual([testProject1, testProject2]);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('update should update a project', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';
    const updatedProject = new Project();
    updatedProject.title = 'Updated Project';
    updatedProject.acronym = 'UP';

    const dto = {
      title: 'Updated Project',
      acronym: 'UP',
    };

    jest.spyOn(projectModel, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(updatedProject),
    } as any);

    const updated = await service.update('102', dto as ProjectDto);

    expect(updated).toEqual(updatedProject);
    expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '102',
      { $set: dto },
      { new: true },
    );
  });

  it('delete should delete a project', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';

    jest.spyOn(projectModel, 'findByIdAndDelete').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(testProject),
    } as any);

    const deletedProject = await service.delete('103');

    expect(deletedProject).toEqual(testProject);
    expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('103');
  });

  it('getAllTable should return a workbook', async () => {
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([]);
    jest.spyOn(personModel, 'find').mockResolvedValueOnce([]);
    const workbook = await service.getAllTable({});
    expect(workbook).toBeInstanceOf(Workbook);
  });

  it('getFinancialPlansAsExcel should return a workbook', async () => {
    jest.spyOn(service, 'getOne').mockResolvedValueOnce(new Project());
    const workbook = await service.getFinancialPlansAsExcel('123', 0);
    expect(workbook).toBeInstanceOf(Workbook);
  });

  it('getProDescAsExcel should return a workbook', async () => {
    jest.spyOn(projectModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(new Project()),
    } as any);
    const workbook = await service.getProDescAsExcel('123');
    expect(workbook).toBeInstanceOf(Workbook);
  });

  it('getOverview should return a workbook', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';
    testProject.solicitedFromId = [];
    testProject.responsibleId = [];

    jest.spyOn(projectModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(testProject),
    } as any);
    jest.spyOn(personModel, 'findById').mockResolvedValueOnce(new Person());
    jest
      .spyOn(instituteModel, 'findById')
      .mockResolvedValueOnce(new Institute());
    jest
      .spyOn(contractModel, 'find')
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as any);
    const workbook = await service.getOverview('123');
    expect(workbook).toBeInstanceOf(Workbook);
  });

  it('getAll should return filtered projects with approved filter', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';
    testProject.authorization = Authorization.accepted;

    jest.spyOn(projectModel, 'find').mockReturnValue({
      and: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([testProject]),
    } as any);

    const projects = await service.getAll({ approved: true });

    expect(projects).toEqual([testProject]);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('getAll should return filtered projects with notApproved filter', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project';
    testProject.acronym = 'TP';
    testProject.authorization = Authorization.notAccepted;

    jest.spyOn(projectModel, 'find').mockReturnValue({
      where: jest
        .fn()
        .mockReturnThis()
        .mockReturnValue({
          equals: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce([testProject]),
          }),
        }),
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([testProject]),
    } as any);

    const projects = await service.getAll({ notApproved: true });

    expect(projects).toEqual([testProject]);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('getAll should return filtered projects with title filter', async () => {
    const testProject = new Project();
    testProject.title = 'Test Project Title';
    testProject.acronym = 'TP';

    jest.spyOn(projectModel, 'find').mockReturnValue({
      and: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([testProject]),
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    } as any);

    const projects = await service.getAll({ title: 'Test' });

    expect(projects).toEqual([testProject]);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('getAll should return sorted projects', async () => {
    const testProject1 = new Project();
    testProject1.title = 'Test Project 1';
    testProject1.acronym = 'A';
    const testProject2 = new Project();
    testProject2.title = 'Test Project 2';
    testProject2.acronym = 'B';

    jest.spyOn(projectModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([testProject1, testProject2]),
    } as any);

    const projects = await service.getAll({ sortBy: 'acronym', sortOrder: 1 });

    expect(projects).toEqual([testProject1, testProject2]);
    expect(projectModel.find).toHaveBeenCalled();
  });

  it('getOne should return null if project not found', async () => {
    jest.spyOn(projectModel, 'findById').mockResolvedValueOnce(null);
    const project = await service.getOne('109');
    expect(project).toBeNull();
    expect(projectModel.findById).toHaveBeenCalledWith('109');
  });

  it('update should return null if project not found', async () => {
    jest.spyOn(projectModel, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const updatedProject = await service.update('110', {} as ProjectDto);
    expect(updatedProject).toBeNull();
    expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '110',
      { $set: {} },
      { new: true },
    );
  });

  it('delete should return null if project not found', async () => {
    jest.spyOn(projectModel, 'findByIdAndDelete').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);
    const deletedProject = await service.delete('111');
    expect(deletedProject).toBeNull();
    expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('111');
  });
});
