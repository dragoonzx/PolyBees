const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

var twitter = express.Router();
app.use("/", twitter);

twitter.get("/:handle/:text", async (req, res) => {
  // const user_name = "User name or email";
  // const password = "your password";
  const twitterHandle = req.params["handle"];
  const tweetText = req.params["text"];

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.0 Safari/537.36",
    "upgrade-insecure-requests": "1",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.9,application/signed-exchange;v=b3",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9,en;q=0.8",
    "Access-Control-Allow-Origin": "*",
  });
  // open twitter on user page
  await page.goto(`https://twitter.com/${twitterHandle}`, {
    waitUntil: "networkidle2",
  });

  // get twitter posts
  // data-testid="tweet"
  const results = await page.$$eval("article div[lang]", (tweets) =>
    tweets.map((tweet) => tweet.textContent),
  );
  const isHandleRight = results.find((v) => v.text === tweetText) ?? true;
  browser.close();

  // if (isHandleRight) {

  // }

  // // Login
  // await page.$eval(
  //   ".js-username-field.email-input.js-initial-focus",
  //   (e) => (e.value = "user_name"),
  // );
  // await page.$eval(".js-password-field", (e) => (e.value = "password"));
  // await page.click(".submit.EdgeButton.EdgeButton--primary.EdgeButtom--medium");

  // // wait till page load
  // await page.waitForNavigation();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
