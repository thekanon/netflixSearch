/*
    넷플릭스 목록 가져오는 프로그램
*/
'use strict';
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
async function getList() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    await browser.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36')
    const page = await browser.newPage();
    await page.goto("https://m.kinolights.com/discover/explore", { waitUntil: 'networkidle2', timeout: 0 });
    await (await page.$('#commentArea > div.filter-channels > div.header-inner-channels > div > div > button:nth-child(11)')).click()
    await (await page.$('#listArea > div.movie-list-title-wrap > button')).click()
    await page.waitForTimeout(2000)
    await (await page.$('#modalContentBody > div > div:nth-child(9) > button')).click()
    let list = ""
    page.on('response', async response => {
        await page.waitForTimeout(1000).then(async () => await page.keyboard.press('End'))
        if (response.request().url().indexOf("api.kinolights") != -1) {
            try {
                let a = await page.waitForRequest(
                    (request) =>
                        request.url().indexOf("api.kinolights") != -1
                    , { timeout: 120000 });
                const cnt = parseInt(response.request().url().split("&")[12].split("=")[1])
                console.log(cnt)
                await page.waitForTimeout(1000).then(async () => await page.keyboard.press('End'))
            } catch (error) {
                list = await page.evaluate(() => {
                    return Object.values(document.querySelectorAll(".title")).map(e => e.innerText)
                })

                //텍스트 생성
                await fs.writeFile('./resultFile/' + ("시즌") + '.txt', list.join("\n"), err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    //file written successfully
                })
                await browser.close();
                return list
            }
        }
        await page.waitForTimeout(1000).then(async () => await page.keyboard.press('End'))
    })
    return list
}
async function run() {
    const text = await getList()
}
run()
