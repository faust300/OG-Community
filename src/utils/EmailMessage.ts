export interface MailContent {
  type: string;
  value: string;
}

export const rawMessage = (email: string) => {
  return {
    type: 'text/html',
    value: `
      <table width="100%" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td align="center">

              <table width="504px;" style="background: #ffffff; border-radius: 20px; border: 1px solid #E1E2E6; padding: 48px;">
                <tbody>
                  <tr>
                    <td>
                      <img alt="" width="66" height="32" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7wXpFgX6iLKVAFQ-ru-nrJYSTxWugjXn_tu8UD1ERFfVFN-utIL09UOOMDzo7O3ODqrBeiSMoDYNKqXYpYcob1xtjzZINF3tCQbmd-9znP2tTCAyULieASfJjMJoNt18Gyv-JC2sbtC4IHqOLk2CpcmqgXRSoKAUY9URIkwHEoGzHGiGcCeupG6uJ/s1600/OG_logo.png">
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div style="text-align: center; margin:40px 0px;">
                        <img alt="" style="width:504px; height:264px; border-radius: 10px;" src="https://blogger.googleusercontent.com/img/a/AVvXsEgnDjpU-vPJj_nzgB68vugkZhV4jPNDUIAJqKXxaWGgjOnkNH5Cu5SxFcadf4Fv24iCRYEZPgfo7W0AkVI2HUh34MYtIXTwETBo1sFSPQiWafGNBT-7ZYIGWxx776a3S_GBGIuH-tvm_AqE6mv2FQ3koMiQt9gWJe57jjg49QEVnGBCDlt5XgJzLj7F"/>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div id="sub-title" type="text" placeholder="Sub Title" style="font-family: Arial, Helvetica, sans-serif; font-size: 36px; font-weight: 600; text-align: center; height: 120px; margin: 0; width: 100%; border-radius: 20px; color: #1A1B1C; ">
                        🍾 Day 1 of The Crypto Whisperer Is Live Now 🥂
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td >
                      <div id="description" style="border-radius: 20px; color: #1A1B1C; font-family: Arial, Helvetica, sans-serif; font-size: 19px; font-weight: 400; line-height: 24px; margin: 0px; ">
                        <div>
                          <div style="margin-top: 40px;">

                            <div>
                            We hope you're ready to test your prediction skills and compete for a chance to win $10,000 USDT.
                            </div>

                            <div><br></div>

                            <div>
                            For the next 30 days, we'll be presenting you with 3 randomly selected cryptocurrencies. Choose one of them and determine if the ending price will be greater than or lower than the starting price. If you correctly guess the price movement, you'll receive "crystals", the event's point system's unit.
                            </div>

                            <div><br></div>

                            <div>
                            Collect as many crystals as you can over the next 30 days and exchange them for a reward at the end of the challenge. Don't forget to visit our community to ask others what they chose.
                            </div>

                            <div><br></div>

                            <div>
                            We wish you the best of luck and can't wait to see who comes out on top. For now, visit The Crypto Whisperer and enter your prediction before the deadline!
                            </div>

                          </div>
                        </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 10px 20px; padding-top: 40px;" align="center">
                      <a href="https://og.xyz/event/whisperer" target="_blank" style="text-decoration: none; color: #1A1B1C; width: 189px; height: 40px; border-radius: 40px; background: #3CE646; gap: 8px; padding: 10px 20px; font-family: Arial, Helvetica, sans-serif; font-weight: 600; font-size: 16px; line-height: 20px; color: #1A1B1C; text-decoration: unset; border: 0px solid #E1E2E6;">
                        Enter prediction 🗳️
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td style="border-bottom: 1px solid #e1e1e6; padding-top: 40px;">
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px 0;">
                      <table width="100%">
                        <tr>

                          <td align="left" width="50%">
                            <img alt="" width="50" height="24" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgtJOCD5IxW55k4RW_moRHnDIOUx91sbQl1shyDzCmdeB02sCjmaCD_PtztmZKkpquHao1wDP4wQM6bLQwgZdLWbMbArT0I3uU1AdJM00cmi1jdvqgpWZQccljxfLyCKyDR31_qRs1rW2zBloMreHIQOjnvbs-rbatDmi7tV0PxUClpMMD-lKhqBRG1/s1600/OG_logo_black.png" loading="lazy">
                          </td>

                          <td align="right" width="50%">
                            <a target="_blank" href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyHAYAnp-2FMhA-2Blq6AD4gfBHtjqU7IRuaxc2E14BMzb2MIQWtl_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVye29kDRoqlyz-2BXPr9UNvtiS7O-2FfS6b1UUMGboPUTBqXwpQfG9PEiNZ2iBXHDD0bMrTtbSjVCVkj-2BabrgLy4kLwXlN-2Fqtig0piEVwRvX1R5D8cXtrrazgm9Pbit-2F8ZS9Zp6UL75F-2F3OgROn70VIBH9w-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                              <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbAakL5GrN7eA0ogVf0t-O9SYiSKWSiGEQwLWbsZfmYCo7OomX-zVnOoAEYDNxAG3W2AgXexncokLdNOI1lYG4Bt6FiUCBZmOUTTKFElYrqRiQao1qqnVLe7dIwxBmuKT2gFA_zjqL0TD8TWRhuEznp-etIXRJ1APFjE4BJ7H8WbhgWNQ8wfN2zLg0/s1600/twitter.png" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
                            </a>
                          </td>

                          <td align="right" width="50%">
                            <a target="_blank" href="http://url8771.og.xyz/ls/click?upn=fmFH1uDrKg8bpBhahX7GnnIhTtP8gGuaGYjrV9U04FA-3D-LV3_zhHrTngT9NhcC0xtbNPwveuo6OcYUw-2BcVF9-2FBGi6BrUKWbFUehepTFQ7FheUGVYFLiJnCWvJD7Zfs6m-2BLZiEiEDivstUa1ayMKLLapq9ylmW3hUx9-2BPWqXmuB5bPlMBn-2FQ-2Fz3CxZueXB8BKOg-2Bn44pXCE1S5PW7VZXS1tNTLRDYovowBrTQVXUj3YRALmF7aD1ZHf0LMqKcWqgXtojYQGA-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                              <img alt="" src="https://blogger.googleusercontent.com/img/a/AVvXsEgITuuJ_LzpWEiGLFRx6KKwU6UtRF2cWVaLcOtn-xYg289MM3iHdKCk9SRTwsSAR0pnRERk6MiCUpt0iVGEsI1pdAhNpc1v26joT9D0o-0H7TJMTiMuiEZnocX6glm2gwjSW-qAFBd-JIglHh_hQKhVdSaceHykLW16n1ufrBbBg2StEKOMcUw6-QHf" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
                            </a>
                          </td>

                          <td align="right" width="50%">
                            <a target="_blank" href="https://www.instagram.com/OGXYZOFFICIAL/" rel="noreferrer noopener"style="text-decoration: none;">
                              <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEax8ofqlOHv9AjpnANZxffSNrD6jh1etfZx8MK1skm9scqO_pKR7X9S6AbVAVbaW1aghJA7bT4Qwc-urn3IQQHkkBKm-rI5iusBI7zBb8yoNorMnBI-XkP6MPl4EcjNRZAJEIc6QmO5wEW9LeJ0YzQ6dGgmCCL3m4a_vYmP_naR2s5EtDePdeuquH/s1600/instagram.png" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
                            </a>
                          </td>

                          <td align="right" width="50%">
                            <a target="_blank" href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyPLLhTNu5E7Kd4zTMo5cKpNmg0DVPdkVGQDfPYmzc720Ixkw_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVxkHKa5mPHrAlWV6opMrs3fp1R18YrrbrMyTY7uxsKev3WD1hgLFwT-2BDTmSQQpwMs8aZEFWK3x-2Bv3UPVr1rbaby1jEAmoV3hEeDqYMTaLHR-2BhJ5JAp2JwotKA9XA-2B5fmkqznBpff9AVnu80M5fV8l1w-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                              <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgv2rulpMXT3ggTrH7dkD2pPn1cOv02QyR9P5b8QIkMEtgqys283oCLJTjk7zEIYQdaySETLOip3hPe9BPE4_-EArLqsUMfPgoKrrwbk6STpxwVc2WYT8IBYpDyIglzsL8hAHmjx8IywtZL-cfBH0C5rVSuut5DeDjAYMN-qif85pSSW0YRM-d4ioNB/w48-h48/linkedin.png" loading="lazy"style="width: 24px; height: 24px;">
                            </a>
                          </td>

                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <a href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyMld8d6INcjzqF0uJDVr5mE-3DI2ng_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVYfkz6O0T-2F2K6GMqLrccfQM0MjxhKy1txTR-2BS37JRCUN-2FikmJpayMOXOFB9XbnslqrknkwDoF8MO1UyDKRbxzra0A1wRZVo0dYMa3iN5uV2ywTduQVBAtlc4WEth-2Fti4aF9DbjtAUSFjK7YI-2Bu5sfow-3D-3D" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 20px; color: #1a1a1c; text-decoration: underline; " rel="noreferrer noopener">
                      OG.xyz</a>
                      <a href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyBpidgeOTzr5PwGyvcO2wXKwul2UnLZxBSQ6rihQXbBFG24g_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVtm20UQsxC-2B9pd2-2FUa-2F46QsRhm2D2qYNzqoeaWEL-2BFmJ3eV2TCaAIk50LiqvO3ik4A3CpdEgWcY-2BL2MpA9lemEZuQNNRfLc3QL7vrVDpis0TxjlFg1iA5pYhH6E6tgyfnqi6c8DY5O02OQjUp1yRLcw-3D-3D" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 20px; color: #1a1a1c; text-decoration: underline; " rel="noreferrer noopener">
                      Privacy Policy</a>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:24px;">
                      <p style="font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 20px; color: #838388; margin: 0; ">
                        If you didn’t subscribe to OG.xyz, select
                          <a href="https://api.og.xyz/user/unsubscribe?email=${email}" target="_blank" style="
                            font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 20px; color: #838388; text-decoration: underline; ">
                            unsubscribe
                          </a>
                        to be removed from our mailing list.</p>
                    </td>
                  </tr>

                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `
  }
}

