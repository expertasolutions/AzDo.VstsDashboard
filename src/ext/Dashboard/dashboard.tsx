import "es6-promise/auto";

import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { 
  getBuildDefinitionsV1
, getBuildsV1
, getReleasesV1
, getProjects
, getProject
, sortBuilds
, sortBuildReferences
, getMinTimeFromNow
, setUserPreferences
, getUserPreferences
} from "./PipelineServices";

import { dashboardColumns, buildColumns }  from "./tableData";

import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { DropdownFilterBarItem } from "azure-devops-ui/Dropdown";
import { DropdownSelection, DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Page } from "azure-devops-ui/Page";
import { Link } from "azure-devops-ui/Link";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";

import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build, BuildStatus, BuildResult } from "azure-devops-extension-api/Build";
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
import { ZeroData } from "azure-devops-ui/ZeroData";
import { CommonServiceIds, IProjectPageService, IHostPageLayoutService } from "azure-devops-extension-api";

const isFullScreen = new ObservableValue(false);

const buildNeverQueued = new ObservableValue(0);
const buildCancelled = new ObservableValue(0);
const buildInPending = new ObservableValue(0);
const buildInProgress = new ObservableValue(0);
const buildSucceeded = new ObservableValue(0);
const buildInWarning = new ObservableValue(0);
const buildInError = new ObservableValue(0);

class CICDDashboard extends React.Component<{}, {}> {
  private isLoading = new ObservableValue<boolean>(true);
  
  private selectedTabId = new ObservableValue("summary");
  private refreshUI = new ObservableValue(new Date().toTimeString());

  private projectSelection = new DropdownMultiSelection();
  private allDeploymentSelection = new DropdownSelection();
  private errorsOnSummaryTopSelection = new DropdownSelection();
  private onlyWithDeploymentSelection = new DropdownSelection();
  private lastBuildsDisplaySelection = new DropdownSelection();

  private filter: Filter = new Filter();
  private allDeploymentFilter: Filter = new Filter();
  private errorsOnSummaryTopFilter = new Filter();
  private onlyBuildWithDeploymentFilter: Filter = new Filter();
  private lastBuildsDisplayFilter: Filter = new Filter();

  private currentSelectedProjects: Array<string> = new Array<string>();
  private initialProjectName : string = "";
  private extensionVersion : string = "";
  private releaseNoteVersion: string = "";

  private showAllBuildDeployment = false;
  private showOnlyBuildWithDeployments = false;
  private showErrorsOnSummaryOnTop = true;
  private lastBuildsDisplay = "lastHour";

  private buildTimeRangeHasChanged = true;
  private hostInfo: any = undefined;
  private extContext: any = undefined;

  constructor(props: {}) {
    super(props);
    this.filter = new Filter();
    setInterval(()=> this.updateFromProject(false), 5000);
  }

  state = {
    buildDefs: new Array<BuildDefinitionReference>(),
    builds: new Array<Build>(),
    releases: new Array<Deployment>(),
    projects: new Array<TeamProjectReference>(),
    showAllBuildDeployment: false,
    refreshUI: new Date().toTimeString(),
    fullScreenMode: false
  };

  private onFilterReset = async () => {
    let nam = this.initialProjectName;
    let prj = this.state.projects.find(x=> x.name === nam);
    if(prj != undefined) {
      let index = this.state.projects.indexOf(prj);
      this.projectSelection.select(index);
      this.allDeploymentSelection.select(1);
      this.showOnlyBuildWithDeployments = false;
      this.errorsOnSummaryTopSelection.select(0);
      this.showErrorsOnSummaryOnTop = true;
      this.onlyWithDeploymentSelection.select(1);
      this.lastBuildsDisplaySelection.select(0);
      this.lastBuildsDisplay = "lastHour";
      this.showAllBuildDeployment = false;
      this.updateFromProject(true);
    }
  }

  private onFilterChanged = () => {
    this.filterData();
    this.filterBuildsData();
    this.refreshUI.value = new Date().toTimeString();
  }

  private isFullScreenValueChanged = () => {
    this.setState({ fullScreenMode: isFullScreen.value });
  }

