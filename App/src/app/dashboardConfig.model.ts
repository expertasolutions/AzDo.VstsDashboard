export interface IDashboardConfig {
  env: {
    name:string;
  },
  tfsKind:string;
  azureDevOpsDetails:{
    orgName:string;
    pat:string;
  },
  OnPremise: {
    TfsUrl:string;
  }
}