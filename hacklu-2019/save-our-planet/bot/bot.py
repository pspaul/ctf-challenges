#/usr/bin/env python

import json
from os import getenv
from sys import argv
from time import sleep
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

timeout = int(getenv('TIMEOUT_SECS', '30'))

if len(argv) not in [2, 3]:
    print('Usage: {} <url>'.format(argv[0]))
    exit(1)

url = argv[1]

if len(argv) == 3:
    cookies = json.loads(argv[2])
else:
    cookies = []

options = webdriver.FirefoxOptions()
options.add_argument('--headless')

browser = webdriver.Firefox(options=options)
browser.install_addon('/selenium/save-our-planet.xpi', temporary=True)

print('Setting cookies')
for cookie in cookies:
    setter_url, cookie_items = cookie['url'], cookie['cookies']

    # Navigate to a url on the same domain
    browser.get(setter_url)

    # Set all the cookies for that domain
    for cookie_item in cookie_items:
        browser.add_cookie(cookie_item)

print('Visiting', url)
browser.get(url)

sleep(timeout)
browser.quit()
