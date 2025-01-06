import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import CreateDeploymentDto from './createDeploymentDto';
import Deployment from './deployment.entity';
import DeploymentStorage from '../deployment/deploymentStorage.entity';
import DeploymentPicture from '../deployment/deploymentPicture.entity';
import User from '../user/user.entity';
import { DataSource } from 'typeorm';
import { UserService } from '../user/user.service';
import UserCredentials from '../user/userCredentials.entity';
import CertifiedCourse from '../user/certifiedCourse.entity';

describe('DeploymentController', () => {
  let controller: DeploymentController;
  let service: DeploymentService;
  let deploymentRepository: Repository<Deployment>;
  let deploymentStorageRepository: Repository<DeploymentStorage>;
  let deploymentPictureRepository: Repository<DeploymentPicture>;
  let userService: UserService;
  let queryRunner: any;
  let dataSource: DataSource;

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
          provide: getRepositoryToken(DeploymentStorage),
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
              },
            } as any),
          },
        },
      ],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
    service = module.get<DeploymentService>(DeploymentService);
    userService = module.get<UserService>(UserService);
    deploymentRepository = module.get<Repository<Deployment>>(getRepositoryToken(Deployment));
    deploymentStorageRepository = module.get<Repository<DeploymentStorage>>(getRepositoryToken(DeploymentStorage));
    deploymentPictureRepository = module.get<Repository<DeploymentPicture>>(getRepositoryToken(DeploymentPicture));
    jest.spyOn(userService, 'findAll').mockResolvedValueOnce([new User()]);
    dataSource = module.get(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllDeployments should return all deployments', async () => {
    const mockDeployments: Deployment[] = [new Deployment(), new Deployment()];
    jest.spyOn(deploymentRepository, 'find').mockResolvedValueOnce(mockDeployments);
    const deployments = await controller.getAllDeployments();
    expect(deployments).toBe(mockDeployments);
  });

  it('getDeployment should return a specific deployment', async () => {
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = '1';
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    const deployment = await controller.getDeployment('1');
    expect(deployment).toBe(mockDeployment);
  });

  it('getDeployment should return null if deployment not found', async () => {
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(null);
    const deployment = await controller.getDeployment('1');
    expect(deployment).toBeNull();
  });

  it('getAllPictures should return all pictures of a deployment', async () => {
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = '1';
    mockDeployment.pictures = [new DeploymentPicture()];
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    const pictures = await controller.getAllPictures('1');
    expect(pictures).toBeDefined();
  });

  it('getAllPictures should return empty array if no pictures found', async () => {
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = '1';
    mockDeployment.pictures = [];
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(mockDeployment);
    const pictures = await controller.getAllPictures('1');
    expect(pictures).toEqual([]);
  });

  it('postAddDeployment should create a new deployment', async () => {
    const mockDeploymentStorage = new DeploymentStorage();
    const mockDto: CreateDeploymentDto = new CreateDeploymentDto();
    mockDto.deploymentTitle = 'Test Deployment';
    mockDto.location = 'Test Location';
    mockDto.description = 'Test Description';
    mockDto.date = '2024-01-26';
    mockDto.user = ['1'];
    mockDto.fireBrigadeId = '1';
    const mockCreatedDeployment: Deployment = new Deployment();
    mockCreatedDeployment.deploymentId = '1';
    jest.spyOn(service, 'getDeploymentStorageByFireBrigadeId').mockResolvedValueOnce(mockDeploymentStorage as any);
    jest.spyOn(deploymentRepository, 'save').mockResolvedValueOnce(mockCreatedDeployment as any);
    const deployment = await controller.postAddDeployment(mockDto);
    expect(deployment).toBe(mockCreatedDeployment);
    expect(deploymentRepository.save).toHaveBeenCalled();
  });

  it('postAddPicture should add a new picture to a deployment', async () => {
    const mockFile = { mimetype: 'image/jpeg', buffer: Buffer.from('test') } as Express.Multer.File;
    const mockDeployment: Deployment = new Deployment();
    mockDeployment.deploymentId = '1';
    mockDeployment.pictures = [];
    const mockDeploymentPicture = new DeploymentPicture();
    mockDeploymentPicture.id = '1';
    mockDeploymentPicture.picture = Buffer.from('test');
    mockDeploymentPicture.deployment = mockDeployment;

    jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce(mockDeployment);
    jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce(mockDeploymentPicture);
    await controller.postAddPicture(mockFile, '1');
    expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Deployment, {
      where: { deploymentId: '1' },
      relations: ['pictures'],
    });
    expect(queryRunner.manager.save).toHaveBeenCalled();
  });

  it('postAddPicture should not add picture if mimetype is incorrect', async () => {
    const mockFile = { mimetype: 'image/gif', buffer: Buffer.from('test') } as Express.Multer.File;
    const findOneSpy = jest.spyOn(queryRunner.manager, 'findOne');
    const saveSpy = jest.spyOn(queryRunner.manager, 'save');
    await controller.postAddPicture(mockFile, '1');
    expect(findOneSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('postAddPicture should handle error during picture addition', async () => {
    const mockFile = { mimetype: 'image/jpeg', buffer: Buffer.from('test') } as Express.Multer.File;
    jest.spyOn(queryRunner.manager, 'findOne').mockRejectedValueOnce(new Error('Test Error'));
    await expect(controller.postAddPicture(mockFile, '1')).rejects.toThrowError('Test Error');
  });

  it('getDeployment should throw an error if deployment not found', async () => {
    jest.spyOn(deploymentRepository, 'findOne').mockResolvedValueOnce(undefined);
    await expect(controller.getDeployment('1')).rejects.toThrow();
  });
});
