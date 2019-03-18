import {expect} from "chai";
import InterfaceParser from "../src/interface_parser";
import File from "../src/file";

describe("interface_parser 1", () => {
  it("something", () => {
    const contents = "INTERFACE zif_abapgit_gui_page PUBLIC.\n" +
      "  INTERFACES zif_abapgit_gui_event_handler.\n" +
      "  INTERFACES zif_abapgit_gui_renderable.\n" +
      "  ALIASES on_event FOR zif_abapgit_gui_event_handler~on_event.\n" +
      "  ALIASES render FOR zif_abapgit_gui_renderable~render.\n" +
      "ENDINTERFACE.";

    const f = new File("zif_abapgit_gui_page.intf.abap", contents);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(2);
  });
});
