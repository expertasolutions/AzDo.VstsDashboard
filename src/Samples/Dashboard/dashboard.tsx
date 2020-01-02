import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuilds, getBuildDefinitions, getReleases } from "./PipelineServices";
import { dashboardColumns, buildColumns }  from "./tableData";

import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Button } from "azure-devops-ui/Button";
import { CustomDialog } from "azure-devops-ui/Dialog";

import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { Release } from "azure-devops-extension-api/Release";
import { HeaderTitleArea, CustomHeader } from "azure-devops-ui/Header";
import { PanelContent, PanelFooter } from "azure-devops-ui/Panel";

class CICDDashboard extends React.Component<{}, {}> {
  private isDialogOpen = new ObservableValue<boolean>(false);
  private currentSelectedBuildReferenceId = new ObservableValue<Number>(-1);
  private projectName = "Community";

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Release>(),
    intervalId: Number,
  };

  refreshData() {
    getBuildDefinitions(this.projectName).then(result => {
      console.log("Def Count: " + result.length);
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        console.log(result[i].name);
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          if(currentBuildDef != undefined){
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      console.log("Result Table: " + currentBuildState.length);
      // Update the currentBuilds Definition
      this.setState({ buildDefs: currentBuildState });
      this.itemProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(this.state.buildDefs));
    });
  }

  public componentDidMount() {
    SDK.init();

    var intervalId = setInterval(this.refreshData, 5000);
    this.setState( { intervalId: intervalId});

    /*
    // TODO: If build def not been runs since x days... not list it !!
    getBuildDefinitions(this.projectName).then(result => {
      console.log("Def Count: " + result.length);
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        console.log(result[i].name);
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          if(currentBuildDef != undefined){
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      console.log("Result Table: " + currentBuildState.length);
      // Update the currentBuilds Definition
      this.setState({ buildDefs: currentBuildState });
    });

    // Get the All build instance
    getBuilds(this.projectName).then(result=> {
      let buildsList = this.state.builds;
      for(let i=0;i<result.length;i++){
        let newBuild = result[i];
        let currentBuild = buildsList.find(x=> x.id === newBuild.id);
        if(currentBuild === undefined){
          buildsList.push(newBuild);
        } else {
          currentBuild = newBuild;
        }
      }
      this.setState({ builds: buildsList });
    });

    getReleases(this.projectName).then(result => {
      let releaseList = this.state.releases;
      for(let i=0;i<result.length;i++){
        let newRelease = result[i];
        let currentRelease = releaseList.find(x=> x.id === newRelease.id);
        if(currentRelease === undefined) {
          releaseList.push(newRelease);
        } else {
          currentRelease = newRelease;
        }
      }
      this.setState({releases: releaseList });
    });
    */
  }

  private itemProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(
    new ArrayItemProvider(this.state.buildDefs)
  );

  private buildItemProvider = new ObservableValue<ArrayItemProvider<Build>>(
    new ArrayItemProvider(this.state.builds.filter(x=> x.definition.id === this.currentSelectedBuildReferenceId.value))
  );

  public render() : JSX.Element {
    const onDismiss = () => {
      this.isDialogOpen.value = false;
      this.currentSelectedBuildReferenceId.value = -1;
    };

    return (
      <Card className="flex-grow bolt-table-card" 
            titleProps={{ text: "All pipelines" }} 
            contentProps={{ contentPadding: false }}>
        <Observer isDialogOpen={this.isDialogOpen}>
          {(props: { isDialogOpen: boolean }) => {
            return props.isDialogOpen ? (
              <CustomDialog onDismiss={onDismiss} modal={true}>
                <CustomHeader className="bolt-header-with-commandbar" separator>
                  <HeaderTitleArea>
                    <div className="flex-grow scroll-hidden"
                        style={{ marginRight: "16px" }}>
                      <div className="title-m"
                          style={{
                              height: "500px",
                              width: "500px",
                              maxHeight: "32px" }}>
                          Build details
                      </div>
                    </div>
                  </HeaderTitleArea>
                </CustomHeader>
                <PanelContent>
                  <Observer itemProvider={this.buildItemProvider}>
                    {(observableProps: {itemProvider: ArrayItemProvider<Build> }) => (
                      <Table<Build> columns={buildColumns}
                                    itemProvider={observableProps.itemProvider}
                                    showLines={true}
                                    role="table"/>
                    )}
                  </Observer>
                </PanelContent>
                <PanelFooter showSeparator className="body-m">
                  Footer here !!
                </PanelFooter>
              </CustomDialog>
            ) : null;
          }}
        </Observer>
        <Observer itemProvider={this.itemProvider}>
          {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => (
            <Table<BuildDefinitionReference> columns={dashboardColumns} 
                itemProvider={observableProps.itemProvider}
                showLines={true}
                onSelect={(event, data) => {
                  this.currentSelectedBuildReferenceId.value = data.data.id;
                  this.isDialogOpen.value = true;
                  this.buildItemProvider = new ObservableValue<ArrayItemProvider<Build>>(
                    new ArrayItemProvider(this.state.builds.filter(x=> x.definition.id === this.currentSelectedBuildReferenceId.value))
                  );
                }}
                role="table"/>
          )}
        </Observer>
      </Card>
    );
  }
}

showRootComponent(<CICDDashboard />);