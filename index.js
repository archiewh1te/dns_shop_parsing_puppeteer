const fs = require('fs')
const puppeteer = require('puppeteer')

let link = 'https://www.dns-shop.ru/catalog/17a89aab16404e77/videokarty/?stock=now&p=';

(async () => {
    let flag = true
    let res = []
    let counter = 1

    try {

        let browser = await puppeteer.launch({
            headless: false, //Чтобы не видеть окно браузера ставим значение true
            slowMo: 100,
            devtools: true
        })
        let page = await browser.newPage()
        await page.setViewport({
            width: 1400, height: 900
        })

        while (flag){
            await page.goto(`${link}${counter}`)
            await page.waitForSelector('a.pagination-widget__page-link_next')
            console.log(counter);

            let html = await page.evaluate(async () => {
                let page = []

                try {

                    let divs = document.querySelectorAll('div.catalog-product')

                    divs.forEach(div => {
                        let a = div.querySelector('a.ui-link')

                        let obj = {
                            title: a !== null
                                ? a.innerText
                                : 'NO-LINK',
                            link: a.href,
                            price: div.querySelector('div.product-buy__price') !== null
                                ? div.querySelector('div.product-buy__price').innerText
                                : 'NO-PRICE'
                        }

                        page.push(obj)
                    })

                } catch (e) {
                    console.log(e);
                }

                return page
            }, { waitUntil: 'a.pagination-widget__page-link_next'})

            await res.push(html)

            for(let i in res) {
                if(res[i].length === 0) flag = false
            }

            counter++
        }

        await browser.close()

        res = res.flat()

        console.log(res)

        // Сохранение в файл
        fs.writeFile('dns-shop.json', JSON.stringify({ 'data': res }), err => {
            if(err) throw err
            console.log('dns.json saved');
            console.log('dns.json total - ', res.length);
        })

    } catch (e) {
        console.log(e);
        await browser.close()
    }

})();