import "es6-promise/auto";

import * as React from "react";

import * as SDK from "azure-devops-extension-sdk";

import { getBuildDefinitionsV1, getBuildsV1 , getReleasesV1, getProjects, getProject, sortBuilds } from "./PipelineServices";
import { dashboardColumns, buildColumns }  from "./tableData";

import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { DropdownFilterBarItem, Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection, DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Page } from "azure-devops-ui/Page";

import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { DataContext }  from "./dataContext";
import { CustomHeader, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize, HeaderDescription } from "azure-devops-ui/Header";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Filter, FILTER_CHANGE_EVENT, FILTER_RESET_EVENT } from "azure-devops-ui/Utilities/Filter";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";

class CICDDashboard extends React.Component<{}, {}> {
  private isLoading = new ObservableValue<boolean>(true);
  private selectedTabId = new ObservableValue("summary");
  private projectSelection = new DropdownMultiSelection();
  private allDeploymentSelection = new DropdownSelection();
  private errorsOnSummaryTopSelection = new DropdownSelection();
  private onlyWithDeploymentSelection = new DropdownSelection();
  private filter: Filter = new Filter();
  private allDeploymentFilter: Filter = new Filter();
  private errorsOnSummaryTopFilter = new Filter();
  private onlyBuildWithDeploymentFilter: Filter = new Filter();
  private currentSelectedProjects: Array<string> = new Array<string>();
  private initialProjectName : string = "";
  private extensionVersion : string = "";

