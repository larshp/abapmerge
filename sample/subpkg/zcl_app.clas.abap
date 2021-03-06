class zcl_app definition
  public
  create public .

  public section.
    interfaces zif_app.
  protected section.
  private section.
endclass.

class zcl_abapgit_zip implementation.
  method zif_app~run.
    write: / 'Hello'.
  endmethod.
endclass.
