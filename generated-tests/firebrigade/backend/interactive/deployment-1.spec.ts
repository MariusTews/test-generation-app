import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Deployment from './deployment.entity';
import CreateDeploymentDto from './createDeploymentDto';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import User from '../user/user.entity';
import UserCredentials from '../user/userCredentials.entity';
import CertifiedCourse from '../user/certifiedCourse.entity';
import DeploymentStorage from './deploymentStorage.entity';
import FireBrigade from '../fire-brigade/fireBrigade.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import DeploymentPicture from './deploymentPicture.entity';

describe('DeploymentController', () => {
  let controller: DeploymentController;
  let service: DeploymentService;
  let deploymentRepository: Repository<Deployment>;
  let userRepository: Repository<User>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let deploymentPictureRepository: Repository<DeploymentPicture>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentController],
      providers: [
        DeploymentService,
        UserService,
        {
          provide: getRepositoryToken(Deployment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserCredentials),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CertifiedCourse),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DeploymentStorage),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeploymentPicture),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                findOne: jest.fn(),
                save: jest.fn(),
              },
            }),
          },
        },
        // Add more providers if needed
      ],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
    service = module.get<DeploymentService>(DeploymentService);
    deploymentRepository = module.get<Repository<Deployment>>(getRepositoryToken(Deployment));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    deploymentStorageRepository = module.get<Repository<DeploymentStorage>>(getRepositoryToken(DeploymentStorage));
    deploymentPictureRepository = module.get<Repository<DeploymentPicture>>(getRepositoryToken(DeploymentPicture));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a deployment', async () => {
    // Mock data
    const mockDto: CreateDeploymentDto = {
      deploymentTitle: 'Test Deployment',
      location: 'Test Location',
      description: 'Test Description',
      date: '2024-08-24',
      user: ['user1'],
      fireBrigadeId: 'firebrigade1',
    };
    const mockDeployment: Deployment = {
      deploymentId: 'uuid',
      deploymentTitle: 'Test Deployment',
      location: 'Test Location',
      description: 'Test Description',
      date: '2024-08-24',
      storage: undefined,
      pictures: [],
      involvedUsers: [],
    };
    const mockUsers = [{ userId: 'user1', userName: 'Testuser' }];
    const mockFireBrigade = { fireBrigadeId: 'firebrigade1' };
    const mockDeploymentStorage = { storageId: 'storage1', fireBrigade: mockFireBrigade };

    // Mock database calls
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers as any);
    jest.spyOn(deploymentStorageRepository, 'find').mockResolvedValue([mockDeploymentStorage] as any);
    jest.spyOn(deploymentRepository, 'save').mockResolvedValue(mockDeployment);

    // Call the controller method
    const result = await controller.postAddDeployment(mockDto);

    // Assertions
    expect(userRepository.find).toHaveBeenCalled();
    expect(deploymentStorageRepository.find).toHaveBeenCalled();
    expect(deploymentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        deploymentTitle: 'Test Deployment',
        location: 'Test Location',
        description: 'Test Description',
        date: '2024-08-24',
        involvedUsers: mockUsers,
        storage: mockDeploymentStorage,
        pictures: [],
      }),
    );
    expect(result).toEqual(mockDeployment);
  });

  it('should throw NotFoundException if deployment not found', async () => {
    const id = 'nonexistent-id';
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(undefined);

    await expect(controller.getDeployment(id)).rejects.toThrow(NotFoundException);
    expect(deploymentRepository.findOne).toHaveBeenCalledWith({
      where: { deploymentId: id },
      relations: ['involvedUsers'],
    });
  });

  it('should get all deployments', async () => {
    const mockDeployments: Deployment[] = [
      {
        deploymentId: '1',
        deploymentTitle: 'Deployment 1',
        location: 'Location 1',
        description: 'Description 1',
        date: '2024-01-01',
        storage: undefined,
        pictures: [],
        involvedUsers: [],
      },
      {
        deploymentId: '2',
        deploymentTitle: 'Deployment 2',
        location: 'Location 2',
        description: 'Description 2',
        date: '2024-01-02',
        storage: undefined,
        pictures: [],
        involvedUsers: [],
      },
    ];
    jest.spyOn(deploymentRepository, 'find').mockResolvedValue(mockDeployments);

    const result = await controller.getAllDeployments();
    expect(result).toEqual(mockDeployments);
    expect(deploymentRepository.find).toHaveBeenCalled();
  });

  it('should add a picture to a deployment', async () => {
    const mockFile = { mimetype: 'image/jpeg', buffer: Buffer.from('test') } as Express.Multer.File;
    const id = 'existing-id';
    const mockDeployment = { pictures: [] } as Deployment;
    const mockDeploymentPicture = { picture: Buffer.from('test'), deployment: mockDeployment } as DeploymentPicture;
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn().mockResolvedValue(mockDeployment as any),
        save: jest.fn().mockResolvedValue(mockDeploymentPicture as any),
      },
    };

    jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(queryRunner as any);

    await controller.postAddPicture(mockFile, id);
    expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Deployment, {
      where: { deploymentId: id },
      relations: ['pictures'],
    });
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      DeploymentPicture,
      expect.objectContaining({ picture: Buffer.from('test') }),
    );
  });

  it('should throw BadRequestException if file mimetype is invalid', async () => {
    const mockFile = { mimetype: 'text/plain', buffer: Buffer.from('test') } as Express.Multer.File;
    const id = 'existing-id';

    await expect(controller.postAddPicture(mockFile, id)).rejects.toThrow(BadRequestException);
    expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('should get all pictures for a deployment', async () => {
    const id = 'existing-id';
    const mockDeployment = { pictures: [{ picture: Buffer.from('test') }] } as Deployment;
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(mockDeployment as any);

    const result = await controller.getAllPictures(id);
    expect(result).toEqual([Buffer.from('test')]);
    expect(deploymentRepository.findOne).toHaveBeenCalledWith({ where: { deploymentId: id }, relations: ['pictures'] });
  });

  it('should get a single deployment by ID', async () => {
    const id = 'existing-id';
    const mockDeployment = { deploymentId: id, deploymentTitle: 'Test Deployment' } as Deployment;
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(mockDeployment as any);

    const result = await controller.getDeployment(id);
    expect(result).toEqual(mockDeployment);
    expect(deploymentRepository.findOne).toHaveBeenCalledWith({
      where: { deploymentId: id },
      relations: ['involvedUsers'],
    });
  });
});
