import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly circuitBreakerByHandler = new WeakMap<
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function,
    CircuitBreaker
  >();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodRef = context.getHandler();

    let circuitBreaker: CircuitBreaker;
    if (this.circuitBreakerByHandler.has(methodRef)) {
      circuitBreaker = this.circuitBreakerByHandler.get(methodRef);
    } else {
      circuitBreaker = new CircuitBreaker({
        successThreshold: 3,
        failureThreshold: 3,
        openToHalfOpenWaitTime: 60000,
        fallback: () => {
          throw new ServiceUnavailableException(
            'Service unavailable. Please try again later.',
          );
        },
      });
      this.circuitBreakerByHandler.set(methodRef, circuitBreaker);
    }

    return circuitBreaker.exec(next).pipe(
      catchError(() => {
        return throwError(() => new InternalServerErrorException());
      }),
    );
  }
}
