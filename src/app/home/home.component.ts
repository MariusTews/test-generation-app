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
  outputText = '';
  outputReceived = false;
  showCodeButtonText = 'Show';
  copyCodeButtonText = 'Copy';

  placeholder =
    'import { Component } from "@angular/core"\n' +
    '@Component({\n' +
    '   selector: "app-root",\n' +
    '   templateUrl: "./app.component.html",\n' +
    '   styleUrls: ["./app.component.css"]\n' +
    '})\n' +
    'export class AppComponent {\n' +
    '   title = "test-generation-app";\n' +
    '}';

  form = new FormControl('', [Validators.required]);

  constructor() {
    this.form.setValue(this.placeholder);
  }

  async run() {
    this.outputReceived = false;
    this.showCodeButtonText = 'Show';
    this.copyCodeButtonText = 'Copy';
    const prompt =
      'Write a test with Playwright for Angular. Return only the code. Here is my code:\n' +
      this.form.value;
    this.outputText = 'Generating code...';
    const result = await this.model.generateContent(prompt);
    const response = result.response;
    const lines = response.text().split('\n');
    this.output = lines.slice(1, lines.length - 1).join('\n');
    this.outputReceived = true;
    this.outputText = '';
  }

  showOutput() {
    this.outputText = this.outputText == '' ? this.output : '';
    this.showCodeButtonText =
      this.showCodeButtonText == 'Show' ? 'Hide' : 'Show';
  }

  copyCode() {
    this.copyCodeButtonText = 'Copied!';
  }

  createFile() {
    const newBlob = new Blob([this.output], {
      type: 'application/x-typescript',
    });
    const data = window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = data;
    link.download = 'e2e.spec.ts';
    link.click();
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
