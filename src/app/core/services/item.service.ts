import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ItemCreate, 
  ItemUpdate, 
  ItemInDB, 
  ApiResponse, 
  ItemsListResponse 
} from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/items`;

  create(item: ItemCreate): Observable<ApiResponse<ItemInDB>> {
    console.log('[ItemService] CREATE - Sending:', JSON.stringify(item));
    return this.http.post<ApiResponse<ItemInDB>>(this.apiUrl, item)
      .pipe(
        tap(response => console.log('[ItemService] CREATE - Response:', response)),
        catchError(this.handleError)
      );
  }

  getAll(page: number = 1, perPage: number = 10): Observable<ItemsListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    console.log(`[ItemService] GET ALL - Page: ${page}, PerPage: ${perPage}`);
    return this.http.get<ItemsListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => console.log('[ItemService] GET ALL - Items count:', response.data.length)),
        catchError(this.handleError)
      );
  }

  search(query: string, limit: number = 10): Observable<ItemsListResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('limit', limit.toString());

    console.log(`[ItemService] SEARCH - Query: "${query}", Limit: ${limit}`);
    return this.http.get<ItemsListResponse>(`${this.apiUrl}/search`, { params })
      .pipe(
        tap(response => console.log('[ItemService] SEARCH - Results:', response.data.length)),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<ApiResponse<ItemInDB>> {
    console.log(`[ItemService] GET BY ID - ID: "${id}"`);
    return this.http.get<ApiResponse<ItemInDB>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => console.log('[ItemService] GET BY ID - Response:', response)),
        catchError(this.handleError)
      );
  }

  update(id: string, item: ItemUpdate): Observable<ApiResponse<ItemInDB>> {
    console.log(`[ItemService] UPDATE - ID: "${id}"`);
    console.log('[ItemService] UPDATE - Payload:', JSON.stringify(item));
    console.log('[ItemService] UPDATE - Full URL:', `${this.apiUrl}/${id}`);
    
    return this.http.patch<ApiResponse<ItemInDB>>(`${this.apiUrl}/${id}`, item)
      .pipe(
        tap(response => console.log('[ItemService] UPDATE - Response:', response)),
        catchError(this.handleError)
      );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    console.log(`[ItemService] DELETE - ID: "${id}"`);
    console.log('[ItemService] DELETE - Full URL:', `${this.apiUrl}/${id}`);
    
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => console.log('[ItemService] DELETE - Response:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('[ItemService] HTTP ERROR:', error);
    console.error('[ItemService] Error Status:', error.status);
    console.error('[ItemService] Error Body:', error.error);
    console.error('[ItemService] Error URL:', error.url);
    
    let message = 'An unexpected error occurred';
    
    if (error.error?.detail) {
      message = error.error.detail;
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 0) {
      message = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.status === 404) {
      message = 'Item not found. ID may be invalid or item was already deleted.';
    } else if (error.status === 422) {
      message = 'Validation error. Please check your input.';
    }

    console.error('[ItemService] Final Error Message:', message);
    return throwError(() => new Error(message));
  }
}