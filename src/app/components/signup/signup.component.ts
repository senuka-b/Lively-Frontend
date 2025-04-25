import { Component } from '@angular/core';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  signup(): void {
    this.authService
      .signup({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .subscribe(
        (response) => {
          this.router.navigate(['/login']); // Redirect to login after successful signup
        },
        (error) => {
          console.error('Signup failed', error);
        }
      );
  }
}
