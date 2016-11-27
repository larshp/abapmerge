report zmain.

write / 'Main include'.
* @@abapmerge include style.css > write '$$'.
  " @@abapmerge include js/script.js > write '$$'.
  " @@abapmerge wrong pragma, just copy to output
  " @@abapmerge include data.txt > write '$$'.
  " @@abapmerge include data.txt > write '$$$'. " Unescaped !