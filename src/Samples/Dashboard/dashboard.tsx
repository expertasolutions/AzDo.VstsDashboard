import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as Api from "azure-devops-extension-api";

import { dashboardColumns, BuildRowItem }  from "./tableData";

import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";

//import { Header } from "azure-devops-ui/Header";
//import { Page } from "azure-devops-ui/Page";

import { showRootComponent } from "../../Common";
import { BuildRestClient, Build, BuildAgent } from "azure-devops-extension-api/Build";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

const getBuildsData = async() => {
  let buildClient = Api.getClient(BuildRestClient);
  const response = buildClient.getBuilds("Community");
  return await response;
}

class CICDDashboard extends React.Component<{}, {}> {

  state = {
    builds: Array<Build>()
  };
  
  public componentDidMount() {
    SDK.init();
    getBuildsData().then(result=> {
      this.setState({ builds: result });
    })
  }

  public render() : JSX.Element {

    let buildsList = this.state.builds;

    let buildRows: BuildRowItem[];
    buildRows = [];

    for(let i=0;i<buildsList.length;i++){
      let currentBuild = buildsList[i];
      buildRows.push({
        id: currentBuild.id,
        teamProject: currentBuild.project.name,
        definitionName: currentBuild.definition.name,
        buildNumber: currentBuild.buildNumber,
        requestedFor: currentBuild.requestedFor.displayName,
        result: currentBuild.result.toString(),
        status: currentBuild.status.toString()
      });
    }

    const tableItems = new ArrayItemProvider<BuildRowItem>(
      buildRows.map((item: BuildRowItem) => {
        const newItem = Object.assign({}, item);
        return newItem;
      })
    );

    return (
      <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
        <Table columns={dashboardColumns} itemProvider={tableItems} role="table">

        </Table>
      </Card>
    );
  }
}

showRootComponent(<CICDDashboard />);

/*
export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

import BuildRestClient = require("TFS/Build/RestClient");
import { BuildResult, BuildStatus, QueryDeletedOption } from "TFS/Build/Contracts";
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");

class build {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  queueTime: number;
  result: BuildResult;
  status: BuildStatus;
  deleted: boolean;
  release: string;
}

class release {
  id: number;
  name: string;
}

function getColumns() {
  return [
    { text: "Id", width: 75, index: "id", columnOrder: "desc" },
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 250, index: "definitionName" },
    { text: "Build #", width: 350, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" },
    { text: "Exec (min)", width: 100, index: "queueTime"},
    { text: "Status", width: 100, index: "status", 
      getCellContents: function (
        rowInfo, 
        dataIndex, 
        expandedState, 
        level, 
        column, 
        indentIndex, 
        columnOrder)
      {
        var statusValue = this.getColumnValue(dataIndex, column.index);
        var statusText = "NA";
        switch(statusValue){
          case BuildStatus.NotStarted: 
            statusText = "Not Started";
            break;
          case BuildStatus.Cancelling:
            statusText = "Cancelling";
            break;
          case BuildStatus.Completed:
            statusText = "Completed";
            break;
          case BuildStatus.InProgress:
            statusText = "InProgress";
            break;
          case BuildStatus.Postponed:
            statusText = "Postponed";
            break;
        }
        return $("<div class='grid-cell'/>").width("100").text(statusText);
      }
    },
    { text: "Result", width: 100, index: "result",
      getCellContents: function (
        rowInfo, 
        dataIndex, 
        expandedState, 
        level, 
        column, 
        indentIndex, 
        columnOrder)
      {
        var resultValue = this.getColumnValue(dataIndex, column.index);
        var resultText = "NA";
        switch(resultValue){
          case BuildResult.Canceled: 
            resultText = "Canceled";
            break;
          case BuildResult.Failed:
            resultText = "Failed";
            break;
          case BuildResult.PartiallySucceeded:
            resultText = "Partially Succeeded";
            break;
          case BuildResult.Succeeded:
            resultText = "Succeeded";
            break;
        }
        return $("<div class='grid-cell'/>").width("100").text(resultText);
      }
    }, 
  ]
}

export function getLastBuilds(source: Array<build>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname, null, null, null, null, null,
                    null, null, null, null, null, null, null, 
                    null, null, QueryDeletedOption.IncludeDeleted
    ).then(builds => {
    
    builds.forEach(b=> {
    
      var newBuild = { 
        id: b.id, 
        teamProject: b.project.name,
        definitionName: b.definition.name,
        buildNumber: b.buildNumber,
        requestedFor: b.requestedFor.displayName,
        queueTime: 0,
        result: b.result,
        status: b.status,
        deleted: b.deleted === undefined ? false : b.deleted,
        release: 'NA'
      };
      var buildInstance = source.find(x=> x.id === newBuild.id);
      if(buildInstance === undefined && newBuild.deleted === false) {
        // Add the build in the current list
        source.push(newBuild);
      } else if (buildInstance != undefined && newBuild.deleted === true) {
        console.log("delete a build");
        var indexToRemove = source.indexOf(buildInstance);
        source.splice(indexToRemove,1);
      } else {
        // update the build with new infos
        source[source.indexOf(buildInstance)] = newBuild;
      }
    });
    target.setDataSource(source);
  });
}

export function getRelease(source: Array<release>): void {    
  let client = ReleaseRestClient.getClient()
    client.getDeployments(getTeamContext().projectname).then(definitions => {
        definitions.forEach(d => {
            source.push({ name: d.release.name, id: d.id });
        });
    });
   $("#buildDetails").text(JSON.stringify(source));
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<build>();
var releaseSource = new Array<release>();

var buildGridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "50%",
  columns: getColumns(),
  sortOrder: [
    { index: "id", order: "desc" }
  ],
  openRowDetail: (index: number) => {
    var buildInstance = grid.getRowData(index);
    
    var releases = "test";
    var releases = releaseSource.find(function(elm:releaseGrid) {
      return true;
    //  return elm.artifacts.filter(a=> a.definitionReference.version.id === buildInstance.Id) != null;
    });
    $("#buildDetails").text(JSON.stringify(releases));
  }
  
}
var grid = Controls.create(Grids.Grid, buildContainer, buildGridOptions);
getRelease(releaseSource);

function refreshData() {
  getLastBuilds(buildSource, grid);
}

refreshData();

setInterval(refreshData, 5000);
*/