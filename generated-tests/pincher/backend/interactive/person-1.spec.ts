import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Model } from 'mongoose';
import { Person } from './person.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from '../../auth/auth.guard';
import { ExportHelper } from '../../util/export-helper';
import { Workbook } from 'exceljs';
import { Arrangement } from '../arrangement';
import { getModelToken as getModelToken2 } from '@nestjs/mongoose';
import { CommitteeEntry } from '../committee/committee-entry';
import { Committee } from '../committee/committee.schema';
import { Membership } from '../membership/membership.schema';
import { Relationship } from '../relationship/relationship.schema';
import { Tag } from '../tag/tag.schema';
import { Project } from '../project/project.schema';
import { ContractType } from '../contract/contract-type/contract-type.schema';
import { Institute } from '../institute/institute.schema';
import { Contract } from '../contract/contract.schema';
import { Qualification } from './model/qualification';
import { SciTimeVG } from './model/sciTimeVG';
import { Workdays } from './model/workday.enum';
import { PersonDto } from './person.dto';
import { Status } from './model/qualification';
import { ArrangementTypes } from '../arrangement/arrangement-types';
import { MembershipTypes } from '../membership/membership-types';
import { RelationshipTypes } from '../relationship/relationship-types';
import { ContractTypes } from '../contract/contract-type/contract-types';