  // BuildDefinition Summary
  private filterData() {
    let filterState = this.filter.getState();

    let buildDefList = new Array<BuildDefinitionReference>();

    if(filterState.pipelineKeyWord !== undefined && filterState.pipelineKeyWord !== null && filterState.pipelineKeyWord.value !== "") {
      let pipelineFilterText = filterState.pipelineKeyWord.value.toLowerCase();
      
      let elm = this.state.buildDefs.filter(
        x=> x.name.toLowerCase().indexOf(pipelineFilterText) !== -1 || 
        (x.latestCompletedBuild != null && x.latestCompletedBuild.buildNumber.toLowerCase().indexOf(pipelineFilterText) !== -1) ||
        (x.latestCompletedBuild != null && x.latestCompletedBuild.sourceBranch.toLowerCase().indexOf(pipelineFilterText) !== -1)
      );

      if(elm.length === 0) {
        try {
          let regexSearcher = new RegExp(pipelineFilterText.toLowerCase());
          elm = this.state.buildDefs.filter(
              x=> regexSearcher.test(x.name.toLowerCase()) ||
              (x.latestCompletedBuild != null && regexSearcher.test(x.latestCompletedBuild.buildNumber.toLowerCase())) ||
              (x.latestCompletedBuild != null && regexSearcher.test(x.latestCompletedBuild.sourceBranch.toLowerCase()))
          );
        } catch {
          elm = [];
        }
      }

      buildDefList = elm;
    } else {
      buildDefList = this.state.buildDefs;
    }

    if(this.showOnlyBuildWithDeployments) {
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

    buildDefList = sortBuildReferences(buildDefList, this.showErrorsOnSummaryOnTop);
    this.buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(buildDefList));
  }

