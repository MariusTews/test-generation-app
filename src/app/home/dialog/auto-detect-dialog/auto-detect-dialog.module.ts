import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoDetectDialogComponent } from './auto-detect-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [AutoDetectDialogComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
})
export class AutoDetectDialogModule {}
