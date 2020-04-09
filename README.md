[![Build Status](https://travis-ci.org/larshp/abapmerge.svg?branch=master)](https://travis-ci.org/larshp/abapmerge)
[![npm version](https://badge.fury.io/js/abapmerge.svg)](https://badge.fury.io/js/abapmerge)
[![devDependencies Status](https://david-dm.org/larshp/abapmerge/dev-status.svg)](https://david-dm.org/larshp/abapmerge?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/larshp/abapmerge.svg)](https://greenkeeper.io/)

# abapmerge

Merge ABAP INCLUDEs into single file. Function groups are skipped

### Building

* `npm install`

* `npm test`

### How it works

abapmerge takes a path to the main report and analyzes its code and all files
stored in the same directory and all sub-directories.

The resulting code consists of the code of all found ABAP classes and
interfaces, regardless of their production use in any part of the resulting
report, and contents of ABAP includes found in the main report or the included
reports.

abapmerge expects that the whole directory structure should result into a
single executable program and, hence, if it finds an ABAP report that is not
directly or indirectly included in the main report, abapmerge terminates its
processing without issuing the input.

abapmerge requires file naming schema compatible with the schema used by [abapGit](https://github.com/larshp/abapgit/).

### Additional features

Abapmerge supports pragmas that can be written inside an abap comment. If written as " comment, then indentation before " is also used for output.

`@@abapmerge command params`

Currently supported pragmas:
- **include** {filename} > {string wrapper}
  - {filename} - path to the file relative to script execution dir (argv[0])
  - {string wrapper} is a pattern where `$$` is replaced by the include line
  - `$$` is escaped - ' replaced to '' (to fit in abap string), use `$$$` to skip escaping
- **main** void
  - must be included at the very first line of a ABAP program that should be
    treated as a standalone main report and abamerge should not die with an error
    if the program is never included.

Example

```abap
...
  " @@abapmerge include somefile.txt > APPEND '$$' TO styletab.
...
```
