const _ = require('underscore');
const Apify = require('apify');
const utils = require('apify-shared/utilities');


// This function normalizes the URL and removes the #fragment
/*const normalizeUrl = (url) => {
    const nurl = utils.normalizeUrl(url);
    if (nurl) return nurl;

    const index = url.indexOf('#');
    if (index > 0) return url.substring(0, index);

    return url;
};*/

Apify.main(async () => {
    // Fetch input
    const input = await Apify.getValue('INPUT');
    console.log('Input:');
    //console.dir(input);

    //const baseUrl = normalizeUrl(input.baseUrl);

    const requestQueue = await Apify.openRequestQueue();
    const urlList = input.URL;
    urlList.forEach(async function(urlInput){
        await requestQueue.addRequest({ url: urlInput });
    })
    

    //const purlBase = baseUrl;

    //console.log(`Starting crawl of ${baseUrl}`);

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        maxRequestsPerCrawl: input.maxPages,
        maxRequestRetries: 3,
        maxConcurrency: input.maxConcurrency,
        launchPuppeteerFunction: async () => Apify.launchPuppeteer({
            defaultViewport: {
                width: 1200,
                height: 900,
            },
        }),
        handlePageFunction: async ({ request, page, response }) => {
            // await page.setRequestInterception(true);

            // page.on('request', request => {
            //     console.log(request.url());
            //   if (request.url().endsWith('.pdf')) {
            //     request_client({
            //       uri: request.url(),
            //       encoding: null,
            //       headers: {
            //         'Content-type': 'applcation/pdf',
            //       },
            //     }).then(response => {
            //       console.log(response); // PDF Buffer
            //       request.abort();
            //     });
            //   } else{
            //     request.continue();
            //   }
            // });        

            const url = request.url
            console.log(`Analysing page: ${url}`);

            let record = {
                url,
                isBaseWebsite: false,
                httpStatus: response.status(),
                title: await page.title(),
                linkUrls: null,
                dvText: false,
                dvAudio: false
            }

            if (await page.$('.transcript-link') !== null){
                record.dvText = true;
            } else if (await page.$('.dv-toggle__container') !== null){
                record.dvAudio = true;  
            } 

  

                if (response.status() !== 200) {
                    console.log('ALERT');
                    console.dir(request);
                    console.dir(record);
                    console.dir(response);
                }

                // If we're on the base website, find links to new pages and enqueue them
                //if(response.status == 10000){

                /*let afterClick = page.evaluateHandle(()=>{
                    let button = document.querySelectorAll('.button');
                    
                })*/

                
                /*if (url.match(`${purlBase}.*$`)) {
                    record.isBaseWebsite = true;
                    console.log(`[${url}] Enqueuing links`);
                    const infos = await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'a:not([href^="mailto"]):not([href^="javascript"])',
                    pseudoUrls: [
                        'https://www.tvo.org/video[(|/.*)]',
                        'https://www.tvo.org/programs[(|/.*)]',
                        'https://www.tvo.org/documentaries[(|/.*)]',
                        'https://www.tvo.org/theagenda[(|/.*)]'

                    ]
                    });
                    let links = _.map(infos, (info) => info.request.url).sort();
                    record.linkUrls = _.uniq(links, true);
                }*/

                // Find all HTML element IDs and <a name="xxx"> anchors,
                // basically anything that can be addressed by #fragment
                // record.anchors = await page.evaluate(() => {
                //     const anchors = [];
                //     document.querySelectorAll('body a[name]').forEach((elem) => {
                //         const name = elem.getAttribute('name');
                //         if (name) anchors.push(name);
                //     });
                //     document.querySelectorAll('body [id]').forEach((elem) => {
                //         const id = elem.getAttribute('id');
                //         if (id) anchors.push(id);
                //     });
                //     return anchors;
                // });
                // record.anchors.sort();
                // record.anchors = _.uniq(record.anchors, true);

                // Save results
                
                await Apify.pushData(record);
            },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request }) => {
            const url = request.url
            console.log(`Page failed ${request.retryCount + 1} times, giving up: ${url}`);

            await Apify.pushData({
                url,
                httpStatus: null,
                errorMessage: _.last(request.errorMessages) || 'Unkown error',
            });
        },
    });

    await crawler.run();


    console.log('Crawling finished, processing results...');

    // Create a look-up table for normalized URL->record,
    // and also create a look-up table in record.anchorsDict for anchor->true
    const urlToRecord = {};
    const dataset = await Apify.openDataset();


    await dataset.forEach(async (record) => {
        urlToRecord[record.url] = record;
        // record.anchorsDict = {};
        // _.each(record.anchors, (anchor) => {
        //     record.anchorsDict[anchor] = true;
        // });
        
        
    });

    

    // Array of normalized URLs to process
    let pendingUrls = [
    ];
    urlList.forEach(async function(urlInput){
        pendingUrls.push(urlInput)
    });
    

    // Dictionary of finished URLs. Key is normalized URL, value true if URL was already processed
    const doneUrls = {};
    const results = [];


    while (pendingUrls.length > 0) {
        const url = pendingUrls.shift();
        
        //console.log(urlToRecord);

        // Only process each URL once
        if (doneUrls[url]) continue;
        doneUrls[url] = true;

        console.log(`Processing result: ${url}`);

        const record = urlToRecord[url];
        //console.log(urlToRecord);

        const result = {
            url,
            title: record.title,
            links: []
        };
        results.push(result);

        
        console.log(record.url);
        //for (let linkUrl of url) {
            const linkUrl = url;
            
            // Get fragment from URL
            //const index = linkUrl.indexOf('#');
            //const fragment = index > 0 ? linkUrl.substring(index+1) : '';

            const link = {
                url: linkUrl,
                //normalizedUrl: linkNurl,
                httpStatus: null,
                errorMessage: null,
                //fragment,
                //fragmentValid: false,
                crawled: false,
                dvText: null,
                dvAudio: null
            };

            //const record = urlToRecord[linkNurl];
            //if (!record) {
                // Page was not crawled at all...
            //    result.links.push(link);
            //    continue;
            //}

            link.crawled = true;
            link.httpStatus = record.httpStatus;
            link.errorMessage = record.errorMessage;
            link.dvText = record.dvText;
            link.dvAudio = record.dvAudio;
            //link.fragmentValid = !fragment || !!record.anchorsDict[fragment];
            result.links.push(link);
            

            //// If the linked page is from the base website, add it to the processing queue
            //if (record.isBaseWebsite && !doneUrls[linkNurl]) {
            //    pendingUrls.push(linkNurl);
           // }
        //}
        
    }

    // Save results in JSON format
    console.log('Saving results...');
    await Apify.setValue('OUTPUT', results);

    // Generate HTML report
    let html = `
<html>
  <head>
    <title>DV Audio/DV Text report for tvo.org</title>
    <style>
        body {
            font-family : Sans-serif;
        }
        th {
            text-align: left;
        }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <th>Video URL</th>
        <th>HTTP&nbsp;status</th>
        <th>Description</th>
      </tr>`;
    for (let link of results) {

        console.log(link.links[0].dvText);
        console.log(link.links[0].dvAudio);
        //if (link.links[0].url.includes('https://www.tvokids.com')){
            //console.log(link);
            let color = 'lightblue';
            let description = 'OK';
            //if (!link.crawled) {
            //    color = '#F0E68C';
            //    description = 'Page not crawled';
            //} else 
            /*if ((link.links[0].errorMessage || !link.links[0].httpStatus || link.links[0].httpStatus < 200 || link.links[0].httpStatus >= 300)) {
                color = 'red';
                description = link.links[0].errorMessage ? `Error: ${link.links[0].errorMessage}` : 'Invalid HTTP status';
            } else */
            if (link.links[0].dvText == false && link.links[0].dvAudio == false){
                color = 'lightblue';
                description = 'No DV Audio or DV Text';
            }
            if (link.links[0].httpStatus !== 200 || (link.links[0].httpStatus == 200 && link.links[0].dvText == false && link.links[0].dvAudio == false )){
                html += `<tr style="background-color: ${color}">
                    <td><a href="${link.links[0].url}" target="_blank">${link.links[0].url}</a></td>
                    <td>${link.links[0].httpStatus || ''}</td>
                    <td>${description}</td>
                </tr>`;
            }
            
    }
    html += `
    </table>
</body>
</html>`;

    await Apify.setValue('OUTPUT.html', html, { contentType: 'text/html' });

    console.log('HTML report was stored to:');
    console.log(`https://api.apify.com/v2/key-value-stores/${process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID}/records/OUTPUT.html?disableRedirect=1`);

    console.log('\nDone.');
});
