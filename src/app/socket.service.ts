import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  requestSnapshotData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.emit('requestSnapshotData');
      this.socket.on('snapshotData', (data:any) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }
}
