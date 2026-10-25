import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';

import { BokehBackgroundComponent } from './components/bokeh-background/bokeh-background.component';
import { HeaderComponent } from './components/header/header.component';
import { MiniPlayerComponent } from './components/mini-player/mini-player.component';
import { PlayerCardComponent } from './components/player-card/player-card.component';
import { PlaylistDrawerComponent } from './components/playlist-drawer/playlist-drawer.component';
import { SongListComponent } from './components/song-list/song-list.component';
import { StationChipsComponent } from './components/station-chips/station-chips.component';
import { ToastComponent } from './components/toast/toast.component';
import { TuningPopupComponent } from './components/tuning-popup/tuning-popup.component';
import { LibraryService } from './services/library.service';
import { PlayerService } from './services/player.service';

/** Page layout. Wires the pieces together; the logic lives in the services. */
@Component({
  selector: 'app-root',
  imports: [
    BokehBackgroundComponent, HeaderComponent, MiniPlayerComponent, PlayerCardComponent, PlaylistDrawerComponent,
    SongListComponent, StationChipsComponent, ToastComponent, TuningPopupComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class AppComponent {
  private readonly library = inject(LibraryService);
  protected readonly player = inject(PlayerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerCard = viewChild.required(PlayerCardComponent, { read: ElementRef });

  protected readonly menuOpen = signal(false);
  private readonly playerCardVisible = signal(true);
  /** Phones only (hidden by CSS on wide screens): show once the big player scrolls away. */
  protected readonly showMini = computed(() => this.player.started() && !this.playerCardVisible());

  constructor() {
    // Load the last-opened playlist so the list isn't empty.
    this.library.load(this.library.selected());

    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => this.playerCardVisible.set(entry.isIntersecting), { threshold: 0.15 });
      observer.observe(this.playerCard().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Space bar plays / pauses, unless typing or on a button. */
  protected onKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement).tagName;
    if (event.code === 'Space' && !/INPUT|BUTTON|LI|TEXTAREA/.test(tag)) {
      event.preventDefault();
      this.player.togglePlay();
    }
  }
}
