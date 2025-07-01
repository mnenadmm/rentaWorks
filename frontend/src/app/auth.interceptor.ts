import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ako se izvršava na serveru (SSR), ne koristi localStorage
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Ako je greška 401 i nije login/refresh zahtev, pokušaj refresh token
        if (
          error.status === 401 &&
          !req.url.includes('/login') &&
          !req.url.includes('/refresh')
        ) {
          return this.authService.refreshToken().pipe(
            switchMap(response => {
              const newToken = response.access_token;
              if (!newToken) {
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
                return throwError(() => new Error('Neuspešno osveženje tokena'));
              }

              localStorage.setItem('token', newToken);

              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });

              return next.handle(newReq);
            }),
            catchError(err => {
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
