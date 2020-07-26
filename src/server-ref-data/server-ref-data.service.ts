import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerPermission } from './server-permission.entity';
import { Codec } from './codec.entity';
import { ServerPermissionRepository } from './server-permission.repository';
import { CodecRepository } from './codec.repository';

@Injectable()
export class ServerRefDataService {
  constructor(
    @InjectRepository(ServerPermissionRepository)
    private permRepository: ServerPermissionRepository,
    @InjectRepository(CodecRepository)
    private codecRepository: CodecRepository,
  ) {}

  getAllPermissions(): Promise<ServerPermission[]> {
    return this.permRepository.find();
  }

  getAllCodecs(): Promise<Codec[]> {
    return this.codecRepository.find();
  }

  async checkCodecExists(id: number): Promise<boolean> {
    const codec = await this.codecRepository.count({
      where: { id }
    });

    return codec > 0;
  }
}
