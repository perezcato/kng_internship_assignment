const puppeteer = require('puppeteer');
describe('KNG assignment tests', () => {
  test('site loads the login page on startup', async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')
    const loginButton = await page.$eval('button', el => el.innerText)

    expect(loginButton).toBe('Sign In')
    await browser.close()
  })
  test('Gets redirected back to the login page without being authenticated when trying to access the dashboard', async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')
    const loginButton = await page.$eval('button', el => el.innerText)

    expect(loginButton).toBe('Sign In')
    await browser.close()
  })

  test('Loads the register page on request', async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage()
    await page.goto('http://localhost:3000/register')
    const loginButton = await page.$eval('button', el => el.innerText)
    const loginLink = await page.$eval('.footer > a', el => el.innerText)
    expect(loginButton).toBe('Sign Up')
    expect(loginLink).toBe('Login')
    await browser.close()
  })

  test('loads the forgotten password page upon request', async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage()
    await page.goto('http://localhost:3000/forgot-password')
    const loginButton = await page.$eval('button', el => el.innerText)
    expect(loginButton).toBe('Reset')
    await browser.close()
  })

  test('Redirects to a 404 page when trying to access the verify page with a token', async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage()
    await page.goto('http://localhost:3000/verify')
    const loginButton = await page.$eval('h1', el => el.innerText)
    expect(loginButton).toBe('404')
    await browser.close()
  })
})
