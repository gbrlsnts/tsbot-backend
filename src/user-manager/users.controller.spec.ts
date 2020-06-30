import { Test, TestingModule } from '@nestjs/testing';
import { UserManagerController } from './user-manager.controller';

describe('Users Controller', () => {
  let controller: UserManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagerController],
    }).compile();

    controller = module.get<UserManagerController>(UserManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
