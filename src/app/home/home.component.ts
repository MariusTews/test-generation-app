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
import EndpointItem from 'src/util/endpoint-item';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  genAI = new GoogleGenerativeAI(environment.API_KEY);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  componentFiles: ComponentItem[] = [];
  endpointFiles: EndpointItem[] = [];
  otherFiles: OtherCodeItem[] = [];
  autoDetectComponentFiles: ComponentItem[] = [];
  autoDetectEndpointFiles: EndpointItem[] = [];
  autoDetectOtherFiles: OtherCodeItem[] = [];
  outputText = '';
  outputReceived = false;
  copyCodeButtonText = 'Copy';

  textInputForm = new FormControl('', []);
  inputTypeForm = new FormControl('files', []);
  testTypeForm = new FormControl('e2e', []);
  isErrorForm = new FormControl(false, []);

  readonly dialog = inject(MatDialog);

  e2ePromptInit =
    'This is the start of a new, isolated conversation. ' +
    'Write an end-to-end test for an Angular application using the Playwright test framework. ' +
    'Try to find critical paths in the scope of the components I provided. ' +
    'Write one test for each critical path. ' +
    'Assume that the application is running on http://localhost:4200/. ' +
    'Assume that you are an authorized, already logged in user of the application. ' +
    'Mock every HTTP request of any type with an appropriate data response. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'If possible, every locator should find the corresponding element by its role and text or placeholder. ' +
    'Use locators such as getByLabel, getByText, getByRole or getByPlaceholder. ' +
    'If you use the getByRole locator, make sure that it searches for the correct role. ' +
    'If you search by a name, label or a text which is taken from a Constants file, then use the value from the constant variable. ' +
    'Do not explicitly wait for elements to be loaded. ' +
    'Do not create custom page objects. ' +
    'Do not import other files which are not used in the tests. ' +
    'Assume that all paths for imports from the source files can start with src. ' +
    'Set the test timeout limit to 15 seconds by using the setTimeout method. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'Start your answer with #nocode, if your answer is not the final test code. ' +
    'If your answer is the final test code, return only the code and start your answer with #code. ' +
    'Here is my code:\n';

  unitPromptInit =
    'This is the start of a new, isolated conversation. ' +
    'Write a unit test for a NestJS backend using the Jest test framework. ' +
    'Make sure to mock everything that needs to be mocked. ' +
    'Do not import other files which are not used in the tests. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'Start your answer with #nocode, if your answer is not the final test code. ' +
    'If your answer is the final test code, return only the code and start your answer with #code. ' +
    'Here is my code:\n';

  errorPromptInit =
    'When I run the test, it results in an error. ' +
    'Please try to fix the error by changing the code line which causes the error. ' +
    'Return only the code line or segment which needs to be changed to fix the error and start your answer with #code. ' +
    'Here is some additional information about the error:\n';

  constructor() {}

  async run() {
    this.outputReceived = false;
    this.copyCodeButtonText = 'Copy';
    let codeInput: any = '';
    if (this.inputTypeForm.value === 'text') {
      codeInput = this.textInputForm.value;
    } else if (this.inputTypeForm.value === 'files') {
      codeInput = this.generateCodeInput();
    }
    let prompt = '';
    let promptInit = '';
    if (this.testTypeForm.value === 'e2e') {
      promptInit = this.e2ePromptInit;
    } else {
      promptInit = this.unitPromptInit;
    }
    if (this.inputTypeForm.value === 'text' && this.isErrorForm.value) {
      prompt = this.errorPromptInit + codeInput;
    } else {
      prompt = promptInit + codeInput;
    }
    this.outputText = 'Generating output...';
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const lines = response.text().split('\n');
      if (lines[0] === '#code') {
        this.outputText = lines.slice(2, lines.length - 1).join('\n');
      } else if (lines[0] === '#nocode') {
        this.outputText = lines.slice(1, lines.length).join('\n');
      }
      this.outputReceived = true;
    } catch (e) {
      this.outputText = 'Something went wrong!';
    }
  }

  handleAngularAutoDetect(event: any) {
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
          this.openDialog('e2e');
        }
      };
    }
  }

  handleNestAutoDetect(event: any) {
    let count = 0;
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        if (e.target != null) {
          const parts: string[] = file.name.split('.');
          if (this.isEndpointFile(parts)) {
            let addTo = null;
            for (let item of this.autoDetectEndpointFiles) {
              if (item.name === parts[0]) {
                addTo = item;
              }
            }
            const item: EndpointItem =
              addTo === null ? new EndpointItem() : addTo;
            item.name = parts[0];
            if (parts[1] === 'controller') {
              item.controllerFile = e.target.result;
            } else if (parts[1] === 'service') {
              item.serviceFile = e.target.result;
            }
            if (addTo === null) {
              this.autoDetectEndpointFiles.push(item);
            }
          } else {
            if (parts.at(-1) === 'ts') {
              if (
                !(
                  (parts.length === 3 && parts[1] === 'module') ||
                  (parts.length === 4 && parts[2] === 'spec')
                )
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
          this.openDialog('unit');
        }
      };
    }
  }

  openDialog(type: string): void {
    const dialogRef = this.dialog.open(AutoDetectDialogComponent, {
      data: {
        componentFiles: this.autoDetectComponentFiles.sort((file1, file2) => {
          return file1.name < file2.name ? -1 : 1;
        }),
        endpointFiles: this.autoDetectEndpointFiles.sort((file1, file2) => {
          return file1.name < file2.name ? -1 : 1;
        }),
        otherFiles: this.autoDetectOtherFiles.sort((file1, file2) => {
          return file1.name < file2.name ? -1 : 1;
        }),
        type: type,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.componentFiles = result.componentFiles;
      this.endpointFiles = result.endpointFiles;
      this.otherFiles = result.otherFiles;
      if (type === 'e2e') {
        this.finishFileInput('folder1');
      } else {
        this.finishFileInput('folder2');
      }
      this.autoDetectComponentFiles = [];
      this.autoDetectEndpointFiles = [];
      this.autoDetectOtherFiles = [];
    });
  }

  handleComponentFileInput(event: any) {
    let count = 0;
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        count++;
        if (e.target != null) {
          const parts = file.name.split('.');
          if (!this.isComponentFile(parts)) {
            if (count === event.target.files.length) {
              this.finishFileInput('files1');
            }
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
            if (count === event.target.files.length) {
              this.finishFileInput('files1');
            }
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
        }
        if (count === event.target.files.length) {
          this.finishFileInput('files1');
        }
      };
    }
  }

  isComponentFile(parts: string[]): boolean {
    return parts.length === 3 && parts[1] === 'component';
  }

  handleEndpointFileInput(event: any) {
    let count = 0;
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        count++;
        if (e.target != null) {
          const parts = file.name.split('.');
          if (!this.isEndpointFile(parts)) {
            if (count === event.target.files.length) {
              this.finishFileInput('files3');
            }
            return;
          }
          let duplicate = false;
          let addTo = null;
          for (let item of this.endpointFiles) {
            if (item.name === parts[0]) {
              if (
                (parts[1] === 'controller' && item.controllerFile) ||
                (parts[1] === 'service' && item.serviceFile)
              ) {
                duplicate = true;
              } else {
                addTo = item;
              }
            }
          }
          if (duplicate) {
            if (count === event.target.files.length) {
              this.finishFileInput('files3');
            }
            return;
          }
          const item: EndpointItem =
            addTo === null ? new EndpointItem() : addTo;
          item.name = parts[0];
          if (parts[1] === 'controller') {
            item.controllerFile = e.target.result;
          } else if (parts[1] === 'service') {
            item.serviceFile = e.target.result;
          }
          if (addTo === null) {
            this.endpointFiles.push(item);
          }
        }
        if (count === event.target.files.length) {
          this.finishFileInput('files3');
        }
      };
    }
  }

  isEndpointFile(parts: string[]): boolean {
    return (
      parts.length === 3 &&
      (parts[1] === 'controller' || parts[1] === 'service')
    );
  }

  handleOtherFileInput(event: any) {
    let count = 0;
    for (let file of event.target.files) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        count++;
        if (e.target != null) {
          const item: OtherCodeItem = new OtherCodeItem();
          item.name = file.name;
          item.content = e.target.result;
          this.otherFiles.push(item);
        }
        if (count === event.target.files.length) {
          this.finishFileInput('files2');
        }
      };
    }
  }

  finishFileInput(inputId: string) {
    this.textInputForm.setValue(this.generateCodeInput());
    const input: any = document.getElementById(inputId);
    input.value = null;
  }

  generateCodeInput(): string {
    let input = '';
    if (this.testTypeForm.value === 'e2e') {
      for (let item of this.componentFiles) {
        input += item.name + ' component:\n\n';
        if (item.HTMLFile) {
          input += item.HTMLFile + '\n\n';
        }
        if (item.TSFile) {
          input += item.TSFile + '\n\n';
        }
      }
    } else {
      for (let item of this.endpointFiles) {
        if (item.controllerFile) {
          input += item.name + ' controller:\n\n';
          input += item.controllerFile + '\n\n';
        }
        if (item.serviceFile) {
          input += item.name + ' service:\n\n';
          input += item.serviceFile + '\n\n';
        }
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

  getEndpointLabel(item: EndpointItem): string {
    let label = '';
    label += item.name;
    if (item.controllerFile && item.serviceFile) {
      label += ' (Controller, Service)';
    } else if (item.controllerFile) {
      label += ' (Controller)';
    } else if (item.serviceFile) {
      label += ' (Service)';
    }
    return label;
  }

  removeComponent(item: ComponentItem) {
    this.componentFiles = this.componentFiles.filter((element) => {
      return element !== item;
    });
    this.textInputForm.setValue(this.generateCodeInput());
  }

  removeEndpoint(item: EndpointItem) {
    this.endpointFiles = this.endpointFiles.filter((element) => {
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

  copyCode() {
    this.copyCodeButtonText = 'Copied!';
  }

  createFile() {
    const newBlob = new Blob([this.outputText], {
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
