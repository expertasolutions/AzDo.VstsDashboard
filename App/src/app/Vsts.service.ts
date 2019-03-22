import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardConfig } from './dashboard.config';

@Injectable()
export class VstsDataService {
  private _token = "";
  private __HEADER = null; 
  private _httpOptions = null;
  private orgName = null;
  private pat = null;

  private tfsUrl = null;

  constructor(private http:HttpClient) {
    this.orgName = DashboardConfig.settings.azureDevOpsDetails.orgName;
    this.pat = DashboardConfig.settings.azureDevOpsDetails.pat;
    console.log("tfs Kind: " + DashboardConfig.settings.tfsKind);
    if(DashboardConfig.settings.tfsKind == "OnPremise"){
      this.tfsUrl = DashboardConfig.settings.OnPremise.TfsUrl;
    } else {
      this.tfsUrl = "https://dev.azure.com/" + this.orgName;
    }

    this._token = "Basic " + btoa(":" + this.pat);
    this.__HEADER = new HttpHeaders()
                        .append("Authorization", this._token)
                        .append("Content-Type", "application/json");
    this._httpOptions = { headers : this.__HEADER };
  }

  getProjects() : Observable<object> {
    var projectListUrl = this.tfsUrl + "/_apis/projects?api-version=5.0-preview.3";
    return this.http.get(projectListUrl, this._httpOptions);
  }

  getDeployments(projectName, minTime) : Observable<object>{
    var relUrl = "https://vsrm.dev.azure.com/" + this.orgName;

    var deploymentUrl = relUrl + "/"+ projectName + "/_apis/release/deployments?minStartedTime=" + minTime + "&api-version=5.0-preview.2";
    
    return this.http.get(deploymentUrl, this._httpOptions)
  }

  getBuilds(projectName, minTime) : Observable<object>{
    var buildDefUrl = this.tfsUrl + "/" + projectName + "/_apis/build/builds?minTime=" + minTime + "&queryOrder=queueTimeAscending&deletedFilter=includeDeleted&api-version=5.0-preview.5";
    return this.http.get(buildDefUrl, this._httpOptions);
  }
}