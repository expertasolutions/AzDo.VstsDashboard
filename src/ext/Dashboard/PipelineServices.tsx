import * as API from "azure-devops-extension-api";

import { 
  BuildRestClient, BuildDefinitionReference, Build, BuildStatus, ResultSet
} from "azure-devops-extension-api/Build";

import {
  ReleaseRestClient, Deployment
} from "azure-devops-extension-api/Release";

import {
  CoreRestClient
} from "azure-devops-extension-api/core"

import { ExtensionManagementRestClient } from "azure-devops-extension-api/ExtensionManagement";
import { getAccessToken } from "azure-devops-extension-sdk";
import { PipelineInfo } from "./dataContext";

const coreClient = API.getClient(CoreRestClient);
const buildClient = API.getClient(BuildRestClient);
const releaseClient = API.getClient(ReleaseRestClient);
const extClient = API.getClient(ExtensionManagementRestClient);

export async function getProjects() {
  let result = await coreClient.getProjects(null, 9999);
  return result.sort((a,b) => a.name.localeCompare(b.name) );
}

export async function getProject(projectName: string) {
  let result = await coreClient.getProject(projectName);
  return result;
}

export async function setUserPreferences(
      projectList: Array<string>
    , statusOrder: number
    , withDeploymentOnly: number
    , showAllDeployment: number
    , extensionContext: any
    , collectionName: string
  ) : Promise<any> {
  try {
    let currentDocument = await getUserPreferences(extensionContext, collectionName);
    let result: any;
    if(currentDocument === undefined) {
      var newDoc = {
        docName : "UserPreferences",
        showErrorsOnTop: statusOrder,
        withDeploymentOnly: withDeploymentOnly,
        showAllDeployment: showAllDeployment,
        selectedProjects : projectList
      };
      result = await extClient.createDocumentByName(newDoc, extensionContext.publisherId, extensionContext.extensionId, "User", "Me", collectionName);
    } else {
      var updDoc = { 
        docName : "UserPreferences",
        selectedProjects : projectList,
        showErrorsOnTop: statusOrder,
        withDeploymentOnly: withDeploymentOnly,
        showAllDeployment: showAllDeployment,
        id: currentDocument.id,
        __etag: currentDocument.__etag
      };
      result = await extClient.updateDocumentByName(updDoc, extensionContext.publisherId, extensionContext.extensionId, "User", "Me", collectionName);
    }
    return result;
  } catch {
    console.log("setUserPreference errors");
    return undefined;
  }
}

export async function getUserPreferences(extensionContext: any, collectionName: string) : Promise<any> {
  try {
    let results = await extClient.getDocumentsByName(extensionContext.publisherId, extensionContext.extensionId, "User", "Me", collectionName);
    return results.find(x=> x.docName === "UserPreferences");
  } catch {
    console.log("GetUserPreferences error");
    return undefined;
  }
}

export async function getReleasesV1(projectList: Array<string>, isFirstLoad: boolean){
  let deployments = new Array<Deployment>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getReleases(projectList[i], isFirstLoad);
    deployments.push(...result);
  }
  return deployments;
}

export async function getReleases(projectName: string, isFirstLoad: boolean) {
  let minDate = undefined;

  if(!isFirstLoad){
    let now = new Date();
    minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  }

  let continuationToken = 0;
  let dpl = new Array<Deployment>();

  let result = new Array<Deployment>();
  do {
    result = await releaseClient.getDeployments(projectName, undefined, undefined, undefined, minDate, undefined,
      undefined, undefined, false, undefined, 1000, continuationToken,
      undefined, undefined, undefined, undefined); 
    
    if(result.length > 1){
      continuationToken = result[result.length-1].id;
    } else {
      continuationToken = -1;
    }
    dpl.push(...result);
  } while(result.length > 0);
  return dpl;
}

