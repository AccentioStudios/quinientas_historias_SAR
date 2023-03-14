import { Injectable } from '@nestjs/common';

@Injectable()
export class RetosService {
  async addReto(): Promise<any> {
    return {data:'furula el hfe!'};
  }
}
