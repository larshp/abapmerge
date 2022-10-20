import PackageInfo from "../package.json";

export default class AbapmergeMarker {
  public render(): string {
    return `
****************************************************
INTERFACE lif_abapmerge_marker.
* abapmerge ${ PackageInfo.version } - ${ new Date().toJSON() }
ENDINTERFACE.
****************************************************
`;
  }
}
