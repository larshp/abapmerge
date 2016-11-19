[![Build Status](https://travis-ci.org/larshp/abapmerge.svg?branch=master)](https://travis-ci.org/larshp/abapmerge)
[![npm version](https://badge.fury.io/js/abapmerge.svg)](https://badge.fury.io/js/abapmerge)
[![devDependencies Status](https://david-dm.org/larshp/abapmerge/dev-status.svg)](https://david-dm.org/larshp/abapmerge?type=dev)

# abapmerge
Merge ABAP INCLUDEs into single file

Test online: http://larshp.github.io/abapmerge/

### Building

* `npm install`

* `npm test`

### Additional features

Abapmerge supports pragmas that can be written inside an abap comment. If written as " comment, then indentation before " is also used for output.

`@@abapmerge command params`

Currently supported pragmas:
- **include** {filename} > {string wrapper}
  - {filename} - path to the file relative to script execution dir (argv[0])
  - {string wrapper} is a pattern where $$ is replaced by the include line

Example

```abap
...
  " @@abapmerge include somefile.txt > APPEND '$$' TO styletab.
...
```
