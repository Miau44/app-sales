import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiMessage, CreateSaleRequest, CreateSaleResponse, Sale } from '../models/sales.models';

@Injectable({ providedIn: 'root' })
export class SalesApiService {
  private readonly endpoint = `${environment.apiUrl}/sales`;

  constructor(private readonly http: HttpClient) { }

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.endpoint);
  }

  createSale(request: CreateSaleRequest): Observable<CreateSaleResponse> {
    return this.http.post<CreateSaleResponse>(this.endpoint, request);
  }

  deleteSale(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.endpoint}/${id}`);
  }
}
