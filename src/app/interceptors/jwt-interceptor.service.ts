import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenStorageService } from '../service/token-storage/token-storage.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserToken = this.tokenStorageService.getToken();

    if (currentUserToken) {
      let clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUserToken}`,
        },
      });

      return next.handle(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token is invalid or expired, redirect to login
            this.router.navigate(['/login']);
          }
          return throwError(() => new Error(error.message));
          
        })
      );
    }

    return next.handle(req);
  }


}
