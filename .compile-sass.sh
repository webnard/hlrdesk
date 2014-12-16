#!/bin/bash
for i in core/sass/*.s[ac]ss
  do
    j=$(basename $i)
    $(npm bin)/node-sass $i public/css/${j:0:-4}css
done
