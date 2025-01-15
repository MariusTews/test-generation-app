import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Person } from './person.schema';
import { Model } from 'mongoose';
import { MongoIdPipe } from '../../pipe/mongo-id.pipe';
import { ExportHelper } from '../../util/export-helper';
import { Contract } from '../contract';
import { Arrangement } from '../arrangement';
import { CommitteeEntry } from '../committee/committee-entry';
import { Membership } from '../membership';
import { Committee } from '../committee';
import { Relationship } from '../relationship';
import { Tag } from '../tag';
import { Project } from '../project';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Institute } from '../institute';
import { CollectionNames } from '../../constants/collection-names';
import { ContractTypes } from '../contract/contract-type/contract-types';
import { MembershipTypes } from '../membership/membership-types';
import { ArrangementTypes } from '../arrangement/arrangement-types';
import { PersonDto } from './person.dto';
import { Workbook } from 'exceljs';
import { getFullPersonName } from '../../util/person.helper';
import { RelationshipTypes } from '../relationship/relationship-types';

describe('PersonController', () => {
  let controller: PersonController;
  let service: PersonService;
  let personModel: Model<Person>;
  let contractModel: Model<Contract>;
  let arrangementModel: Model<Arrangement>;
  let committeeEntryModel: Model<CommitteeEntry>;
  let membershipModel: Model<Membership>;
  let committeeModel: Model<Committee>;
  let relationshipModel: Model<Relationship>;
  let tagModel: Model<Tag>;
  let projectModel: Model<Project>;
  let contractTypeModel: Model<ContractType>;
  let instituteModel: Model<Institute>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [
        PersonService,
        {
          provide: getModelToken('personsv3'),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: getModelToken('contractsv3'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('arrangements'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('committeeentries'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('memberships'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('committees'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue({ name: 'Test Committee' }),
          },
        },
        {
          provide: getModelToken('relationshipsv3'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('tags'),
          useValue: {
            findById: jest.fn().mockResolvedValue({ value: 'Test Tag' }),
          },
        },
        {
          provide: getModelToken('projects'),
          useValue: {
            findById: jest.fn().mockResolvedValue({ acronym: 'Test Project' }),
          },
        },
        {
          provide: getModelToken('contracttypes'),
          useValue: {
            findById: jest
              .fn()
              .mockResolvedValue({ short: 'Test Contract Type' }),
          },
        },
        {
          provide: getModelToken('institutesv3'),
          useValue: {
            findById: jest.fn().mockResolvedValue({ name: 'Test Institute' }),
          },
        },
      ],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    service = module.get<PersonService>(PersonService);
    personModel = module.get(getModelToken(CollectionNames.PERSONS_V3));
    contractModel = module.get(getModelToken(CollectionNames.CONTRACTS_V3));
    arrangementModel = module.get(getModelToken(CollectionNames.ARRANGEMENTS));
    committeeEntryModel = module.get(
      getModelToken(CollectionNames.COMMITTEE_ENTRIES),
    );
    membershipModel = module.get(getModelToken(CollectionNames.MEMBERSHIPS));
    committeeModel = module.get(getModelToken(CollectionNames.COMMITTEES));
    relationshipModel = module.get(
      getModelToken(CollectionNames.RELATIONSHIPS_V3),
    );
    tagModel = module.get(getModelToken(CollectionNames.TAGS));
    projectModel = module.get(getModelToken(CollectionNames.PROJECTS));
    contractTypeModel = module.get(
      getModelToken(CollectionNames.CONTRACT_TYPES),
    );
    instituteModel = module.get(getModelToken(CollectionNames.INSTITUTES_V3));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a person', async () => {
      const mockPerson = { _id: '123', firstName: 'test', lastName: 'user' };
      jest.spyOn(personModel, 'findById').mockResolvedValue(mockPerson);
      const result = await controller.getOne('123');
      expect(personModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockPerson);
    });
    it('should return null if person not found', async () => {
      jest.spyOn(personModel, 'findById').mockResolvedValue(null);
      const result = await controller.getOne('456');
      expect(personModel.findById).toHaveBeenCalledWith('456');
      expect(result).toEqual(null);
    });
  });

  describe('getAll', () => {
    it('should return an array of persons', async () => {
      const mockQuery = {
        and: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue([
            { _id: '1', firstName: 'Test', lastName: 'User' },
          ]),
      };
      jest.spyOn(personModel, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(committeeModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ _id: '123', name: 'Test Committee' }]),
      } as any);
      jest.spyOn(committeeEntryModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ personId: '1', committeeId: '123' }]),
        map: jest.fn().mockReturnValue(['1']),
      } as any);
      jest.spyOn(contractModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ personId: '1', type: ContractTypes.sciAssCo }]),
      } as any);
      jest.spyOn(arrangementModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ personId: '1', type: ArrangementTypes.guest }]),
        map: jest.fn().mockReturnValue(['1']),
      } as any);
      jest.spyOn(relationshipModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ personId: '1', type: 'ProjectPartner' }]),
        map: jest.fn().mockReturnValue(['1']),
      } as any);
      jest.spyOn(membershipModel, 'find').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            { personId: '1', type: MembershipTypes.professor },
          ]),
        map: jest.fn().mockReturnValue(['1']),
      } as any);
      jest.spyOn(tagModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ value: 'Test Tag' }),
      } as any);

      const queryParams = {
        name: 'Test User',
        female: true,
        thesis: true,
        current: true,
        graduateSchool: true,
        habilitation: true,
        postDoc: true,
        committeeId: '123',
        sciAss: true,
        contractType: ContractTypes.sciAssCo,
        arrangementType: ArrangementTypes.guest,
        relationshipType: 'ProjectPartner',
        member: true,
        sciMember: true,
        membershipType: MembershipTypes.professor,
        page: 1,
        sortBy: 'lastName',
        sortOrder: 1,
        select: 'firstName lastName',
        selectSpecific: 'firstName',
      };
      const result = await controller.getAll(queryParams);
      expect(personModel.find).toHaveBeenCalled();
      expect(mockQuery.collation).toHaveBeenCalledWith({
        locale: 'de@collation=phonebook',
      });
      expect(mockQuery.sort).toHaveBeenCalledWith([['lastName', 1]]);
      expect(mockQuery.and).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith(['firstName']);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      const mockId = '123';
      const mockDto = { firstName: 'updated' } as PersonDto;
      const mockPerson = {
        _id: mockId,
        firstName: 'updated',
        lastName: 'user',
      };
      jest.spyOn(personModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerson),
      } as any);
      const result = await controller.update(mockId, mockDto);
      expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        { $set: mockDto },
        { new: true },
      );
      expect(result).toEqual(mockPerson);
    });
  });

  describe('delete', () => {
    it('should delete a person', async () => {
      const mockId = '123';
      const mockPerson = { _id: mockId, firstName: 'test', lastName: 'user' };
      jest.spyOn(personModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerson),
      } as any);
      const result = await controller.delete(mockId);
      expect(personModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockPerson);
    });
  });

  describe('getAllTable', () => {
    it('should return a workbook', async () => {
      const queryParams = {
        sortBy: 'firstName',
        sortOrder: -1,
        page: 0,
        selectSpecific: 'firstName',
      };
      const mockPersons = [
        {
          title: 'Dr.',
          lastName: 'Test',
          firstName: 'User',
          phoneWork: '1234567',
          emailWork: 'test@user.com',
          calculatedEmploymentEnd: new Date(),
        },
      ];
      jest.spyOn(service, 'getAll').mockResolvedValue(mockPersons as Person[]);
      jest.spyOn(committeeModel, 'findById').mockResolvedValue(undefined);
      const workbook = await service.getAllTable(queryParams);
      expect(workbook).toBeDefined();
    });
  });

  describe('getOverview', () => {
    it('should return a workbook', async () => {
      const mockPerson = {
        _id: '123',
        firstName: 'Test',
        lastName: 'User',
        title: 'Dr.',
        gender: 'male',
        roomNumber: '123',
        current: true,
        member: true,
        extern: false,
        phoneWork: '1234567',
        emailWork: 'test@user.com',
        calculatedEmploymentEnd: new Date(),
      };
      const contract = new Contract();
      contract.calculatedEnd = new Date();
      contract.type = 'Ats';
      contract.projectId = 'projectId1';
      contract.calculatedVte = 100;
      contract.limited = true;
      const committeeEntry = new CommitteeEntry();
      committeeEntry.comment = 'Committee Entry Comment';
      const committee = new Committee();
      committee.name = 'Test Committee';
      const arrangement = new Arrangement();
      arrangement.type = ArrangementTypes.guest;
      arrangement.comment = 'Arrangement Comment';
      const relationship = new Relationship();
      relationship.type = RelationshipTypes.projectPartner;
      relationship.comment = 'Relationship Comment';
      const membership = new Membership();
      membership.type = MembershipTypes.professor;
      membership.comment = 'Membership Comment';
      jest.spyOn(personModel, 'findById').mockResolvedValue(mockPerson);
      jest
        .spyOn(contractModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([contract]),
        } as any);
      jest;
      jest
        .spyOn(relationshipModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([relationship]),
        } as any);
      jest
        .spyOn(arrangementModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([arrangement]),
        } as any);
      jest
        .spyOn(committeeEntryModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([committeeEntry]),
        } as any);
      jest
        .spyOn(committeeModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(committee),
        } as any);
      jest
        .spyOn(membershipModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([membership]),
        } as any);
      jest.spyOn(tagModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ value: 'Test Tag' }),
      } as any);
      jest.spyOn(projectModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ acronym: 'Test Project' }),
      } as any);
      jest.spyOn(contractTypeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ short: 'Test Contract Type' }),
      } as any);
      jest.spyOn(instituteModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Test Institute' }),
      } as any);

      const workbook = await service.getOverview('123');
      expect(workbook).toBeDefined();
      expect(personModel.findById).toHaveBeenCalledWith('123');
    });
  });
});
