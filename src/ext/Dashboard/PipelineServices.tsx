
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient, BuildDefinitionReference, Build
} from "azure-devops-extension-api/Build";

import {
  ReleaseRestClient, Deployment
} from "azure-devops-extension-api/Release";

import {
  CoreRestClient
} from "azure-devops-extension-api/core"

const coreClient = API.getClient(CoreRestClient);
const buildClient = API.getClient(BuildRestClient);
const releaseClient = API.getClient(ReleaseRestClient);

export async function getProjects() {
  let result = await coreClient.getProjects();
  return result.sort((a,b) => a.name.localeCompare(b.name) );
}

export async function getProject(projectName: string) {
  let result = await coreClient.getProject(projectName);
  return result;
}

export async function getReleasesV1(projectList: Array<string>){
  let deployments = new Array<Deployment>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getReleases(projectList[i]);
    deployments.push(...result);
  }
  return deployments;
}

export async function getReleases(projectName: string) {
  //let minDate = new Date();
  //let newDate = minDate.setDate(minDate.getDate()-1000);
  //minDate = new Date(newDate);
  let minDate = undefined;
  let continuationToken = 0;
  let dpl = new Array<Deployment>();

  let result = new Array<Deployment>();
  do {
    result = await releaseClient.getDeployments(projectName, undefined, undefined, undefined, minDate, new Date(),
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

export async function getBuildsV1(projectList: Array<string>) {
  let builds = new Array<Build>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getBuilds(projectList[i]);
    builds.push(...result);
  }
  return builds.sort((a,b) => {
    return b.id - a.id;
  });
}

export async function getBuilds(projectName: string)  {
  let result = await buildClient.getBuilds(projectName);
  return result;
}

export async function getBuildDefinitionsV1(projectList: Array<string>) {
  let buildDef = new Array<BuildDefinitionReference>();
  for(let i=0;i<projectList.length;i++) {
    let result = await getBuildDefinitions(projectList[i]);
    buildDef.push(...result);
  }
  return buildDef.sort((a,b) => {
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
}

export async function getBuildDefinitions(projectName: string) {

  let result = await buildClient.getDefinitions(projectName, undefined, undefined, undefined,
                                              undefined, undefined, undefined,undefined, undefined,
                                              undefined,undefined,undefined,undefined, true, undefined, 
                                              undefined, undefined);
  return result;
}