export const sendWelcomeMessage = (email: string) => {
  return {
    type: 'text/html',
    value: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table
              width="600"
              style="
                background: #ffffff;
                padding: 48px;
                border-radius: 20px;
                border: 1px solid #E1E2E6;
              "
            >
              ${defaultHeader()}
              ${defeultTitle('Welcome to OG!')}
              ${defaultDescription(`
                Well done 👍
                <br/><br/>

                By signing up, you’ve taken your first step toward becoming an OG. We look forward to providing you with the latest crypto insights and hope you drop your own in our growing community.
                <br/><br/>

                We also got a lot of new features in the pipeline so follow us on Twitter for the latest updates!
              `)}
              ${visitButton()}
              ${defaultFooter(email)}
            </table>
          </td>
        </tr>
      </table>
    `
  };
}

export const sendCodeMessage = (email: string, randomCode: string) => {
  return {
    type: 'text/html',
    value: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table
              width="600"
              style="
                background: #ffffff;
                padding: 48px;
                border-radius: 20px;
                border: 1px solid #E1E2E6;
              "
            >
              ${defaultHeader()}
              ${defeultTitle('Email Verification')}
              ${sendCode(randomCode)}
              ${defaultFooter(email)}
            </table>
          </td>
        </tr>
      </table>
    `
  };
}

