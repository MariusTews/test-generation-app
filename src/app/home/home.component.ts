import { Component } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  genAI = new GoogleGenerativeAI(environment.API_KEY);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  output = '';

  async run() {
    const prompt = 'Write a story about a AI and magic';
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    this.output = response.text();
  }
}
