import { Test, TestingModule } from '@nestjs/testing';
import { AddRetoController } from './add-reto.controller';
import { AddRetoService } from './add-reto.service';

describe('AddRetoController', () => {
  let addRetoController: AddRetoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AddRetoController],
      providers: [AddRetoService],
    }).compile();

    addRetoController = app.get<AddRetoController>(AddRetoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(addRetoController.getHello()).toBe('Hello World!');
    });
  });
});