  constructor(props: {}) {
    super(props);

    this.filter = new Filter();
    setInterval(()=> this.updateFromProject(false), 10000);
    
  }

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Deployment>(),
    projects: Array<TeamProjectReference>(),
    showAllBuildDeployment: false,
    showOnlyBuildWithDeployments: false,
    showErrorsOnSummaryOnTop: true
  };

  private onFilterReset = async () => {
    let nam = this.initialProjectName;
    let prj = this.state.projects.find(x=> x.name === nam);
    if(prj != undefined) {
      let index = this.state.projects.indexOf(prj);
      this.projectSelection.select(index);
      this.allDeploymentSelection.select(1);
      this.setState({ showOnlyBuildWithDeployments: false });
      this.errorsOnSummaryTopSelection.select(0);
      this.setState({ showErrorsOnSummaryOnTop: true });
      this.onlyWithDeploymentSelection.select(1);
      this.setState({ showAllBuildDeployment: false });
      this.updateFromProject(true);
    }
  }

  private onFilterChanged = () => {
    this.filterData();
    this.filterBuildsData();
  };

  // BuildDefinition Summary
  private filterData() {
    let filterState = this.filter.getState();

    let buildDefList = Array<BuildDefinitionReference>();

    if(filterState.pipelineKeyWord !== undefined && filterState.pipelineKeyWord !== null && filterState.pipelineKeyWord.value !== "") {
      let pipelineFilterText = filterState.pipelineKeyWord.value.toLowerCase();
      let elm = this.state.buildDefs.filter(x=> x.name.toLowerCase()
                                                  .indexOf(pipelineFilterText) !== -1 || 
                                                  (x.latestCompletedBuild != null && x.latestCompletedBuild.buildNumber.toLowerCase().indexOf(pipelineFilterText) !== -1));
      buildDefList = elm;
    } else {
      buildDefList = this.state.buildDefs;
    }

    if(this.state.showOnlyBuildWithDeployments) {
      let allBuildWithRelease = buildDefList.filter(
        b => b.latestCompletedBuild != undefined && this.state.releases.find(r=> 
            r.release.artifacts.find(a=> 
              {
                let version = a.definitionReference["version"];
                return version.id === b.latestCompletedBuild.id.toString();
              }) != null
          ) != null
      );
      buildDefList = allBuildWithRelease;
    }
    
    if(this.state.showErrorsOnSummaryOnTop) {
      var reOrder = buildDefList;
      buildDefList = reOrder.sort((a, b) => {
        if(a.latestBuild !== undefined && b.latestBuild !== undefined){
          return b.latestBuild.result - a.latestBuild.result;
        } else if(a.latestBuild !== undefined && b.latestBuild === undefined) {
          return a.latestBuild.result;
        } else if(a.latestBuild === undefined && b.latestBuild !== undefined){
          return b.latestBuild.result;
        } else {
          return 999;
        }
      });
    }

    this.buildReferenceProvider.value = new ArrayItemProvider(buildDefList);
  }

  // All Builds
  private filterBuildsData() {
    let filterState = this.filter.getState();

    let buildList = Array<Build>();
    if(filterState.pipelineKeyWord !== undefined && filterState.pipelineKeyWord !== null && filterState.pipelineKeyWord.value !== "") {
      let pipelineFilterText = filterState.pipelineKeyWord.value.toLowerCase();
      let elm = this.state.builds.filter(x=> x.definition.name.toLowerCase().indexOf(pipelineFilterText) !== -1 || x.buildNumber.toLowerCase().indexOf(pipelineFilterText) !== -1);
      buildList = elm;
    } else {
      buildList = this.state.builds;
    }

    if(this.state.showOnlyBuildWithDeployments) {
      let allBuildWithRelease = buildList.filter(
        b => this.state.releases.find(r=> 
            r.release.artifacts.find(a=> 
              {
                let version = a.definitionReference["version"];
                return version.id === b.id.toString();
              }) != null
          ) != null
      );
      buildList = allBuildWithRelease;
    }
    this.buildProvider.value = new ArrayItemProvider(buildList);
  }

  private updateFromProject(firstLoad:boolean){ 
    this.currentSelectedProjects = new Array<string>();

    for(let i=0;i<this.projectSelection.value.length;i++){
      let items = this.projectSelection.value[i];
      for(let s=items.beginIndex;s<=items.endIndex;s++) {
        let selectedProjectName = this.state.projects[s];
        this.currentSelectedProjects.push(selectedProjectName.name);
      }
    }

    getBuildDefinitionsV1(this.currentSelectedProjects, firstLoad).then(result => {
      this.setState({ buildDefs: result });
      this.filterData();
    }).then(()=> {
      SDK.ready().then(()=> { this.isLoading.value = false; });
    });
   
    // Update the Release List
    getReleasesV1(this.currentSelectedProjects, firstLoad).then(result => {
      this.setState({releases: result });
    });

    // Update Builds Runs list...
    getBuildsV1(this.currentSelectedProjects, firstLoad).then(result => {
      let currentBuilds = this.state.builds;

      if(this.state.builds !== undefined && this.state.builds.length > 0) {
        for(let i=0;i<result.length;i++){
          let newElement = result[i];
          let existing = currentBuilds.find(x=> x.id === newElement.id);

          if(existing !== undefined) {

          } else {
            currentBuilds.push(newElement);
          }
        }
      }
      else {
        currentBuilds = result;
      }

      let newResult = sortBuilds(currentBuilds);
      this.setState({ builds: newResult });
      this.filterBuildsData();
    });
  }

  private onOnlyBuildWithDeployments = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.text !== undefined) {
      let showAll = item.text === "Yes";
      this.setState({ showOnlyBuildWithDeployments: showAll });
    } else {
      this.setState({ showOnlyBuildWithDeployments: false });
    }
    //this.updateFromProject();
  }

  private onErrorsOnSummaryOnTop = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.id !== undefined) {
      let showAll = item.id === "true";
      this.setState({ showErrorsOnSummaryOnTop: showAll });
    } else {
      this.setState({ showErrorsOnSummaryOnTop: true });
    }
    //this.updateFromProject();
  }

  private onAllDeploymentSelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.text !== undefined) {
      let showAll = item.text === "Yes";
      this.setState({ showAllBuildDeployment: showAll });
    } else {
      this.setState({ showAllBuildDeployment: false });
    }
  }

  private onProjectSelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    // Reset the Pipeline KeyWord only, when TeamProject selection has changed
    let filterState = this.filter.getState();
    filterState.pipelineKeyWord = null;
    this.filter.setState(filterState);
    //this.updateFromProject();
  }

  public async loadProjects() {
    let result = await getProjects();
    this.setState( { projects: result });
  }

  public componentDidMount() {
    this.initializeState();    
    this.filter.subscribe(this.onFilterChanged, FILTER_CHANGE_EVENT);
    this.filter.subscribe(this.onFilterReset, FILTER_RESET_EVENT);
  }

  public componentWillMount() {
    this.filter.unsubscribe(this.onFilterChanged, FILTER_CHANGE_EVENT);
    this.filter.unsubscribe(this.onFilterReset, FILTER_RESET_EVENT);
  }

  private async initializeState(): Promise<void> {
    await SDK.init();
    //await SDK.ready();

    let hostInfo = SDK.getHost();

    let extContext = SDK.getExtensionContext();
    this.extensionVersion = "v" + extContext.version;

    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    let currentProject = await projectService.getProject();
    await this.loadProjects();

    if(currentProject != undefined){
      this.initialProjectName = currentProject.name;
      let prj = this.state.projects.find(x=> x.name === this.initialProjectName);
      if(prj != undefined) {
        let index = this.state.projects.indexOf(prj);
        this.projectSelection.select(index);
        this.updateFromProject(true);
        this.allDeploymentSelection.select(1);
        this.onlyWithDeploymentSelection.select(1);
        this.errorsOnSummaryTopSelection.select(0);
      }
    }
  }

  private buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(this.state.buildDefs));
  private buildProvider = new ObservableValue<ArrayItemProvider<Build>>(new ArrayItemProvider(this.state.builds));

  private onSelectedTabChanged = (newTabId: string) => {
    this.selectedTabId.value = newTabId;
  }

  private async getProjectUrl(projectName:string) {
    let prj = this.state.projects.find(x=> x.name === projectName);
    if(prj === undefined){
      return "http://perdu.com";
    }
    let prjDetail = await getProject(projectName);
    return prjDetail._links.web.href;
  }

  private renderFirstLoad() : JSX.Element {
    return (
      <div className="flex-center">
          <ZeroData
            primaryText="Loading in progress..."
            secondaryText={
              <span></span>
            }
            imageAltText="Bars"
            imagePath="https://cdn.vsassets.io/ext/ms.vss-build-web/pipelines/Content/no-builds.G8i4mxU5f17yTzxc.png"
          />
        </div>
    );
  }

  private renderZeroData(tabId: string) : JSX.Element {
    if(this.currentSelectedProjects.length === 0){
      return (<div className="flex-center">
          <ZeroData
            primaryText="No Team Project selected"
            secondaryText={
              <span>
                Select at least one Team Project to show CI/CD pipeline status
              </span>
            }
            imageAltText="Bars"
            imagePath="https://cdn.vsassets.io/ext/ms.vss-build-web/pipelines/Content/no-builds.G8i4mxU5f17yTzxc.png"
          />
        </div>);
    }
    else if(this.buildReferenceProvider.value.length === 0){
      return (
        <div className="flex-center">
          <ZeroData
            primaryText="No Pipeline definitions exists for the selected Team Projects"
            secondaryText={
              <span>
                You will have to create Pipeline definitions to see CI/CD builds and releases status
              </span>
            }
            imageAltText="Bars"
            imagePath="https://cdn.vsassets.io/ext/ms.vss-build-web/pipelines/Content/no-builds.G8i4mxU5f17yTzxc.png"
          />
        </div>
      );
    } else {
      return (<div></div>);
    }
  }

  private renderTab(tabId: string) : JSX.Element {
    if(tabId === "summary") {
      if(this.buildReferenceProvider.value.length > 0) {
        return (
          <Observer itemProvider={this.buildReferenceProvider}>
            {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => 
              {
                return (
                  <Table<BuildDefinitionReference> columns={dashboardColumns} 
                      itemProvider={observableProps.itemProvider}
                      showLines={true}
                      role="table"/>
                );
              }
            }
          </Observer>
        )
      } else {
        return (<div></div>)
      }
    } else if(tabId === "builds") {
      return (
        <Observer itemProvider={ this.buildProvider }>
          {(observableProps: {itemProvider: ArrayItemProvider<Build> }) => (
              <Table<Build> columns={buildColumns} 
                  itemProvider={observableProps.itemProvider}
                  showLines={true}
                  role="table"/>
          )}
        </Observer>
      )
    } else {
      return (<div></div>);
    }
  }

  public renderTabBar() : JSX.Element {
    return (<TabBar
            onSelectedTabChanged={this.onSelectedTabChanged}
            selectedTabId={this.selectedTabId}
            tabSize={TabSize.Tall}>
            <Tab name="Summary" id="summary"/>
            <Tab name="All Runs" id="builds"/>
          </TabBar>);          
  }

  public render() : JSX.Element {
    return (
      <Surface background={SurfaceBackground.neutral}>
        <Page className="pipelines-page flex-grow">
          <CustomHeader>
            <HeaderTitleArea>
              <HeaderTitleRow>
                <HeaderTitle titleSize={TitleSize.Large}>
                  CI/CD Dashboard
                </HeaderTitle>
              </HeaderTitleRow>
              <HeaderDescription>
                {this.extensionVersion}
              </HeaderDescription>
            </HeaderTitleArea>
          </CustomHeader>
          <div className="page-content-left page-content-right page-content-top">
            {this.renderTabBar()}
          </div>
          <div className="page-content-left page-content-right page-content-top">
          <Observer selectedTabId={this.selectedTabId} isLoading={this.isLoading}>
            {(props: { selectedTabId: string, isLoading: boolean }) => {
                let errorOnTopFilter = (
                  <DropdownFilterBarItem
                        filterItemKey="errorsOnSummaryTop"
                        filter={this.errorsOnSummaryTopFilter}
                        disabled={props.selectedTabId !== "summary"}
                        items={[
                          { id:"true", text: "Failure/Partial on top"},
                          { id:"false", text: "By Queue date"}
                        ]}
                        placeholder="Status order"
                        onSelect={this.onErrorsOnSummaryOnTop}
                        selection={this.errorsOnSummaryTopSelection}
                        hideClearAction={true}/>
                );

                if(props.selectedTabId !== "summary") {
                  errorOnTopFilter = (<div></div>);
                }

                return (
                  <FilterBar filter={this.filter}>
                    <KeywordFilterBarItem filterItemKey="pipelineKeyWord" />
                    { errorOnTopFilter }
                    <DropdownFilterBarItem
                      filterItemKey="onlyWithDeployments"
                      filter={this.onlyBuildWithDeploymentFilter}
                      items={[
                        { id:"true", text: "Yes"},
                        { id:"false", text: "No"}
                      ]}
                      placeholder="With deployments only"
                      onSelect={this.onOnlyBuildWithDeployments}
                      selection={this.onlyWithDeploymentSelection}
                      hideClearAction={true}/>
                    <DropdownFilterBarItem
                      filterItemKey="allDeployments"
                      filter={this.allDeploymentFilter}
                      items={[
                        { id:"true", text: "Yes"},
                        { id:"false", text: "No"}
                      ]}
                      placeholder="Show all deployments"
                      onSelect={this.onAllDeploymentSelected}
                      selection={this.allDeploymentSelection}
                      hideClearAction={true}/>
                    <DropdownFilterBarItem
                      filterItemKey="teamProjectId"
                      filter={this.filter}
                      items={this.state.projects.map(i => {
                        return {
                          id: i.id,
                          text: i.name
                        };
                      })}
                      placeholder="Team Project"
                      showFilterBox={true}
                      onSelect={this.onProjectSelected}
                      selection={this.projectSelection}
                      hideClearAction={true}/>
                  </FilterBar>
                );
            }}
            </Observer>
          </div>
          <div className="page-content page-content-top page-content-bottom">
            <DataContext.Provider value={{ state: this.state }}>
                <Observer isLoading={this.isLoading}> 
                  {(props: {isLoading: boolean }) => {
                    if(props.isLoading) {
                      return this.renderFirstLoad();
                    } else {
                      return (
                        <Observer selectedTabId={this.selectedTabId}>
                            {(props: { selectedTabId: string }) => {
                              if(this.state.buildDefs.length === 0){
                                return this.renderZeroData(this.selectedTabId.value);
                              } else {
                                return (
                                  <Card className="flex-grow bolt-table-card" 
                                        titleProps={{ text: "All pipelines" }} 
                                        contentProps={{ contentPadding: false }}>
                                            <div style={{ marginTop: "16px;", marginBottom: "16px;"}}>
                                                { this.renderTab(props.selectedTabId) }
                                            </div>
                                  </Card>
                                );
                              }
                            }}
                          </Observer>
                      )
                    }
                  }}
                </Observer>
                
            </DataContext.Provider>
          </div>
        </Page>
      </Surface>
    );
  }
}

showRootComponent(<CICDDashboard />);