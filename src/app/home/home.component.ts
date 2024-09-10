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
import Prompts from 'src/util/prompts';

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

  e2ePromptInit = Prompts.E2E_PROMPT_INIT;
  unitPromptInit = Prompts.UNIT_PROMPT_INIT;
  errorPromptInit = Prompts.ERROR_PROMPT_INIT;

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
      const chat = this.model.startChat();
      const result1 = await chat.sendMessage(prompt);
      const response1 = result1.response;
      if (response1.text().startsWith('```')) {
        // response is the final test code, but it needs to be refined
        this.outputText = 'Refining output...';
        const result2 = await chat.sendMessage(Prompts.E2E_PROMPT_FOLLOWUP);
        const response2 = result2.response;
        const lines = response2.text().split('\n');
        this.outputText = lines.slice(1, lines.length - 1).join('\n');
      } else {
        this.outputText = response1.text();
      }
      this.outputReceived = true;
    } catch (e) {
      this.outputText = 'Something went wrong!';
    }
  }

  clearInput() {
    this.componentFiles = [];
    this.endpointFiles = [];
    this.otherFiles = [];
    this.textInputForm.setValue('');
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

  showClearFileButton(): boolean {
    return (
      this.otherFiles.length > 0 ||
      (this.testTypeForm.value === 'e2e' && this.componentFiles.length > 0) ||
      (this.testTypeForm.value === 'unit' && this.endpointFiles.length > 0)
    );
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
