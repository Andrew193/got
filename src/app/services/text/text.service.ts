import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  getKeywordsFromText(text: string, keywords: string[]) {
    const result = [];
    const textLowerCase = text.toLowerCase();

    console.log('0000000000000000000000000000000000000000000000000000000000000');

    for (const word of keywords) {
      console.log(word, '==================', textLowerCase);
      if (textLowerCase.includes(word)) {
        result.push(word);
      }
    }

    console.log('0000000000000000000000000000000000000000000000000000000000000');

    return result;
  }
}
