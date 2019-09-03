# dvtext-dvaudio-checker

# Install Instructions

# install node packages using:

npm install

# install apify-cli

npm install apify-cli -g --save

# populate videos into INPUT.json

a) get spreadsheet from devs and copy the column with URLs (only URLS).
b) Goto http://www.convertcsv.com/csv-to-json.htm and past the URLs into the Input box where you can enter data
c) In the input options, uncheck "First row is column names"
d) In "Generate Output" click on "CSV to JSON Array"
e) Copy JSON array and add to INPUT.json under apify_storage/key_value_stores/default/INPUT.json

# run apify

apify run -p
