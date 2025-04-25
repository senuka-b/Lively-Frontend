import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../service/token-storage/token-storage.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private tokenStorageService: TokenStorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserToken = this.tokenStorageService.getToken();

    if (currentUserToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUserToken}`,
        },
      });
    }

    return next.handle(req);
  }


}
