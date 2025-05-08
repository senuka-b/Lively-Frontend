import { Component } from '@angular/core';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin = true;
  username = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.route.data?.subscribe((data) => {
      this.isLogin = data['isLogin'];
    })

  }


  onSubmit() {
    // Handle form submission
    console.log('Form submitted', {
      username: this.username,
      email: this.email,
      password: this.password
    });
  }
}
