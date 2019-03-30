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

  private _coreUrl = null;
  private _releaseUrl = null;
  
  private _coreAreaId = "79134c72-4a58-4b42-976c-04e7115f32bf"
  private _releaseManagementAreaId = "efc2f575-36ef-48e9-b672-0c6fb4a48ac5"

  constructor(private http:HttpClient) {

    this.tfsUrl = DashboardConfig.settings.TfsAccessInfo.TfsUrl;
    this.pat = DashboardConfig.settings.TfsAccessInfo.pat;
    this._apiVersions = DashboardConfig.settings.TfsAccessInfo.apiVersion;
    
    this._token = "Basic " + btoa(":" + this.pat);
    this.__HEADER = new HttpHeaders()
                        .append("Authorization", this._token)
                        .append("Content-Type", "application/json");
    this._httpOptions = { headers : this.__HEADER };

    this.loadUrl(this._coreAreaId).then(url => this._coreUrl = url);
    this.loadUrl(this._releaseManagementAreaId).then(url => this._releaseUrl = url);
  }

  loadUrl(areaId): Promise<string> {
    var orgResUrl = this.tfsUrl + "_apis/resourceAreas/" + areaId + "?api-version=" + this._apiVersions.resourceAreas

    return this.http.get(orgResUrl).toPromise()
      .then(data => {
          var locationUrl = data['locationUrl'];
          return locationUrl;
        }
      );
  }

  getProjects() : Observable<object> {
    var projectListUrl = this._coreUrl + "_apis/projects?api-version=" + this._apiVersions.projects;
    return this.http.get(projectListUrl, this._httpOptions);
  }

  getDeployments(projectName, minTime) : Observable<object>{
    var deploymentUrl = this._releaseUrl + projectName + "/_apis/release/deployments?minStartedTime=" + minTime + "&api-version=" + this._apiVersions.releases;
    return this.http.get(deploymentUrl, this._httpOptions)
  }

  getBuilds(projectName, minTime) : Observable<object>{
    var buildDefUrl = this._coreUrl + projectName + "/_apis/build/builds?minTime=" + minTime + "&queryOrder=queueTimeAscending&deletedFilter=includeDeleted&api-version=" + this._apiVersions.builds;
    return this.http.get(buildDefUrl, this._httpOptions);
  }
}