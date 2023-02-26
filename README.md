[![npm version](https://badge.fury.io/js/abapmerge.svg)](https://badge.fury.io/js/abapmerge)

# abapmerge

Merge ABAP INCLUDEs into single file. Function groups are skipped

## Building

- `npm install`
- `npm test`
- `abapmerge -h` - to see the parameters

## Invocation example

Take `src/zabapgit.prog.abap`, merge it, rename the program (`report` statement) to `zabapgit_standalone` and save to `zabapgit.abap` in the current directory.

- `abapmerge -f src/zabapgit.prog.abap -c zabapgit_standalone -o zabapgit.abap`

## How it works

Abapmerge takes a path to the main report and analyzes its code and all files stored in the same directory and all sub-directories.

The resulting code consists of the code of all found ABAP classes and interfaces, regardless of their production use in any part of the resulting report, and contents of ABAP includes found in the main report or the included reports.

Abapmerge expects that the whole directory structure should result into a single executable program and, hence, if it finds an ABAP report that is not directly or indirectly included in the main report, abapmerge terminates its processing without issuing the input.

Abapmerge requires file naming schema compatible with the schema used by [abapGit](https://github.com/larshp/abapgit).

Global classes `FOR TESTING` are skipped.

## Pragmas

Abapmerge supports pragmas that can be written inside an abap comment. If written as " comment, then indentation before " is also used for output.

`@@abapmerge command params`

Currently supported pragmas:
- **include** {filename} > {string wrapper}
  - {filename} - path to the file relative to script execution dir (argv[0])
  - {string wrapper} is a pattern where `$$` is replaced by the include line
  - `$$` is escaped - ' replaced to '' (to fit in abap string), use `$$$` to skip escaping
- **include-base64** {filename} > {string wrapper}
  - same is `include` just that the data is encoded to base64, supposedly the data is binary.
- **include-cua** {filename.xml} > {variable}
  - reads XML, presumably a serialized PROG/FUGR, and extracts GUI status (CUA) node from it. Then use it to fill `variable`. The `variable` is supposed to be of `zcl_abapgit_objects_program=>ty_cua` type. Required data definitions are also generated e.g. `'DATA ls_adm LIKE variable-adm'`.
- **main** void
  - must be included at the very first line of a ABAP program that should be treated as a standalone main report and abamerge should not die with an error if the program is never included.

### Examples

```abap
...
  " @@abapmerge include somefile.txt > APPEND '$$' TO styletab.
  " @@abapmerge include-cua abapgit.prog.xml > ls_cua
...
```
