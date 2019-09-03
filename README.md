# dvtext-dvaudio-checker

# Install Instructions

# install node packages using:

npm install

# install apify-cli

npm install apify-cli -g --save

# populate videos into INPUT.json

a) get spreadsheet from devs and copy the column with URLs (only URLS). <br>
b) Goto http://www.convertcsv.com/csv-to-json.htm and past the URLs into the Input box where you can enter data <br>
c) In the input options, uncheck "First row is column names" <br>
d) In "Generate Output" click on "CSV to JSON Array" <br>
e) Copy JSON array and add to INPUT.json under apify_storage/key_value_stores/default/INPUT.json <br>

# choose the correct main.js file

The main.js currently is for TVOkids.com, if crawling TVO.org, rename main-tvoorg.js to main.js

# run apify

apify run -p

# Output

OUTPUT.html in apify_storage/key_value_stores/default/ is the videos that do not have DVText or DVAudio.
