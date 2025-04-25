import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenStorageService } from '../service/token-storage/token-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenStorageService.getToken();

    if (token) {
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });

      return next.handle(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token is invalid or ecpired

            this.router.navigate(['/login']);
          }
          return throwError(() => new Error(error.message));
        })
      );
    } else {
      return next.handle(req);
    }
  }


}
