import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<header class="header">
    <h1>VPN Dashboard</h1>
    <nav>
      <a routerLink="/subscriptions" class="nav-link">Subscriptions</a>
      <a routerLink="/vpn-configurations" class="nav-link">VPN Configs</a>
      <button class="btn-danger">Logout</button>
    </nav>
  </header>`,
  styles: [
    `
      @use 'variables' as *;
      .header {
        background: white;
        padding: 1.5rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header h1 {
        margin: 0;
        font-size: $font-size-xl;
        color: $color-text;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        text-decoration: none;
        color: $color-text-light;
        border-radius: 4px;
        transition: background 0.3s;

        &:hover {
          background: $color-secondary-hover;
        }
      }

      nav {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
    `,
  ],
})
export class HeaderComponent {}
