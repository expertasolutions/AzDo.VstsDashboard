import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuildDefinitions, getReleases } from "./PipelineServices";
import { dashboardColumns }  from "./tableData";

import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Page } from "azure-devops-ui/Page";

import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { DataContext }  from "./dataContext";
import { Header, TitleSize } from "azure-devops-ui/Header";

class CICDDashboard extends React.Component<{}, {}> {
  private projectName = "Community";
  private selectedTabId = new ObservableValue("summary");

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Deployment>(),
    patate: String,
  };

  public refreshData() {
    getBuildDefinitions(this.projectName).then(result => {
      // CODE_REVIEW: temp fix ... dump shit !!
      this.setState( { buildDefs: Array<BuildDefinitionReference>()});
      this.setState( { patate: "frite" });
      console.log(this.state.buildDefs.length);
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          // CODE_REVIEW: this code not work !!! 
          if(currentBuildDef != undefined) {
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      this.setState({ buildDefs: currentBuildState });
      this.buildReferenceProvider.value = new ArrayItemProvider(this.state.buildDefs);
      console.log("setState is called");
    });
  }

  public componentDidMount() {
    SDK.init();
    this.refreshData();
    /*
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
    */
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
  }

  private buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(
    new ArrayItemProvider(this.state.buildDefs)
  );

  private onSelectedTabChanged = (newTabId: string) => {
    this.selectedTabId.value = newTabId;
  }

  public render() : JSX.Element {
    return (
      <Surface background={SurfaceBackground.neutral}>
        <Page className="pipelines-page flex-grow">
          <Header title="Pipelines" titleSize={TitleSize.Large} />
          <TabBar
            onSelectedTabChanged={this.onSelectedTabChanged}
            selectedTabId={this.selectedTabId}
            tabSize={TabSize.Tall}>
            <Tab name="Summary" id="summary"/>
            <Tab name="All" id="all"/>
          </TabBar>
          <div className="page-content page-content-top">
              <Button text="Refresh" onClick={()=> {
                console.log("refreshData is clicked");
                this.refreshData();
              }} />
              <Card className="flex-grow bolt-table-card" 
                    titleProps={{ text: "All pipelines" }} 
                    contentProps={{ contentPadding: false }}>
                <DataContext.Provider value={{ state: this.state }}>
                  <Observer itemProvider={this.buildReferenceProvider}>
                    {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => (
                      <Table<BuildDefinitionReference> columns={dashboardColumns} 
                          itemProvider={observableProps.itemProvider}
                          showLines={true}
                          role="table"/>
                    )}
                  </Observer>
                </DataContext.Provider>
              </Card>
            </div>
        </Page>
      </Surface>
    );
  }
}

showRootComponent(<CICDDashboard />);