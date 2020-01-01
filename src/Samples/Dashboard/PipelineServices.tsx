
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient
} from "azure-devops-extension-api/Build";

import {
  ReleaseRestClient
} from "azure-devops-extension-api/Release";

export async function getReleases(projectName: string) {
  let releaseClient = API.getClient(ReleaseRestClient);
  return await releaseClient.getReleases(projectName);
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