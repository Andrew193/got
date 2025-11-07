import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  getKeywordsFromText(text: string, keywords: string[]) {
    const result = [];
    const textLowerCase = text.toLowerCase();

    for (const word of keywords) {
      if (textLowerCase.includes(word)) {
        result.push(word);
      }
    }

    return result;
  }
}
