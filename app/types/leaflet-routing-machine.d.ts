import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options: any): any;
    function mapbox(token: string, options?: any): any;
  }
}
