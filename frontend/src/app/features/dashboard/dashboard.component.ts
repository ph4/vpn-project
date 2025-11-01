// src/app/pages/dashboard/dashboard.component.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Subscription, VpnConfiguration } from '../../core/api.service';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  protected loading = signal(true);
  protected activeSubscription = signal<Subscription | null>(null);
  protected vpnConfigurations = signal<VpnConfiguration[]>([]);
  protected activeConfigs = signal(0);
  protected maxConfigs = signal(0);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.apiService.getActiveSubscription().subscribe({
      next: (subscription) => {
        this.activeSubscription.set(subscription);
        this.maxConfigs.set(subscription.max_configurations);
      },
      error: () => this.activeSubscription.set(null),
    });

    this.apiService.getVpnConfigurations().subscribe({
      next: (configs) => {
        this.vpnConfigurations.set(configs);
        this.activeConfigs.set(configs.filter((c) => c.status === 'active').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
