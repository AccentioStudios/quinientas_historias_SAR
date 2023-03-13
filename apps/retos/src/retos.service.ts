import { Injectable } from '@nestjs/common';

@Injectable()
export class RetosService {
  async addReto(): Promise<any> {
    console.log("pase por aca")
    return {data:'Hello World!'};
  }
}
