// Dice Manager - handles dice rolling logic and animations
export class DiceManager {
  constructor() {
    this.currentRoll = null;
    this.rollHistory = [];
    this.isRolling = false;
  }

  // Roll the dice (1-6)
  rollDice() {
    if (this.isRolling) {
      return null;
    }

    this.isRolling = true;
    const rollResult = Math.floor(Math.random() * 6) + 1;
    
    // Store result after brief animation delay
    setTimeout(() => {
      this.currentRoll = rollResult;
      this.rollHistory.push(rollResult);
      this.isRolling = false;
      
      // Keep only last 10 rolls in history
      if (this.rollHistory.length > 10) {
        this.rollHistory = this.rollHistory.slice(-10);
      }
    }, 1000); // 1 second animation

    return rollResult;
  }

  // Get current dice value
  getCurrentValue() {
    return this.currentRoll;
  }

  // Check if dice is currently rolling
  isRollingInProgress() {
    return this.isRolling;
  }

  // Get dice roll history
  getRollHistory() {
    return [...this.rollHistory];
  }

  // Get emoji representation of dice value
  getDiceEmoji(value) {
    const diceEmojis = {
      1: '⚀',
      2: '⚁',
      3: '⚂',
      4: '⚃',
      5: '⚄',
      6: '⚅'
    };
    return diceEmojis[value] || '❔';
  }

  // Get CSS animation class for rolling
  getRollingAnimation() {
    return this.isRolling ? 'dice-rolling' : '';
  }

  // Reset dice to initial state
  reset() {
    this.currentRoll = null;
    this.rollHistory = [];
    this.isRolling = false;
  }

  // Simulate quick dice roll for testing
  quickRoll() {
    if (this.isRolling) {
      return null;
    }
    
    this.currentRoll = Math.floor(Math.random() * 6) + 1;
    this.rollHistory.push(this.currentRoll);
    
    // Keep only last 10 rolls
    if (this.rollHistory.length > 10) {
      this.rollHistory = this.rollHistory.slice(-10);
    }
    
    return this.currentRoll;
  }

  // Get statistics about rolls
  getRollStatistics() {
    if (this.rollHistory.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let sum = 0;

    this.rollHistory.forEach(roll => {
      distribution[roll]++;
      sum += roll;
    });

    return {
      total: this.rollHistory.length,
      average: Math.round((sum / this.rollHistory.length) * 100) / 100,
      distribution
    };
  }
}