export const sendPreRegister = (email: string) => {
  return {
    type: 'text/html',
    value: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table
              width="600"
              style="
                background: #ffffff;
                padding: 48px;
                border-radius: 20px;
                border: 1px solid #E1E2E6;
              "
            >
              ${defaultHeader()}
              ${defeultTitle('Welcome to OG!')}
              ${defaultDescription(`
                The wait is finally over. After a grueling month of developing, testing, and quality control—😓 thank you for your patience—we’re ready to bring the crypto community together.
                <br/><br/>

                We’ve got a steady stream of content ready for you and can’t wait for you to help our community grow. Select the link below or visit og.xyz to finish registration.
                <br/><br/>

                See you on 🛝 Playground!
                <br/><br/>

                OG
                <br/><br/>

                P.S. We said “massive rewards”, right? Don’t worry; we got something coming up soon, so stay tuned by following us on <a target="_blank" href="https://twitter.com/OG_XYZ" style="text-decoration: none;">Twitter<a/> or <a target="_blank" href="https://www.instagram.com/OGXYZOFFICIAL/" style="text-decoration: none;">IG<a/>! For now see you on OG!
                <br/><br/>
              `)}
              ${signupButton()}
              ${defaultFooter(email)}
            </table>
          </td>
        </tr>
      </table>
    `
  };
}

export const defaultMailContainer = (email: string, title: string, des: string, randomCode: string | undefined): MailContent => {
  return {
    type: 'text/html',
    value: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table
              width="600"
              style="
                background: #ffffff;
                padding: 48px;
                border-radius: 20px;
                border: 1px solid #E1E2E6;
              "
            >
              ${defaultHeader()}
              ${defeultTitle(title)}
              ${defaultDescription(des)}
              ${randomCode ? sendCode(randomCode) : visitButton()}
              ${defaultFooter(email)}
            </table>
          </td>
        </tr>
      </table>
    `
  };
}

