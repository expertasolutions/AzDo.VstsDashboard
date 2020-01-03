import { 
  renderBuildStatus,
  renderBuildInfo01Cell, 
  renderBuildInfo02Cell,
} from "./cells/build";

import {
  renderBuildRef01,
  renderLastBuild01,
  renderLastBuild02,
  renderReleaseInfo01
} from "./cells/buildReference";

import {
    ColumnMore,
    ITableColumn,
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildResult, 
  BuildStatus, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

export const buildColumns : ITableColumn<Build>[] = [
  {
    id: "Status",
    name: "Status",
    renderCell: renderBuildStatus,
    width:50
  },
  {
    id: "BuildInfo01",
    name: "Build #", 
    renderCell: renderBuildInfo01Cell,
    width: 350,
  },
  {
    id: "BuildInfo02",
    renderCell: renderBuildInfo02Cell,
    width: 250,
  }
]

export const dashboardColumns : ITableColumn<BuildDefinitionReference>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    renderCell: renderBuildRef01,
    width: 450
  },
  {
    id:"LastBuildInfo01",
    name: "Last run",
    renderCell: renderLastBuild01,
    width: 400
  },
  {
    id:"LastBuildInfo02",
    renderCell: renderLastBuild02,
    width: 200
  },
  {
    id: "ReleaseInfo01",
    name: "Latest release",
    renderCell: renderReleaseInfo01,
    width: 550
  },
  new ColumnMore(() => {
    return {
      id: "sub-menu",
      items: [
        { id: "submenu-two", text: "Edit Pipeline" },
        { id: "submenu-one", text: "View Releases" }
      ]
    }
  })
];

