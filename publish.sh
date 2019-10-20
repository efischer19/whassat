#!/bin/bash

aws s3 rm s3://www.whassat.info --recursive
aws s3 sync . s3://www.whassat.info --exclude ".git*" --exclude "*.md" --exclude "*publish.sh" --exclude "LICENSE" || exit 1
for id in `cat ~/whassat.ids`; do
  aws cloudfront create-invalidation --distribution-id $id --paths "/*";
done
