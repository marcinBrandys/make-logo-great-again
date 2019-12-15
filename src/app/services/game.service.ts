import {EventEmitter, Injectable, Output} from '@angular/core';
import {Card} from '../intarfaces/card';
import {LogoItem} from '../intarfaces/logo-item';
import {GameState} from '../enumes/game-state.enum';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  answer: string;
  timer: number;
  interval: number;
  availableCardsId: string;
  availableCards: Card[];
  logo: LogoItem[];
  cardToFind: Card;
  @Output() gameStatus: EventEmitter<GameState> = new EventEmitter();
  @Output() scorePenalty: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.answer = environment.answer;
    this.timer = 0;
    this.interval = null;
    this.availableCardsId = 'available-cards';
    this.availableCards = this.shuffleArray([
      { value: 'z', imgSrc: 'assets/img/logo-z.png', marginY: GameService.getRandomMargin(2) },
      { value: 'o', imgSrc: 'assets/img/logo-o.png', marginY: GameService.getRandomMargin(2) },
      { value: 'o', imgSrc: 'assets/img/logo-o.png', marginY: GameService.getRandomMargin(2) },
      { value: 'v', imgSrc: 'assets/img/logo-v.png', marginY: GameService.getRandomMargin(2) },
      { value: 'u', imgSrc: 'assets/img/logo-u.png', marginY: GameService.getRandomMargin(2) }
    ]);
    this.logo = [
      { id: 'logo-item-0', cards: [] },
      { id: 'logo-item-1', cards: [] },
      { id: 'logo-item-2', cards: [] },
      { id: 'logo-item-3', cards: [] },
      { id: 'logo-item-4', cards: [] },
    ];
    this.setCardToFind();
  }

  private static getRandomMargin(maxRem: number): number {
    return Math.round(Math.random() *  (maxRem * 100)) / 100;
  }

  public getDropListConnectedIds(): string[] {
    return this.logo.filter(item => !item.cards.length).map(item => item.id);
  }

  public startGame(): void {
    if (!this.interval) {
      this.gameStatus.emit(GameState.START);
      this.timer = 0;
      this.interval = setInterval(() => {
        this.timer++;
      }, 1000);
      this.gameStatus.emit(GameState.RUNNING);
    }
  }

  public stopGame(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.cardToFind = null;
    }
  }

  public isMoveCorrect(dragPreviousIndex: number, targetDragContainerId: string): boolean {
    let result = false;
    const index = this.logo.findIndex(item => item.id === targetDragContainerId);
    if (this.cardToFind.value === this.availableCards[dragPreviousIndex].value
        && this.answer[index] === this.availableCards[dragPreviousIndex].value) {
      result = true;
    }
    if (!result) {
      this.makePenalty();
      this.setCardToFind();
    }
    return result;
  }

  public onMove(): void {
    if (this.availableCards.length) {
      this.setCardToFind();
    } else {
      this.stopGame();
      this.gameStatus.emit(GameState.END);
    }
  }

  private setCardToFind(): void {
    const randomIndex = Math.floor(Math.random() *  this.availableCards.length);
    this.cardToFind = this.availableCards[randomIndex];
  }

  private makePenalty(): void {
    this.timer += environment.penalty;
    this.scorePenalty.emit();
  }

  private shuffleArray(array): [] {
    return array.sort(() => Math.random() - 0.5);
  }

}
