export interface IDashboardConfig {
  env: {
    name:string;
  },
  TfsAccessInfo: {
    TfsUrl:string;
    pat:string;
    apiVersion :IApiVersion;
  }
}

export interface IApiVersion{
    projects:string;
    builds:string;
    releases:string;
    resourceAreas:string;
}