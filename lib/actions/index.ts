"use server"

import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productURL: string) {
    if(!productURL){
        return;
    }

    try {
        connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productURL);

        if(!scrapedProduct){return;}

        let product = scrapedProduct;

        const existingProduct = await Product.findOne()
    } catch (error: any) {
        throw new Error(`Failed to update/create the product: ${error.message}`)
    }
}