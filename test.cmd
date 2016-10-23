rem "Test script"
node abapmerge test\abap\1\zmain.abap > NUL || exit /b
node abapmerge test\abap\2\zmain.abap > NUL || exit /b
node abapmerge test\abap\3\zmain.abap > NUL || exit /b
node abapmerge test\abap\4\zmain.abap > NUL || exit /b
node abapmerge test\abap\5\zmain.abap > NUL || exit /b
echo "test successful"
