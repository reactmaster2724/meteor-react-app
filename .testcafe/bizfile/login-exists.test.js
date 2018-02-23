import { Selector, ClientFunction, t } from 'testcafe';
import fs from 'fs';

fixture `Check login exists`
    .page `https://www.bizfile.gov.sg/ngbbizfileinternet/faces/oracle/webcenter/portalapp/pages/singPassIntegration.jspx`;


//got this from https://stackoverflow.com/questions/15696218/get-the-most-recent-file-in-a-directory-node-js
function getNewestFile(dir, regexp) {
    let newest = null
    let files = fs.readdirSync(dir)
    let one_matched = 0
    let i = 0

    for (i; i < files.length; i++) {

        if (regexp.test(files[i]) == false)
            continue
        else if (one_matched == 0) {
            newest = files[i]
            one_matched = 1
            continue
        }

        f1_time = fs.statSync(files[i]).mtime.getTime()
        f2_time = fs.statSync(newest).mtime.getTime()
        if (f1_time > f2_time)
            newest[i] = files[i]  
    }

    if (newest != null)
        return (newest)
    return null
}

async function waitForPIN (timeout) {
    const startTime = Date.now();

    let timeoutExpired = false;
    let PIN = null;
    // get actionId from file
    const actionId = getNewestFile(process.env["PWD"] + "/../../../../../.testcafe/bizfile/action/", new RegExp('.*'))

    while(!timeoutExpired && !PIN) {
        await t.wait(1000)
        
        // Get PIN from file
        if (fs.existsSync(process.env["PWD"] + "/../../../../../.testcafe/bizfile/singpass_pin/" + actionId) == true) {
            PIN = fs.readFileSync(process.env["PWD"] + "/../../../../../.testcafe/bizfile/singpass_pin/" + actionId)
            fs.unlink(process.env["PWD"] + "/../../../../../.testcafe/bizfile/singpass_pin/" + actionId)
        }

    // check is timeout expired
        timeoutExpired = Date.now() - startTime >= timeout;
    }

    return PIN.toString();
}

test.only('Check login exists', async t => {

    await t.typeText("#loginID", "S8208204B");
    const loginExists = await Selector('#loginID');
    await t.expect(loginExists.exists).ok()
    const PIN = await waitForPIN(30000);
    await t.typeText('#password', PIN);
    const passwordExists = await Selector('#password');
    await t.expect(passwordExists.exists).ok()

    
});