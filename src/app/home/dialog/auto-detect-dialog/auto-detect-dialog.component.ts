import { AfterViewInit, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import ComponentItem from 'src/util/component-item';
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
  otherFiles: OtherCodeItem[] = this.data.otherFiles;

  checklist: boolean[] = [];
  returnFiles: any = {};

  constructor() {
    for (
      let i = 0;
      i < this.data.componentFiles.length + this.data.otherFiles.length;
      i++
    ) {
      this.checklist.push(false);
    }
    this.getPresetFromCookies();
    this.setSelection();
  }

  onNoClick(): void {
    this.dialogRef.close({ componentFiles: [], otherFiles: [] });
  }

  update(select: boolean, index: number) {
    this.checklist[index] = select;
    this.setSelection();
  }

  setSelection() {
    let i = 0;
    const selectedComponentFiles: ComponentItem[] = [];
    for (let item of this.componentFiles) {
      if (this.checklist[i]) {
        selectedComponentFiles.push(item);
      }
      i++;
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
    for (let element of this.returnFiles.componentFiles) {
      string += element.name + '#';
    }
    string += '+';
    for (let element of this.returnFiles.otherFiles) {
      string += element.name + '#';
    }
    document.cookie = `files=${string}`;
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
    const componentNames: string[] = parts[0].split('#');
    const otherFileNames: string[] = parts[1].split('#');
    let i = 0;
    for (i; i < this.componentFiles.length; i++) {
      if (componentNames.includes(this.componentFiles[i].name)) {
        this.checklist[i] = true;
      }
    }
    for (i; i < this.componentFiles.length + this.otherFiles.length; i++) {
      if (
        otherFileNames.includes(
          this.otherFiles[i - this.componentFiles.length].name
        )
      ) {
        this.checklist[i] = true;
      }
    }
  }
}
