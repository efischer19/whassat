#!/bin/bash

for id in `cat ~/whassat.ids`; do
  aws cloudfront list-invalidations --distribution-id $id | grep InProgress && echo "Still going..." || echo "Done!";
done
