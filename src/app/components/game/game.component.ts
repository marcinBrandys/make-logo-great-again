import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {GameService} from '../../services/game.service';
import {Card} from '../../intarfaces/card';
import {GameState} from '../../enumes/game-state.enum';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material';
import text_en from '../../../assets/translations/en.json';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  public translations = text_en;
  public isMenuVisible = true;
  @ViewChild('score', {static: false}) score: ElementRef;

  constructor(public gameService: GameService, private snackBar: MatSnackBar) {}

  public ngOnInit(): void {
    this.subscribeGameStatusChange();
    this.subscribeGamePenaltyChange();
  }

  public ngOnDestroy(): void {
    this.gameService.stopGame();
    this.unsubscribeGameStatusChange();
    this.unsubscribeGamePenaltyChange();
  }

  public drop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (this.gameService.isMoveCorrect(event.previousIndex, event.container.id)) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.gameService.onMove();
      }
    }
  }

  public onCdkTouch(): void {
    this.gameService.startGame();
  }

  private onGameStatusChange(value: GameState): void {
    if (value === GameState.END) {
      setTimeout(() => {
        this.isMenuVisible = false;
        this.snackBar.open(
          `
          ${this.translations.text_end_game} ${this.gameService.timer} ${this.translations.text_seconds}.
          ${this.translations.text_next_game} ${environment.newGameTimeout / 1000} ${this.translations.text_seconds}.
        `,
          '',
          {duration: environment.newGameTimeout}
        );
      }, 1000);
      setTimeout(() => {
        this.unsubscribeGameStatusChange();
        this.unsubscribeGamePenaltyChange();
        this.gameService = new GameService();
        this.isMenuVisible = true;
        this.subscribeGameStatusChange();
        this.subscribeGamePenaltyChange();
      }, environment.newGameTimeout + 1000);
    }
  }

  private subscribeGameStatusChange(): void {
    this.gameService.gameStatus.subscribe(value => this.onGameStatusChange(value));
  }

  private unsubscribeGameStatusChange(): void {
    this.gameService.gameStatus.unsubscribe();
  }

  private subscribeGamePenaltyChange(): void {
    this.gameService.scorePenalty.subscribe(() => this.animatePenalty());
  }

  private unsubscribeGamePenaltyChange(): void {
    this.gameService.scorePenalty.unsubscribe();
  }

  private animatePenalty(): void {
    const penaltyAnimationClassName = 'animation-shake-x';
    this.score.nativeElement.classList.add(penaltyAnimationClassName);
    setTimeout(() => {
      this.score.nativeElement.classList.remove(penaltyAnimationClassName);
    }, 1000);
  }

}
