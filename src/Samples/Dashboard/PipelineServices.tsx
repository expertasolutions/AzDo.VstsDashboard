
import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import { BuildRestClient, Build } from "azure-devops-extension-api/Build";

const getBuildDefinitions = async(projectName: string) => {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getBuilds(projectName);
  return await response;
}

class PipelineService {

}