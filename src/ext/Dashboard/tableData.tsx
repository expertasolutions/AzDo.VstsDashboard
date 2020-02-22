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
    ITableColumn
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

function buildOnSize(event: MouseEvent, index: number, width: number) {
  return (buildColumns[index].width as ObservableValue<number>).value = width;
}

function buildRefOnSize(event: MouseEvent, index: number, width: number) {
  return (dashboardColumns[index].width as ObservableValue<number>).value = width;
}

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
    name: "Build # | Branch/commit", 
    onSize: buildOnSize,
    renderCell: renderBuildInfo01Cell,
    width: new ObservableValue(-35),
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    onSize: buildOnSize,
    renderCell: renderDeploymentInfo01,
    width: new ObservableValue(-40)
  },
  {
    id: "BuildInfo02",
    renderCell: renderBuildInfo02Cell,
    width: 150,
  }
]

export const dashboardColumns : ITableColumn<BuildDefinitionReference>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildRefOnSize,
    renderCell: renderBuildRef01,
    width: new ObservableValue(-25)
  },
  {
    id: "pipeline",
    name: "Last Run",
    onSize: buildRefOnSize,
    renderCell: renderLastBuild01,
    width: new ObservableValue(-35)
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    onSize: buildRefOnSize,
    renderCell: renderReleaseInfo01,
    width: new ObservableValue(-40)
  },
  {
    id:"LastBuildInfo02",
    renderCell: renderLastBuild02,
    width: 150
  }
];