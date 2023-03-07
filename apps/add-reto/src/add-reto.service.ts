import { Injectable } from '@nestjs/common';

@Injectable()
export class AddRetoService {
  getHello(): string {
    return 'Hello World!';
  }
}
