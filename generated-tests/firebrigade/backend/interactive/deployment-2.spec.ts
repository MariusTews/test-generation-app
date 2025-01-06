import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserService } from '../user/user.service';
import Deployment from './deployment.entity';
import User from '../user/user.entity';
import UserCredentials from '../user/userCredentials.entity';
import CertifiedCourse from '../user/certifiedCourse.entity';
import DeploymentStorage from './deploymentStorage.entity';
import CreateDeploymentDto from './createDeploymentDto';
import { NotFoundException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import DeploymentPicture from './deploymentPicture.entity';

describe('DeploymentController', () => {
  let controller: DeploymentController;
  let service: DeploymentService;
  let deploymentRepository: Repository<Deployment>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentController],
      providers: [
        DeploymentService,
        UserService,
        {
          provide: getRepositoryToken(Deployment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserCredentials),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CertifiedCourse),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeploymentStorage),
          useClass: Repository,
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
                find: jest.fn(),
              },
            } as any),
          },
        },
      ],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
    service = module.get<DeploymentService>(DeploymentService);
    deploymentRepository = module.get<Repository<Deployment>>(getRepositoryToken(Deployment));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    queryRunner.manager.find = jest.fn();
    queryRunner.manager.findOne = jest.fn();
    queryRunner.manager.save = jest.fn();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all deployments', async () => {
    // Arrange
    const mockDeployments: Deployment[] = [
      {
        deploymentId: '1',
        deploymentTitle: 'Test Deployment 1',
        location: 'Test Location 1',
        description: 'Test Description 1',
        date: '2024-07-26',
        storage: { storageId: 'storage1' } as any,
        pictures: [],
        involvedUsers: [],
      },
      {
        deploymentId: '2',
        deploymentTitle: 'Test Deployment 2',
        location: 'Test Location 2',
        description: 'Test Description 2',
        date: '2024-07-27',
        storage: { storageId: 'storage2' } as any,
        pictures: [],
        involvedUsers: [],
      },
    ];
    jest.spyOn(deploymentRepository, 'find').mockResolvedValue(mockDeployments);

    // Act
    const deployments = await controller.getAllDeployments();

    // Assert
    expect(deploymentRepository.find).toHaveBeenCalled();
    expect(deployments).toEqual(mockDeployments);
  });

  it('should return a single deployment by ID', async () => {
    // Arrange
    const mockDeploymentId = '1';
    const mockDeployment: Deployment = {
      deploymentId: mockDeploymentId,
      deploymentTitle: 'Test Deployment 1',
      location: 'Test Location 1',
      description: 'Test Description 1',
      date: '2024-07-26',
      storage: { storageId: 'storage1' } as any,
      pictures: [],
      involvedUsers: [],
    };
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(mockDeployment);

    // Act
    const deployment = await controller.getDeployment(mockDeploymentId);

    // Assert
    expect(deploymentRepository.findOne).toHaveBeenCalledWith({
      where: { deploymentId: mockDeploymentId },
      relations: ['involvedUsers'],
    });
    expect(deployment).toEqual(mockDeployment);
  });

  it('should create a new deployment', async () => {
    //Arrange
    const mockDto: CreateDeploymentDto = {
      deploymentTitle: 'Test Deployment 3',
      location: 'Test Location 3',
      description: 'Test Description 3',
      date: '2024-07-28',
      user: ['user1'],
      fireBrigadeId: 'firebrigade1',
    };
    const mockUsers: User[] = [{ userId: 'user1', username: 'Testuser1' } as any];
    const mockDeploymentStorage = { storageId: 'storage3' } as any;
    const mockCreatedDeployment: Deployment = {
      deploymentTitle: 'Test Deployment 3',
      location: 'Test Location 3',
      description: 'Test Description 3',
      date: '2024-07-28',
      storage: mockDeploymentStorage,
      pictures: [],
      involvedUsers: mockUsers,
    } as any;
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
    jest.spyOn(service, 'getDeploymentStorageByFireBrigadeId').mockResolvedValue(mockDeploymentStorage);
    jest.spyOn(deploymentRepository, 'save').mockResolvedValue(mockCreatedDeployment);

    //Act
    const createdDeployment = await controller.postAddDeployment(mockDto);

    //Assert
    expect(userRepository.find).toHaveBeenCalled();
    expect(service.getDeploymentStorageByFireBrigadeId).toHaveBeenCalledWith('firebrigade1');
    expect(deploymentRepository.save).toHaveBeenCalledWith(mockCreatedDeployment);
    expect(createdDeployment).toEqual(mockCreatedDeployment);
  });

  it('should throw NotFoundException if deployment not found', async () => {
    //Arrange
    const mockDeploymentId = 'nonexistent';
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(null);

    //Act & Assert
    await expect(controller.getDeployment(mockDeploymentId)).rejects.toThrow(NotFoundException);
  });

  it('should add a picture to a deployment', async () => {
    // Arrange
    const mockDeploymentId = '1';
    const mockFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      fieldname: 'picture',
      encoding: '7bit',
      size: 4,
    } as Express.Multer.File;
    const mockDeployment: Deployment = {
      deploymentId: mockDeploymentId,
      deploymentTitle: 'Test Deployment 1',
      location: 'Test Location 1',
      description: 'Test Description 1',
      date: '2024-07-26',
      storage: { storageId: 'storage1' } as any,
      pictures: [],
      involvedUsers: [],
    };
    const mockDeploymentPicture = new DeploymentPicture();
    queryRunner.manager.findOne = jest.fn().mockResolvedValueOnce(mockDeployment);
    queryRunner.manager.save = jest.fn().mockResolvedValueOnce(mockDeploymentPicture);

    // Act
    await controller.postAddPicture(mockFile, mockDeploymentId);

    // Assert
    expect(queryRunner.manager.findOne).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalled();
  });

  it('should return all pictures for a deployment', async () => {
    // Arrange
    const deploymentId = '1';
    const mockPictures = [
      { id: '1', picture: Buffer.from('test1') },
      { id: '2', picture: Buffer.from('test2') },
    ];
    const mockDeployment = {
      deploymentId: deploymentId,
      pictures: mockPictures,
    } as Deployment;
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValue(mockDeployment);

    // Act
    const pictures = await controller.getAllPictures(deploymentId);

    // Assert
    expect(deploymentRepository.findOne).toHaveBeenCalledWith({ where: { deploymentId }, relations: ['pictures'] });
    expect(pictures).toEqual(mockPictures.map((p) => p.picture));
  });
});