const defaultHeader = () => {
  return `
    <tr>
      <td>
        <img
          width="66"
          height="32"
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7wXpFgX6iLKVAFQ-ru-nrJYSTxWugjXn_tu8UD1ERFfVFN-utIL09UOOMDzo7O3ODqrBeiSMoDYNKqXYpYcob1xtjzZINF3tCQbmd-9znP2tTCAyULieASfJjMJoNt18Gyv-JC2sbtC4IHqOLk2CpcmqgXRSoKAUY9URIkwHEoGzHGiGcCeupG6uJ/s1600/OG_logo.png"
        />
      </td>
    </tr>
  `;
}

const defaultFooter = (email: string) => {
  return `
    <tr>
      <td
        style="border-bottom: 1px solid #e1e1e6; padding-top: 40px"
      ></td>
    </tr>

    <tr>
      <td style="padding-top: 40px;">
        <table width="100%">
          <tr>

            <td align="left" width="50%">
              <img alt="" width="50" height="24" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgtJOCD5IxW55k4RW_moRHnDIOUx91sbQl1shyDzCmdeB02sCjmaCD_PtztmZKkpquHao1wDP4wQM6bLQwgZdLWbMbArT0I3uU1AdJM00cmi1jdvqgpWZQccljxfLyCKyDR31_qRs1rW2zBloMreHIQOjnvbs-rbatDmi7tV0PxUClpMMD-lKhqBRG1/s1600/OG_logo_black.png" loading="lazy">
            </td>

            <td align="right" width="50%">
              <a target="_blank" href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyHAYAnp-2FMhA-2Blq6AD4gfBHtjqU7IRuaxc2E14BMzb2MIQWtl_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVye29kDRoqlyz-2BXPr9UNvtiS7O-2FfS6b1UUMGboPUTBqXwpQfG9PEiNZ2iBXHDD0bMrTtbSjVCVkj-2BabrgLy4kLwXlN-2Fqtig0piEVwRvX1R5D8cXtrrazgm9Pbit-2F8ZS9Zp6UL75F-2F3OgROn70VIBH9w-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbAakL5GrN7eA0ogVf0t-O9SYiSKWSiGEQwLWbsZfmYCo7OomX-zVnOoAEYDNxAG3W2AgXexncokLdNOI1lYG4Bt6FiUCBZmOUTTKFElYrqRiQao1qqnVLe7dIwxBmuKT2gFA_zjqL0TD8TWRhuEznp-etIXRJ1APFjE4BJ7H8WbhgWNQ8wfN2zLg0/s1600/twitter.png" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
              </a>
            </td>

            <td align="right" width="50%">
              <a target="_blank" href="http://url8771.og.xyz/ls/click?upn=fmFH1uDrKg8bpBhahX7GnnIhTtP8gGuaGYjrV9U04FA-3D-LV3_zhHrTngT9NhcC0xtbNPwveuo6OcYUw-2BcVF9-2FBGi6BrUKWbFUehepTFQ7FheUGVYFLiJnCWvJD7Zfs6m-2BLZiEiEDivstUa1ayMKLLapq9ylmW3hUx9-2BPWqXmuB5bPlMBn-2FQ-2Fz3CxZueXB8BKOg-2Bn44pXCE1S5PW7VZXS1tNTLRDYovowBrTQVXUj3YRALmF7aD1ZHf0LMqKcWqgXtojYQGA-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                <img alt="" src="https://blogger.googleusercontent.com/img/a/AVvXsEgITuuJ_LzpWEiGLFRx6KKwU6UtRF2cWVaLcOtn-xYg289MM3iHdKCk9SRTwsSAR0pnRERk6MiCUpt0iVGEsI1pdAhNpc1v26joT9D0o-0H7TJMTiMuiEZnocX6glm2gwjSW-qAFBd-JIglHh_hQKhVdSaceHykLW16n1ufrBbBg2StEKOMcUw6-QHf" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
              </a>
            </td>

            <td align="right" width="50%">
              <a target="_blank" href="https://www.instagram.com/OGXYZOFFICIAL/" rel="noreferrer noopener"style="text-decoration: none;">
                <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEax8ofqlOHv9AjpnANZxffSNrD6jh1etfZx8MK1skm9scqO_pKR7X9S6AbVAVbaW1aghJA7bT4Qwc-urn3IQQHkkBKm-rI5iusBI7zBb8yoNorMnBI-XkP6MPl4EcjNRZAJEIc6QmO5wEW9LeJ0YzQ6dGgmCCL3m4a_vYmP_naR2s5EtDePdeuquH/s1600/instagram.png" loading="lazy"style="margin-right: 20px; width: 24px; height: 24px;">
              </a>
            </td>

            <td align="right" width="50%">
              <a target="_blank" href="https://u31374548.ct.sendgrid.net/ls/click?upn=79szFbGIEWeEMCFhncFCyPLLhTNu5E7Kd4zTMo5cKpNmg0DVPdkVGQDfPYmzc720Ixkw_8qn0IT-2BBXiOuyuSGBnSMJK7nskiFtYjZjmwkqsTyQyqERdfP8p7gfICN4AnqcsYVxkHKa5mPHrAlWV6opMrs3fp1R18YrrbrMyTY7uxsKev3WD1hgLFwT-2BDTmSQQpwMs8aZEFWK3x-2Bv3UPVr1rbaby1jEAmoV3hEeDqYMTaLHR-2BhJ5JAp2JwotKA9XA-2B5fmkqznBpff9AVnu80M5fV8l1w-3D-3D" rel="noreferrer noopener"style="text-decoration: none;">
                <img alt="" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgv2rulpMXT3ggTrH7dkD2pPn1cOv02QyR9P5b8QIkMEtgqys283oCLJTjk7zEIYQdaySETLOip3hPe9BPE4_-EArLqsUMfPgoKrrwbk6STpxwVc2WYT8IBYpDyIglzsL8hAHmjx8IywtZL-cfBH0C5rVSuut5DeDjAYMN-qif85pSSW0YRM-d4ioNB/w48-h48/linkedin.png" loading="lazy"style="width: 24px; height: 24px;">
              </a>
            </td>

          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding-top: 24px">
        <a
          href="https://og.xyz"
          target="_blank"
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 13px;
            line-height: 20px;
            color: #1a1a1c;
          "
          >OG.xyz</a
        >

        <a
          href="https://og.xyz/docs/privacypolicy"
          target="_blank"
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 13px;
            line-height: 20px;
            color: #1a1a1c;
          "
          >Privacy Policy</a
        >
      </td>
    </tr>

    <tr>
      <td style="padding-top: 40px">
        <p
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 13px;
            line-height: 20px;
            color: #838388;
            margin: 0;
          "
        >
          If you didn’t subscribe to OG.xyz, select
          <a
            href="https://api.og.xyz/user/unsubscribe?email=${email}"
            style="
              font-family: Arial, Helvetica, sans-serif;
              font-style: normal;
              font-weight: 400;
              font-size: 13px;
              line-height: 20px;
              color: #838388;
            "
            >unsubscribe</a
          >
          to be removed from our mailing list.
        </p>
      </td>
    </tr>
  `
}

