import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../service/token-storage/token-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserToken = this.tokenStorageService.getToken();

    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
      return next.handle(req); // Bypass interceptor
    }


    console.log("Intercepting request...");
    

    if (currentUserToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUserToken}`,
        },
      });
    } else {
    
      console.log('No token found, redirecting to login...');


        this.router.navigate(['/login']);
    
      
    }

    return next.handle(req);
  }


}