  // All Builds
  private filterBuildsData() {
    let filterState = this.filter.getState();

    let buildList = Array<Build>();
    if(filterState.pipelineKeyWord !== undefined && filterState.pipelineKeyWord !== null && filterState.pipelineKeyWord.value !== "") {
      let pipelineFilterText = filterState.pipelineKeyWord.value.toLowerCase();
      let elm = this.state.builds.filter(x=> x.definition.name.toLowerCase().indexOf(pipelineFilterText) !== -1 || x.buildNumber.toLowerCase().indexOf(pipelineFilterText) !== -1);

      if(elm.length === 0) {
        try {
          let regexSearcher = new RegExp(pipelineFilterText.toLowerCase());
          elm = this.state.builds.filter(
              x=> regexSearcher.test(x.definition.name.toLowerCase()) ||
              (regexSearcher.test(x.buildNumber.toLowerCase())) ||
              (regexSearcher.test(x.sourceBranch.toLowerCase()))
          );
        } catch {
          elm = [];
        }
      }
      buildList = elm;

    } else {
      buildList = this.state.builds;
    }

    if(this.showOnlyBuildWithDeployments) {
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
      let currentDef = this.state.buildDefs;

      if(firstLoad) {
        currentDef = result;
      } else {
        for(let i=0;i<result.length;i++) {
          let newDef = result[i];
          let def = currentDef.find(x=> x.id === newDef.id);
          if(def !== undefined) {
            let defIndx = currentDef.indexOf(def, 0);
            if(defIndx > -1) {
              currentDef[defIndx] = newDef;
            }
          } else {
            currentDef.push(newDef);
          }
        }
      }

      this.setState({ buildDefs: currentDef });
      this.buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(currentDef));

      // Get Build Reference Status
      buildNeverQueued.value = this.getCompletedBuildStatusCount(BuildStatus.None, BuildResult.None);
      buildCancelled.value = this.getCompletedBuildStatusCount(BuildStatus.None, BuildResult.Canceled);
      buildSucceeded.value = this.getCompletedBuildStatusCount(BuildStatus.Completed, BuildResult.Succeeded);
      buildInWarning.value = this.getCompletedBuildStatusCount(BuildStatus.Completed, BuildResult.PartiallySucceeded);
      buildInError.value = this.getCompletedBuildStatusCount(BuildStatus.Completed, BuildResult.Failed);

      this.filterData();
    }).then(()=> {
      SDK.ready().then(()=> { this.isLoading.value = false; });
    });
   
    // Update the Release List
    getReleasesV1(this.currentSelectedProjects, firstLoad).then(result => {
      let currentReleases = this.state.releases;
      if(firstLoad) {
        currentReleases = result;
      } else {
        for(let i=0;i<result.length;i++) {
          let newRelease = result[i];
          let rel = currentReleases.find(x=> x.id === newRelease.id);
          if(rel !== undefined) {
            let relIndex = currentReleases.indexOf(rel, 0);
            if(relIndex > -1) {
              currentReleases[relIndex] = newRelease;
            }
          } else {
            currentReleases.splice(0, 0, newRelease);
          }
        }
      }
      this.setState({ releases: currentReleases });
    });
    
    // Update Builds Runs list...
    if(firstLoad) {
      this.buildTimeRangeHasChanged = true;
    }

    getBuildsV1(this.currentSelectedProjects, this.buildTimeRangeHasChanged, this.lastBuildsDisplay).then(result => {
      let currentResult = this.state.builds;

      for(let i=0;i<result.length;i++) {
        let newElement = result[i];
        let existingElement = currentResult.find(x=> x.id === newElement.id);
        if(existingElement !== undefined) {
          let buildIndex = currentResult.indexOf(existingElement, 0);
          if(buildIndex > -1) {
            currentResult[buildIndex] = newElement;
            let buildDefs = this.state.buildDefs;
            let buildDef = buildDefs.find(x=> x.id === newElement.definition.id);
            if(buildDef !== undefined && buildDef.latestBuild.id <= newElement.id) {
              let buildDefIndex = buildDefs.indexOf(buildDef, 0);
          
              if(buildDefIndex > -1) {
                buildDefs[buildDefIndex].latestBuild = newElement;
                let newbuildDef = sortBuildReferences(this.state.buildDefs, this.showErrorsOnSummaryOnTop);
                this.setState({ buildDefs: newbuildDef });
                this.filterData();
              }
            }
          }
        } else {
          currentResult.push(newElement);
        }
      }

      currentResult = sortBuilds(currentResult);

      // Get Build Reference Status
      buildInPending.value = this.getActiveBuildStatusCount(BuildStatus.NotStarted, currentResult);
      buildInProgress.value = this.getActiveBuildStatusCount(BuildStatus.InProgress, currentResult);

      this.setState({ builds: currentResult });
      this.refreshUI.value = new Date().toTimeString();
      this.buildTimeRangeHasChanged = false;

      this.filterBuildsData();
    });
  }

  private onOnlyBuildWithDeployments = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.text !== undefined) {
      let showAll = item.text === "Yes";
      this.showOnlyBuildWithDeployments = showAll;
    } else {
      this.showOnlyBuildWithDeployments = false;
    }
    this.assignUserPreferences();
    this.refreshUI.value = new Date().toTimeString();
    this.filterData();
    this.filterBuildsData();
  }

  private onErrorsOnSummaryOnTop = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    let showAll = true;
    if(item.id !== undefined) {
      showAll = item.id === "true";
    }
    this.showErrorsOnSummaryOnTop = showAll;
    this.assignUserPreferences();
    
    this.refreshUI.value = new Date().toTimeString();
    this.filterData();
  }

  private onAllDeploymentSelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.text !== undefined) {
      let showAll = item.text === "Yes";
      this.showAllBuildDeployment = showAll;
    } else {
      this.showAllBuildDeployment = false;
    }
    this.assignUserPreferences();
    this.setState({ showAllBuildDeployment: this.showAllBuildDeployment });
    this.refreshUI.value = new Date().toTimeString();
    this.filterData();
  }

  private onProjectSelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    // Reset the Pipeline KeyWord only, when TeamProject selection has changed
    let filterState = this.filter.getState();
    this.buildTimeRangeHasChanged = true;
    filterState.pipelineKeyWord = null;
    this.filter.setState(filterState);

    this.setState({ builds: new Array<Build>() });
    this.buildProvider.value = new ArrayItemProvider(this.state.builds);
    
    this.updateFromProject(true);
    this.assignUserPreferences();
  }

  private assignUserPreferences() {
    /************ Preferences storage tests ***********/
    setUserPreferences(
      this.currentSelectedProjects
    , (this.showErrorsOnSummaryOnTop ? 0 : 1)
    , (this.showOnlyBuildWithDeployments ? 0 : 1)
    , (this.showAllBuildDeployment ? 0 : 1)
    , this.extContext, this.hostInfo.name);
    /************ Preferences storage tests ***********/
  }

  private onLastBuildsDisplaySelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    if(item.text !== undefined) {
      this.lastBuildsDisplay = item.id;
    }
    this.buildTimeRangeHasChanged = true;
    this.refreshUI.value = new Date().toTimeString();
    this.updateFromProject(false);
  }

  public async loadProjects() {
    let result = await getProjects();
    this.setState( { projects: result });
  }

  public componentDidMount() {
    this.initializeState();    
    this.filter.subscribe(this.onFilterChanged, FILTER_CHANGE_EVENT);
    this.filter.subscribe(this.onFilterReset, FILTER_RESET_EVENT);
    isFullScreen.subscribe(this.isFullScreenValueChanged);
  }

  public componentWillMount() {
    this.filter.unsubscribe(this.onFilterChanged, FILTER_CHANGE_EVENT);
    this.filter.unsubscribe(this.onFilterReset, FILTER_RESET_EVENT);
    isFullScreen.unsubscribe(this.isFullScreenValueChanged);
  }

  private async initializeState(): Promise<void> {
    await SDK.init();
    //await SDK.ready();
    this.hostInfo = SDK.getHost();
    this.extContext = SDK.getExtensionContext();
    this.extensionVersion = "v" + this.extContext.version;
    this.releaseNoteVersion = "https://github.com/expertasolutions/VstsDashboard/releases/tag/" + this.extContext.version;

    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    let currentProject = await projectService.getProject();

    await this.loadProjects();
    this.setState({ releases: new Array<Deployment>(), builds: new Array<Build>() });

    if(currentProject != undefined){
      this.initialProjectName = currentProject.name;
      let prj = this.state.projects.find(x=> x.name === this.initialProjectName);
      if(prj != undefined) {
        let index = this.state.projects.indexOf(prj);

        // If no UsersPreferences is set...
        this.projectSelection.select(index);

        // Select Projectlist from the UserPreferences
        let userPreferences = await getUserPreferences(this.extContext, this.hostInfo.name);
        for(let i=0;i<userPreferences.selectedProjects.length;i++) {
          let prString = userPreferences.selectedProjects[i]
          let pr = this.state.projects.find(x=> x.name === prString);
          if(pr !== undefined) {
            let idx = this.state.projects.indexOf(pr);
            this.projectSelection.select(idx);
          }
        }
        //
        if(userPreferences !== undefined) {
          this.showAllBuildDeployment = (userPreferences.showAllDeployment === 0);
          this.allDeploymentSelection.select(userPreferences.showAllDeployment);

          this.showOnlyBuildWithDeployments = (userPreferences.withDeploymentOnly === 0);
          this.onlyWithDeploymentSelection.select(userPreferences.withDeploymentOnly);
          
          this.showErrorsOnSummaryOnTop = (userPreferences.showErrorsOnTop === 0);
          this.errorsOnSummaryTopSelection.select(userPreferences.showErrorsOnTop);

          this.lastBuildsDisplaySelection.select(0);
        } else {
          this.allDeploymentSelection.select(1);
          this.onlyWithDeploymentSelection.select(1);
          this.errorsOnSummaryTopSelection.select(0);
          this.lastBuildsDisplaySelection.select(0);
        }

        this.updateFromProject(true);
        this.filterData();
        this.filterBuildsData();
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
            primaryText="No Pipeline definitions founds"
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
    } else if(tabId === "builds" && this.buildProvider.value.length === 0) {
      return (
        <div className="flex-center">
          <ZeroData
            primaryText="No build has been runs from a while for the selected Team Projects"
            secondaryText={
              <span>
                If it's not an holiday, are you sure that your team is working ? ;)
              </span>
            }
            imageAltText="No builds has been runs from a while..."
            imagePath="https://ms.gallerycdn.vsassets.io/extensions/ms/vss-releasemanagement-web/18.166.0.311329757/1586412473334/release-landing/zerodata-release-management-new.png"
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
          <Observer itemProvider={this.buildReferenceProvider} refreshUI={ this.refreshUI } >
            {(props: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => 
              {
                return (
                  <Table<BuildDefinitionReference> columns={dashboardColumns} 
                      itemProvider={props.itemProvider}
                      showLines={true}
                      role="table"/>
                );
              }
            }
          </Observer>
        )
      } else {
        return this.renderZeroData(tabId);
      }
    } else if(tabId === "builds") {
      return (
        <Observer itemProvider={ this.buildProvider }>
          {(observableProps: { itemProvider: ArrayItemProvider<Build> }) => (
              <Table<Build> columns={buildColumns} 
                  itemProvider={observableProps.itemProvider}
                  showLines={true}
                  role="table"/>
          )}
        </Observer>
      );
    } else {
      return this.renderZeroData(tabId);
    }
  }

  public renderTabBar() : JSX.Element {
    return (<TabBar
            onSelectedTabChanged={this.onSelectedTabChanged}
            selectedTabId={this.selectedTabId}
            tabSize={TabSize.Tall}
            renderAdditionalContent={this.renderOptionsFilterView}>
            <Tab name="Summary" id="summary"/>
            <Tab name="All Runs" id="builds"/>
          </TabBar>);
  }

  private getActiveBuildStatusCount(statusToFind:BuildStatus, builds:Array<Build>) {
    if(statusToFind === BuildStatus.InProgress || statusToFind === BuildStatus.NotStarted) {
      return builds.filter(x=> x.status === statusToFind).length;
    }
    return 0;
  }

  private getCompletedBuildStatusCount(statusToFind:BuildStatus, resultToFind:BuildResult) {
    if(statusToFind === BuildStatus.None && resultToFind === BuildResult.None){
      return this.state.buildDefs.filter(x=> x.latestCompletedBuild === undefined && x.latestBuild === undefined).length;
    }
    else if(statusToFind === BuildStatus.InProgress || statusToFind === BuildStatus.NotStarted) {
      return this.state.builds.filter(x=> x.status === statusToFind).length;
    } else if(statusToFind === BuildStatus.None) {
      return this.state.buildDefs.filter(x=> x.latestBuild !== undefined && x.latestBuild.result == resultToFind).length;
    }
    return this.state.buildDefs.filter(x=> x.latestBuild !== undefined && x.latestBuild.status === statusToFind && x.latestBuild.result == resultToFind).length;
  }

  public renderOptionsFilterView() : JSX.Element {
    return (
      <div>
        <span className="font-size-m"><Status {...Statuses.Queued} size={StatusSize.m}/>&nbsp;{buildNeverQueued.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Canceled} size={StatusSize.m}/>&nbsp;{buildCancelled.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Waiting} size={StatusSize.m}/>&nbsp;{buildInPending.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Running} size={StatusSize.m}/>&nbsp;{buildInProgress.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Success} size={StatusSize.m}/>&nbsp;{buildSucceeded.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Warning} size={StatusSize.m}/>&nbsp;{buildInWarning.value}</span>&nbsp;&nbsp;
        <span className="font-size-m"><Status {...Statuses.Failed} size={StatusSize.m}/>&nbsp;{buildInError.value}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
        <Link href="https://github.com/expertasolutions/VstsDashboard/issues/new" target="_blank">
          <Icon iconName="FeedbackRequestSolid" size={IconSize.medium}/>
        </Link>&nbsp;&nbsp;&nbsp;
        <Link onClick={async ()=> {
          isFullScreen.value = !isFullScreen.value;
          const layoutService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
          layoutService.setFullScreenMode(isFullScreen.value);
        }} >
          <Icon iconName={isFullScreen.value ? "BackToWindow": "FullScreen"} size={IconSize.medium}/>
        </Link>
      </div>
    );
  }

  public renderHeader() : JSX.Element {
    if(!isFullScreen.value) {
      return (
        <CustomHeader>
          <HeaderTitleArea>
            <HeaderTitleRow>
              <HeaderTitle titleSize={TitleSize.Large}>
                CI/CD Dashboard
              </HeaderTitle>
            </HeaderTitleRow>
            <HeaderDescription>
              <Link href={this.releaseNoteVersion} target="_blank" subtle={true}>{this.extensionVersion}</Link>&nbsp;
            </HeaderDescription>
          </HeaderTitleArea>
        </CustomHeader>
      );
    } else {
      return (<div></div>);
    }
  }

  public render() : JSX.Element {
    return (
      <Surface background={SurfaceBackground.neutral}>
        <Page className="pipelines-page flex-grow">
          {this.renderHeader()}
          <div className="page-content-left page-content-right page-content-top">
            {this.renderTabBar()}
          </div>
          <div className="page-content-left page-content-right page-content-top">
          <Observer selectedTabId={this.selectedTabId} isLoading={this.isLoading}>
            {(props: { selectedTabId: string, isLoading: boolean}) => {
                let errorOnTopFilter = (
                  <DropdownFilterBarItem
                        filterItemKey="errorsOnSummaryTop"
                        filter={this.errorsOnSummaryTopFilter}
                        disabled={props.selectedTabId !== "summary"}
                        items={[
                          { id:"true", text: "Cancelled/Failed/Partial on top"},
                          { id:"false", text: "By Queue date"}
                        ]}
                        placeholder="Status order"
                        onSelect={this.onErrorsOnSummaryOnTop}
                        selection={this.errorsOnSummaryTopSelection}
                        hideClearAction={true}/>
                );

                let lastBuildsDisplay = (
                  <DropdownFilterBarItem
                    filterItemKey="lastBuildsDisplay"
                    filter={this.lastBuildsDisplayFilter}
                    disabled={props.selectedTabId === "summary"}
                    placeholder="Show Pipelines from"
                    items={[
                      { id: "lastHour", text: "Last hour"},
                      { id: "last4Hours", text: "Last 4 hours"},
                      { id: "last8Hours", text: "Last 8 hours"},
                      { id: "today", text: "Today"},
                      { id: "yesterday", text: "Yesterday"},
                      { id: "lastweek", text: "Last Week"},
                    ]}
                    onSelect={this.onLastBuildsDisplaySelected}
                    selection={this.lastBuildsDisplaySelection}
                    hideClearAction={true}/>
                );

                if(props.selectedTabId !== "summary") {
                  errorOnTopFilter = (<div></div>);
                } else {
                  lastBuildsDisplay = (<div></div>);
                }

                return (
                  <FilterBar filter={this.filter}>
                    <KeywordFilterBarItem filterItemKey="pipelineKeyWord" />
                    { errorOnTopFilter }
                    { lastBuildsDisplay }
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
                <Observer isLoading={this.isLoading} refreshUI={this.refreshUI}> 
                  {(props: {isLoading: boolean }) => {
                    if(props.isLoading) {
                      return this.renderFirstLoad();
                    } else {
                      return (
                        <Observer selectedTabId={this.selectedTabId} refreshUI={this.refreshUI}>
                            {(props: { selectedTabId: string, refreshUI: string }) => {
                              if(this.state.buildDefs === undefined || this.state.buildDefs.length === 0){
                                return this.renderZeroData(this.selectedTabId.value);
                              } else if(this.state.buildDefs.length > 0 && this.state.builds.length === 0 && props.selectedTabId === "builds") {
                                return this.renderZeroData(this.selectedTabId.value);
                              } else if(this.buildReferenceProvider.value.length === 0) {
                                return this.renderZeroData(this.selectedTabId.value);
                              } else {
                                return (
                                  <div>
                                    <Card className="flex-grow bolt-table-card" 
                                        titleProps={{ text: "All pipelines" }} 
                                        contentProps={{ contentPadding: false }}>
                                      <div style={{ marginTop: "16px;", marginBottom: "16px;"}}>
                                          { this.renderTab(props.selectedTabId) }
                                      </div>
                                    </Card>
                                  </div>
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
