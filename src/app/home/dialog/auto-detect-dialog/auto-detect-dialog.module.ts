import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoDetectDialogComponent } from './auto-detect-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AutoDetectDialogComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class AutoDetectDialogModule {}
