import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDashboardConfig } from './dashboardConfig.model';

@Injectable()
export class DashboardConfig {
  static settings: IDashboardConfig;
  constructor(private http: HttpClient){}
  load() {
     const jsonFile = '/secrets/vsts.appsettings.json';
     
     return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response : IDashboardConfig) => {
         DashboardConfig.settings = <IDashboardConfig>response;
         resolve();
      }).catch((response: any) => {
         reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
      });
   });
  }
}