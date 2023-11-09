import { ObservableValue } from "azure-devops-ui/Core/Observable";

import { 
  renderBuildStatus,
  renderBuildInfo01Cell, 
  renderBuildInfo02Cell,
  renderDeploymentInfo01
} from "./cells/build";

import {
  renderBuildRef01,
  renderLastBuild01,
  renderLastBuild02,
  renderReleaseInfo01
} from "./cells/buildReference";

import {
  renderEnvironmentCol01
} from "./cells/environmentRef";

import {
    ITableColumn
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

import { PipelineEnvironment, PipelineInfo } from "./dataContext";

function buildOnSize(event: MouseEvent, index: number, width: number) {
  return (buildColumns[index].width as ObservableValue<number>).value = width;
}

function buildRefOnSize(event: MouseEvent, index: number, width: number) {
  return (dashboardColumns[index].width as ObservableValue<number>).value = width;
}

export const environmentColumns : ITableColumn<PipelineEnvironment>[] = [
  {
    id: "environment",
    name: "name",
    onSize: buildOnSize,
    renderCell: renderEnvironmentCol01,
    width: new ObservableValue(-25)
  }
]

export const buildColumns : ITableColumn<Build>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildOnSize,
    renderCell: renderBuildStatus,
    width: new ObservableValue(-25),
  },
  {
    id: "BuildInfo01",
    name: "Build # | Branch & commit", 
    onSize: buildOnSize,
    renderCell: renderBuildInfo01Cell,
    width: new ObservableValue(-25),
  },
  {
    id: "ReleaseInfo01",
    name: "Environments/Stages Health",
    renderCell: renderDeploymentInfo01,
    width: new ObservableValue(-45)
  },
  {
    id: "BuildInfo02",
    name: "Execution Infos",
    renderCell: renderBuildInfo02Cell,
    width: 165,
  }
]

export const dashboardColumns : ITableColumn<PipelineInfo>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildRefOnSize,
    renderCell: renderBuildRef01,
    width: new ObservableValue(-25)
  },
  {
    id: "pipeline",
    name: "Build # | Branch & commit",
    onSize: buildRefOnSize,
    renderCell: renderLastBuild01,
    width: new ObservableValue(-25)
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    renderCell: renderReleaseInfo01,
    width: new ObservableValue(-45)
  },
  {
    id:"LastBuildInfo02",
    name: "Execution Infos",
    renderCell: renderLastBuild02,
    width: 165
  }
];
