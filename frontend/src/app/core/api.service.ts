import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// API Models
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  user: User;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string;
  max_configurations: number;
  created_at: string;
  updated_at: string;
}

export interface VpnConfiguration {
  id: number;
  user_id: number;
  user: User;
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'suspended';
  description: string;
  last_connection_ip: string;
  last_connection_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface CreateSubscriptionDto {
  max_configurations: number;
}

export interface CreateVpnConfigDto {
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Auth endpoints
  register(data: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginDto): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.baseUrl}/auth/login`, data);
  }

  refreshToken(refreshToken: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.baseUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    });
  }

  // Subscription endpoints
  createSubscription(data: CreateSubscriptionDto): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.baseUrl}/subscriptions`, data);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl}/subscriptions`);
  }

  getActiveSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/subscriptions/active`);
  }

  getSubscription(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/subscriptions/${id}`);
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.http.delete<Subscription>(`${this.baseUrl}/subscriptions/${id}`);
  }

  renewSubscription(id: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.baseUrl}/subscriptions/${id}/renew`, {});
  }

  // VPN Configuration endpoints
  createVpnConfig(data: CreateVpnConfigDto): Observable<VpnConfiguration> {
    return this.http.post<VpnConfiguration>(`${this.baseUrl}/vpn-configurations`, data);
  }

  getVpnConfigurations(): Observable<VpnConfiguration[]> {
    return this.http.get<VpnConfiguration[]>(`${this.baseUrl}/vpn-configurations`);
  }

  getVpnConfiguration(id: number): Observable<VpnConfiguration> {
    return this.http.get<VpnConfiguration>(`${this.baseUrl}/vpn-configurations/${id}`);
  }

  deleteVpnConfiguration(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vpn-configurations/${id}`);
  }

  activateVpnConfiguration(id: number): Observable<VpnConfiguration> {
    return this.http.patch<VpnConfiguration>(
      `${this.baseUrl}/vpn-configurations/${id}/activate`,
      {},
    );
  }

  deactivateVpnConfiguration(id: number): Observable<VpnConfiguration> {
    return this.http.patch<VpnConfiguration>(
      `${this.baseUrl}/vpn-configurations/${id}/deactivate`,
      {},
    );
  }

  regeneratePassword(id: number): Observable<VpnConfiguration> {
    return this.http.patch<VpnConfiguration>(
      `${this.baseUrl}/vpn-configurations/${id}/regenerate-password`,
      {},
    );
  }
}
