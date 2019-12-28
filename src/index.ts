export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

export function show(divName: string, func: (target: HTMLElement) => void){
    const elt = document.getElementById(divName)!;
    let result = func(elt);
}

import BuildRestClient = require("TFS/Build/RestClient");
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import { BuildResult, BuildStatus } from "TFS/Build/Contracts";


class buildGrid {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  queueTime: number;
  releases: any[];
  result: BuildResult;
  status: BuildStatus;
}

function getColumns() {
  return [
    { text: "Id", width: 100, index: "id" },
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 200, index: "definitionName" },
    { text: "Build #", width: 350, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" },
    { text: "Queue Time (min)", width: 250, index: "queueTime"},
    { text: "result", width: 200, index: "result",
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
        return $("<div class='grid-cell'/>").width("200").text(resultText);
      }
    },
    { text: "Status", width: 200, index: "status", 
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
        return $("<div class='grid-cell'/>").width("200").text(statusText);
      }
    }
  ]
}

export function getLastBuilds(source: Array<buildGrid>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname).then(builds => {
    builds.forEach(b=> {
      source.push({ 
        id: b.id, 
        teamProject: b.project.name,
        definitionName: b.definition.name,
        buildNumber: b.buildNumber,
        requestedFor: b.requestedFor.displayName,
        releases: [{ id: 0, releaseName: "invalid", status: "Pending", }],
        queueTime: b.queueTime.getMinutes(),
        result: b.result,
        status: b.status,
      });
    });
    target.setDataSource(source);
  });
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<buildGrid>();
var buildGridOptions: Grids.IGridOptions = {
  width: "99%",
  height: "100%",
  columns: getColumns(),
  openRowDetail: (index: number) => {
    var buildInstance = grid.getRowData(index);
    $(".item-details").text(JSON.stringify(buildInstance));
  }
}
var grid = Controls.create(Grids.Grid, buildContainer, buildGridOptions);
getLastBuilds(buildSource, grid);

//import RestClient = require("ReleaseManagement/Core/RestClient");
//import Controls = require("VSS/Controls");
//import Grids = require("VSS/Controls/Grids");

//little holder class for my grid datasource
/*
class releaseGrid {
    name: string;
    id: number;
}
  
export function getAvailableReleaseDefinitions(source: Array<releaseGrid>, target: Grids.Grid): void {    
  // Get an instance of the client
  let client = RestClient.getClient();
  client.getReleaseDefinitions(getTeamContext().projectname).then(definitions => {
      definitions.forEach(d => {
          source.push({ name: d.name, id: d.id });
      });
      //data is retrieved via a IPromise so update the datasource when you have gotten it
      target.setDataSource(source);
  });
} 

//get the div to show your grid
var container = $("#grid-container");
var source = new Array<releaseGrid>();

//define your grid
var gridOptions: Grids.IGridOptions = {
    height: "300px",
    width: "500px",
    source: source,
    columns: [
      { text: "ReleaseName", width: 200, index: "name" },
      { text: "ReleaseIdentifier", width: 200, index: "id" }
    ]
};

var grid = Controls.create(Grids.Grid, container, gridOptions);

getAvailableReleaseDefinitions(source, grid);
*/