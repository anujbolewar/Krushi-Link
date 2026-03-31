import requests
import time
from requests.exceptions import RequestException
from cachetools import TTLCache

# Cache for external API responses
api_cache = TTLCache(maxsize=100, ttl=86400)  # 24-hour TTL for NCDEX/APMC prices
mrl_cache = TTLCache(maxsize=50, ttl=604800)  # 7-day TTL for APEDA MRL tables

# Exponential backoff retry logic
def fetch_with_retry(url, params=None, max_retries=3):
    retries = 0
    while retries < max_retries:
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except RequestException as e:
            retries += 1
            if retries == max_retries:
                raise e
            time.sleep(2 ** retries)  # Exponential backoff

# Fetch NCDEX/APMC prices with caching
def fetch_price_data(api_url, params=None):
    cache_key = f"{api_url}-{params}"
    if cache_key in api_cache:
        return api_cache[cache_key]

    data = fetch_with_retry(api_url, params)
    api_cache[cache_key] = data
    return data

# Fetch APEDA MRL tables with caching
def fetch_mrl_data(api_url, params=None):
    cache_key = f"{api_url}-{params}"
    if cache_key in mrl_cache:
        return mrl_cache[cache_key]

    data = fetch_with_retry(api_url, params)
    mrl_cache[cache_key] = data
    return data