describe('PersonController', () => {
  let controller: PersonController;
  let service: PersonService;
  let contractModel: Model<Contract>;
  let committeeEntryModel: Model<CommitteeEntry>;
  let committeeModel: Model<Committee>;
  let arrangementModel: Model<Arrangement>;
  let relationshipModel: Model<Relationship>;
  let membershipModel: Model<Membership>;
  let tagModel: Model<Tag>;
  let projectModel: Model<Project>;
  let contractTypeModel: Model<ContractType>;
  let instituteModel: Model<Institute>;
  let personModel: Model<Person>;
  let mockPerson1: Person;
  let mockPerson2: Person;
  let mockPersons: Person[];
  let mockPersonDto: PersonDto;
  let mockWorkbook: Workbook;

  beforeEach(async () => {
    mockPerson1 = {
      id: '1',
      firstName: 'Test1',
      lastName: 'User1',
      bornLastName: 'OldLastName',
      title: 'Dr.',
      gender: 'male',
      member: true,
      extern: true,
      current: true,
      currentActivities: ['testActivity'],
      former: true,
      roomNumber: '123',
      emailWork: 'test@example.com',
      phoneWork: '123456789',
      certificate: true,
      rank: 'Professor',
      instituteId: 'instId1',
      subInstituteId: 'subInstId1',
      subInstitute: 'Sub Institute',
      company: 'Test Company',
      street: 'Test Street',
      streetNo: '1',
      additional: 'Additional Address Info',
      plz: '12345',
      town: 'Test Town',
      country: 'Germany',
      candidature: true,
      firstApplication: '2023-10-26',
      sciTimeVGs: [{ date: new Date(), reasonId: 'reasonId1' } as SciTimeVG],
      retirement: new Date('2030-10-26'),
      timeUsedUp: true,
      teamIds: ['teamId1'],
      workdays: [Workdays.monday, Workdays.tuesday],
      loanIT: true,
      device: 'Laptop',
      inventoryNumber: '1234567890',
      loanEnd: new Date('2024-10-26'),
      emailExtension: true,
      emailExtensionEnd: new Date('2025-10-26'),
      qualification: ['Qualification1'],
      thesis: {
        status: Status.finished,
        firstSupervisorId: 'supId1',
        firstSupervisorAlt: 'Supervisor Alt',
        secondSupervisorId: 'supId2',
        secondSupervisorAlt: 'Second Supervisor Alt',
        dateAcceptance: new Date(),
        dateExpiryAcceptance: new Date(),
        thesisTitle: 'Thesis Title',
        enlisted: true,
        endDate: new Date(),
        testLectureTitle: 'Test Lecture Title',
        isFirstSupervisor: true,
        isSecondSupervisor: true,
        extern: true,
        comment: 'Thesis Comment',
        country: 'Germany',
        university: 'Test University',
        denomination: 'Dr.',
        gsBeginSemester: 'WS2023/24',
        gsCompleted: true,
        gsCanceled: false,
      } as Qualification,
      habilitation: {
        status: Status.inProgress,
        firstSupervisorId: 'habSupId1',
      } as Qualification,
      professorship: {
        status: Status.submitted,
        dateAcceptance: new Date(),
        professorshipInstituteId: 'profInstId1',
        professorshipCalling: new Date(),
      } as Qualification,
      newsletter: true,
      calculatedVteSum: 100,
      calculatedEmploymentEnd: new Date('2024-10-26'),
      comment: 'Person Comment',
    };
    mockPerson2 = {
      id: '2',
      firstName: 'Test2',
      lastName: 'User2',
      bornLastName: '',
      title: '',
      gender: '',
      member: false,
      extern: false,
      current: false,
      currentActivities: [],
      former: false,
      roomNumber: '',
      emailWork: '',
      phoneWork: '',
      certificate: false,
      rank: '',
      instituteId: '',
      subInstituteId: '',
      subInstitute: '',
      company: '',
      street: '',
      streetNo: '',
      additional: '',
      plz: '',
      town: '',
      country: '',
      candidature: false,
      firstApplication: '',
      sciTimeVGs: [],
      retirement: new Date(),
      timeUsedUp: false,
      teamIds: [],
      workdays: [],
      loanIT: false,
      device: '',
      inventoryNumber: '',
      loanEnd: new Date(),
      emailExtension: false,
      emailExtensionEnd: new Date(),
      qualification: [],
      thesis: new Qualification(),
      habilitation: new Qualification(),
      professorship: new Qualification(),
      newsletter: false,
      calculatedVteSum: 0,
      calculatedEmploymentEnd: new Date(),
      comment: '',
    };
    mockPersons = [mockPerson1, mockPerson2];
    mockPersonDto = {
      firstName: 'Test',
      lastName: 'User',
      bornLastName: '',
      title: '',
      gender: '',
      member: false,
      extern: false,
      current: false,
      currentActivities: [],
      former: false,
      roomNumber: '',
      emailWork: '',
      phoneWork: '',
      certificate: false,
      rank: '',
      instituteId: '',
      subInstituteId: '',
      subInstitute: '',
      company: '',
      street: '',
      streetNo: '',
      additional: '',
      plz: '',
      town: '',
      country: '',
      candidature: false,
      firstApplication: '',
      sciTimeVGs: [],
      retirement: new Date(),
      timeUsedUp: false,
      teamIds: '',
      workdays: [],
      loanIT: false,
      device: '',
      inventoryNumber: '',
      loanEnd: new Date(),
      emailExtension: false,
      emailExtensionEnd: new Date(),
      qualification: [],
      thesis: new Qualification(),
      habilitation: new Qualification(),
      professorship: new Qualification(),
      newsletter: false,
      calculatedVteSum: 0,
      calculatedEmploymentEnd: new Date(),
      comment: '',
    };
    mockWorkbook = new Workbook() as Workbook;

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
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken('arrangements'),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken('committeeentries'),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken('memberships'),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken('committees'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('relationshipsv3'),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken('tags'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('projects'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('contracttypes'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('institutesv3'),
          useValue: {
            findById: jest.fn(),
          },
        },
        Reflector,
        RoleGuard,
        {
          provide: ExportHelper,
          useValue: {
            workbookToRes: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    service = module.get<PersonService>(PersonService);
    personModel = module.get<Model<Person>>(getModelToken('personsv3'));
    contractModel = module.get<Model<Contract>>(getModelToken('contractsv3'));
    committeeEntryModel = module.get<Model<CommitteeEntry>>(
      getModelToken('committeeentries'),
    );
    arrangementModel = module.get<Model<Arrangement>>(
      getModelToken('arrangements'),
    );
    relationshipModel = module.get<Model<Relationship>>(
      getModelToken('relationshipsv3'),
    );
    membershipModel = module.get<Model<Membership>>(
      getModelToken('memberships'),
    );
    tagModel = module.get<Model<Tag>>(getModelToken('tags'));
    projectModel = module.get<Model<Project>>(getModelToken('projects'));
    contractTypeModel = module.get<Model<ContractType>>(
      getModelToken('contracttypes'),
    );
    instituteModel = module.get<Model<Institute>>(
      getModelToken('institutesv3'),
    );
    committeeModel = module.get<Model<Committee>>(getModelToken('committees'));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      const mockPerson: Person = {
        id: 'testId',
        firstName: 'Test',
        lastName: 'User',
        bornLastName: '',
        title: '',
        gender: '',
        member: false,
        extern: false,
        current: false,
        currentActivities: [],
        former: false,
        roomNumber: '',
        emailWork: '',
        phoneWork: '',
        certificate: false,
        rank: '',
        instituteId: '',
        subInstituteId: '',
        subInstitute: '',
        company: '',
        street: '',
        streetNo: '',
        additional: '',
        plz: '',
        town: '',
        country: '',
        candidature: false,
        firstApplication: '',
        sciTimeVGs: [],
        retirement: new Date(),
        timeUsedUp: false,
        teamIds: [],
        workdays: [],
        loanIT: false,
        device: '',
        inventoryNumber: '',
        loanEnd: new Date(),
        emailExtension: false,
        emailExtensionEnd: new Date(),
        qualification: [],
        thesis: new Qualification(),
        habilitation: new Qualification(),
        professorship: new Qualification(),
        newsletter: false,
        calculatedVteSum: 0,
        calculatedEmploymentEnd: new Date(),
        comment: '',
      };
      jest
        .spyOn(personModel, 'create')
        .mockImplementation(() => Promise.resolve(mockPerson));

      const result = await controller.create(mockPersonDto);

      expect(personModel.create).toHaveBeenCalledWith(mockPersonDto);
      expect(result).toEqual(mockPerson);
    });
  });

  describe('getOne', () => {
    it('should return a person by id', async () => {
      const mockId = 'mockId';
      jest.spyOn(personModel, 'findById').mockResolvedValue(mockPerson1);
      const result = await controller.getOne(mockId);
      expect(result).toEqual(mockPerson1);
      expect(personModel.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('getAll', () => {
    it('should return all persons', async () => {
      const queryParams = {
        name: 'Test User',
        female: true,
        thesis: true,
        current: true,
        graduateSchool: true,
        habilitation: true,
        postDoc: true,
        committeeId: 'committeeId1',
        sciAss: true,
        contractType: ContractTypes.sciAssCo,
        arrangementType: ArrangementTypes.guest,
        relationshipType: RelationshipTypes.projectPartner,
        member: true,
        sciMember: true,
        membershipType: MembershipTypes.professor,
        planned: true,
        sortBy: 'firstName',
        sortOrder: -1,
        select: 'firstName lastName',
        page: 1,
      };

      const mockCommittee = { name: 'Beirat' };
      jest.spyOn(committeeModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCommittee]),
      } as any);
      const mockCommitteeEntries: CommitteeEntry[] = [
        { committeeId: 'committeeId1', personId: '1' } as CommitteeEntry,
        { committeeId: 'committeeId1', personId: '2' } as CommitteeEntry,
      ];
      jest.spyOn(committeeEntryModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommitteeEntries),
        map: jest.fn().mockReturnThis(),
      } as any);
      jest.spyOn(contractModel, 'find').mockResolvedValue([{ personId: '1' }]);
      jest.spyOn(arrangementModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ personId: '1' }]),
      } as any);
      jest.spyOn(relationshipModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ personId: '1' }]),
        map: jest.fn().mockReturnThis(),
      } as any);
      jest.spyOn(membershipModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ personId: '1' }]),
        map: jest.fn().mockReturnThis(),
      } as any);
      jest.spyOn(personModel, 'find').mockReturnValue({
        and: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPersons),
      } as any);

      const result = await controller.getAll(queryParams);
      expect(result).toBeDefined();
      expect(personModel.find).toHaveBeenCalledWith();
      expect(personModel.find().and).toHaveBeenCalled();
      expect(personModel.find().collation).toHaveBeenCalled();
      expect(personModel.find().sort).toHaveBeenCalled();
      expect(personModel.find().limit).toHaveBeenCalled();
      expect(personModel.find().skip).toHaveBeenCalled();
      expect(personModel.find().where).toHaveBeenCalled();
      expect(personModel.find().select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      const mockId = '1';
      jest.spyOn(personModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerson1),
      } as any);
      const result = await controller.update(mockId, mockPersonDto);
      expect(result).toEqual(mockPerson1);
      expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        { $set: mockPersonDto },
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a person', async () => {
      const mockId = '1';
      jest.spyOn(personModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerson1),
      } as any);
      const result = await controller.delete(mockId);
      expect(result).toEqual(mockPerson1);
      expect(personModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    });
  });

  describe('getAllTable', () => {
    it('should return a workbook', async () => {
      const queryParams = { committeeId: '0' };
      const committee = new Committee();
      committee.name = 'Test Committee';
      jest.spyOn(service, 'getAll').mockResolvedValue(mockPersons);
      jest.spyOn(committeeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(committee),
      } as any);
      const result = await service.getAllTable(queryParams);
      expect(result).toBeDefined();
      expect(service.getAll).toHaveBeenCalledWith(queryParams);
      expect(committeeModel.findById).toHaveBeenCalledWith(
        queryParams.committeeId,
      );
    });
  });

  describe('getOverview', () => {
    it('should return a workbook', async () => {
      const id = 'mockId';
      jest.spyOn(service, 'getOne').mockResolvedValue(mockPerson1);
      const contract = new Contract();
      contract.calculatedEnd = new Date();
      contract.type = 'Ats';
      contract.projectId = 'projectId1';
      contract.calculatedVte = 50;
      contract.limited = true;

      const contract2 = new Contract();
      contract2.calculatedEnd = new Date();
      contract2.type = 'Ats';
      contract2.calculatedVte = 50;
      contract2.limited = true;
      contract2.primaryTypeId = '1';

      jest.spyOn(contractModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([contract, contract2]),
      } as any);
      const committeeEntry = new CommitteeEntry();
      committeeEntry.comment = 'Committee Entry Comment';
      jest.spyOn(committeeEntryModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([committeeEntry]),
      } as any);
      const committee = new Committee();
      committee.name = 'Test Committee';
      jest.spyOn(committeeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(committee),
      } as any);
      const arrangement = new Arrangement();
      arrangement.type = ArrangementTypes.guest;
      arrangement.comment = 'Arrangement Comment';
      jest.spyOn(arrangementModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([arrangement]),
      } as any);
      const relationship = new Relationship();
      relationship.type = RelationshipTypes.projectPartner;
      relationship.comment = 'Relationship Comment';
      jest.spyOn(relationshipModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([relationship]),
      } as any);
      const membership = new Membership();
      membership.type = MembershipTypes.professor;
      membership.comment = 'Membership Comment';
      jest.spyOn(membershipModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([membership]),
      } as any);
      const tag = new Tag();
      tag.value = 'Test Tag';
      jest.spyOn(tagModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(tag),
      } as any);
      const project = new Project();
      project.acronym = 'Test Project';
      jest.spyOn(projectModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(project),
      } as any);
      const contractType = new ContractType();
      contractType.short = 'Test Contract Type';
      jest.spyOn(contractTypeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(contractType),
      } as any);
      const institute = new Institute();
      institute.name = 'Test Institute';
      institute.street = 'Test Institute Street';
      institute.streetNo = '10';
      institute.plz = '12345';
      institute.town = 'Test Institute Town';
      jest.spyOn(instituteModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(institute),
      } as any);
      jest.spyOn(personModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerson1),
      } as any);

      const result = await service.getOverview(id);
      expect(result).toBeDefined();
      expect(contractModel.find).toHaveBeenCalled();
      expect(committeeEntryModel.find).toHaveBeenCalled();
      expect(committeeModel.findById).toHaveBeenCalled();
      expect(arrangementModel.find).toHaveBeenCalled();
      expect(relationshipModel.find).toHaveBeenCalled();
      expect(membershipModel.find).toHaveBeenCalled();
      expect(tagModel.findById).toHaveBeenCalled();
      expect(projectModel.findById).toHaveBeenCalled();
      expect(contractTypeModel.findById).toHaveBeenCalled();
      expect(instituteModel.findById).toHaveBeenCalled();
      expect(personModel.findById).toHaveBeenCalled();
    });
  });
});