const defeultTitle = (title: string) => {
  return `
    <tr>
      <td>
        <p
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-size: 36px;
            line-height: 120px;
            font-weight: 600;
            text-align: center;
            width: 504px;
            height: 120px;
            margin: 0;
          "
        >
          ${title}
        </p>
      </td>
    </tr>
  `;
}

const defaultDescription = (des: string) => {
  return `
    <tr>
      <td style="padding-top: 24px">
        <p
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
            margin: 0;
          "
        >
          ${des}
        </p>
      </td>
    </tr>
  `;
}

const visitButton = () => {
  return `
    <tr>
      <td style="width: 90px; height: 40px; padding: 10px 20px; " align="center">
        <a
          href="https://og.xyz/signin"
          style="
            display: inline-block;
            width: 50px;
            height: 20px;
            border-radius: 40px;
            background: #3CE646;
            gap: 8px;
            padding: 10px 20px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 600;
            font-size: 13px;
            line-height: 20px;
            color: #1A1B1C;
            text-decoration: unset;
          "
          >
          Visit
        </a>
      </td>
    </tr>
  `;
}

const signupButton = () => {
  return `
    <tr>
      <td style="width: 90px; height: 40px; padding: 10px 20px; " align="center">
        <a
          href="https://og.xyz/signin"
          target="_blank"
          style="
            display: inline-block;
            width: 50px;
            height: 20px;
            border-radius: 40px;
            background: #3CE646;
            gap: 8px;
            padding: 10px 20px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 600;
            font-size: 13px;
            line-height: 20px;
            color: #1A1B1C;
            text-decoration: unset;
          "
          >
          Sign up
        </a>
      </td>
    </tr>
  `;
}

const sendCode = (randomCode: string) => {
  return `
    <tr>
      <td style="padding-top: 24px">
        <p
          style="
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 20px;
            margin: 0;
            text-align: center;
            color: #58595B;
          "
        >
          Here is your verification code for OG. <br/>
          Your code will expire in 3 minutes.
        </p>
      </td>
    </tr>

    <tr>
      <td>
        <div style="margin-top: 33px; text-align: center">
          <div
            style="
              text-align: center;
              width: 520px;
              padding: 20px 0;
              font-style: normal;
              font-weight: 600;
              font-size: 22px;
              background-color: #EEF8EE;
              border-radius: 16px;
            "
          >
            ${randomCode}
          </div>
        </div>
      </td>
    </tr>
  `;
}