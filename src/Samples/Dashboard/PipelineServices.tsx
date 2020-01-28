
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient
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

export async function getReleases(projectName: string) {
  let minDate = new Date();
  let newDate = minDate.setDate(minDate.getDate()-1000);
  minDate = new Date(newDate);
  let continuationToken = 0;
  let dpl = new Array<Deployment>();

  let result = new Array<Deployment>();
  do {
    console.log("ContinuationToken: " + continuationToken);
    result = await releaseClient.getDeployments(projectName, undefined, undefined, undefined, minDate, new Date(),
      undefined, undefined, false, undefined, 1000, continuationToken,
      undefined, undefined, undefined, undefined); 
    
    if(result.length > 1){
      continuationToken = result[result.length-1].id;
    } else {
      console.log("Result is empty");
      continuationToken = -1;
    }

    console.log("Result: " + result.length);
    dpl.push(...result);
    console.log("DeploymentNumber: " + dpl.length);
  } while(result.length > 0);
  console.log("IM OUT !!!!");
  return dpl;
}

export async function getBuilds(projectName: string)  {
  return await buildClient.getBuilds(projectName);
}

export async function getBuildDefinitions(projectName: string) {
  let result = await buildClient.getDefinitions(projectName, undefined, undefined, undefined,
                                              undefined, undefined, undefined,undefined, undefined,
                                              undefined,undefined,undefined,undefined, true, undefined, 
                                              undefined, undefined);
  return result.sort((a,b) => {
    if(b.latestBuild != undefined && a.latestBuild != undefined){
      return b.latestBuild.id - a.latestBuild.id
    }
    return 0;
  });
}
