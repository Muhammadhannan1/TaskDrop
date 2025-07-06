import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // To convert observable to promise

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, params?: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { params, headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during GET request:', error);
      throw error;
    }
  }

  async post<T>(url: string, data: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during POST request:', error);
      throw error;
    }
  }

  async put<T>(url: string, data: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during PUT request:', error);
      throw error;
    }
  }

  async delete<T>(url: string, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(url, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during DELETE request:', error);
      throw error;
    }
  }
}
