const puppeteer = require('puppeteer');
const crypto = require('crypto');
const {parentPort, workerData} = require('worker_threads');

const crypto = require('crypto');

const names = [
  "John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Jessica",
  "Liam", "Emma", "Noah", "Olivia", "Aiden", "Sophia", "Jackson", "Isabella",
  "Lucas", "Mia", "Ethan", "Amelia", "Mason", "Harper", "Logan", "Ella",
  "Mateo", "Camila", "Ben", "Léa", "Arjun", "Saanvi", "Wei", "Mei", "Ahmed", "Aisha",
  "Alejandro", "Ananya", "Hiroshi", "Yuki", "Fatima", "Omar", "Hannah", "Sophie",
  "Dmitry", "Irina", "Juan", "Elena", "Mario", "Lucia", "Samuel", "Eva",
  "Lars", "Freya", "Hans", "Greta", "Pierre", "Chloe", "Mohammed", "Leila",
  "Carlos", "Maria", "Antonio", "Marta", "Igor", "Nina", "Satoshi", "Akira"
];

const surnames = [
  "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
  "Taylor", "Anderson", "Thomas", "Moore", "Martin", "Jackson", "Thompson", "White",
  "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Nguyen", "Kim",
  "Chen", "Wang", "Singh", "Patel", "Kumar", "Das", "Sharma", "Gupta", "Ibrahim", "Hassan",
  "Garcia", "Martinez", "Rodriguez", "Hernandez", "Lee", "Walker", "Hall", "Young",
  "Allen", "King", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter",
  "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
  "Edwards", "Collins", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers"
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDigits(length) {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

function generateRandomGmail() {
  const start_digits = generateRandomDigits(3);
  const name = getRandomElement(names);
  const surname = getRandomElement(surnames);
  const end_digits = generateRandomDigits(4);
  return `${start_digits}${name}${surname}${end_digits}@gmail.com`;
}


function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const {votesPerWorker, workerIndex} = workerData;

  console.log(`Worker ${workerIndex} started with ${votesPerWorker} votes`);

  for (let i = 0; i < votesPerWorker; i++) {
    console.log(`Worker ${workerIndex} - Starting voting process ${i + 1} of ${
        votesPerWorker}`);

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    const mail = generateRandomGmail();

    await page.goto('https://www.mtv.com/vma/vote/best-k-pop');

    const cookie_btn = await page.waitForSelector(
        '::-p-xpath(//*[@id="onetrust-accept-btn-handler"])');
    await cookie_btn.click();
    await timeout(1000);

    const vote_btn = await page.waitForSelector(
        '::-p-xpath(//*[@id="accordion-panel-best-k-pop"]/div/div/div[2]/div[2]/div[2]/button[2])');
    await vote_btn.click();
    console.log(`Worker ${workerIndex} - 1st vote`);
    await timeout(1000);

    const mail_field = await page.waitForSelector(
        '::-p-xpath(/html/body/div[6]/div[3]/div/section/div/div/div/form/fieldset/div/input)');
    await mail_field.focus();
    await page.keyboard.type(mail);
    console.log(`Worker ${workerIndex} - Mail typed`);

    const login_btn = await page.waitForSelector(
        '::-p-xpath(/html/body/div[6]/div[3]/div/section/div/div/div/form/fieldset/button[2])');
    await login_btn.click();
    console.log(`Worker ${workerIndex} - Logged in`);
    await timeout(1000);

    const votes = await page.waitForSelector(
        '::-p-xpath(/html/body/div[1]/div/main/div[3]/div[13]/div/div/div/div/div[2]/div[2]/div[2]/div/p[1])');
    if (votes) {
      let text = await page.evaluate(el => el.textContent, votes);
      while (text.trim() != '' + workerData.nbVotes) {
        await vote_btn.click();
        text = await page.evaluate(el => el.textContent, votes);
        await timeout(100);
      }
    }
    console.log(`Worker ${workerIndex} - All votes casted`);
    await timeout(1000);

    const submit_btn = await page.waitForSelector(
        '::-p-xpath(/html/body/div[6]/div[3]/div/section/div/div/div/button[1])');
    await submit_btn.click();
    console.log(`Worker ${workerIndex} - Submitted`);

    await timeout(1000);
    const best_kpop = await page.waitForSelector(
        '::-p-xpath(//*[@id="accordion-button-best-k-pop"])');
    await best_kpop.click()

        await timeout(1000);
    await page.screenshot({path: `screenshots/${mail}.jpg`});
    await browser.close();
    console.log(
        `Worker ${workerIndex} - Voting process ${i + 1} done on ${mail}`);


    parentPort.postMessage(mail);
  }

  parentPort.close();
})();