export async function getEnvironments(projectName: string, accessToken: string) {
  // CODE_REVIEW: Replace 'experta' from the URL with the proper organization name
  let apiVersion = "7.2-preview.1";
  let envUrl = `https://dev.azure.com/experta/${projectName}/_apis/distributedtask/environments?api-version=${apiVersion}`;
  let acceptHeaderValue = `application/json;api-version=${apiVersion};excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true`;
  let result = await fetch(envUrl, 
    {
      method: 'GET',
      mode: 'cors',
      headers: { 
        'Accept': acceptHeaderValue,
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${accessToken}`
      }
    })
    .then(response => response.json());
  return result;
}

export async function getBuildsV1(projectList: Array<string>, isFirstLoad: boolean, timeRangeLoad: string) {
  let builds = new Array<Build>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getBuilds(projectList[i], isFirstLoad, timeRangeLoad);
    builds.push(...result);
  }
  return builds;
}

export function getMinTimeFromNow(timeRangeLoad: string) {
  const MS_IN_MIN = 60000;
  let minDate = undefined;
  let now = new Date();
  switch(timeRangeLoad) {
    case "lastHour":
      minDate = new Date(now.valueOf() - 60 * MS_IN_MIN);
      break;
    case "last4Hours":
      minDate = new Date(now.valueOf() - 4 * 60 * MS_IN_MIN);
      break;
    case "last8Hours":
      minDate = new Date(now.valueOf() - 8 * 60 * MS_IN_MIN);
      break;
    case "today":
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "yesterday":
      now.setDate(now.getDate()-1);
      minDate = now;
      break;
    case "lastweek":
      now.setDate(now.getDate()-7);
      minDate = now;
      break;
  }
  return minDate;
}

export async function getPipelineInfo(projectName: string, pipelineId: number, accessToken: string) {
  // CODE_REVIEW: Replace 'experta' from the URL with the proper organization name
  let apiVersion = "7.2-preview.1";
  let envUrl = `https://dev.azure.com/experta/${projectName}/_apis/pipelines/${pipelineId}?api-version=${apiVersion}`;
  let acceptHeaderValue = `application/json;api-version=${apiVersion};excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true`;
  let result = await fetch(envUrl, 
    {
      method: 'GET',
      mode: 'cors',
      headers: { 
        'Accept': acceptHeaderValue,
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${accessToken}`
      }
    })
    .then(response => response.json());
    return result;
}

export async function getBuilds(projectName: string, isFirstLoad: boolean, timeRangeLoad: string)  {
  const MS_IN_MIN = 60000;
  let minDate = undefined;
  let now = new Date();
  if(!isFirstLoad) {
    minDate = new Date(now.valueOf() - 5 * MS_IN_MIN);
  } else {
    minDate = getMinTimeFromNow(timeRangeLoad);
  }

  let inProgressResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.InProgress);
  let cancellingResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.Cancelling);  
  let notStartedResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.NotStarted);   
  let postponedResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.Postponed); 
  let noneResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.None);                                                
  let completedResult = await buildClient.getBuilds(projectName, undefined, undefined, undefined, minDate);
  
  let result = new Array<Build>();
  result.push(...inProgressResult);
  result.push(...cancellingResult);
  result.push(...notStartedResult);
  result.push(...postponedResult);
  result.push(...noneResult);
  result.push(...completedResult);

  return result;
}

export function sortBuilds(builds: Array<Build>) {
  return builds.sort((a,b) => {
    return b.id - a.id;
  });
}

export function sortBuildReferences(buildRefs: Array<BuildDefinitionReference>, errorOnTop: boolean) {
  buildRefs = buildRefs.sort((a,b) => {
    if(b.latestBuild !== undefined && a.latestBuild !== undefined) {
      if(a.latestBuild.id > b.latestBuild.id){
        return -1;
      } else if(a.latestBuild.id < b.latestBuild.id) {
        return 1;
      } else {
        return 0;
      }
    } else if(b.latestBuild !== undefined && a.latestBuild === undefined) {
      return 1;
    } else if(b.latestBuild === undefined && a.latestBuild !== undefined) {
      return -1;
    } else {
      return 0;
    }
  });

  if(errorOnTop) {
    buildRefs = buildRefs.sort((a, b) => {
      if(a.latestBuild !== undefined && b.latestBuild !== undefined){
        return b.latestBuild.result - a.latestBuild.result;
      } else if(a.latestBuild !== undefined && b.latestBuild === undefined) {
        return a.latestBuild.result;
      } else if(a.latestBuild === undefined && b.latestBuild !== undefined){
        return b.latestBuild.result;
      } else {
        return 999;
      }
    });
  }
  return buildRefs;
}

export async function getBuildDefinitionsV1(projectList: Array<string>, isFirstLoad: boolean) {
  let buildDef = new Array<BuildDefinitionReference>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getBuildDefinitions(projectList[i], isFirstLoad);
    buildDef.push(...result);
  }
  return buildDef;
}



export async function getBuildDefinitions(projectName: string, isFirstLoad: boolean) {
  const MS_IN_MIN = 60000;
  let minDate = undefined;
  let now = new Date();

  if(!isFirstLoad) {
    minDate = new Date(now.valueOf() - 5 * MS_IN_MIN);
  }

  let result = await buildClient.getDefinitions(projectName, undefined, undefined, undefined,
                                              undefined, undefined, undefined, undefined, undefined,
                                              undefined, minDate, undefined,undefined, true, undefined, 
                                              undefined, undefined);
  const castResult = result as Array<PipelineInfo>;
  for(let i=0;i<result.length;i++) {
    let rs = await getPipelineInfo(projectName, result[i].id, await getAccessToken());
    console.log(`${result[i].id} - ${rs.configuration.type}`);
    castResult[i].pipelineType = rs.configuration.type;
  }

  return castResult;
}
