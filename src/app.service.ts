import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  getData() {
    console.log(`getData called at ${new Date()}`);

    const response = this.httpService.get(
      'https://jsonplaceholder.typicode.com/posts',
    );
    return firstValueFrom(
      response.pipe(
        map((res) => res.data),
        catchError(() => {
          throw new InternalServerErrorException(
            'Failed to fetch data from the service',
          );
        }),
      ),
    );
  }
}
