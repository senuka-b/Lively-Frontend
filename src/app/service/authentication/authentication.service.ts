import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenStorageService } from '../token-storage/token-storage.service';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../model/AuthResponse';
import {jwtDecode} from 'jwt-decode';
import { User } from '../../model/User';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = 'http://localhost:8080/api/auth'; // Replace with your API URL

  constructor(
    private http: HttpClient,
    private tokenStorageService: TokenStorageService
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  saveToken(token: string): void {
    this.tokenStorageService.saveToken(token);
  }

  logout(): void {
    this.tokenStorageService.removeToken();
  }

  isTokenValid(): boolean {
    const token = this.tokenStorageService.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = decoded.exp * 1000; 
      const currentDate = new Date().getTime();

      return currentDate < expirationDate;
    } catch (e) {
      return false; 
    }
  }

  isLoggedIn(): boolean {
    let token = this.tokenStorageService.getToken();

    if (!token) {
      return false;
    }

    return this.isTokenValid();

  }

  signup(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user);
  }
}
