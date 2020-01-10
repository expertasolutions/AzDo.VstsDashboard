
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient
} from "azure-devops-extension-api/Build";

import {
  ReleaseRestClient
} from "azure-devops-extension-api/Release";

import {
  CoreRestClient
} from "azure-devops-extension-api/core"

export async function getProjects() {
  let coreClient = API.getClient(CoreRestClient);
  return await coreClient.getProjects();
}

export async function getReleases(projectName: string) {
  let minDate = new Date();
  console.log("CurrentDate: " + minDate);
  let newDate = minDate.setDate(minDate.getDate()-365);
  minDate = new Date(newDate);
  console.log("MinDate: " + minDate);
  let releaseClient = API.getClient(ReleaseRestClient);
  return await releaseClient.getDeployments(projectName, undefined, undefined, undefined, minDate, new Date(),
    undefined, undefined, true, undefined, 500, undefined,
    undefined, minDate, new Date(), undefined);
}

export async function getBuilds(projectName: string)  {
  let buildClient = API.getClient(BuildRestClient);
  return await buildClient.getBuilds(projectName);
}

export async function getBuildDefinitions(projectName: string) {
  let buildClient = API.getClient(BuildRestClient);
  return await buildClient.getDefinitions(projectName, undefined, undefined, undefined,
                                              undefined, undefined, undefined,undefined, undefined,
                                              undefined,undefined,undefined,undefined, true, undefined, 
                                              undefined, undefined);
}
