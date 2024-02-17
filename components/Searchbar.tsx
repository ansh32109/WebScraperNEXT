"use client"
import { scrapeAndStoreProduct } from '@/lib/actions';
import React, { FormEvent, useState } from 'react'

const isValidLinkURL = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        if(
            hostname.includes('amazon.com') || 
            hostname.includes('amazon.in') || 
            hostname.includes('amazon.co.in') ||
            hostname.endsWith('amazon')
        ){
            return true
        }
    } catch (error) {
        return false;
    }
}

const Searchbar = () => {

    const [searchPrompt, setsearchPrompt] = useState('');
    const [isLoading, setisLoading] = useState(false);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValidLink = isValidLinkURL(searchPrompt);

        if(!isValidLink){
            return alert('Please provide a valid link')
        }

        try {
            setisLoading(true);

            // Scraping the first product
            const product = await scrapeAndStoreProduct(searchPrompt);

        } catch (error) {
            console.log(error)
        }finally{
            setisLoading(false);
        }
    }

  return (
    <>
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
        <input type='text' placeholder='Enter the product link' className='searchbar-input'
        value={searchPrompt}
        onChange={(e) => setsearchPrompt(e.target.value)}/>
        <button type='submit' className='searchbar-btn'
        disabled={searchPrompt===''}>
            {isLoading?'Searching.....' : 'Search'}
        </button>
    </form>
    </>
  )
}

export default Searchbar
