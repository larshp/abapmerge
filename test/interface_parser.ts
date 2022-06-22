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

  it("parse apack", () => {
    const f = new File("zif_abapgit_apack_definitions.intf.abap", `
INTERFACE zif_abapgit_apack_definitions PUBLIC .

  TYPES:
    BEGIN OF ty_dependency,
      group_id       TYPE string,
      artifact_id    TYPE string,
      version        TYPE string,
      sem_version    TYPE zif_abapgit_definitions=>ty_version,
      git_url        TYPE string,
      target_package TYPE devclass,
    END OF ty_dependency,
    ty_dependencies    TYPE STANDARD TABLE OF ty_dependency
                    WITH NON-UNIQUE DEFAULT KEY,

    ty_repository_type TYPE string,

    BEGIN OF ty_descriptor_wo_dependencies,
      group_id        TYPE string,
      artifact_id     TYPE string,
      version         TYPE string,
      sem_version     TYPE zif_abapgit_definitions=>ty_version,
      repository_type TYPE ty_repository_type,
      git_url         TYPE string,
    END OF ty_descriptor_wo_dependencies,

    BEGIN OF ty_descriptor.
      INCLUDE TYPE ty_descriptor_wo_dependencies.
  TYPES:
    dependencies TYPE ty_dependencies,
    END OF ty_descriptor,

    ty_descriptors TYPE STANDARD TABLE OF ty_descriptor WITH NON-UNIQUE DEFAULT KEY.

  CONSTANTS c_dot_apack_manifest TYPE string VALUE '.apack-manifest.xml' ##NO_TEXT.
  CONSTANTS c_repository_type_abapgit TYPE ty_repository_type VALUE 'abapGit' ##NO_TEXT.
  CONSTANTS c_apack_interface_sap TYPE seoclsname VALUE 'IF_APACK_MANIFEST' ##NO_TEXT.
  CONSTANTS c_apack_interface_cust TYPE seoclsname VALUE 'ZIF_APACK_MANIFEST' ##NO_TEXT.
ENDINTERFACE.`);

    const result = InterfaceParser.parse(f);

    expect(result.getDependencies().length).to.equal(1);
  });
});
