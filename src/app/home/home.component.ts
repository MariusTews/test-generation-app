import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  afterNextRender,
  Component,
  inject,
  Injector,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/environments/environment';
import ComponentItem from 'src/util/component-item';
import OtherCodeItem from 'src/util/other-code-item';
import { AutoDetectDialogComponent } from './dialog/auto-detect-dialog/auto-detect-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  genAI = new GoogleGenerativeAI(environment.API_KEY);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  componentFiles: ComponentItem[] = [];
  otherFiles: OtherCodeItem[] = [];
  autoDetectComponentFiles: ComponentItem[] = [];
  autoDetectOtherFiles: OtherCodeItem[] = [];
  output = '';
  outputText = '';
  outputReceived = false;
  showCodeButtonText = 'Show';
  copyCodeButtonText = 'Copy';

  textInputForm = new FormControl('', []);
  inputTypeForm = new FormControl('files', []);
  isErrorForm = new FormControl(false, []);

  readonly dialog = inject(MatDialog);

  promptInit =
    'This is the start of a new, isolated conversation. ' +
    'Write an end-to-end test for an Angular application using the Playwright test framework. ' +
    'Try to find critical paths in the scope of the components I provided. ' +
    'Write one test for each critical path. ' +
    'Assume that the application is running on http://localhost:4200/. ' +
    'Assume that you are an authorized, already logged in user of the application. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'If possible, every locator should find the corresponding element by its role and text or placeholder. ' +
    'Use locators such as getByLabel, getByRole or getByPlaceholder. ' +
    'Do not create custom page objects. ' +
    'Do not explicitly wait for elements to be loaded. ' +
    'Set the test timeout limit to 15 seconds. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'Start your answer with #nocode, if your answer is not the final test code. ' +
    'If your answer is the final test code, return only the code and start your answer with #code. ' +
    'Here is my code:\n';

  errorPromptInit =
    'When I run the test, it results in an error. ' +
    'Please try to fix the error by changing the code line which causes the error. ' +
    'This is the error message:\n';

  constructor() {}

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
    let prompt = '';
    if (this.inputTypeForm.value === 'text' && this.isErrorForm.value) {
      prompt = this.errorPromptInit + codeInput;
    } else {
      prompt = this.promptInit + codeInput;
    }
    this.outputText = 'Generating answer...';
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const lines = response.text().split('\n');
      if (lines[0] === '#code') {
        this.output = lines.slice(2, lines.length - 1).join('\n');
      } else if (lines[0] === '#nocode') {
        this.output = lines.slice(1, lines.length).join('\n');
      }
      this.outputReceived = true;
      this.outputText = '';
    } catch (e) {
      this.outputText = 'Something went wrong!';
    }
  }

  handleAutoDetect(event: any) {
    let count = 0;
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        if (e.target != null) {
          const parts: string[] = file.name.split('.');
          if (this.isComponentFile(parts)) {
            let addTo = null;
            for (let item of this.autoDetectComponentFiles) {
              if (item.name === parts[0]) {
                addTo = item;
              }
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
              this.autoDetectComponentFiles.push(item);
            }
          } else {
            if (parts.at(-1) === 'ts' || parts.at(-1) === 'html') {
              if (
                !(
                  (parts.length === 3 && parts[1] === 'module') ||
                  (parts.length === 4 && parts[2] === 'spec')
                ) ||
                parts[0] === 'app-routing'
              ) {
                const item: OtherCodeItem = new OtherCodeItem();
                item.name = file.name;
                item.content = e.target.result;
                this.autoDetectOtherFiles.push(item);
              }
            }
          }
        }
        count++;
        if (count === event.target.files.length) {
          this.openDialog();
        }
      };
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AutoDetectDialogComponent, {
      data: {
        componentFiles: this.autoDetectComponentFiles.sort((file1, file2) => {
          return file1.name < file2.name ? -1 : 1;
        }),
        otherFiles: this.autoDetectOtherFiles.sort((file1, file2) => {
          return file1.name < file2.name ? -1 : 1;
        }),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.componentFiles = result.componentFiles;
      this.otherFiles = result.otherFiles;
      this.textInputForm.setValue(this.generateCodeInput());
      this.autoDetectComponentFiles = [];
      this.autoDetectOtherFiles = [];
    });
  }

  handleComponentFileInput(event: any) {
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        if (e.target != null) {
          const parts = file.name.split('.');
          if (!this.isComponentFile(parts)) {
            return;
          }
          let duplicate = false;
          let addTo = null;
          for (let item of this.componentFiles) {
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
            this.componentFiles.push(item);
          }
          this.textInputForm.setValue(this.generateCodeInput());
        }
      };
    }
  }

  isComponentFile(parts: string[]): boolean {
    return parts.length === 3 && parts[1] === 'component';
  }

  handleOtherFileInput(event: any) {
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        if (e.target != null) {
          const item: OtherCodeItem = new OtherCodeItem();
          item.name = file.name;
          item.content = e.target.result;
          this.otherFiles.push(item);
          this.textInputForm.setValue(this.generateCodeInput());
        }
      };
    }
  }

  generateCodeInput(): string {
    let input = '';
    for (let item of this.componentFiles) {
      input += item.name + ' component:\n\n';
      if (item.HTMLFile) {
        input += item.HTMLFile + '\n\n';
      }
      if (item.TSFile) {
        input += item.TSFile + '\n\n';
      }
    }
    for (let item of this.otherFiles) {
      input += item.name + '\n\n';
      input += item.content + '\n\n';
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
    this.componentFiles = this.componentFiles.filter((element) => {
      return element !== item;
    });
    this.textInputForm.setValue(this.generateCodeInput());
  }

  removeFile(item: OtherCodeItem) {
    this.otherFiles = this.otherFiles.filter((element) => {
      return element !== item;
    });
    this.textInputForm.setValue(this.generateCodeInput());
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
