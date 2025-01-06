import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import CreateDeploymentDto from './createDeploymentDto';
import Deployment from './deployment.entity';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import DeploymentStorage from './deploymentStorage.entity';
import DeploymentPicture from './deploymentPicture.entity';
import User from '../user/user.entity';
import { UserService } from '../user/user.service';
import UserCredentials from '../user/userCredentials.entity';
import CertifiedCourse from '../user/certifiedCourse.entity';

const mockUser = new User();
mockUser.userId = 'mockUserId';
mockUser.username = 'mockUsername';

describe('DeploymentController', () => {
  let controller: DeploymentController;
  let service: DeploymentService;
  let deploymentRepository: Repository<Deployment>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let dataSource: DataSource;
  let queryRunner: any;
  let module: TestingModule;
  let deploymentPictureRepository: Repository<DeploymentPicture>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [DeploymentController],
      providers: [
        DeploymentService,
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValueOnce([mockUser]),
            userRepository: { find: jest.fn() },
            userCredentialsRepository: { find: jest.fn() },
            certfiedCourseRepository: { find: jest.fn() },
          },
        },
        {
          provide: getRepositoryToken(Deployment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeploymentStorage),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeploymentPicture),
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
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
    service = module.get<DeploymentService>(DeploymentService);
    deploymentRepository = module.get<Repository<Deployment>>(getRepositoryToken(Deployment));
    deploymentStorageRepository = module.get<Repository<DeploymentStorage>>(getRepositoryToken(DeploymentStorage));
    dataSource = module.get(DataSource);
    queryRunner = dataSource.createQueryRunner();
    queryRunner.manager.find = jest.fn();
    queryRunner.manager.findOne = jest.fn();
    queryRunner.manager.save = jest.fn();
    jest.spyOn(deploymentRepository, 'save').mockImplementation(jest.fn());
    jest.spyOn(deploymentRepository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(deploymentRepository, 'find').mockImplementation(jest.fn());
    deploymentPictureRepository = module.get(getRepositoryToken(DeploymentPicture));
    jest.spyOn(deploymentPictureRepository, 'save').mockImplementation(jest.fn());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllDeployments should return all deployments', async () => {
    const mockDeployments: Deployment[] = [new Deployment()];
    jest.spyOn(deploymentRepository, 'find').mockResolvedValueOnce(mockDeployments);
    expect(await controller.getAllDeployments()).toBe(mockDeployments);
  });

  it('getDeployment should return a deployment by id', async () => {
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = '1';
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    expect(await controller.getDeployment('1')).toBe(mockDeployment);
  });

  it('getDeployment should return null if deployment not found', async () => {
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(null);
    expect(await controller.getDeployment('nonexistentId')).toBe(null);
  });

  it('getAllPictures should return all pictures of a deployment', async () => {
    const mockDeployment = new Deployment();
    mockDeployment.pictures = [new DeploymentPicture()];
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    expect(await controller.getAllPictures('mockId')).toEqual([undefined]);
  });

  it('getAllPictures should return empty array if no pictures found', async () => {
    const mockDeployment = new Deployment();
    mockDeployment.pictures = [];
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    expect(await controller.getAllPictures('mockId')).toEqual([]);
  });

  it('postAddDeployment should create a new deployment', async () => {
    const mockDto: CreateDeploymentDto = {
      deploymentTitle: 'mockTitle',
      location: 'mockLocation',
      description: 'mockDescription',
      date: 'mockDate',
      user: ['mockUserId'],
      fireBrigadeId: 'mockFireBrigadeId',
    };
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = 'mockDeploymentId';
    jest.spyOn(deploymentRepository, 'save').mockResolvedValueOnce(mockDeployment);
    const userService = module.get(UserService);
    jest.spyOn(userService, 'findAll').mockResolvedValueOnce([mockUser]);

    const deploymentStorageSpy = jest.spyOn(service, 'getDeploymentStorageByFireBrigadeId');
    const mockDeploymentStorage = new DeploymentStorage();
    mockDeploymentStorage.storageId = 'mockStorageId';
    deploymentStorageSpy.mockResolvedValueOnce(mockDeploymentStorage);

    const result = await controller.postAddDeployment(mockDto);
    expect(result).toEqual(mockDeployment);
    expect(userService.findAll).toHaveBeenCalled();
    expect(deploymentStorageSpy).toHaveBeenCalledWith('mockFireBrigadeId');
    expect(deploymentRepository.save).toHaveBeenCalled();
  });

  it('postAddPicture should add a new picture to a deployment', async () => {
    const mockFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mockPictureData'),
    } as Express.Multer.File;
    const mockDeployment = new Deployment();
    mockDeployment.deploymentId = 'mockDeploymentId';
    mockDeployment.pictures = [];
    const mockDeploymentPicture = new DeploymentPicture();
    mockDeploymentPicture.id = 'mockPictureId';
    mockDeploymentPicture.picture = mockFile.buffer;
    mockDeploymentPicture.deployment = mockDeployment;

    queryRunner.manager.findOne = jest.fn().mockResolvedValueOnce(mockDeployment);
    queryRunner.manager.save = jest.fn().mockResolvedValueOnce(mockDeploymentPicture);

    await controller.postAddPicture(mockFile, 'mockId');
    expect(dataSource.createQueryRunner).toHaveBeenCalled();
    expect(queryRunner.manager.findOne).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalled();
  });

  it('postAddPicture should not add picture if mimetype is incorrect', async () => {
    const mockFile = {
      mimetype: 'text/plain',
      buffer: Buffer.from('mockPicture'),
    } as Express.Multer.File;
    const addPictureSpy = jest.spyOn(service, 'addPicture');

    await controller.postAddPicture(mockFile, 'mockId');
    expect(addPictureSpy).not.toHaveBeenCalled();
  });

  it('postAddPicture should handle error during picture addition', async () => {
    const mockFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('mockPicture'),
    } as Express.Multer.File;
    queryRunner.manager.findOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await controller.postAddPicture(mockFile, 'mockId');
    expect(dataSource.createQueryRunner).toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
