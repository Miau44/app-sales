import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/sales.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly endpoint = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.endpoint);
  }
}
