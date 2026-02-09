import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options: any): any;
    function mapbox(
      token: string,
      options?: {
        profile?: string;
        polylinePrecision?: number;
        requestParameters?: Record<string, string>;
      }
    ): any;
  }
}
