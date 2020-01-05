
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient
} from "azure-devops-extension-api/Build";

import {
  ReleaseRestClient
} from "azure-devops-extension-api/Release";

export async function getReleases(projectName: string) {
  let releaseClient = API.getClient(ReleaseRestClient);
  return await releaseClient.getDeployments(projectName, undefined, undefined, undefined,undefined, undefined,
                                            undefined, undefined,undefined,undefined, undefined, undefined,
                                            undefined, new Date("2000-01-01"), new Date(),undefined);
}

export async function getBuilds(projectName: string)  {
  let buildClient = API.getClient(BuildRestClient);
  return await buildClient.getBuilds(projectName, undefined,undefined,undefined, undefined, undefined, undefined, undefined,
                                    undefined, undefined, undefined,undefined, undefined,undefined,undefined,undefined,
                                    undefined, undefined, undefined, undefined);
}

export async function getBuildDefinitions(projectName: string) {
  let buildClient = API.getClient(BuildRestClient);
  return await buildClient.getDefinitions(projectName, undefined, undefined, undefined,
                                              undefined, undefined, undefined,undefined, undefined,
                                              undefined,undefined,undefined,undefined, true, undefined, 
                                              undefined, undefined);
}