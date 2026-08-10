import { Module } from '@nestjs/common';
import { DatController } from './dat.controller';
import { DatService } from './dat.service';

@Module({
  controllers: [DatController],
  providers: [DatService],
  exports: [DatService],
})
export class DatModule {}
