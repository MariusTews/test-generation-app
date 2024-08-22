import { AfterViewInit, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import ComponentItem from 'src/util/component-item';
import EndpointItem from 'src/util/endpoint-item';
import OtherCodeItem from 'src/util/other-code-item';

@Component({
  selector: 'app-auto-detect-dialog',
  templateUrl: './auto-detect-dialog.component.html',
  styleUrls: ['./auto-detect-dialog.component.css'],
})
export class AutoDetectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AutoDetectDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  componentFiles: ComponentItem[] = this.data.componentFiles;
  endpointFiles: EndpointItem[] = this.data.endpointFiles;
  otherFiles: OtherCodeItem[] = this.data.otherFiles;
  type: string = this.data.type;

  length: number = 0;
  checklist: boolean[] = [];
  returnFiles: any = {};

  constructor() {
    this.length =
      this.type === 'e2e'
        ? this.data.componentFiles.length
        : this.data.endpointFiles.length;
    for (let i = 0; i < this.length + this.data.otherFiles.length; i++) {
      this.checklist.push(false);
    }
    this.getPresetFromCookies();
    this.setSelection();
  }

  onNoClick(): void {
    this.dialogRef.close({
      componentFiles: [],
      endpointFiles: [],
      otherFiles: [],
    });
  }

  update(select: boolean, index: number) {
    this.checklist[index] = select;
    this.setSelection();
  }

  setSelection() {
    let i = 0;
    const selectedComponentFiles: ComponentItem[] = [];
    const selectedEndpointFiles: EndpointItem[] = [];
    if (this.type === 'e2e') {
      for (let item of this.componentFiles) {
        if (this.checklist[i]) {
          selectedComponentFiles.push(item);
        }
        i++;
      }
    } else {
      for (let item of this.endpointFiles) {
        if (this.checklist[i]) {
          selectedEndpointFiles.push(item);
        }
        i++;
      }
    }
    const selectedOtherFiles: OtherCodeItem[] = [];
    for (let item of this.otherFiles) {
      if (this.checklist[i]) {
        selectedOtherFiles.push(item);
      }
      i++;
    }
    this.returnFiles = {
      componentFiles: selectedComponentFiles,
      endpointFiles: selectedEndpointFiles,
      otherFiles: selectedOtherFiles,
    };
    this.setCookies();
  }

  getCookie(cookieName: string) {
    let name = cookieName + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  setCookies() {
    let string = '';
    if (this.type === 'e2e') {
      for (let element of this.returnFiles.componentFiles) {
        string += element.name + '#';
      }
    } else {
      for (let element of this.returnFiles.endpointFiles) {
        string += element.name + '#';
      }
    }
    string += '+';
    for (let element of this.returnFiles.otherFiles) {
      string += element.name + '#';
    }
    let maxAge = 60 * 60 * 24 * 7;
    document.cookie = `files=${string};max-age=${maxAge}`;
  }

  getPresetFromCookies() {
    const cookie = this.getCookie('files');
    if (!cookie) {
      return;
    }
    if (!cookie.includes('+')) {
      return;
    }
    const parts: string[] = cookie.split('+');
    let i = 0;
    if (this.type === 'e2e') {
      const componentNames: string[] = parts[0].split('#');
      for (i; i < this.length; i++) {
        if (componentNames.includes(this.componentFiles[i].name)) {
          this.checklist[i] = true;
        }
      }
    } else {
      const endpointNames: string[] = parts[0].split('#');
      for (i; i < this.length; i++) {
        if (endpointNames.includes(this.endpointFiles[i].name)) {
          this.checklist[i] = true;
        }
      }
    }
    const otherFileNames: string[] = parts[1].split('#');
    for (i; i < this.length + this.otherFiles.length; i++) {
      if (otherFileNames.includes(this.otherFiles[i - this.length].name)) {
        this.checklist[i] = true;
      }
    }
  }

  showH1(): boolean {
    return (
      (this.type === 'e2e' && this.componentFiles.length > 0) ||
      (this.type === 'unit' && this.endpointFiles.length > 0)
    );
  }
}
