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
import ComponentItem from 'src/util/component-item';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  genAI = new GoogleGenerativeAI(environment.API_KEY);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  inputFiles: ComponentItem[] = [];
  output = '';
  outputText = '';
  outputReceived = false;
  showCodeButtonText = 'Show';
  copyCodeButtonText = 'Copy';

  textInputForm = new FormControl('', [Validators.required]);
  inputTypeForm = new FormControl('text', []);

  handleFileInput(event: any) {
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        if (e.target != null) {
          const parts = file.name.split('.');
          if (parts.length !== 3) {
            return;
          }
          if (parts[1] !== 'component') {
            return;
          }
          let duplicate = false;
          let addTo = null;
          for (let item of this.inputFiles) {
            if (item.name === parts[0]) {
              if (
                (parts[2] === 'html' && item.HTMLFile) ||
                (parts[2] === 'ts' && item.TSFile)
              ) {
                duplicate = true;
              } else {
                addTo = item;
              }
            }
          }
          if (duplicate) {
            return;
          }
          const item: ComponentItem =
            addTo === null ? new ComponentItem() : addTo;
          item.name = parts[0];
          if (parts[2] === 'html') {
            item.HTMLFile = e.target.result;
          } else if (parts[2] === 'ts') {
            item.TSFile = e.target.result;
          }
          if (addTo === null) {
            this.inputFiles.push(item);
          }
          this.textInputForm.setValue(this.generateCodeInput());
        }
      };
    }
  }

  generateCodeInput(): string {
    let input = '';
    for (let item of this.inputFiles) {
      input += item.name + ' component:\n\n';
      if (item.HTMLFile) {
        input += item.HTMLFile + '\n\n';
      }
      if (item.TSFile) {
        input += item.TSFile + '\n\n';
      }
    }
    return input;
  }

  getComponentLabel(item: ComponentItem): string {
    let label = '';
    label += item.name;
    if (item.HTMLFile && item.TSFile) {
      label += ' (HTML, TS)';
    } else if (item.HTMLFile) {
      label += ' (HTML)';
    } else if (item.TSFile) {
      label += ' (TS)';
    }
    return label;
  }

  removeComponent(item: ComponentItem) {
    this.inputFiles = this.inputFiles.filter((element) => {
      return element !== item;
    });
    this.textInputForm.setValue(this.generateCodeInput());
  }

  async run() {
    this.outputReceived = false;
    this.showCodeButtonText = 'Show';
    this.copyCodeButtonText = 'Copy';
    let codeInput: any = '';
    if (this.inputTypeForm.value === 'text') {
      codeInput = this.textInputForm.value;
    } else if (this.inputTypeForm.value === 'files') {
      codeInput = this.generateCodeInput();
    }
    const prompt =
      'Write a test with Playwright for Angular. Return only the code. Here is my code:\n' +
      codeInput;
    console.log(codeInput);
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
