import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconRepository } from './icon.repository';
import { IconContentRepository } from './icon-content.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IconRepository, IconContentRepository])],
})
export class IconsModule {}
