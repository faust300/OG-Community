import bip39 from './bip39.json';
import crypto from "crypto";

export class StatsChartData {
  time: string;
  value: string;
}

export class MySQLAes128 {
  static getSecertKey(){
    return MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`);
  }
  static getEmailHash(email:string){
    return MySQLAes128.encrypt(MySQLAes128.getSecertKey(), email);
  }

  private static convertSecretKey(secretKey: string) {
    var newKey = Buffer.alloc(16);
    var secretKey2 = Buffer.from(secretKey);
    for (var i = 0; i < secretKey2.length; i++) newKey[i % 16] ^= secretKey2[i];
    return newKey;
  }

  static sha256(plainText: string): string {
    return crypto.createHash("sha256").update(plainText).digest("hex");
  }

  static decrypt(secretKey: string, encrypted: string) {
    let decipher = crypto.createDecipheriv("aes-128-ecb", MySQLAes128.convertSecretKey(secretKey), "");
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static encrypt(secretKey: string, plainText: string) {
    let cipher = crypto.createCipheriv("aes-128-ecb", MySQLAes128.convertSecretKey(secretKey), "");
    let encrypted = cipher.update(plainText, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }
}

// console.log(MySQLAes128.encrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), "jun.kim@flfi.co"));
// console.log(MySQLAes128.decrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), "wnEqbw7lH9DaqusAjIDg7g=="));

export const getMnemonicUsername = (): string => {

  const mnemonics = bip39;
  const randomMnemonics = mnemonics.sort(() => Math.random() - 0.5).slice(0,2);

  return `${randomMnemonics[0]}_${randomMnemonics[1]}`;
}

export const originalMnemonicUsername = (username: string): string | undefined => {
  const splitUsername = username.split("_")
  const lastSplitUsernameWithoutNumber = splitUsername[1].replace(/[0-9]/, '');

  const mnemonics = bip39;
  if(mnemonics.includes(splitUsername[0]) && mnemonics.includes(lastSplitUsernameWithoutNumber)){
    return `${splitUsername[0]}_${lastSplitUsernameWithoutNumber}`;
  }

  return undefined;
}

export const validateUsername = (username: string): boolean => {
  // a-z, A-Z, 0-9, _, 0~30
   const isMatch = username.match(/([a-z0-9_]){0,30}/gi);
   if(!isMatch || (isMatch && isMatch[0] !== username)){
     return false;
   }
   return true;
}

export const validatePassword = (password: string): boolean => {
   // 1 upper, 1 digit, 1 special, no space, 8~32
    const isMatch = password.match(/^((?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])(?!.* )).{8,32}$/g);
    if(!isMatch || (isMatch && isMatch[0] !== password)){
      return false;
    }
    return true;
}

export const convertDateWithoutTime = (date: string) => {
  const convertDate = new Date(date);
  if(convertDate.toString() === 'Invalid Date'){
    return -1;
  }

  return `${convertDate.getFullYear()}-${String(convertDate.getMonth()+1).padStart(2,'0')}-${String(convertDate.getDate()).padStart(2,'0')}`;
}

export const returnChartDataFromTimeNValue = (viewChartResult: Array<StatsChartData>, weekDate: string | -1, date: string): Array<StatsChartData> => {
  if(weekDate === -1){
    return undefined;
  }

  const viewChart = [];

  for(let i=0; i<viewChartResult.length; i++){
    if(i === 0 && weekDate !== viewChartResult[i].time){
      const periodWithStart = (new Date(viewChartResult[i].time).getTime() - new Date(weekDate).getTime()) / 86400000;
      for(let j=0; j<periodWithStart; j++){
        viewChart.push({
          time: convertDateWithoutTime(String(new Date(new Date(weekDate).getTime() + 86400000*j))),
          value: '0'
        });
      }
    }

    if(i === viewChartResult.length-1){
      viewChart.push(viewChartResult[i]);
      const lastSub = new Date(date).getTime() - new Date(viewChartResult[i].time).getTime();
      const periodWithLast = lastSub / 86400000;
      if(periodWithLast !== 0){
        for(let j=1; j<periodWithLast+1; j++){
          const nextDate = convertDateWithoutTime(String(new Date(new Date(viewChartResult[i].time).getTime() + 86400000*j)));
          viewChart.push({
            time: nextDate,
            value: '0'
          });
        }
      }
      break;
    }

    const dateSub = new Date(viewChartResult[i+1].time).getTime() - new Date(viewChartResult[i].time).getTime();

    if(dateSub === 86400000){
      viewChart.push(viewChartResult[i]);
      continue;
    }

    const period = dateSub / 86400000;
    for(let j=0; j<period; j++){
      const nextDate = convertDateWithoutTime(String(new Date(new Date(viewChartResult[i].time).getTime() + 86400000*j)));
      viewChart.push({
        time: nextDate,
        value: '0'
      });
    }
  }

  if(viewChart.length === 0){
    const totalSub = new Date(date).getTime() - new Date(weekDate).getTime();
    const totalPeriod = totalSub / 86400000;
    for(let j=0; j<totalPeriod+1; j++){
      const nextDate = convertDateWithoutTime(String(new Date(new Date(weekDate).getTime() + 86400000*j)));
      viewChart.push({
        time: nextDate,
        value: '0'
      });
    }
  }
  return viewChart;
}