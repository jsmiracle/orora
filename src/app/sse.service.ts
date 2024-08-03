import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment.prod';
import { IDownload, IDownloadWithThumbnail } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export default class SseService {
  public loading: boolean = false;
  private backendUrl: string;
  private userId: string;
  private downloadsSubject: Subject<IDownloadWithThumbnail[]> = new Subject<IDownloadWithThumbnail[]>();

  constructor(private http: HttpClient) {
    this.backendUrl = environment.backendUrl;
    this.userId = this.getUserId();
    this.initEventSource();
  }

  private initEventSource(): void {
    this.loading = true;
    const eventSource = new EventSource(`${this.backendUrl}/events?user_id=${this.userId}`);

    eventSource.onopen = () => {
      this.loading = false;
    };

    eventSource.onmessage = (event) => {
      const parsedData = Object.values(JSON.parse(event.data));
      const downloadsArray = parsedData.map((download: IDownload) => ({
        ...download,
        thumbnailUrl: this.generateThumbnailUrl(download.url)
      }));
      this.downloadsSubject.next(downloadsArray);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error: ', error);
      this.loading = false;
    };
  }

  public getDownloads(): Observable<IDownloadWithThumbnail[]> {
    return this.downloadsSubject.asObservable();
  }

  public add(url: string, quality: string, format: string): void {
    this.loading = true;
    const body = { url, format, quality, folder: '', user_id: this.userId };
    this.http.post(`${this.backendUrl}/add`, body).subscribe(async () => {
      await new Promise((r) => setTimeout(r, 1200))
      this.loading = false;
    }, async (error) => {
      console.error('Add error: ', error);
      await new Promise((r) => setTimeout(r, 1200))
      this.loading = false;
    });
  }

  public delete(id: string): void {
    this.loading = true;
    const body = { id, user_id: this.userId };
    this.http.post(`${this.backendUrl}/delete`, body).subscribe(async () => {
      await new Promise((r) => setTimeout(r, 1200))
      this.loading = false;
    }, async (error) => {
      console.error('Delete error: ', error);
      await new Promise((r) => setTimeout(r, 1200))
      this.loading = false;
    });
  }

  private generateThumbnailUrl(url: string): string | null {
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&]|$)/;
    const match = url.match(regex);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
    return null;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = this.generateUniqueId(9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  private generateUniqueId(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public deepEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
        return false;
      }
    }
    return true;
  }
}
