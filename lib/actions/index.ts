"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../scraper/utils";

export async function scrapeAndStoreProduct(productURL: string) {
    if(!productURL){
        return;
    }

    try {
        connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productURL);

        if(!scrapedProduct){return;}

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url});

        if(existingProduct){
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                {price: scrapedProduct.currentPrice},
            ];

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            {url: scrapedProduct.url },
            product,
            {upsert: true, new: true},
        );

        revalidatePath(`/product/${newProduct.id}`);

    } catch (error: any) {
        throw new Error(`Failed to update/create the product: ${error.message}`)
    }
}