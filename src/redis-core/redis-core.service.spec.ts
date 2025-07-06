import { Test, TestingModule } from '@nestjs/testing';
import { RedisCoreService } from './redis-core.service';

describe('RedisCoreService', () => {
  let service: RedisCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisCoreService],
    }).compile();

    service = module.get<RedisCoreService>(RedisCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
