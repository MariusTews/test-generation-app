import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  afterNextRender,
  Component,
  inject,
  Injector,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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

  form = new FormControl('', [Validators.required]);

  constructor() {
    this.form.setValue(
      'import { Component } from "@angular/core"\n' +
        '@Component({\n' +
        '   selector: "app-root",\n' +
        '   templateUrl: "./app.component.html",\n' +
        '   styleUrls: ["./app.component.css"]\n' +
        '})\n' +
        'export class AppComponent {\n' +
        '   title = "test-generation-app";\n' +
        '}'
    );
  }

  async run() {
    const prompt =
      'Write an Angular Test with Playwright. Return only the pure code. Here is my code: ' +
      this.form.value;
    this.output = 'Generating code...';
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    this.output = response.text();
  }

  private _injector = inject(Injector);

  @ViewChild('autosize')
  autosize!: CdkTextareaAutosize;

  triggerResize() {
    // Wait for content to render, then trigger textarea resize.
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      }
    );
  }
}
