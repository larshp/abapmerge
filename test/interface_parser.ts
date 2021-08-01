import {expect} from "chai";
import InterfaceParser from "../src/interface_parser";
import File from "../src/file";

describe("interface_parser 1", () => {
  it("parses interface", () => {
    const f = new File("zif_abapgit_gui_page.intf.abap", `
      INTERFACE zif_abapgit_gui_page PUBLIC.
        INTERFACES zif_abapgit_gui_event_handler.
        INTERFACES zif_abapgit_gui_renderable.
        ALIASES on_event FOR zif_abapgit_gui_event_handler~on_event.
        ALIASES render FOR zif_abapgit_gui_renderable~render.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(2);
    expect(result.getDependencies()).to.contain("zif_abapgit_gui_event_handler");
    expect(result.getDependencies()).to.contain("zif_abapgit_gui_renderable");
  });

  it("parses interface but skips self", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_x TYPE zif_common_types=>ty_type1.
        TYPES ty_y TYPE zif_my_interface=>ty_x.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(1);
    expect(result.getDependencies()).to.contain("zif_common_types");
  });

  it("parses interface with different indentations", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_x TYPE   zif_common_types=>ty_type1.
        INTERFACES   zif_some_other_if.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(2);
    expect(result.getDependencies()).to.contain("zif_common_types");
    expect(result.getDependencies()).to.contain("zif_some_other_if");
  });

  it("parses interface with several refs to same if", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_x TYPE zif_common_types=>ty_type1.
        TYPES ty_y TYPE zif_common_types=>ty_type2.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(1);
    expect(result.getDependencies()).to.contain("zif_common_types");
  });

  it("parses interface with types to from another interface", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_x TYPE zif_common_types=>ty_type1.
        TYPES ty_z TYPE REF TO zif_some_other_if=>ty_obj.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(2);
    expect(result.getDependencies()).to.contain("zif_common_types");
    expect(result.getDependencies()).to.contain("zif_some_other_if");
  });

  it("parses interface and skips REF TO another interface", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_z TYPE REF TO zif_some_other_if.
        TYPES ty_x TYPE TABLE OF REF TO zif_log.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(0);
  });

  it("parses interface throws on missing REF TO and direct ref to interface", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_z TYPE zif_some_other_if~xyz. " ??? just to test it
      ENDINTERFACE.`);

    expect(() => InterfaceParser.parse(f)).throws();
  });

  it("parses interface with 'interfaces:'", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        INTERFACES: zif_some_other_if.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(1);
    expect(result.getDependencies()).to.contain("zif_some_other_if");
  });

  it("parses interface with table types of types from another interface", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES ty_x TYPE TABLE OF zif_common_types=>ty_type1.
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(1);
    expect(result.getDependencies()).to.contain("zif_common_types");
  });

  it("parses interface and does not capture irrelevant references", () => {
    const f = new File("zif_my_interface.intf.abap", `
      INTERFACE zif_my_interface PUBLIC.
        TYPES:
          ty_x TYPE i, " zif_common_types1
          ty_y TYPE i. " zif_common_types2
      ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(0);
  });
});
