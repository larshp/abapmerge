import PackageInfo from "../package.json";

export default class AbapmergeMarker {
  public render(): string {
    const timestamp = new Date().toJson();
    const abapmergeVersion = PackageInfo.version;
    
    return `
****************************************************
INTERFACE lif_abapmerge_marker.
* abapmerge ${ abapmergeVersion } - ${ timestamp }
  CONSTANTS c_merge_timestamp TYPE string VALUE \`{ timestamp }\`.
  CONSTANTS c_abapmerge_version TYPE string VALUE \`{ abapmergeVersion }\`.
ENDINTERFACE.
****************************************************
`;
  }
}
