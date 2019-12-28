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

class buildGrid {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  releases: any[];
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
        releases: [{ id: 0, releaseName: "invalid", status: "Pending"}],
      });
    });
    var gridSource = new Grids.GridHierarchySource(source);
    target.setDataSource(gridSource);
  });
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<buildGrid>();
var buildGridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "100%",
  columns: [
    { text: "Id", width: 50, index: "id"},
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 200, index: "definitionName" },
    { text: "Build #", width: 250, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" }
  ]
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