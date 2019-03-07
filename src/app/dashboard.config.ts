import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IDashboardConfig } from './dashboardConfig.model';
import * as fs from "file-system";

@Injectable()
export class DashboardConfig {
  static settings: IDashboardConfig;
  constructor(private http: HttpClient){}
  load(){
     const jsonFile = '/app/secrets/vstsDashboard.secret.release.json';
     console.log(jsonFile);
     var content = fs.File.fromPath(jsonFile);
     console.log(content);
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