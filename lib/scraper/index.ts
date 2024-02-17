import axios from "axios";
import * as cheerio from 'cheerio';
import {extractCurrency, extractDescription, extractPrice} from "./utils";


export async function scrapeAmazonProduct(url: string){
    if(!url) {return;}

//    curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_702fc863-zone-unblocker:55i4ekj3u092 -k https://lumtest.com/myip.json

    //BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 2225;
    const session_id = (1000000*Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        //Extracting product title
        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );

        const originalPrice = extractPrice(
            $('.a-price.a-text-price span.a-offscreen'),
            $('.a-size-small.a-color-secondary.aok-align-center.basisPrice span.a-offscreen'),
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase()==='currently unavailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || 
                      $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));

        const discountRate = $('.savingPriceOverride').text().replace(/[-%]/g, "");

        const description = extractDescription($);

        // Construct a data object with all the saved info

        const data = {
            url,
            currency: currency || '₹',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category', // TODO: Later    
            reviewsCount: 0, // TODO: Later
            stars: 4.5, // TODO: Later
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }

        return data;


    } catch (error: any) {
        throw new Error(`Failed to scrape the product: ${error.message}`)
    }
}