import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';

type NavItem = {
  /** Translation key under `layout.nav`. */
  labelKey: string;
  icon: string;
  route: string;
  /** Match the route exactly; needed for `/`, which every other route starts with. */
  isExact: boolean;
};

type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

/**
 * App shell: colored sidebar with a grouped menu and a top bar, based on the PrimeBlocks
 * "colored sidebar with grouped menu" template. Wraps every page via a layout route.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslocoDirective, AvatarModule, StyleClassModule],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  protected readonly navGroups: NavGroup[] = [
    {
      labelKey: 'lending',
      items: [{ labelKey: 'loanOverview', icon: 'pi pi-wallet', route: '/', isExact: true }],
    },
  ];
}
