import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardConfig } from './dashboard.config';

@Injectable()
export class VstsDataService {
  private _token = "";
  private __HEADER = null; 
  private _httpOptions = null;
  private pat = null;
  private _apiVersions = null;

  private tfsUrl = null;

  constructor(private http:HttpClient) {

    this.tfsUrl = DashboardConfig.settings.TfsAccessInfo.TfsUrl;
    this.pat = DashboardConfig.settings.TfsAccessInfo.pat;
    this._apiVersions = DashboardConfig.settings.TfsAccessInfo.apiVersion;
    
    this._token = "Basic " + btoa(":" + this.pat);
    console.log(this._token);
    this.__HEADER = new HttpHeaders()
                        .append("Authorization", this._token)
                        .append("Content-Type", "application/json");
    this._httpOptions = { headers : this.__HEADER };
  }

  getProjects() : Observable<object> {
    var projectListUrl = this.tfsUrl + "_apis/projects?api-version=" + this._apiVersions.projects;
    return this.http.get(projectListUrl, this._httpOptions);
  }

  getDeployments(projectName, minTime) : Observable<object>{
    var deploymentUrl = this.tfsUrl + projectName + "/_apis/release/releases?minStartedTime=" + minTime + "&api-version=" + this._apiVersions.releases;
    return this.http.get(deploymentUrl, this._httpOptions)
  }

  getBuilds(projectName, minTime) : Observable<object>{
    var buildDefUrl = this.tfsUrl + projectName + "/_apis/build/builds?minTime=" + minTime + "&queryOrder=queueTimeAscending&deletedFilter=includeDeleted&api-version=" + this._apiVersions.builds;
    return this.http.get(buildDefUrl, this._httpOptions);
  }
}