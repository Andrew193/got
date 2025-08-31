import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';
import {NgClass, NgTemplateOutlet} from "@angular/common";

type Variant = 'badge' | 'ribbon';
type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'app-pin-badge',
  imports: [
    NgClass,
    NgTemplateOutlet
  ],
  templateUrl: './pin-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pin-badge.component.scss'
})
export class PinBadgeComponent {
  /** e.g. 300 -> "+300% buy now" if cta is provided, else just "+300%" */
  @Input() percent?: number;
  /** Optional trailing copy, e.g. "buy now" */
  @Input() cta?: string;
  /** If provided, overrides composed text entirely */
  @Input() text?: string;

  /** 'badge' | 'ribbon' | 'corner' */
  @Input() variant: Variant = 'badge';
  /** 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' */
  @Input() position: Position = 'top-right';
  /** Text color */
  @Input() color = '#ffffff';
  /** Background color */
  @Input() background = '#ef4444'; // nice red
  /** Shadow tint (alpha supported) */
  @Input() shadowColor = 'rgba(239, 68, 68, 0.35)';
  /** Gentle attention getter */
  @Input() pulse = false;
  /** Link (optional); if present, whole pin is clickable */
  @Input() href?: string;
  /** Optional aria label override */
  @Input() ariaLabel?: string;

  @HostBinding('attr.aria-hidden') ariaHidden = false;
  @HostBinding('style.pointer-events') pe = 'none'; // container overlay only
  @HostBinding('style.position') pos = 'absolute';  // overlay
  @HostBinding('style.inset') inset = '0';

  get displayText(): string {
    if (this.text) return this.text;
    const pref = this.percent != null ? `+${this.percent}%` : '';
    return this.cta ? `${pref} ${this.cta}`.trim() : (pref || '');
  }

  get variantClass(): string {
    return this.variant === 'ribbon' ? 'pb-ribbon'
      : 'pb-badge';
  }

  get positionClass(): string {
    return `pb-${this.position}`;
  }
}
