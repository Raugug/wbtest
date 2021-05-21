import clear from 'clear';
import chalk from 'chalk';

export class ChargeStatusIndicator {

  public update(status: string): void {
    clear();

    if (status === 'charging') {
      console.log(chalk.white.bgRed(formatMessage('Charging')));
    } else if (status === 'charging80') {
      console.log(chalk.black.bgYellow(formatMessage('Charging >80%')));
    } else if (status === 'charged') {
      console.log(chalk.black.bgGreen(formatMessage('Charged')));
    } else {
      console.log('Not recognized Status update', status);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public getUpdateFn() {
    return this.update.bind(this);
  }

}

export function createChargeStatusIndicator(): ChargeStatusIndicator {
  return new ChargeStatusIndicator();
}

function formatMessage(message: string): string {
  return `         ${message}       
         ${message}       
         ${message}       `;
}
