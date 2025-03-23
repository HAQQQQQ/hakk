import { Test, TestingModule } from '@nestjs/testing';
import { RedisTestService } from './redis-test.service';

describe('RedisTestService', () => {
  let service: RedisTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisTestService],
    }).compile();

    service = module.get<RedisTestService>(RedisTestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
