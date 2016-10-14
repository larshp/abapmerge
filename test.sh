#!/bin/bash
set -e
./abapmerge test/abap/1/zmain.abap > /dev/null
./abapmerge test/abap/2/zmain.abap > /dev/null
./abapmerge test/abap/3/zmain.abap > /dev/null
./abapmerge test/abap/4/zmain.abap > /dev/null
./abapmerge test/abap/5/zmain.abap > /dev/null
echo "test.sh successful"
