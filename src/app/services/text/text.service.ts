import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  getKeywordsFromText(text: string, keywords: string[]) {
    const result = [];

    for (const word of keywords) {
      if (text.includes(word)) {
        result.push(word);
      }
    }

    return result;
  }
}
